/**
 * Root Navigator
 * Main navigation structure for the app
 */

import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';

// Import screens (to be created)
import { AuthScreen } from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { EntryDetailScreen } from '../screens/EntryDetailScreen';
import { NewEntryScreen } from '../screens/NewEntryScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { AboutScreen } from '../screens/AboutScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
    const { authState, user } = useAuth();
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

    useEffect(() => {
        checkFirstLaunch();
    }, []);

    const checkFirstLaunch = async () => {
        // Check if this is the user's first launch
        // In production, this would check AsyncStorage
        setIsFirstLaunch(!user);
    };

    if (isFirstLaunch === null) {
        // Still checking, could show a loading screen here
        return null;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#4A6FA5',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            {!authState.isAuthenticated ? (
                <>
                    {isFirstLaunch && (
                        <Stack.Screen
                            name="Onboarding"
                            component={OnboardingScreen}
                            options={{ headerShown: false }}
                        />
                    )}
                    <Stack.Screen
                        name="Auth"
                        component={AuthScreen}
                        options={{ headerShown: false }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Main"
                        component={MainTabNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="EntryDetail"
                        component={EntryDetailScreen}
                        options={{
                            title: 'Session Entry',
                            headerBackTitle: 'Back',
                        }}
                    />
                    <Stack.Screen
                        name="NewEntry"
                        component={NewEntryScreen}
                        options={{
                            title: 'New Entry',
                            headerBackTitle: 'Cancel',
                        }}
                    />
                    <Stack.Screen
                        name="Conversation"
                        component={ConversationScreen}
                        options={{
                            title: 'Reflect',
                            headerBackTitle: 'Back',
                        }}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            title: 'Settings',
                        }}
                    />
                    <Stack.Screen
                        name="Analytics"
                        component={AnalyticsScreen}
                        options={{
                            title: 'Insights',
                        }}
                    />
                    <Stack.Screen
                        name="Export"
                        component={ExportScreen}
                        options={{
                            title: 'Export Data',
                        }}
                    />
                    <Stack.Screen
                        name="About"
                        component={AboutScreen}
                        options={{
                            title: 'About Reflect',
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};
