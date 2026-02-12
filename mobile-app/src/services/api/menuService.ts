import apiClient from './client';
import { ENDPOINTS } from '../../config/api';
import { MenuItem } from '../../types';

export const menuService = {
    /**
     * Get all menu items
     */
    async getAllItems(): Promise<MenuItem[]> {
        try {
            console.log('🍽️ Fetching all menu items');
            const response = await apiClient.get<MenuItem[]>(ENDPOINTS.MENU);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch menu');
        }
    },

    /**
     * Get menu items (alias for getAllItems)
     */
    getMenuItems: async (): Promise<MenuItem[]> => {
        return menuService.getAllItems();
    },

    /**
     * Get menu items by category
     */
    getMenuByCategory: async (category: string): Promise<MenuItem[]> => {
        try {
            const items = await menuService.getAllItems();
            return items.filter(item => item.category === category);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch menu');
        }
    },

    /**
     * Search menu items
     */
    searchMenuItems: async (query: string): Promise<MenuItem[]> => {
        try {
            const items = await menuService.getAllItems();
            const lowerQuery = query.toLowerCase();
            return items.filter(item =>
                item.name.toLowerCase().includes(lowerQuery) ||
                item.description?.toLowerCase().includes(lowerQuery)
            );
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Search failed');
        }
    },
};
