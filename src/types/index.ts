/**
 * Type definitions for Reflect app
 */

// User and Authentication Types
export interface User {
    id: string;
    createdAt: Date;
    lastLogin: Date;
    settings: UserSettings;
}

export interface UserSettings {
    biometricsEnabled: boolean;
    sessionTimeout: number; // in minutes
    themeMode: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    autoBackup: boolean;
    reminderEnabled: boolean;
    reminderTime?: string; // HH:MM format
}

// Journal Entry Types
export interface JournalEntry {
    id: string;
    clientIdentifier: string; // Encrypted identifier
    sessionDate: Date;
    sessionNotes: string; // Encrypted
    emotionalState: EmotionalState;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    aiConversationId?: string;
}

export interface EmotionalState {
    primary: EmotionType;
    intensity: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = High
    secondary?: EmotionType[];
    notes?: string;
}

export type EmotionType =
    | 'calm'
    | 'anxious'
    | 'frustrated'
    | 'sad'
    | 'overwhelmed'
    | 'confident'
    | 'uncertain'
    | 'satisfied'
    | 'concerned'
    | 'hopeful'
    | 'exhausted'
    | 'engaged';

// AI Conversation Types
export interface Conversation {
    id: string;
    entryId: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    summary?: string;
    insights?: string[];
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: MessageMetadata;
}

export interface MessageMetadata {
    tokens?: number;
    processingTime?: number;
    emotionalTone?: EmotionType;
    suggestedActions?: string[];
}

// Reflection Framework Types
export interface ReflectionPrompt {
    id: string;
    category: ReflectionCategory;
    prompt: string;
    followUps: string[];
    framework?: TherapeuticFramework;
}

export type ReflectionCategory =
    | 'countertransference'
    | 'boundaries'
    | 'ethical'
    | 'clinical'
    | 'self-care'
    | 'professional-development'
    | 'supervision-prep';

export type TherapeuticFramework =
    | 'psychodynamic'
    | 'cbt'
    | 'person-centered'
    | 'systemic'
    | 'integrative';

// Database Types
export interface DatabaseConfig {
    name: string;
    location: string;
    encryptionKey?: string;
}

export interface QueryResult<T> {
    rows: T[];
    rowsAffected: number;
}

// Security Types
export interface AuthState {
    isAuthenticated: boolean;
    isLocked: boolean;
    failedAttempts: number;
    lastAuthTime?: Date;
}

export interface BiometricAuth {
    isAvailable: boolean;
    type: 'FaceID' | 'TouchID' | 'Fingerprint' | 'None';
}

// LLM Service Types
export interface LLMConfig {
    modelPath: string;
    maxTokens: number;
    temperature: number;
    topP?: number;
    topK?: number;
    contextWindow: number;
}

export interface LLMResponse {
    text: string;
    tokens: number;
    processingTime: number;
    error?: string;
}

// Analytics Types (Local Only)
export interface SessionAnalytics {
    totalEntries: number;
    entriesByMonth: Map<string, number>;
    emotionalTrends: EmotionalTrend[];
    commonThemes: Theme[];
    reflectionEngagement: number; // percentage
}

export interface EmotionalTrend {
    emotion: EmotionType;
    frequency: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    averageIntensity: number;
}

export interface Theme {
    name: string;
    frequency: number;
    relatedTags: string[];
    firstOccurrence: Date;
    lastOccurrence: Date;
}

// Export/Import Types
export interface ExportData {
    version: string;
    exportDate: Date;
    entries: JournalEntry[];
    conversations?: Conversation[];
    settings?: UserSettings;
    encrypted: boolean;
}

export interface BackupMetadata {
    id: string;
    createdAt: Date;
    size: number;
    entryCount: number;
    location: 'local' | 'icloud' | 'google-drive';
    encrypted: boolean;
}

// Navigation Types
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    Onboarding: undefined;
    Settings: undefined;
    EntryDetail: { entryId: string };
    NewEntry: { clientId?: string };
    Conversation: { entryId: string };
    Analytics: undefined;
    Export: undefined;
    About: undefined;
};

export type MainTabParamList = {
    Journal: undefined;
    Reflect: undefined;
    Insights: undefined;
    Settings: undefined;
};

// Error Types
export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
