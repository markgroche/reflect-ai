# Reflect Application Architecture

## Overview

Reflect is a privacy-first mobile application designed for therapists to journal and reflect on client sessions. The app uses a three-tier architecture with all processing happening locally on the device.

## Architecture Layers

### 1. Presentation Layer (React Native)
- **Technology**: React Native with TypeScript
- **Navigation**: React Navigation (Stack + Tab navigation)
- **UI Components**: React Native Paper for Material Design
- **State Management**: React Context API for global state

### 2. Business Logic Layer
- **Services**: TypeScript classes for business logic
- **Data Models**: TypeScript interfaces for type safety
- **Encryption**: AES-256 encryption for sensitive data
- **Authentication**: Biometric authentication + PIN fallback

### 3. Data Layer
- **Local Database**: SQLite with encrypted storage
- **Key-Value Storage**: React Native Encrypted Storage for settings
- **LLM Integration**: Native module bridge to on-device model

## Data Flow

```
┌─────────────────────┐
│   UI Components     │
│  (React Native)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Service Layer      │
│  - Journal Service  │
│  - AI Service       │
│  - Auth Service     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Data Layer        │
│  - SQLite DB       │
│  - Encrypted Store  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Native Modules     │
│  - LLM Bridge       │
│  - Biometrics       │
└─────────────────────┘
```

## Key Components

### 1. Journal Entry System
- **Create**: New session entries with metadata
- **Read**: Browse and search past entries
- **Update**: Edit existing entries
- **Delete**: Secure deletion with confirmation

### 2. AI Reflection System
- **Conversation Context**: Maintains session history
- **Prompt Engineering**: Therapeutic reflection prompts
- **Response Processing**: Structured AI responses
- **Privacy**: All processing on-device

### 3. Security Architecture
- **Encryption**: 
  - Database: SQLCipher integration
  - Files: AES-256 encryption
  - Keys: Stored in iOS Keychain / Android Keystore
- **Authentication**:
  - Primary: Biometric (Face ID/Touch ID/Fingerprint)
  - Fallback: 6-digit PIN
  - Session timeout: 15 minutes

### 4. Native Module Bridge

The LLM native module provides a bridge between React Native JavaScript and the on-device model:

```typescript
interface LLMBridge {
  initialize(modelPath: string): Promise<boolean>;
  generateResponse(prompt: string, context: string[]): Promise<string>;
  shutdown(): Promise<void>;
}
```

#### iOS Implementation
- **Language**: Swift/Objective-C
- **Framework**: Core ML for model inference
- **Model Format**: Core ML model package

#### Android Implementation
- **Language**: Kotlin/Java
- **Framework**: TensorFlow Lite
- **Model Format**: TFLite model

## Database Schema

### Tables

1. **journal_entries**
   - id (UUID, primary key)
   - client_identifier (encrypted)
   - session_date (timestamp)
   - session_notes (encrypted)
   - emotional_state (encrypted)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **ai_conversations**
   - id (UUID, primary key)
   - entry_id (foreign key)
   - messages (JSON, encrypted)
   - created_at (timestamp)

3. **app_settings**
   - key (string, primary key)
   - value (encrypted)
   - updated_at (timestamp)

## State Management

### Global State Context
```typescript
interface AppState {
  user: UserState;
  entries: JournalEntry[];
  currentConversation: Conversation | null;
  settings: AppSettings;
}
```

### Local Component State
- Form inputs
- UI state (loading, errors)
- Temporary data

## Performance Considerations

1. **Lazy Loading**: Journal entries loaded in batches
2. **Caching**: Recent entries cached in memory
3. **Background Processing**: LLM inference on background thread
4. **Optimization**: Database indexes on frequently queried fields

## Error Handling

1. **Network**: N/A (all processing local)
2. **Database**: Rollback transactions on failure
3. **LLM**: Graceful fallback if model unavailable
4. **UI**: User-friendly error messages

## Testing Strategy

1. **Unit Tests**: Services and utilities
2. **Integration Tests**: Database operations
3. **E2E Tests**: Critical user flows
4. **Security Tests**: Encryption and authentication
