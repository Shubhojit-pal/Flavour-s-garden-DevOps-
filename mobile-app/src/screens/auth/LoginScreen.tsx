import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { authService } from '../../services/api/authService';
import { useAuthStore } from '../../store/authStore';

interface LoginScreenProps {
    navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = useAuthStore((state) => state.login);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            const user = await authService.login({ email, password });
            await login(user);

            // Navigate to appropriate screen based on role
            if (user.role === 'ADMIN') {
                navigation.replace('AdminStack');
            } else {
                navigation.replace('UserTabs');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Flavour Garden</Text>
                    <Text style={styles.subtitle}>Welcome back! 👋</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.light.textDisabled}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.light.textDisabled}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick test credentials */}
                    <View style={styles.testCredentials}>
                        <Text style={styles.testTitle}>Test Credentials:</Text>
                        <Text style={styles.testText}>User: john.doe@example.com</Text>
                        <Text style={styles.testText}>Admin: jane.smith@example.com</Text>
                        <Text style={styles.testText}>Password: password123</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.primary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        color: '#fff',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.h3,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodySmall,
        color: colors.light.text,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    input: {
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        backgroundColor: colors.light.surface,
    },
    button: {
        backgroundColor: colors.light.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.button,
        color: '#fff',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
    footerText: {
        ...typography.bodySmall,
        color: colors.light.textSecondary,
    },
    linkText: {
        ...typography.bodySmall,
        color: colors.light.primary,
        fontWeight: '600',
    },
    testCredentials: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.light.surface,
        borderRadius: borderRadius.md,
    },
    testTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    testText: {
        ...typography.caption,
        color: colors.light.textSecondary,
    },
});
