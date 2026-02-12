import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { menuService } from '../../services/api/menuService';
import { MenuItem as MenuItemType } from '../../types';
import MenuItem from '../../components/menu/MenuItem';
import CategoryChips from '../../components/menu/CategoryChips';
import { useCartStore } from '../../store/cartStore';

const CATEGORIES = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Specials'];

export default function MenuScreen() {
    const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const cartItemCount = useCartStore((state) =>
        state.items.reduce((sum, item) => sum + item.quantity, 0)
    );

    useEffect(() => {
        fetchMenuItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [menuItems, selectedCategory, searchQuery]);

    const fetchMenuItems = async () => {
        try {
            setIsLoading(true);
            const items = await menuService.getAllItems();
            console.log('📋 Fetched menu items:', items.length);
            setMenuItems(items);
        } catch (error: any) {
            console.error('❌ Error fetching menu:', error);
            Alert.alert('Error', 'Failed to load menu items');
        } finally {
            setIsLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = menuItems;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(
                (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query)
            );
        }

        setFilteredItems(filtered);
    };

    const handleCategorySelect = (category: string) => {
        console.log('📂 Category selected:', category);
        setSelectedCategory(category);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.light.primary} />
                <Text style={styles.loadingText}>Loading menu...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Our Menu</Text>
                {cartItemCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </View>
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for dishes..."
                    placeholderTextColor={colors.light.textDisabled}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <Text style={styles.clearButton} onPress={() => setSearchQuery('')}>
                        ✕
                    </Text>
                )}
            </View>

            {/* Category Filters */}
            <CategoryChips
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
            />

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>🍽️</Text>
                    <Text style={styles.emptyStateText}>No items found</Text>
                    <Text style={styles.emptyStateSubtext}>
                        {searchQuery ? 'Try a different search' : 'Check back later'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={({ item }) => <MenuItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: {
        ...typography.h2,
        color: colors.light.text,
    },
    cartBadge: {
        backgroundColor: colors.light.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        paddingVertical: spacing.md,
    },
    clearButton: {
        fontSize: 18,
        color: colors.light.textSecondary,
        paddingLeft: spacing.sm,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
    },
    listContent: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light.background,
    },
    loadingText: {
        ...typography.body,
        color: colors.light.textSecondary,
        marginTop: spacing.md,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyStateIcon: {
        fontSize: 60,
        marginBottom: spacing.md,
    },
    emptyStateText: {
        ...typography.h3,
        color: colors.light.text,
        marginBottom: spacing.xs,
    },
    emptyStateSubtext: {
        ...typography.body,
        color: colors.light.textSecondary,
        textAlign: 'center',
    },
});
