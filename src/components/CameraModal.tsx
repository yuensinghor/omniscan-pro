// src/components/CameraModal.tsx
// Full-screen camera using expo-camera — bypasses the launchCameraAsync
// Modal bug on Android (Expo SDK 51).

import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CameraModalProps {
  visible: boolean;
  onPhotoTaken: (uri: string) => void;
  onCancel: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  visible, onPhotoTaken, onCancel,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing]       = useState(false);
  const cameraRef                       = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });
      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not take photo');
    } finally {
      setCapturing(false);
    }
  };

  if (!visible) return null;

  // Permission not yet determined
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#fff" />
        </SafeAreaView>
      </Modal>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <Text style={styles.permText}>Camera permission is required.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />

        {/* Top bar */}
        <SafeAreaView style={styles.topBar} edges={['top']}>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.topLabel}>Take Product Photo</Text>
          <View style={{ width: 44 }} />
        </SafeAreaView>

        {/* Bottom controls */}
        <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
          <TouchableOpacity
            style={[styles.shutterBtn, capturing && styles.shutterBtnDisabled]}
            onPress={handleCapture}
            disabled={capturing}
          >
            {capturing
              ? <ActivityIndicator color="#000" size="large" />
              : <View style={styles.shutterInner} />
            }
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center', paddingBottom: 40, paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  shutterBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterBtnDisabled: { opacity: 0.6 },
  shutterInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#ddd',
  },
  permText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20, paddingHorizontal: 40 },
  permBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { paddingVertical: 14 },
  cancelBtnText: { color: '#94a3b8', fontSize: 15 },
});
