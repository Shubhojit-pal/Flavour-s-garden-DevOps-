import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.userInfo}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user?.name}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user?.email}</Text>

                <Text style={styles.label}>Role:</Text>
                <Text style={styles.value}>{user?.role}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        padding: spacing.lg,
    },
    title: {
        ...typography.h1,
        color: colors.light.text,
        marginBottom: spacing.xl,
    },
    userInfo: {
        backgroundColor: colors.light.card,
        padding: spacing.lg,
        borderRadius: 12,
        marginBottom: spacing.xl,
    },
    label: {
        ...typography.bodySmall,
        color: colors.light.textSecondary,
        marginTop: spacing.md,
    },
    value: {
        ...typography.h4,
        color: colors.light.text,
        marginTop: spacing.xs,
    },
    logoutButton: {
        backgroundColor: colors.light.error,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        ...typography.button,
        color: '#fff',
    },
});
