import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanMode } from '../types';

interface ScanScreenProps {
  mode: ScanMode;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const MODE_CONFIG = {
  IN: {
    label: 'SCAN IN',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: '⬇️',
    hint: 'Point the camera at a barcode to add stock.',
  },
  OUT: {
    label: 'SCAN OUT',
    color: '#e11d48',
    bg: '#fff1f2',
    icon: '⬆️',
    hint: 'Point the camera at a barcode to remove stock.',
  },
  LOOKUP: {
    label: 'LOOKUP',
    color: '#2563eb',
    bg: '#eff6ff',
    icon: '🔍',
    hint: 'Scan a barcode to look up item details.',
  },
};

export const ScanScreen: React.FC<ScanScreenProps> = ({ mode, onScan, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned]           = useState(false);
  const [manualInput, setManualInput]   = useState('');
  const hasScanned                      = useRef(false);

  const cfg = MODE_CONFIG[mode];

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (hasScanned.current) return;
    hasScanned.current = true;
    setScanned(true);
    onScan(data);
  };

  const handleManualSubmit = () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a barcode.');
      return;
    }
    onScan(trimmed);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Camera Permission Required</Text>
          <Text style={styles.permText}>
            OmniScan Pro needs camera access to scan barcodes.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>GRANT ACCESS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera viewfinder */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e',
            'code128', 'code39', 'code93',
            'qr', 'datamatrix', 'pdf417', 'aztec',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark overlay with cutout */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <View style={[styles.modePill, { backgroundColor: cfg.bg }]}>
              <Text style={styles.modePillIcon}>{cfg.icon}</Text>
              <Text style={[styles.modePillText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Viewfinder frame */}
        <View style={styles.frameArea}>
          <View style={[styles.frame, { borderColor: cfg.color }]}>
            {/* Corner markers */}
            {(['tl', 'tr', 'bl', 'br'] as const).map(corner => (
              <View
                key={corner}
                style={[
                  styles.corner,
                  corner.includes('t') ? styles.cornerTop : styles.cornerBottom,
                  corner.includes('l') ? styles.cornerLeft : styles.cornerRight,
                  { borderColor: cfg.color },
                ]}
              />
            ))}
          </View>
          <Text style={styles.hintText}>{cfg.hint}</Text>
        </View>

        {/* Manual entry footer */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView edges={['bottom']} style={styles.footer}>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                value={manualInput}
                onChangeText={setManualInput}
                placeholder="Enter barcode manually"
                placeholderTextColor="rgba(255,255,255,0.4)"
                returnKeyType="done"
                onSubmitEditing={handleManualSubmit}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.manualBtn, { backgroundColor: cfg.color }]}
                onPress={handleManualSubmit}
              >
                <Text style={styles.manualBtnText}>GO</Text>
              </TouchableOpacity>
            </View>

            {scanned && (
              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={() => { setScanned(false); hasScanned.current = false; }}
              >
                <Text style={styles.rescanText}>TAP TO SCAN AGAIN</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const FRAME = 240;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0f172a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modePillIcon: { fontSize: 16 },
  modePillText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18, color: '#fff', fontWeight: '700' },
  frameArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  frame: {
    width: FRAME,
    height: FRAME,
    borderRadius: 8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
  },
  cornerTop: { top: -2 },
  cornerBottom: { bottom: -2 },
  cornerLeft: { left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerRight: { right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 40,
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    gap: 12,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  manualBtn: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
  },
  manualBtnText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  rescanBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rescanText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 1.5 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  // Permission screen
  permIcon: { fontSize: 56, marginBottom: 16 },
  permTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 12 },
  permText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  permBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  permBtnText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
  cancelLink: { paddingVertical: 8 },
  cancelLinkText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
});
