import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import eventsApi from '../../api/eventsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = SCREEN_WIDTH * 0.72;

export default function QrScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || validating) return;
    setScanned(true);
    processEventCode(data);
  };

  const processEventCode = async (rawCode) => {
    const cleanCode = (rawCode || '').trim();
    if (!cleanCode) {
      Alert.alert('Invalid QR', 'No event code detected.');
      setScanned(false);
      return;
    }

    try {
      setValidating(true);
      // Check if it matches an event id or full url with event id
      let eventId = cleanCode;
      if (cleanCode.includes('/event/')) {
        const parts = cleanCode.split('/event/');
        eventId = parts[1]?.split('/')[0] || cleanCode;
      }

      const event = await eventsApi.getEventById(eventId);
      if (event && event._id) {
        navigation.navigate('EventDetail', { id: event._id });
      } else {
        Alert.alert('Event Not Found', `No event matches code: ${eventId}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not find an event with this code. Please check the code.');
    } finally {
      setValidating(false);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Venue / Event QR</Text>
        <Text style={styles.headerSubtitle}>
          Point camera at event poster or booth code
        </Text>
      </View>

      {/* Camera View or Permission Prompt */}
      <View style={styles.cameraBox}>
        {!permission ? (
          <View style={styles.permissionBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !permission.granted ? (
          <View style={styles.permissionBox}>
            <Ionicons name="camera-outline" size={60} color={colors.textMuted} />
            <Text style={styles.permTitle}>Camera Access Required</Text>
            <Text style={styles.permSubtitle}>
              We need camera access to scan event and venue QR codes.
            </Text>
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <Text style={styles.permBtnText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            enableTorch={torch}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            {/* Viewfinder Target */}
            <View style={styles.overlay}>
              <View style={styles.scanTarget}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                {validating && (
                  <View style={styles.scanningLoader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.scanningText}>Verifying Event...</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Torch Control Button */}
            <TouchableOpacity
              style={[styles.torchBtn, torch && styles.torchBtnActive]}
              onPress={() => setTorch(!torch)}
            >
              <Ionicons
                name={torch ? 'flash' : 'flash-off'}
                size={22}
                color={torch ? '#fff' : colors.textMuted}
              />
            </TouchableOpacity>
          </CameraView>
        )}
      </View>

      {/* Manual Entry Fallback */}
      <View style={styles.manualEntrySection}>
        <Text style={styles.manualLabel}>Or Enter Event Pass ID Manually:</Text>
        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Paste or type Event ID..."
            placeholderTextColor={colors.textMuted}
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.manualSubmitBtn}
            onPress={() => processEventCode(manualCode)}
            disabled={validating || !manualCode.trim()}
          >
            {validating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.manualSubmitText}>Open</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  cameraBox: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 14, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTarget: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scanningLoader: {
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  torchBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  torchBtnActive: {
    backgroundColor: colors.primary,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  permSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  permBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  manualEntrySection: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    marginTop: 14,
  },
  manualLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    fontSize: 13,
  },
  manualSubmitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
