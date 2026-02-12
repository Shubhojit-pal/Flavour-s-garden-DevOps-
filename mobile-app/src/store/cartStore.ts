import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '../types';

// Cart item with full menu item details
export interface CartItemWithDetails {
    item: MenuItem;
    quantity: number;
}

interface CartState {
    items: CartItemWithDetails[];

    // Actions
    addItem: (menuItem: MenuItem, quantity?: number) => void;
    removeItem: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    loadCart: () => Promise<void>;
    saveCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (menuItem, quantity = 1) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(cartItem => cartItem.item.id === menuItem.id);

        let updatedItems: CartItemWithDetails[];
        if (existingItemIndex >= 0) {
            // Item exists, update quantity
            updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
        } else {
            // New item, add to cart
            updatedItems = [...items, { item: menuItem, quantity }];
        }

        set({ items: updatedItems });
        get().saveCart();
    },

    removeItem: (itemId) => {
        const updatedItems = get().items.filter(cartItem => cartItem.item.id !== itemId);
        set({ items: updatedItems });
        get().saveCart();
    },

    updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(itemId);
            return;
        }

        const updatedItems = get().items.map(cartItem =>
            cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem
        );
        set({ items: updatedItems });
        get().saveCart();
    },

    clearCart: () => {
        set({ items: [] });
        get().saveCart();
    },

    getTotal: () => {
        return get().items.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);
    },

    getItemCount: () => {
        return get().items.reduce((count, cartItem) => count + cartItem.quantity, 0);
    },

    loadCart: async () => {
        try {
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData) {
                const items = JSON.parse(cartData);
                set({ items });
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    },

    saveCart: async () => {
        try {
            const items = get().items;
            await AsyncStorage.setItem('cart', JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    },
}));
