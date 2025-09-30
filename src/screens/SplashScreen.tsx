/**
 * Splash Screen
 * Shown while the app is initializing
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { theme } from '../config/theme';

interface SplashScreenProps {
    error?: string | null;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ error }) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Reflect</Text>
                <Text style={styles.subtitle}>Your Private Reflection Space</Text>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                        style={styles.loader}
                    />
                )}
            </View>

            <Text style={styles.footer}>Secure • Private • On-Device</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text,
        opacity: 0.7,
        marginBottom: 40,
    },
    loader: {
        marginTop: 20,
    },
    errorContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        fontSize: 14,
        color: theme.colors.text,
        opacity: 0.5,
    },
});
