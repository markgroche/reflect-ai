/**
 * Settings Context
 * Manages app settings and preferences
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types';

interface SettingsContextType {
    settings: UserSettings;
    updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
    resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
    biometricsEnabled: false,
    sessionTimeout: 15,
    themeMode: 'auto',
    fontSize: 'medium',
    autoBackup: true,
    reminderEnabled: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('app_settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const updateSettings = async (updates: Partial<UserSettings>) => {
        try {
            const newSettings = { ...settings, ...updates };
            setSettings(newSettings);
            await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    };

    const resetSettings = async () => {
        try {
            setSettings(DEFAULT_SETTINGS);
            await AsyncStorage.setItem('app_settings', JSON.stringify(DEFAULT_SETTINGS));
        } catch (error) {
            console.error('Failed to reset settings:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSettings,
                resetSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
