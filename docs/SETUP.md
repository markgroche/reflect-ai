# Reflect - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd Reflect

# Install npm dependencies
npm install

# For iOS, install CocoaPods dependencies
cd ios
pod install
cd ..
```

### 2. Platform-Specific Setup

#### iOS Setup

1. Open `ios/Reflect.xcworkspace` in Xcode
2. Select your development team in project settings
3. Ensure deployment target is iOS 13.0 or higher

#### Android Setup

1. Open `android` folder in Android Studio
2. Sync Gradle files
3. Ensure minimum SDK is API 23 (Android 6.0)

## Local LLM Model Setup

### Option 1: Using Llama.cpp (Recommended for Development)

1. Download a compatible GGUF model (recommended: Llama 2 7B or smaller for mobile):
   ```bash
   # Create models directory
   mkdir -p models
   
   # Download a quantized model (example - replace with actual model URL)
   # Recommended: 4-bit quantized model for mobile devices
   wget https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf -O models/reflect-model.gguf
   ```

2. Place the model file in the appropriate location:
   - iOS: `ios/Reflect/Models/reflect-model.gguf`
   - Android: `android/app/src/main/assets/models/reflect-model.gguf`

### Option 2: Using TensorFlow Lite (Android) / Core ML (iOS)

#### For Android (TFLite):

1. Convert your model to TFLite format:
   ```python
   # Example conversion script
   import tensorflow as tf
   
   converter = tf.lite.TFLiteConverter.from_saved_model('path/to/saved_model')
   converter.optimizations = [tf.lite.Optimize.DEFAULT]
   tflite_model = converter.convert()
   
   with open('reflect-model.tflite', 'wb') as f:
       f.write(tflite_model)
   ```

2. Place in: `android/app/src/main/assets/models/reflect-model.tflite`

#### For iOS (Core ML):

1. Convert your model to Core ML format:
   ```python
   import coremltools as ct
   
   # Example conversion
   model = ct.convert('path/to/model',
                      convert_to="mlprogram",
                      minimum_deployment_target=ct.target.iOS15)
   model.save('ReflectModel.mlpackage')
   ```

2. Add to Xcode project: Drag `ReflectModel.mlpackage` to the Xcode project

## Environment Configuration

### 1. Create Configuration Files

Create `.env` file in the project root:

```env
# App Configuration
APP_NAME=Reflect
DEBUG_MODE=true

# Security Settings
ENCRYPTION_KEY_SIZE=256
SESSION_TIMEOUT_MINUTES=15
MAX_LOGIN_ATTEMPTS=3

# LLM Configuration
MODEL_PATH=models/reflect-model.gguf
MAX_TOKENS=512
TEMPERATURE=0.7
```

### 2. Security Configuration

Create `src/config/security.config.ts`:

```typescript
export const SECURITY_CONFIG = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000,
  },
  biometrics: {
    fallbackToPin: true,
    pinLength: 6,
  },
};
```

## Running the Application

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on specific device
npm run ios -- --device="iPhone 14"
npm run android -- --deviceId="emulator-5554"
```

### Building for Production

#### iOS Production Build

1. Open Xcode
2. Select "Generic iOS Device" as target
3. Product → Archive
4. Distribute App → Ad Hoc or App Store

#### Android Production Build

```bash
cd android

# Generate release APK
./gradlew assembleRelease

# Generate release bundle (for Play Store)
./gradlew bundleRelease
```

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Issues
```bash
# Clear cache
npx react-native start --reset-cache

# Clear watchman
watchman watch-del-all
```

#### 2. iOS Build Failures
```bash
# Clean build
cd ios
xcodebuild clean
pod deintegrate
pod install
cd ..
```

#### 3. Android Build Failures
```bash
# Clean build
cd android
./gradlew clean
cd ..
```

#### 4. LLM Model Loading Issues

- Verify model file exists in correct location
- Check model file permissions
- Ensure model format matches implementation (GGUF/TFLite/CoreML)
- Verify device has sufficient memory (minimum 2GB RAM free)

### Development Tools

#### Debugging
- React Native Debugger: https://github.com/jhen0409/react-native-debugger
- Flipper: https://fbflipper.com/

#### Database Inspection
- Use `react-native-sqlite-storage` debug mode
- Android: Use Android Studio's Database Inspector
- iOS: Use third-party SQLite viewers with simulator DB

## Dependencies Documentation

### Core Dependencies

- **react-native**: Core framework
- **@react-navigation**: Navigation between screens
- **react-native-sqlite-storage**: Local database
- **react-native-encrypted-storage**: Secure key-value storage
- **react-native-keychain**: Secure credential storage
- **react-native-biometrics**: Biometric authentication
- **react-native-paper**: UI components

### Native Module Development

For implementing the LLM bridge:

#### iOS (Swift)
```swift
// ReflectLLMBridge.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReflectLLMBridge, NSObject)
RCT_EXTERN_METHOD(initialize:(NSString *)modelPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateResponse:(NSString *)prompt
                  context:(NSArray *)context
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
```

#### Android (Kotlin)
```kotlin
// ReflectLLMBridge.kt
package com.reflect.llm

import com.facebook.react.bridge.*

class ReflectLLMBridge(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    @ReactMethod
    fun initialize(modelPath: String, promise: Promise) {
        // Implementation
    }
    
    @ReactMethod
    fun generateResponse(prompt: String, context: ReadableArray, promise: Promise) {
        // Implementation
    }
}
```

## Next Steps

1. Complete native module implementation for LLM
2. Set up CI/CD pipeline
3. Configure crash reporting (Sentry/Bugsnag)
4. Set up analytics (privacy-preserving, local only)
5. Implement automated testing suite
