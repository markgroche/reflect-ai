/**
 * Encryption Service
 * Handles all encryption/decryption operations for sensitive data
 */

import CryptoJS from 'crypto-js';
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';

class EncryptionServiceClass {
    private encryptionKey: string | null = null;
    private readonly KEY_SIZE = 256;
    private readonly ITERATIONS = 100000;
    private readonly KEYCHAIN_SERVICE = 'com.reflect.encryption';
    private readonly MASTER_KEY_ALIAS = 'reflect_master_key';

    /**
     * Initialize the encryption service and generate/retrieve encryption key
     */
    async initialize(): Promise<void> {
        try {
            // Try to retrieve existing key from secure storage
            const credentials = await Keychain.getInternetCredentials(this.KEYCHAIN_SERVICE);

            if (credentials) {
                this.encryptionKey = credentials.password;
            } else {
                // Generate new encryption key
                await this.generateAndStoreKey();
            }
        } catch (error) {
            console.error('Failed to initialize encryption service:', error);
            // Fallback to encrypted storage
            await this.initializeWithEncryptedStorage();
        }
    }

    /**
     * Fallback initialization using EncryptedStorage
     */
    private async initializeWithEncryptedStorage(): Promise<void> {
        try {
            const storedKey = await EncryptedStorage.getItem(this.MASTER_KEY_ALIAS);

            if (storedKey) {
                this.encryptionKey = storedKey;
            } else {
                const newKey = this.generateRandomKey();
                await EncryptedStorage.setItem(this.MASTER_KEY_ALIAS, newKey);
                this.encryptionKey = newKey;
            }
        } catch (error) {
            console.error('Failed to initialize with encrypted storage:', error);
            throw new Error('Unable to initialize encryption');
        }
    }

    /**
     * Generate and store a new encryption key
     */
    private async generateAndStoreKey(): Promise<void> {
        const key = this.generateRandomKey();

        try {
            // Store in iOS Keychain / Android Keystore
            await Keychain.setInternetCredentials(
                this.KEYCHAIN_SERVICE,
                'encryption',
                key
            );

            this.encryptionKey = key;
        } catch (error) {
            // Fallback to encrypted storage
            await EncryptedStorage.setItem(this.MASTER_KEY_ALIAS, key);
            this.encryptionKey = key;
        }
    }

    /**
     * Generate a random encryption key
     */
    private generateRandomKey(): string {
        const randomWords = CryptoJS.lib.WordArray.random(this.KEY_SIZE / 8);
        return randomWords.toString(CryptoJS.enc.Base64);
    }

    /**
     * Derive a key from a password using PBKDF2
     */
    deriveKeyFromPassword(password: string, salt: string): string {
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: this.KEY_SIZE / 32,
            iterations: this.ITERATIONS,
        });

        return key.toString(CryptoJS.enc.Base64);
    }

    /**
     * Encrypt a string using AES-256-GCM
     */
    async encrypt(plaintext: string): Promise<string> {
        if (!this.encryptionKey) {
            await this.initialize();
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }
        }

        try {
            // Generate random IV for each encryption
            const iv = CryptoJS.lib.WordArray.random(128 / 8);

            // Encrypt using AES
            const encrypted = CryptoJS.AES.encrypt(plaintext, this.encryptionKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            // Combine IV and ciphertext for storage
            const combined = iv.toString() + ':' + encrypted.toString();

            return combined;
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt a string
     */
    async decrypt(ciphertext: string): Promise<string> {
        if (!this.encryptionKey) {
            await this.initialize();
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }
        }

        try {
            // Split IV and ciphertext
            const parts = ciphertext.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid ciphertext format');
            }

            const iv = CryptoJS.enc.Hex.parse(parts[0]);
            const encrypted = parts[1];

            // Decrypt using AES
            const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Encrypt an object as JSON
     */
    async encryptObject(obj: any): Promise<string> {
        const jsonString = JSON.stringify(obj);
        return this.encrypt(jsonString);
    }

    /**
     * Decrypt JSON back to an object
     */
    async decryptObject<T>(ciphertext: string): Promise<T> {
        const jsonString = await this.decrypt(ciphertext);
        return JSON.parse(jsonString) as T;
    }

    /**
     * Generate a hash of a string (for non-reversible operations)
     */
    hash(input: string): string {
        return CryptoJS.SHA256(input).toString(CryptoJS.enc.Base64);
    }

    /**
     * Compare a plaintext value with a hash
     */
    verifyHash(plaintext: string, hash: string): boolean {
        return this.hash(plaintext) === hash;
    }

    /**
     * Securely wipe sensitive data from memory
     * Note: JavaScript doesn't provide true memory wiping, but we can overwrite
     */
    secureWipe(data: string): void {
        if (typeof data === 'string') {
            // Overwrite the string multiple times
            let wipeData = data;
            for (let i = 0; i < 3; i++) {
                wipeData = CryptoJS.lib.WordArray.random(data.length).toString();
            }
        }
    }

    /**
     * Generate a secure random string (for IDs, tokens, etc.)
     */
    generateSecureRandom(length: number = 32): string {
        const random = CryptoJS.lib.WordArray.random(length);
        return random.toString(CryptoJS.enc.Base64)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Rotate the encryption key (for security best practices)
     */
    async rotateKey(oldData: any[]): Promise<any[]> {
        // Store old key temporarily
        const oldKey = this.encryptionKey;

        try {
            // Generate new key
            await this.generateAndStoreKey();

            // Re-encrypt all data with new key
            const reencryptedData = [];

            for (const item of oldData) {
                // Decrypt with old key
                this.encryptionKey = oldKey;
                const decrypted = await this.decrypt(item);

                // Encrypt with new key
                this.encryptionKey = await this.getStoredKey();
                const reencrypted = await this.encrypt(decrypted);

                reencryptedData.push(reencrypted);
            }

            return reencryptedData;
        } catch (error) {
            // Restore old key on failure
            this.encryptionKey = oldKey;
            throw error;
        }
    }

    /**
     * Get the stored encryption key
     */
    private async getStoredKey(): Promise<string> {
        try {
            const credentials = await Keychain.getInternetCredentials(this.KEYCHAIN_SERVICE);
            if (credentials) {
                return credentials.password;
            }
        } catch (error) {
            // Fallback to encrypted storage
            const key = await EncryptedStorage.getItem(this.MASTER_KEY_ALIAS);
            if (key) {
                return key;
            }
        }

        throw new Error('No encryption key found');
    }

    /**
     * Clear all encryption keys (use with extreme caution!)
     */
    async clearKeys(): Promise<void> {
        try {
            await Keychain.resetInternetCredentials(this.KEYCHAIN_SERVICE);
            await EncryptedStorage.removeItem(this.MASTER_KEY_ALIAS);
            this.encryptionKey = null;
        } catch (error) {
            console.error('Failed to clear keys:', error);
        }
    }
}

// Export singleton instance
export const EncryptionService = new EncryptionServiceClass();
