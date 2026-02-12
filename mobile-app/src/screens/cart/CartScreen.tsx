import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
    const navigation = useNavigation();
    const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

    const subtotal = getTotal();
    const deliveryFee = subtotal > 0 ? 40 : 0;
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + deliveryFee + tax;

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Cart Empty', 'Please add items to your cart first');
            return;
        }

        // For now, just show an alert - we'll implement full checkout later
        Alert.alert(
            'Checkout',
            `Total: ₹${total.toFixed(2)}\n\nCheckout feature coming soon!`,
            [{ text: 'OK' }]
        );
    };

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            Alert.alert(
                'Remove Item',
                'Remove this item from cart?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeItem(itemId) },
                ]
            );
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Add items from the menu to get started!</Text>
                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => navigation.navigate('Menu' as never)}
                >
                    <Text style={styles.browseButtonText}>Browse Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your Cart</Text>
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items */}
                <View style={styles.itemsContainer}>
                    {items.map((cartItem) => (
                        <View key={cartItem.item.id} style={styles.cartItem}>
                            {/* Item Image */}
                            <View style={styles.itemImage}>
                                <Text style={styles.itemImageEmoji}>🍽️</Text>
                            </View>

                            {/* Item Details */}
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName}>{cartItem.item.name}</Text>
                                <Text style={styles.itemPrice}>₹{cartItem.item.price}</Text>
                            </View>

                            {/* Quantity Controls */}
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)}
                                >
                                    <Text style={styles.quantityButtonText}>−</Text>
                                </TouchableOpacity>

                                <Text style={styles.quantity}>{cartItem.quantity}</Text>

                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)}
                                >
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Item Total */}
                            <Text style={styles.itemTotal}>
                                ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Bill Details */}
                <View style={styles.billContainer}>
                    <Text style={styles.billTitle}>Bill Details</Text>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>GST (5%)</Text>
                        <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
                    </View>

                    <View style={[styles.billRow, styles.billTotal]}>
                        <Text style={styles.billTotalLabel}>Grand Total</Text>
                        <Text style={styles.billTotalValue}>₹{total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Checkout Button */}
            <View style={styles.footer}>
                <View style={styles.footerTotal}>
                    <Text style={styles.footerTotalLabel}>Total</Text>
                    <Text style={styles.footerTotalValue}>₹{total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    content: {
        flex: 1,
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
    clearText: {
        ...typography.bodySmall,
        color: colors.light.error,
        fontWeight: '600',
    },
    itemsContainer: {
        paddingHorizontal: spacing.lg,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        backgroundColor: colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    itemImageEmoji: {
        fontSize: 30,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.light.text,
        marginBottom: spacing.xs,
    },
    itemPrice: {
        ...typography.bodySmall,
        color: colors.light.textSecondary,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.sm,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    quantity: {
        ...typography.body,
        fontWeight: '600',
        marginHorizontal: spacing.md,
        minWidth: 20,
        textAlign: 'center',
    },
    itemTotal: {
        ...typography.body,
        fontWeight: '700',
        color: colors.light.primary,
    },
    billContainer: {
        backgroundColor: '#fff',
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.small,
    },
    billTitle: {
        ...typography.h4,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    billLabel: {
        ...typography.body,
        color: colors.light.textSecondary,
    },
    billValue: {
        ...typography.body,
        color: colors.light.text,
    },
    billTotal: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
    },
    billTotalLabel: {
        ...typography.h4,
        color: colors.light.text,
    },
    billTotalValue: {
        ...typography.h4,
        color: colors.light.primary,
        fontWeight: '700',
    },
    footer: {
        backgroundColor: '#fff',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
        ...shadows.large,
    },
    footerTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    footerTotalLabel: {
        ...typography.h3,
        color: colors.light.text,
    },
    footerTotalValue: {
        ...typography.h3,
        color: colors.light.primary,
        fontWeight: '700',
    },
    checkoutButton: {
        backgroundColor: colors.light.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    checkoutButtonText: {
        ...typography.button,
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.light.background,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.light.text,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    browseButton: {
        backgroundColor: colors.light.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    browseButtonText: {
        ...typography.button,
        color: '#fff',
    },
});
