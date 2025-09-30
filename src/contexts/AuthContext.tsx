/**
 * Authentication Context
 * Manages user authentication state and biometric/PIN authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import EncryptedStorage from 'react-native-encrypted-storage';
import { AuthState, BiometricAuth, User } from '../types';

interface AuthContextType {
    authState: AuthState;
    user: User | null;
    biometricAuth: BiometricAuth;
    login: (pin?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    setupPin: (pin: string) => Promise<void>;
    checkBiometricAvailability: () => Promise<void>;
    enableBiometrics: (enable: boolean) => Promise<void>;
    unlockApp: () => Promise<boolean>;
    lockApp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLocked: false,
        failedAttempts: 0,
    });

    const [user, setUser] = useState<User | null>(null);
    const [biometricAuth, setBiometricAuth] = useState<BiometricAuth>({
        isAvailable: false,
        type: 'None',
    });

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            // Check if user exists
            const userDataString = await EncryptedStorage.getItem('user_data');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setUser(userData);
            }

            // Check biometric availability
            await checkBiometricAvailability();

            // Check if app should be locked
            const lockTimeString = await EncryptedStorage.getItem('lock_until');
            if (lockTimeString) {
                const lockUntil = new Date(lockTimeString);
                if (lockUntil > new Date()) {
                    setAuthState(prev => ({ ...prev, isLocked: true }));
                } else {
                    await EncryptedStorage.removeItem('lock_until');
                }
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
        }
    };

    const checkBiometricAvailability = async () => {
        try {
            const rnBiometrics = new ReactNativeBiometrics();
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();

            let type: BiometricAuth['type'] = 'None';
            if (biometryType === ReactNativeBiometrics.FaceID) {
                type = 'FaceID';
            } else if (biometryType === ReactNativeBiometrics.TouchID) {
                type = 'TouchID';
            } else if (biometryType === ReactNativeBiometrics.Biometrics) {
                type = 'Fingerprint';
            }

            setBiometricAuth({
                isAvailable: available,
                type,
            });
        } catch (error) {
            console.error('Biometric check failed:', error);
            setBiometricAuth({ isAvailable: false, type: 'None' });
        }
    };

    const login = async (pin?: string): Promise<boolean> => {
        try {
            if (authState.isLocked) {
                const lockTimeString = await EncryptedStorage.getItem('lock_until');
                if (lockTimeString) {
                    const lockUntil = new Date(lockTimeString);
                    if (lockUntil > new Date()) {
                        const minutesLeft = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
                        Alert.alert('App Locked', `Too many failed attempts. Try again in ${minutesLeft} minutes.`);
                        return false;
                    }
                }
            }

            let authenticated = false;

            // Try biometric authentication first if enabled
            const biometricsEnabled = await EncryptedStorage.getItem('biometrics_enabled');
            if (biometricsEnabled === 'true' && biometricAuth.isAvailable) {
                const rnBiometrics = new ReactNativeBiometrics();
                const { success } = await rnBiometrics.simplePrompt({
                    promptMessage: 'Authenticate to access Reflect',
                    cancelButtonText: 'Use PIN',
                });
                authenticated = success;
            }

            // Fall back to PIN if biometric fails or is not available
            if (!authenticated && pin) {
                const storedPin = await EncryptedStorage.getItem('user_pin');
                authenticated = storedPin === pin;
            }

            if (authenticated) {
                setAuthState({
                    isAuthenticated: true,
                    isLocked: false,
                    failedAttempts: 0,
                    lastAuthTime: new Date(),
                });

                // Create or load user
                if (!user) {
                    const newUser: User = {
                        id: 'user_' + Date.now(),
                        createdAt: new Date(),
                        lastLogin: new Date(),
                        settings: {
                            biometricsEnabled: false,
                            sessionTimeout: 15,
                            themeMode: 'auto',
                            fontSize: 'medium',
                            autoBackup: true,
                            reminderEnabled: false,
                        },
                    };
                    setUser(newUser);
                    await EncryptedStorage.setItem('user_data', JSON.stringify(newUser));
                }

                return true;
            } else {
                // Handle failed attempt
                const newFailedAttempts = authState.failedAttempts + 1;

                if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                    const lockUntil = new Date(Date.now() + LOCK_DURATION);
                    await EncryptedStorage.setItem('lock_until', lockUntil.toISOString());

                    setAuthState({
                        isAuthenticated: false,
                        isLocked: true,
                        failedAttempts: newFailedAttempts,
                    });

                    Alert.alert('App Locked', 'Too many failed attempts. Try again in 5 minutes.');
                } else {
                    setAuthState(prev => ({
                        ...prev,
                        failedAttempts: newFailedAttempts,
                    }));

                    Alert.alert('Authentication Failed', `${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.`);
                }

                return false;
            }
        } catch (error) {
            console.error('Login failed:', error);
            Alert.alert('Error', 'Authentication failed. Please try again.');
            return false;
        }
    };

    const logout = async () => {
        try {
            setAuthState({
                isAuthenticated: false,
                isLocked: false,
                failedAttempts: 0,
            });
            // Note: We keep user data for next login
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const setupPin = async (pin: string) => {
        try {
            await EncryptedStorage.setItem('user_pin', pin);
            Alert.alert('Success', 'PIN has been set successfully.');
        } catch (error) {
            console.error('Failed to set PIN:', error);
            Alert.alert('Error', 'Failed to set PIN. Please try again.');
        }
    };

    const enableBiometrics = async (enable: boolean) => {
        try {
            await EncryptedStorage.setItem('biometrics_enabled', enable ? 'true' : 'false');

            if (user) {
                const updatedUser = {
                    ...user,
                    settings: {
                        ...user.settings,
                        biometricsEnabled: enable,
                    },
                };
                setUser(updatedUser);
                await EncryptedStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to update biometric settings:', error);
        }
    };

    const unlockApp = async (): Promise<boolean> => {
        return login();
    };

    const lockApp = () => {
        setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
        }));
    };

    return (
        <AuthContext.Provider
            value={{
                authState,
                user,
                biometricAuth,
                login,
                logout,
                setupPin,
                checkBiometricAvailability,
                enableBiometrics,
                unlockApp,
                lockApp,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
