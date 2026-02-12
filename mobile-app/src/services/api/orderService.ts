import apiClient from './client';
import { ENDPOINTS } from '../../config/api';
import { Order, CreateOrderRequest } from '../../types';

export const orderService = {
    /**
     * Create a new order
     */
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
        try {
            const response = await apiClient.post<Order>(ENDPOINTS.ORDERS, {
                userId: orderData.userId,
                items: orderData.items,
                total: orderData.total,
                addressId: orderData.addressId,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to create order');
        }
    },

    /**
     * Get user's order history
     */
    getOrderHistory: async (userId: number): Promise<Order[]> => {
        try {
            const response = await apiClient.get<Order[]>(`${ENDPOINTS.ORDERS}?userId=${userId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch orders');
        }
    },

    /**
     * Get order details by ID
     */
    getOrderById: async (orderId: number): Promise<Order> => {
        try {
            const response = await apiClient.get<Order>(ENDPOINTS.ORDER_DETAIL(orderId));
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch order');
        }
    },
};
