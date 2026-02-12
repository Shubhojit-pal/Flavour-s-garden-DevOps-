import apiClient from './client';
import { ENDPOINTS } from '../../config/api';
import { User, LoginRequest, SignupRequest, ApiResponse } from '../../types';

export const authService = {
    /**
     * Login user
     */
    login: async (credentials: LoginRequest): Promise<User> => {
        try {
            const response = await apiClient.post<User>(ENDPOINTS.LOGIN, credentials);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    },

    /**
     * Signup new user
     */
    signup: async (userData: SignupRequest): Promise<User> => {
        try {
            const response = await apiClient.post<User>(ENDPOINTS.SIGNUP, userData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Signup failed');
        }
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        try {
            const response = await apiClient.get<User>(ENDPOINTS.USER_PROFILE);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch profile');
        }
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        // Logic to clear token/session could go here if needed server-side
        return Promise.resolve();
    },
};
