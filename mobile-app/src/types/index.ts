export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'USER' | 'ADMIN';
    isVerified: boolean;
}

export interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: string;
    stockQuantity: number;
    lowStockThreshold: number;
    unit: string;
    sku?: string;
    isAvailable: boolean;
    outletId?: number;
    outlet?: Outlet;
    createdAt: string;
    updatedAt: string;
}

export interface Outlet {
    id: number;
    name: string;
    address?: string;
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    customizations?: string;
}

export interface Order {
    id: number;
    userId: number;
    items: string; // JSON string of CartItem[]
    total: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
    paymentMethod: string;
    paymentStatus: string;
    addressId?: number;
    createdAt: string;

    // Delivery tracking fields (to be added to backend)
    driverName?: string;
    driverPhone?: string;
    driverLocation?: {
        lat: number;
        lng: number;
        timestamp: string;
    };
    estimatedDelivery?: string;
    actualDelivery?: string;
}

export interface Address {
    id: number;
    userId: number;
    street: string;
    city: string;
    state?: string;
    zip: string;
    isDefault: boolean;
    createdAt: string;
}

export interface Transaction {
    id: number;
    userId: number;
    amount: number;
    method: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    transactionId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    phone?: string;
    password: string;
}

export interface CreateOrderRequest {
    userId: number;
    items: CartItem[];
    total: number;
    addressId?: number;
}

export interface PaymentRequest {
    userId: number;
    amount: number;
    cartItems: CartItem[];
    orderType?: string;
}
