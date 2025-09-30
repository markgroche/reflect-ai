/**
 * Reflect - Secure Journaling App for Therapists
 * Main Application Entry Point
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { AuthProvider } from './src/contexts/AuthContext';
import { JournalProvider } from './src/contexts/JournalContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DatabaseService } from './src/services/DatabaseService';
import { theme } from './src/config/theme';
import { SplashScreen } from './src/screens/SplashScreen';

const App: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Initialize database
            await DatabaseService.initialize();

            // Initialize LLM service (placeholder - implement native module)
            // await LLMService.initialize();

            // Small delay to show splash screen
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsInitialized(true);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            setInitError('Failed to initialize application. Please restart.');
        }
    };

    if (!isInitialized) {
        return <SplashScreen error={initError} />;
    }

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <SettingsProvider>
                    <AuthProvider>
                        <JournalProvider>
                            <NavigationContainer>
                                <StatusBar
                                    barStyle="light-content"
                                    backgroundColor={theme.colors.primary}
                                />
                                <RootNavigator />
                            </NavigationContainer>
                        </JournalProvider>
                    </AuthProvider>
                </SettingsProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

export default App;
