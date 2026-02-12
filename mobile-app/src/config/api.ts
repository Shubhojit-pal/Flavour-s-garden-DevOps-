// API Configuration
// Use your computer's IP address so the mobile app on your phone can connect
// IMPORTANT: Your phone must be on the same WiFi network as your computer!

const YOUR_COMPUTER_IP = '172.27.1.164'; // Your computer's IP address

export const API_CONFIG = {
    // For mobile phone testing, use your computer's IP address
    BASE_URL: `http://${YOUR_COMPUTER_IP}:3000/api`,

    // For browser testing, you can temporarily change this back to:
    // BASE_URL: 'http://localhost:3000/api',

    TIMEOUT: 30000, // 30 seconds
};

// Log the API URL for debugging
console.log('🔧 API Configuration:', API_CONFIG);
console.log('📱 Make sure your phone is on the same WiFi as this computer!');

export const ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',

    // Menu
    MENU: '/menu',
    MENU_ITEM: (id: number) => `/menu/${id}`,

    // Orders
    ORDERS: '/orders',
    ORDER_DETAIL: (id: number) => `/orders/${id}`,

    // User
    USER_PROFILE: '/users',
    USER_ADDRESSES: '/users/address',

    // Payment
    PAYMENT: '/pay',

    // Admin
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_INVENTORY: '/admin/inventory',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_USERS: '/admin/users',

    // Tracking (to be implemented)
    TRACKING: (orderId: number) => `/tracking/${orderId}`,

    // Recommendations (to be implemented)
    RECOMMENDATIONS: (userId: number) => `/recommendations/${userId}`,
};
