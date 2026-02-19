import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles/theme';
import { extractProductId } from '../utils/blockchain';

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    try {
      // Extract product ID from QR code data
      const productId = extractProductId(data);
      
      // Navigate to product screen
      navigation.navigate('Product', { productId });
      
      // Reset scanner after 2 seconds
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    } catch (error) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code does not contain valid product information.',
        [
          { text: 'OK', onPress: () => setScanned(false) },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={[styles.messageContainer, { backgroundColor: COLORS.glassBackground }]}>
          <Text style={styles.messageIcon}>📷</Text>
          <Text style={styles.messageTitle}>Camera Permission Required</Text>
          <Text style={styles.messageText}>
            VeriOrganic needs camera access to scan QR codes on products.
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={torchOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <LinearGradient
              colors={['rgba(10, 16, 14, 0.8)', 'transparent']}
              style={styles.gradient}
            >
              <Text style={styles.instructionText}>
                {scanned ? '✓ QR Code Detected!' : 'Position QR code in the frame'}
              </Text>
            </LinearGradient>
          </View>

          {/* Middle Section with Scanning Frame */}
          <View style={styles.middleSection}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanFrame}>
              {/* Corner Markers */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning Line Animation (simplified) */}
              {!scanned && (
                <View style={styles.scanLine} />
              )}
            </View>
            <View style={styles.sideOverlay} />
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <LinearGradient
              colors={['transparent', 'rgba(10, 16, 14, 0.8)']}
              style={styles.gradient}
            >
              {/* Controls */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: COLORS.glassBackground }]}
                  onPress={() => setTorchOn(!torchOn)}
                >
                  <Text style={styles.controlIcon}>{torchOn ? '🔦' : '💡'}</Text>
                  <Text style={styles.controlText}>
                    {torchOn ? 'Torch On' : 'Torch Off'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: COLORS.glassBackground }]}
                  onPress={() => navigation.navigate('Product', { productId: 1 })}
                >
                  <Text style={styles.controlIcon}>🥑</Text>
                  <Text style={styles.controlText}>Try Demo</Text>
                </TouchableOpacity>
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Scan the QR code on any VeriOrganic product package
              </Text>
            </LinearGradient>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  
  // Top Section
  topSection: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  instructionText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  // Middle Section (Scan Frame)
  middleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideOverlay: {
    flex: 1,
    height: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primaryLightest,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primaryLightest,
    opacity: 0.8,
  },
  
  // Bottom Section
  bottomSection: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  controlButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    minWidth: 100,
  },
  controlIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  controlText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  helpText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  
  // Permission Messages
  messageContainer: {
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  messageIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  messageTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  messageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  settingsButton: {
    backgroundColor: COLORS.primaryMid,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  settingsButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
