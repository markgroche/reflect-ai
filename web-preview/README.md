# Reflect App - Web Preview

This is a visual preview of the Reflect app's user interface. Since React Native apps run on mobile devices, this HTML/CSS preview helps visualize the app's design and flow.

## Viewing the Preview

### Local Preview
1. Navigate to this directory
2. Run a simple web server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open http://localhost:8080 in your browser

### Screens Included

1. **Splash Screen** - App loading screen with logo
2. **Authentication Screen** - PIN entry with biometric option
3. **Journal List** - Main screen showing therapy session notes
4. **AI Conversation** - Chat interface with AI supervisor
5. **New Entry** - Form for creating session notes

## About the Actual App

The real Reflect app is built with React Native and includes:
- On-device AI processing (no data leaves the device)
- AES-256 encryption for all data
- Biometric authentication
- Offline-first functionality
- Native mobile performance

This preview is just for visualization - the actual app provides a full interactive experience on iOS and Android devices.
