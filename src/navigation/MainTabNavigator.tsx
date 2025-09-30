/**
 * Main Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import { theme } from '../config/theme';

// Import screens
import { JournalScreen } from '../screens/JournalScreen';
import { ReflectScreen } from '../screens/ReflectScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { SettingsTabScreen } from '../screens/SettingsTabScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'Journal':
                            iconName = focused ? 'notebook' : 'notebook-outline';
                            break;
                        case 'Reflect':
                            iconName = focused ? 'head-heart' : 'head-heart-outline';
                            break;
                        case 'Insights':
                            iconName = focused ? 'chart-line' : 'chart-line-variant';
                            break;
                        case 'Settings':
                            iconName = focused ? 'cog' : 'cog-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.tabBarInactive,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBarBackground,
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: theme.colors.headerBackground,
                },
                headerTintColor: theme.colors.headerText,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Journal"
                component={JournalScreen}
                options={{
                    title: 'Journal',
                    headerTitle: 'Session Journal',
                }}
            />
            <Tab.Screen
                name="Reflect"
                component={ReflectScreen}
                options={{
                    title: 'Reflect',
                    headerTitle: 'Reflection Sessions',
                }}
            />
            <Tab.Screen
                name="Insights"
                component={InsightsScreen}
                options={{
                    title: 'Insights',
                    headerTitle: 'Your Insights',
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsTabScreen}
                options={{
                    title: 'Settings',
                    headerTitle: 'Settings',
                }}
            />
        </Tab.Navigator>
    );
};
