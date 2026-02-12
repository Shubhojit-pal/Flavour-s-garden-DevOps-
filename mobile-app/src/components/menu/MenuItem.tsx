import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { MenuItem as MenuItemType } from '../../types';
import { useCartStore } from '../../store/cartStore';

interface MenuItemProps {
    item: MenuItemType;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2; // 2 columns with spacing

export default function MenuItem({ item }: MenuItemProps) {
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);

    const itemInCart = cartItems.find((cartItem) => cartItem.item.id === item.id);
    const quantity = itemInCart?.quantity || 0;

    const handleAddToCart = () => {
        addItem(item);
    };

    const isAvailable = item.stockQuantity > 0;

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {/* Placeholder image - you can add real images later */}
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.light.primary }]}>
                    <Text style={styles.imagePlaceholderText}>🍽️</Text>
                </View>

                {!isAvailable && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description || 'Delicious food item'}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.price}>₹{item.price}</Text>

                    {isAvailable && (
                        <TouchableOpacity
                            style={[styles.addButton, quantity > 0 && styles.addButtonActive]}
                            onPress={handleAddToCart}
                        >
                            <Text style={styles.addButtonText}>
                                {quantity > 0 ? `+${quantity}` : 'ADD'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.medium,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 120,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 40,
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        padding: spacing.sm,
    },
    name: {
        ...typography.h4,
        color: colors.light.text,
        marginBottom: spacing.xs,
    },
    description: {
        ...typography.caption,
        color: colors.light.textSecondary,
        marginBottom: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        ...typography.h4,
        color: colors.light.primary,
        fontWeight: '700',
    },
    addButton: {
        backgroundColor: colors.light.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    addButtonActive: {
        backgroundColor: colors.light.success,
    },
    addButtonText: {
        ...typography.button,
        color: '#fff',
        fontSize: 12,
    },
});
