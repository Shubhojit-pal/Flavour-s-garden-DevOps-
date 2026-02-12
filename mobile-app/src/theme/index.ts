export const colors = {
    // Light Mode
    light: {
        primary: '#FF6B35',      // Vibrant orange (food-themed)
        primaryDark: '#E85A2A',
        primaryLight: '#FF8C61',

        secondary: '#4ECDC4',    // Teal
        secondaryDark: '#3DB5AD',

        background: '#FFFFFF',
        surface: '#F8F9FA',
        surfaceVariant: '#E9ECEF',

        text: '#1A1A1A',
        textSecondary: '#6C757D',
        textDisabled: '#ADB5BD',

        border: '#DEE2E6',
        divider: '#E9ECEF',

        success: '#51CF66',
        warning: '#FFD93D',
        error: '#FF6B6B',
        info: '#4DABF7',

        card: '#FFFFFF',
        shadow: 'rgba(0, 0, 0, 0.1)',
    },

    // Dark Mode
    dark: {
        primary: '#FF6B35',
        primaryDark: '#E85A2A',
        primaryLight: '#FF8C61',

        secondary: '#4ECDC4',
        secondaryDark: '#3DB5AD',

        background: '#121212',
        surface: '#1E1E1E',
        surfaceVariant: '#2C2C2C',

        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        textDisabled: '#6C6C6C',

        border: '#3A3A3A',
        divider: '#2C2C2C',

        success: '#51CF66',
        warning: '#FFD93D',
        error: '#FF6B6B',
        info: '#4DABF7',

        card: '#1E1E1E',
        shadow: 'rgba(0, 0, 0, 0.3)',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 38,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700' as const,
        lineHeight: 30,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 26,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 22,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 22,
    },
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
        elevation: 8,
    },
};
