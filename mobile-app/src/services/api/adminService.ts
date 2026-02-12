import apiClient from './client';
import { ENDPOINTS } from '../../config/api';
import { Order, MenuItem } from '../../types';

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    lowStockCount: number;
    activeUsers: number;
}

export const adminService = {
    /**
     * Get dashboard analytics stats
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response = await apiClient.get<any>(ENDPOINTS.ADMIN_ANALYTICS);
            // The backend might return a different structure, we'll map it if needed
            const data = response.data;
            return {
                totalOrders: data.totalOrders || 0,
                totalRevenue: data.totalRevenue || 0,
                lowStockCount: data.lowStockItems || 0,
                activeUsers: data.totalUsers || 0,
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch dashboard stats');
        }
    },

    /**
     * Get all orders with optional status filter
     */
    getAllOrders: async (status?: string): Promise<Order[]> => {
        try {
            const url = status ? `${ENDPOINTS.ADMIN_ORDERS}?status=${status}` : ENDPOINTS.ADMIN_ORDERS;
            const response = await apiClient.get<{ orders: Order[] }>(url);
            return response.data.orders;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch all orders');
        }
    },

    /**
     * Update order status or payment status
     */
    updateOrderStatus: async (orderId: number, status?: string, paymentStatus?: string): Promise<Order> => {
        try {
            const response = await apiClient.patch<{ order: Order }>(ENDPOINTS.ADMIN_ORDERS, {
                orderId,
                status,
                paymentStatus,
            });
            return response.data.order;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update order status');
        }
    },

    /**
     * Get inventory with metrics
     */
    getInventory: async (): Promise<{ items: MenuItem[]; metrics: any }> => {
        try {
            const response = await apiClient.get<any>(ENDPOINTS.ADMIN_INVENTORY);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch inventory');
        }
    },

    /**
     * Update menu item in inventory
     */
    updateInventoryItem: async (itemId: number, data: Partial<MenuItem>): Promise<MenuItem> => {
        try {
            const response = await apiClient.put<MenuItem>(`${ENDPOINTS.ADMIN_INVENTORY}/${itemId}`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update inventory item');
        }
    },
};
