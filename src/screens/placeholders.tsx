/**
 * Placeholder screens for rapid prototyping
 * These screens will need to be fully implemented in production
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../config/theme';

const PlaceholderScreen: React.FC<{ title: string; description: string }> = ({
    title,
    description,
}) => (
    <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
    </View>
);

// Entry Detail Screen
export const EntryDetailScreen: React.FC = () => (
    <PlaceholderScreen
        title="Entry Detail"
        description="View and edit journal entry details, start AI reflection"
    />
);

// Conversation Screen
export const ConversationScreen: React.FC = () => (
    <PlaceholderScreen
        title="AI Reflection"
        description="Chat with your AI supervisor about this session"
    />
);

// Reflect Screen (Main Tab)
export const ReflectScreen: React.FC = () => (
    <PlaceholderScreen
        title="Reflection Sessions"
        description="View all your AI reflection conversations"
    />
);

// Insights Screen (Main Tab)
export const InsightsScreen: React.FC = () => (
    <PlaceholderScreen
        title="Insights"
        description="View patterns, trends, and analytics from your journal"
    />
);

// Settings Tab Screen
export const SettingsTabScreen: React.FC = () => (
    <PlaceholderScreen
        title="Settings"
        description="Configure app settings, security, and preferences"
    />
);

// Settings Screen (Stack)
export const SettingsScreen: React.FC = () => (
    <PlaceholderScreen
        title="App Settings"
        description="Detailed settings configuration"
    />
);

// Analytics Screen
export const AnalyticsScreen: React.FC = () => (
    <PlaceholderScreen
        title="Analytics"
        description="Detailed analytics and insights from your practice"
    />
);

// Export Screen
export const ExportScreen: React.FC = () => (
    <PlaceholderScreen
        title="Export Data"
        description="Export your journal entries and create backups"
    />
);

// About Screen
export const AboutScreen: React.FC = () => (
    <ScrollView style={styles.aboutContainer}>
        <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>Reflect</Text>
            <Text style={styles.aboutVersion}>Version 0.0.1 (MVP)</Text>

            <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Privacy First</Text>
                <Text style={styles.aboutText}>
                    All your data stays on your device. No cloud syncing, no external servers,
                    complete privacy for your therapeutic reflections.
                </Text>
            </View>

            <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>On-Device AI</Text>
                <Text style={styles.aboutText}>
                    Uses a local language model to provide reflective support without
                    sending any data over the internet.
                </Text>
            </View>

            <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Security</Text>
                <Text style={styles.aboutText}>
                    • AES-256 encryption for all data
                    {'\n'}• Biometric authentication
                    {'\n'}• Automatic session timeout
                    {'\n'}• Secure key storage
                </Text>
            </View>

            <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Disclaimer</Text>
                <Text style={styles.aboutText}>
                    This app is a tool for personal reflection and does not replace
                    professional supervision. Always consult with qualified supervisors
                    for clinical guidance.
                </Text>
            </View>
        </View>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: theme.colors.text,
        textAlign: 'center',
        opacity: 0.7,
    },
    aboutContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    aboutContent: {
        padding: 20,
    },
    aboutTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    aboutVersion: {
        fontSize: 14,
        color: theme.colors.placeholder,
        textAlign: 'center',
        marginBottom: 32,
    },
    aboutSection: {
        marginBottom: 24,
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 8,
    },
    aboutSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
        opacity: 0.8,
    },
});
