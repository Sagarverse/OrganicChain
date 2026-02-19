# 📱 VeriOrganic Mobile Scanner

React Native mobile app for scanning QR codes and verifying organic products on-the-go.

## Features

- 📷 QR Code Scanner (camera-based)
- ✅ Product Verification
- 🎨 Glassmorphism UI matching web app
- 📊 Authenticity Score Display
- 🌱 Carbon Footprint
- 📍 Product Journey Timeline
- 🔗 Deep linking to web app

## Tech Stack

- **React Native 0.73**
- **Expo SDK 50** (for easier camera access)
- **ethers.js** for blockchain interaction
- **react-native-reanimated** for smooth animations

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone

### Installation

```bash
cd mobile-app
npm install
```

### Run on Device

```bash
# Start Expo development server
npm start

# Scan QR code with Expo Go app (iOS/Android)
```

### Build for Production

```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Project Structure

```
mobile-app/
├── App.js                 # Main app component
├── src/
│   ├── screens/
│   │   ├── ScannerScreen.js      # QR scanner
│   │   ├── ProductScreen.js       # Product details
│   │   └── HomeScreen.js          # Welcome screen
│   ├── components/
│   │   ├── VerificationBadge.js   # Authenticity score
│   │   ├── Timeline.js            # Journey visualization
│   │   └── GlassCard.js           # Reusable glass card
│   ├── utils/
│   │   ├── blockchain.js          # Ethers.js functions
│   │   └── constants.js           # Contract ABI & config
│   └── styles/
│       └── theme.js               # Colors & glassmorphism
├── package.json
├── app.json              # Expo configuration
└── README.md
```

## Environment Variables

Create `.env` file:

```bash
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CHAIN_ID=11155111
```

## Screenshots

### Scanner Screen
<img src="docs/scanner.png" width="300">

### Product Details
<img src="docs/product.png" width="300">

### Verification Badge
<img src="docs/badge.png" width="300">

## Platform-Specific Notes

### iOS
- Camera permission automatically requested
- Requires iOS 13.0+
- Test on physical device (simulator camera limited)

### Android
- Camera permission automatically requested
- Requires Android 5.0+
- Works on emulator with webcam passthrough

## Building Standalone Apps

### Configure `app.json`

```json
{
  "expo": {
    "name": "VeriOrganic",
    "slug": "veriorganic",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#1a3f2c"
    },
    "ios": {
      "bundleIdentifier": "com.veriorganic.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.veriorganic.app",
      "versionCode": 1,
      "permissions": ["CAMERA"]
    }
  }
}
```

### Build Commands

```bash
# Login to Expo
expo login

# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for Android
eas build --platform android
```

## Testing

```bash
# Run tests
npm test

# Run with specific device
expo start --ios
expo start --android
```

## Troubleshooting

### Camera Not Working
- Check app permissions in device settings
- Restart Expo Go app
- Use physical device instead of simulator

### Blockchain Connection Fails
- Verify RPC_URL is correct
- Check contract address matches deployed contract
- Ensure device has internet connection

### Slow Performance
- Enable Hermes engine in `app.json`
- Optimize images (use WebP)
- Use memoization for heavy components

## License

MIT
