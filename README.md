# Reflect - Private Therapy Journal & AI Supervisor

A secure, privacy-first mobile application for therapists to journal client sessions and engage in reflective conversations with an on-device AI supervisor.

## 🔒 Privacy First

- **100% On-Device**: All data stays on your device
- **Local AI**: Uses on-device language models - no cloud processing
- **End-to-End Encryption**: AES-256 encryption for all sensitive data
- **Biometric Security**: Face ID/Touch ID/Fingerprint authentication
- **No Analytics**: Zero tracking or telemetry

## ✨ Features

### Current (MVP)
- 📝 Encrypted journal entries for therapy sessions
- 🔐 Biometric and PIN authentication
- 🧠 On-device AI supervisor for reflection
- 📊 Basic emotional state tracking
- 🏷️ Tag system for organizing entries
- 🔍 Local search functionality

### Planned (See [ROADMAP.md](docs/ROADMAP.md))
- 📈 Advanced analytics and insights
- 💾 Encrypted backup/restore
- 📤 Secure export options
- 🎯 Pattern recognition across sessions
- 📱 Apple Watch companion app

## 🌐 Live Demos

### Web Preview (Visual Demo)
🔗 [**View Live Demo**](https://htmlpreview.github.io/?https://github.com/markgroche/reflect-journal/blob/main/web-preview/index.html)

### Easy Deploy Version (Working App)
🔗 [**Try the Working App**](https://htmlpreview.github.io/?https://github.com/markgroche/reflect-journal/blob/main/easy-deploy/index.html)

> **Note**: These links use htmlpreview.github.io to render the HTML directly from GitHub. For best performance, deploy to Netlify or enable GitHub Pages.

## 🚀 Quick Start

### Option 1: Use the Web Version (Easy!)
1. Download the `easy-deploy` folder
2. Open `index.html` in your browser
3. Or deploy to Netlify in 2 minutes - [see instructions](easy-deploy/README.md)

### Option 2: React Native App (Advanced)
1. **Install Dependencies**
```bash
npm install
cd ios && pod install
```

2. **Set Up LLM Model**
Download a compatible GGUF model and place it in the appropriate directory:
- iOS: `ios/Reflect/Models/`
- Android: `android/app/src/main/assets/models/`

3. **Run the App**
```bash
# iOS
npm run ios

# Android
npm run android
```

For detailed setup instructions, see [SETUP.md](docs/SETUP.md).

## 📱 System Requirements

### iOS
- iOS 13.0 or later
- iPhone 6s or newer
- Face ID or Touch ID capable device (recommended)

### Android
- Android 6.0 (API 23) or later
- 2GB RAM minimum (4GB recommended)
- Fingerprint sensor (recommended)

## 🏗️ Architecture

The app follows a three-tier architecture:
- **Presentation Layer**: React Native with TypeScript
- **Business Logic**: Service classes for data management
- **Data Layer**: SQLite with encryption + on-device LLM

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed information.

## 🛡️ Security Features

- **Database Encryption**: SQLCipher integration
- **Secure Key Storage**: iOS Keychain / Android Keystore
- **Session Management**: Automatic timeout after 15 minutes
- **Failed Login Protection**: App locks after 3 failed attempts
- **Privacy Screen**: Hides content when app is backgrounded

## 🤖 AI Integration

The app uses a local language model for therapeutic reflection:
- **iOS**: Core ML or llama.cpp
- **Android**: TensorFlow Lite or llama.cpp
- **Model Size**: 7B parameters (4-bit quantized)
- **Context Window**: 2048 tokens

## 📂 Project Structure

```
Reflect/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── contexts/        # React Context providers
│   ├── services/        # Business logic services
│   ├── types/          # TypeScript definitions
│   └── config/         # App configuration
├── ios/                # iOS native code
│   └── ReflectLLMBridge.* # LLM native module
├── android/            # Android native code
│   └── .../llm/       # LLM native module
├── docs/              # Documentation
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── ROADMAP.md
└── models/            # LLM model files (git-ignored)
```

## 🧪 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🤝 Contributing

This is currently a private project. If you have access:

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## ⚖️ Ethical Considerations

This app is designed to support therapists' professional development through reflection. It:
- Does NOT replace professional supervision
- Does NOT provide clinical advice or diagnoses
- Does NOT make therapeutic decisions
- DOES encourage ethical reflection and self-care

## 📜 License

Private and Confidential. All rights reserved.

## ⚠️ Disclaimer

This application is a tool for personal reflection and does not replace professional clinical supervision. Always consult with qualified supervisors for clinical guidance. The AI supervisor is designed to facilitate reflection, not to provide clinical advice or make diagnostic assessments.

## 📞 Support

For technical support or questions about the app, please contact the development team.

---

**Remember**: Your clients' confidentiality and your professional wellbeing are paramount. This app is designed to support both.
