import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function HomeScreen() {
    const navigation = useNavigation();
    const user = useAuthStore((state) => state.user);
    const cartItemCount = useCartStore((state) =>
        state.items.reduce((sum, item) => sum + item.quantity, 0)
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.userName}>{user?.name || 'Guest'} 👋</Text>
                </View>
                {cartItemCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </View>
                )}
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🛍️</Text>
                    <Text style={styles.statValue}>{cartItemCount}</Text>
                    <Text style={styles.statLabel}>In Cart</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📦</Text>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>⭐</Text>
                    <Text style={styles.statValue}>4.5</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Menu' as never)}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>📖</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Browse Menu</Text>
                        <Text style={styles.actionSubtitle}>Explore our delicious offerings</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Cart' as never)}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>🛒</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>View Cart</Text>
                        <Text style={styles.actionSubtitle}>
                            {cartItemCount > 0 ? `${cartItemCount} items waiting` : 'Cart is empty'}
                        </Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Orders' as never)}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>📋</Text>
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Order History</Text>
                        <Text style={styles.actionSubtitle}>View your past orders</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Coming Soon Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coming Soon</Text>
                <View style={styles.comingSoonCard}>
                    <Text style={styles.comingSoonIcon}>🤖</Text>
                    <Text style={styles.comingSoonTitle}>AI Recommendations</Text>
                    <Text style={styles.comingSoonText}>
                        Personalized food suggestions based on your preferences
                    </Text>
                </View>

                <View style={styles.comingSoonCard}>
                    <Text style={styles.comingSoonIcon}>🗺️</Text>
                    <Text style={styles.comingSoonTitle}>Real-Time Tracking</Text>
                    <Text style={styles.comingSoonText}>
                        Track your delivery in real-time with live maps
                    </Text>
                </View>
            </View>
        </ScrollView>
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
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    greeting: {
        ...typography.body,
        color: colors.light.textSecondary,
    },
    userName: {
        ...typography.h1,
        color: colors.light.text,
    },
    cartBadge: {
        backgroundColor: colors.light.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        ...typography.h4,
        color: '#fff',
        fontWeight: '700',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.small,
    },
    statIcon: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    statValue: {
        ...typography.h2,
        color: colors.light.primary,
        fontWeight: '700',
    },
    statLabel: {
        ...typography.caption,
        color: colors.light.textSecondary,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    actionIconText: {
        fontSize: 24,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.light.text,
        marginBottom: spacing.xs,
    },
    actionSubtitle: {
        ...typography.caption,
        color: colors.light.textSecondary,
    },
    actionArrow: {
        fontSize: 28,
        color: colors.light.textSecondary,
    },
    comingSoonCard: {
        backgroundColor: '#fff',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        alignItems: 'center',
        ...shadows.small,
    },
    comingSoonIcon: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    comingSoonTitle: {
        ...typography.h4,
        color: colors.light.text,
        marginBottom: spacing.xs,
    },
    comingSoonText: {
        ...typography.body,
        color: colors.light.textSecondary,
        textAlign: 'center',
    },
});
