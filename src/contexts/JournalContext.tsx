/**
 * Journal Context
 * Manages journal entries and related operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { JournalEntry, EmotionalState, Conversation } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { EncryptionService } from '../services/EncryptionService';

interface JournalContextType {
    entries: JournalEntry[];
    currentEntry: JournalEntry | null;
    isLoading: boolean;
    loadEntries: () => Promise<void>;
    createEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    getEntry: (id: string) => Promise<JournalEntry | null>;
    searchEntries: (query: string) => Promise<JournalEntry[]>;
    getEntriesByClient: (clientId: string) => Promise<JournalEntry[]>;
    getEntriesByDateRange: (startDate: Date, endDate: Date) => Promise<JournalEntry[]>;
    getConversation: (entryId: string) => Promise<Conversation | null>;
    saveConversation: (conversation: Conversation) => Promise<void>;
    setCurrentEntry: (entry: JournalEntry | null) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        setIsLoading(true);
        try {
            const loadedEntries = await DatabaseService.getAllEntries();

            // Decrypt sensitive fields
            const decryptedEntries = await Promise.all(
                loadedEntries.map(async (entry) => {
                    try {
                        return {
                            ...entry,
                            clientIdentifier: await EncryptionService.decrypt(entry.clientIdentifier),
                            sessionNotes: await EncryptionService.decrypt(entry.sessionNotes),
                        };
                    } catch (error) {
                        console.error('Failed to decrypt entry:', entry.id, error);
                        return entry;
                    }
                })
            );

            // Sort by session date, most recent first
            decryptedEntries.sort((a, b) =>
                new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
            );

            setEntries(decryptedEntries);
        } catch (error) {
            console.error('Failed to load entries:', error);
            Alert.alert('Error', 'Failed to load journal entries');
        } finally {
            setIsLoading(false);
        }
    };

    const createEntry = async (
        entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> => {
        try {
            const id = uuid.v4() as string;
            const now = new Date();

            // Encrypt sensitive fields
            const encryptedEntry: JournalEntry = {
                ...entryData,
                id,
                clientIdentifier: await EncryptionService.encrypt(entryData.clientIdentifier),
                sessionNotes: await EncryptionService.encrypt(entryData.sessionNotes),
                createdAt: now,
                updatedAt: now,
            };

            await DatabaseService.createEntry(encryptedEntry);

            // Add to state with decrypted values
            const newEntry = {
                ...entryData,
                id,
                createdAt: now,
                updatedAt: now,
            };

            setEntries(prev => [newEntry, ...prev]);

            return id;
        } catch (error) {
            console.error('Failed to create entry:', error);
            Alert.alert('Error', 'Failed to create journal entry');
            throw error;
        }
    };

    const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
        try {
            const encryptedUpdates = { ...updates };

            // Encrypt sensitive fields if they're being updated
            if (updates.clientIdentifier !== undefined) {
                encryptedUpdates.clientIdentifier = await EncryptionService.encrypt(updates.clientIdentifier);
            }
            if (updates.sessionNotes !== undefined) {
                encryptedUpdates.sessionNotes = await EncryptionService.encrypt(updates.sessionNotes);
            }

            encryptedUpdates.updatedAt = new Date();

            await DatabaseService.updateEntry(id, encryptedUpdates);

            // Update state
            setEntries(prev =>
                prev.map(entry =>
                    entry.id === id
                        ? { ...entry, ...updates, updatedAt: encryptedUpdates.updatedAt }
                        : entry
                )
            );

            if (currentEntry?.id === id) {
                setCurrentEntry({ ...currentEntry, ...updates, updatedAt: encryptedUpdates.updatedAt });
            }
        } catch (error) {
            console.error('Failed to update entry:', error);
            Alert.alert('Error', 'Failed to update journal entry');
            throw error;
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            await DatabaseService.deleteEntry(id);

            // Also delete associated conversation if exists
            await DatabaseService.deleteConversation(id);

            setEntries(prev => prev.filter(entry => entry.id !== id));

            if (currentEntry?.id === id) {
                setCurrentEntry(null);
            }
        } catch (error) {
            console.error('Failed to delete entry:', error);
            Alert.alert('Error', 'Failed to delete journal entry');
            throw error;
        }
    };

    const getEntry = async (id: string): Promise<JournalEntry | null> => {
        try {
            const entry = await DatabaseService.getEntry(id);

            if (entry) {
                // Decrypt sensitive fields
                return {
                    ...entry,
                    clientIdentifier: await EncryptionService.decrypt(entry.clientIdentifier),
                    sessionNotes: await EncryptionService.decrypt(entry.sessionNotes),
                };
            }

            return null;
        } catch (error) {
            console.error('Failed to get entry:', error);
            return null;
        }
    };

    const searchEntries = async (query: string): Promise<JournalEntry[]> => {
        try {
            const results = await DatabaseService.searchEntries(query);

            // Decrypt results
            return Promise.all(
                results.map(async (entry) => ({
                    ...entry,
                    clientIdentifier: await EncryptionService.decrypt(entry.clientIdentifier),
                    sessionNotes: await EncryptionService.decrypt(entry.sessionNotes),
                }))
            );
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    };

    const getEntriesByClient = async (clientId: string): Promise<JournalEntry[]> => {
        try {
            // Encrypt the client ID for searching
            const encryptedClientId = await EncryptionService.encrypt(clientId);
            const results = await DatabaseService.getEntriesByClient(encryptedClientId);

            // Decrypt results
            return Promise.all(
                results.map(async (entry) => ({
                    ...entry,
                    clientIdentifier: await EncryptionService.decrypt(entry.clientIdentifier),
                    sessionNotes: await EncryptionService.decrypt(entry.sessionNotes),
                }))
            );
        } catch (error) {
            console.error('Failed to get entries by client:', error);
            return [];
        }
    };

    const getEntriesByDateRange = async (
        startDate: Date,
        endDate: Date
    ): Promise<JournalEntry[]> => {
        try {
            const results = await DatabaseService.getEntriesByDateRange(startDate, endDate);

            // Decrypt results
            return Promise.all(
                results.map(async (entry) => ({
                    ...entry,
                    clientIdentifier: await EncryptionService.decrypt(entry.clientIdentifier),
                    sessionNotes: await EncryptionService.decrypt(entry.sessionNotes),
                }))
            );
        } catch (error) {
            console.error('Failed to get entries by date range:', error);
            return [];
        }
    };

    const getConversation = async (entryId: string): Promise<Conversation | null> => {
        try {
            const conversation = await DatabaseService.getConversation(entryId);

            if (conversation) {
                // Decrypt messages
                const decryptedMessages = await Promise.all(
                    conversation.messages.map(async (message) => ({
                        ...message,
                        content: await EncryptionService.decrypt(message.content),
                    }))
                );

                return {
                    ...conversation,
                    messages: decryptedMessages,
                };
            }

            return null;
        } catch (error) {
            console.error('Failed to get conversation:', error);
            return null;
        }
    };

    const saveConversation = async (conversation: Conversation) => {
        try {
            // Encrypt messages before saving
            const encryptedMessages = await Promise.all(
                conversation.messages.map(async (message) => ({
                    ...message,
                    content: await EncryptionService.encrypt(message.content),
                }))
            );

            const encryptedConversation = {
                ...conversation,
                messages: encryptedMessages,
            };

            await DatabaseService.saveConversation(encryptedConversation);

            // Update entry to link conversation
            if (!entries.find(e => e.id === conversation.entryId)?.aiConversationId) {
                await updateEntry(conversation.entryId, {
                    aiConversationId: conversation.id,
                });
            }
        } catch (error) {
            console.error('Failed to save conversation:', error);
            Alert.alert('Error', 'Failed to save conversation');
            throw error;
        }
    };

    return (
        <JournalContext.Provider
            value={{
                entries,
                currentEntry,
                isLoading,
                loadEntries,
                createEntry,
                updateEntry,
                deleteEntry,
                getEntry,
                searchEntries,
                getEntriesByClient,
                getEntriesByDateRange,
                getConversation,
                saveConversation,
                setCurrentEntry,
            }}
        >
            {children}
        </JournalContext.Provider>
    );
};

export const useJournal = () => {
    const context = useContext(JournalContext);
    if (!context) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
};
