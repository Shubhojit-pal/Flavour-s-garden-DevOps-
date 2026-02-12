import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function OrderHistoryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order History</Text>
            <Text style={styles.subtitle}>Coming soon: View your past orders</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    title: {
        ...typography.h1,
        color: colors.light.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.light.textSecondary,
        textAlign: 'center',
    },
});
