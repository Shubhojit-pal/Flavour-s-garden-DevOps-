import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    login: (user: User, token?: string) => Promise<void>;
    logout: () => Promise<void>;
    loadUserFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    login: async (user, token) => {
        try {
            // Sanitize user data to ensure booleans are actual booleans
            const sanitizedUser: User = {
                ...user,
                isVerified: Boolean(user.isVerified),
            };

            // Store user data
            await AsyncStorage.setItem('userData', JSON.stringify(sanitizedUser));
            if (token) {
                await AsyncStorage.setItem('authToken', token);
            }

            set({ user: sanitizedUser, isAuthenticated: true });
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('authToken');
            set({ user: null, isAuthenticated: false });
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    },

    loadUserFromStorage: async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                // Explicitly convert boolean fields to prevent casting errors
                const sanitizedUser: User = {
                    ...user,
                    isVerified: Boolean(user.isVerified), // Force to boolean
                };
                set({ user: sanitizedUser, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            set({ isLoading: false });
        }
    },
}));
