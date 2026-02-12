import apiClient from './client';
import { ENDPOINTS } from '../../config/api';
import { Address, ApiResponse, User } from '../../types';

export const userService = {
    /**
     * Update user profile
     */
    updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
        try {
            const response = await apiClient.put<User>(ENDPOINTS.USER_PROFILE, {
                id: userId,
                ...data,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update profile');
        }
    },

    /**
     * Get user addresses
     */
    getAddresses: async (userId: number): Promise<Address[]> => {
        try {
            const response = await apiClient.get<Address[]>(`${ENDPOINTS.USER_ADDRESSES}?userId=${userId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch addresses');
        }
    },

    /**
     * Add new address
     */
    addAddress: async (addressData: Omit<Address, 'id' | 'createdAt'>): Promise<Address> => {
        try {
            const response = await apiClient.post<Address>(ENDPOINTS.USER_ADDRESSES, addressData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to add address');
        }
    },

    /**
     * Update address
     */
    updateAddress: async (addressData: Partial<Address> & { id: number }): Promise<Address> => {
        try {
            const response = await apiClient.put<Address>(ENDPOINTS.USER_ADDRESSES, addressData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update address');
        }
    },

    /**
     * Delete address
     */
    deleteAddress: async (addressId: number): Promise<void> => {
        try {
            await apiClient.delete(`${ENDPOINTS.USER_ADDRESSES}?id=${addressId}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to delete address');
        }
    },
};
