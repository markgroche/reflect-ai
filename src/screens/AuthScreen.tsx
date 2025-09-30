/**
 * Authentication Screen
 * Handles PIN and biometric authentication
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';

export const AuthScreen: React.FC = () => {
    const { login, biometricAuth, authState } = useAuth();
    const [pin, setPin] = useState('');
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [confirmPin, setConfirmPin] = useState('');

    useEffect(() => {
        // Auto-trigger biometric auth if available and enabled
        if (biometricAuth.isAvailable && !authState.isLocked) {
            handleBiometricAuth();
        }
    }, []);

    const handleBiometricAuth = async () => {
        const success = await login();
        if (!success && biometricAuth.isAvailable) {
            // Biometric failed, show PIN input
            Alert.alert('Authentication Failed', 'Please enter your PIN');
        }
    };

    const handlePinSubmit = async () => {
        if (isSettingPin) {
            if (pin.length !== 6) {
                Alert.alert('Invalid PIN', 'PIN must be 6 digits');
                return;
            }

            if (pin !== confirmPin) {
                Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
                return;
            }

            // Save the new PIN (this would be handled by AuthContext)
            const success = await login(pin);
            if (success) {
                setPin('');
                setConfirmPin('');
                setIsSettingPin(false);
            }
        } else {
            const success = await login(pin);
            if (success) {
                setPin('');
            }
        }
    };

    const renderPinInput = (value: string, onChange: (text: string) => void, placeholder: string) => {
        const digits = value.split('');

        return (
            <View style={styles.pinContainer}>
                <Text style={styles.pinLabel}>{placeholder}</Text>
                <View style={styles.pinInputContainer}>
                    {[...Array(6)].map((_, index) => (
                        <View key={index} style={styles.pinDigit}>
                            <Text style={styles.pinDigitText}>
                                {digits[index] ? '•' : ''}
                            </Text>
                        </View>
                    ))}
                </View>
                <TextInput
                    style={styles.hiddenInput}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    maxLength={6}
                    secureTextEntry
                    autoFocus
                />
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Icon name="shield-lock" size={80} color={theme.colors.primary} />
                <Text style={styles.title}>Welcome to Reflect</Text>
                <Text style={styles.subtitle}>Your secure reflection space</Text>
            </View>

            <View style={styles.authContainer}>
                {authState.isLocked && (
                    <View style={styles.lockedMessage}>
                        <Icon name="lock" size={24} color={theme.colors.error} />
                        <Text style={styles.lockedText}>
                            App is temporarily locked due to multiple failed attempts.
                            Please try again later.
                        </Text>
                    </View>
                )}

                {!authState.isLocked && (
                    <>
                        {isSettingPin ? (
                            <>
                                {renderPinInput(pin, setPin, 'Create a 6-digit PIN')}
                                {pin.length === 6 && renderPinInput(confirmPin, setConfirmPin, 'Confirm your PIN')}
                            </>
                        ) : (
                            renderPinInput(pin, setPin, 'Enter your PIN')}
            )}

                        <TouchableOpacity
                            style={[styles.submitButton, pin.length < 6 && styles.submitButtonDisabled]}
                            onPress={handlePinSubmit}
                            disabled={pin.length < 6 || (isSettingPin && pin !== confirmPin)}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSettingPin ? 'Set PIN' : 'Unlock'}
                            </Text>
                        </TouchableOpacity>

                        {biometricAuth.isAvailable && !isSettingPin && (
                            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                                <Icon
                                    name={
                                        biometricAuth.type === 'FaceID'
                                            ? 'face-recognition'
                                            : 'fingerprint'
                                    }
                                    size={32}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.biometricButtonText}>
                                    Use {biometricAuth.type}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {authState.failedAttempts > 0 && !authState.isLocked && (
                    <Text style={styles.attemptsText}>
                        {3 - authState.failedAttempts} attempts remaining
                    </Text>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    All data is encrypted and stored locally on your device
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text,
        opacity: 0.7,
        marginTop: 8,
    },
    authContainer: {
        flex: 1,
        paddingHorizontal: 40,
    },
    lockedMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.error,
        marginBottom: 20,
    },
    lockedText: {
        flex: 1,
        marginLeft: 12,
        color: theme.colors.error,
    },
    pinContainer: {
        marginBottom: 30,
    },
    pinLabel: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    pinInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pinDigit: {
        width: 45,
        height: 45,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    pinDigitText: {
        fontSize: 24,
        color: theme.colors.text,
    },
    hiddenInput: {
        position: 'absolute',
        left: -1000,
        top: -1000,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderRadius: 8,
        backgroundColor: '#FFF',
    },
    biometricButtonText: {
        marginLeft: 12,
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    attemptsText: {
        textAlign: 'center',
        color: theme.colors.error,
        marginTop: 16,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.text,
        opacity: 0.5,
    },
});
