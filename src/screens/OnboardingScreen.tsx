/**
 * Onboarding Screen
 * Introduction and setup for first-time users
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../config/theme';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleGetStarted = () => {
        navigation.replace('Auth');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Icon name="shield-check" size={80} color={theme.colors.primary} />
                <Text style={styles.title}>Welcome to Reflect</Text>
                <Text style={styles.subtitle}>
                    Your private space for therapeutic reflection
                </Text>
            </View>

            <View style={styles.features}>
                <View style={styles.feature}>
                    <Icon name="lock" size={32} color={theme.colors.primary} />
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Complete Privacy</Text>
                        <Text style={styles.featureText}>
                            All data stays on your device. No cloud syncing, no external servers.
                        </Text>
                    </View>
                </View>

                <View style={styles.feature}>
                    <Icon name="brain" size={32} color={theme.colors.primary} />
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>AI Supervisor</Text>
                        <Text style={styles.featureText}>
                            On-device AI provides reflective support without compromising privacy.
                        </Text>
                    </View>
                </View>

                <View style={styles.feature}>
                    <Icon name="notebook" size={32} color={theme.colors.primary} />
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Secure Journaling</Text>
                        <Text style={styles.featureText}>
                            Document your sessions with encrypted notes and emotional tracking.
                        </Text>
                    </View>
                </View>

                <View style={styles.feature}>
                    <Icon name="chart-line" size={32} color={theme.colors.primary} />
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Personal Insights</Text>
                        <Text style={styles.featureText}>
                            Track patterns and growth across your therapeutic practice.
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                <Text style={styles.buttonText}>Get Started</Text>
                <Icon name="arrow-right" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
                This app is a tool for personal reflection and does not replace professional supervision.
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text,
        textAlign: 'center',
        opacity: 0.7,
    },
    features: {
        marginBottom: 40,
    },
    feature: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    featureContent: {
        flex: 1,
        marginLeft: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    featureText: {
        fontSize: 14,
        color: theme.colors.text,
        opacity: 0.7,
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    disclaimer: {
        fontSize: 12,
        color: theme.colors.text,
        opacity: 0.5,
        textAlign: 'center',
        lineHeight: 18,
    },
});
