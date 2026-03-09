import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Device } from 'react-native-ble-plx';
import { EspProvisioning } from '../services/EspProvisioning';
import { supabase } from '../lib/supabase';

interface ProvisioningScreenProps {
  onComplete: () => void;
  onCancel: () => void;
  userId: string;
}

type Step = 'scan' | 'connect' | 'wifi' | 'provisioning' | 'success';

export const ProvisioningScreen: React.FC<ProvisioningScreenProps> = ({
  onComplete,
  onCancel,
  userId,
}) => {
  const [step, setStep]                       = useState<Step>('scan');
  const [devices, setDevices]                 = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice]   = useState<Device | null>(null);
  const [ssid, setSsid]                       = useState('');
  const [password, setPassword]               = useState('');
  const [statusMessage, setStatusMessage]     = useState('Initializing...');
  const [provisionedIp, setProvisionedIp]     = useState('');
  const [error, setError]                     = useState<string | null>(null);

  const service = useRef(new EspProvisioning());

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  useEffect(() => {
    requestPermissionsAndScan();
    return () => {
      service.current.stopScan();
    };
  }, []);

  // ─── Permissions ────────────────────────────────────────────────────────

  const requestPermissionsAndScan = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);
          const allGranted = Object.values(result).every(
            v => v === PermissionsAndroid.RESULTS.GRANTED,
          );
          if (!allGranted) {
            setError('Bluetooth permissions are required to scan for devices.');
            return;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setError('Location permission is required for Bluetooth scanning on Android.');
            return;
          }
        }
      } catch (e: any) {
        setError(`Permission error: ${e.message}`);
        return;
      }
    }
    startScan();
  };

  // ─── Scan ────────────────────────────────────────────────────────────────

  const startScan = () => {
    setError(null);
    setDevices([]);
    service.current.scanForDevices((device) => {
      setDevices(prev =>
        prev.find(d => d.id === device.id) ? prev : [...prev, device],
      );
    });
  };

  // ─── Connect → WiFi entry ────────────────────────────────────────────────

  const handleDeviceSelect = async (device: Device) => {
    setSelectedDevice(device);
    setStep('connect');
    service.current.stopScan();
    try {
      await service.current.connect(device.id);
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep('wifi');
    } catch (err: any) {
      setError(`Connection failed: ${err.message}`);
      setStep('scan');
    }
  };

  // ─── Full provision flow ─────────────────────────────────────────────────

  const handleProvision = async () => {
    if (!ssid.trim() || !password.trim()) {
      Alert.alert('Missing credentials', 'Please enter both the SSID and password.');
      return;
    }

    setStep('provisioning');

    try {
      setStatusMessage('Establishing secure session…');
      await service.current.startSession();

      setStatusMessage('Sending WiFi credentials…');
      await service.current.sendWifiConfig(ssid, password);

      setStatusMessage('Waiting for the scanner to connect…');
      const ip = await service.current.waitForConnection();
      setProvisionedIp(ip);

      setStatusMessage('Registering device…');
      await saveDeviceToSupabase(ip);

      setStep('success');
    } catch (err: any) {
      Alert.alert('Provisioning Failed', err.message, [
        { text: 'Try Again', onPress: () => setStep('wifi') },
        { text: 'Cancel',    onPress: onCancel, style: 'cancel' },
      ]);
    }
  };

  // ─── Save to Supabase ────────────────────────────────────────────────────

  const saveDeviceToSupabase = async (ip: string) => {
    if (!selectedDevice) return;

    // Parse MAC from device name format: SCANNER_AABBCC → AA:BB:CC
    let macAddress = '00:00:00:00:00:00';
    if (selectedDevice.name?.startsWith('SCANNER_')) {
      const suffix = selectedDevice.name.replace('SCANNER_', '');
      if (suffix.length >= 6) {
        macAddress = suffix.slice(0, 12).match(/.{1,2}/g)?.join(':') || macAddress;
      }
    }

    const { error } = await supabase.from('devices').insert({
      mac_address: macAddress,
      owner_id:    userId,
      device_label: selectedDevice.name || 'ESP32 Scanner',
      last_seen:   new Date().toISOString(),
      ip_address:  ip,
    });

    if (error) throw new Error(`Failed to register device: ${error.message}`);
  };

  // ─── Render steps ────────────────────────────────────────────────────────

  const renderScan = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconBox}>
        <Text style={styles.stepIcon}>📡</Text>
      </View>
      <Text style={styles.stepTitle}>Select a Scanner</Text>
      <Text style={styles.stepSubtitle}>
        Searching for BLE devices named "SCANNER_…"
      </Text>

      {error && <Text style={styles.errorBox}>{error}</Text>}

      <FlatList
        data={devices}
        keyExtractor={d => d.id}
        style={styles.deviceList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceItem}
            onPress={() => handleDeviceSelect(item)}
          >
            <View>
              <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </View>
            <Text style={styles.connectArrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.scanning}>
            <ActivityIndicator color="#10b981" size="large" />
            <Text style={styles.scanningText}>Scanning for nearby devices…</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.secondaryBtn} onPress={startScan}>
        <Text style={styles.secondaryBtnText}>Refresh Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
        <Text style={styles.cancelLinkText}>Cancel Setup</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConnect = () => (
    <View style={styles.centerStep}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.centerTitle}>Connecting…</Text>
      <Text style={styles.centerSubtitle}>Linking to {selectedDevice?.name}</Text>
    </View>
  );

  const renderWifi = () => (
    <ScrollView contentContainerStyle={styles.stepContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.iconBox}>
        <Text style={styles.stepIcon}>📶</Text>
      </View>
      <Text style={styles.stepTitle}>Wi-Fi Configuration</Text>
      <Text style={styles.stepSubtitle}>
        Enter credentials for the 2.4 GHz network the scanner should use.
      </Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>NETWORK NAME (SSID)</Text>
        <TextInput
          style={styles.input}
          value={ssid}
          onChangeText={setSsid}
          placeholder="e.g. MyHomeWiFi"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="WiFi Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleProvision}>
        <Text style={styles.primaryBtnText}>PROVISION DEVICE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelLink} onPress={() => setStep('scan')}>
        <Text style={styles.cancelLinkText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderProvisioning = () => (
    <View style={styles.centerStep}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.centerTitle}>{statusMessage}</Text>
      <Text style={styles.centerSubtitle}>
        Do not close the app or turn off the device.
      </Text>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.centerStep}>
      <View style={styles.successCircle}>
        <Text style={styles.successCheck}>✓</Text>
      </View>
      <Text style={styles.stepTitle}>Setup Complete!</Text>
      <Text style={styles.stepSubtitle}>
        Your scanner is now online and registered.
      </Text>
      <View style={styles.ipBox}>
        <Text style={styles.ipLabel}>DEVICE IP ADDRESS</Text>
        <Text style={styles.ipValue}>{provisionedIp}</Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={onComplete}>
        <Text style={styles.primaryBtnText}>FINISH</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onCancel}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Provision Node</Text>
          <Text style={styles.headerStep}>
            STEP: {step.toUpperCase()}
          </Text>
        </View>
      </View>

      {step === 'scan'         && renderScan()}
      {step === 'connect'      && renderConnect()}
      {step === 'wifi'         && renderWifi()}
      {step === 'provisioning' && renderProvisioning()}
      {step === 'success'      && renderSuccess()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#64748b', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  headerStep: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5, marginTop: 2 },

  stepContainer: { flex: 1, padding: 24 },
  centerStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  stepIcon: { fontSize: 36 },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  centerTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  centerSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    padding: 14,
    color: '#e11d48',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  deviceList: { flex: 1, marginBottom: 16 },
  deviceItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  deviceName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  deviceId: { fontSize: 11, color: '#94a3b8', marginTop: 3, fontVariant: ['tabular-nums'] },
  connectArrow: { fontSize: 24, color: '#10b981', fontWeight: '300' },
  scanning: { padding: 40, alignItems: 'center', gap: 16 },
  scanningText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  primaryBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  secondaryBtn: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  secondaryBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  cancelLink: { paddingVertical: 14, alignItems: 'center' },
  cancelLinkText: { color: '#94a3b8', fontWeight: '600', fontSize: 13 },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successCheck: { fontSize: 44, color: '#fff', fontWeight: '700' },
  ipBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  ipLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 6 },
  ipValue: { fontSize: 20, fontWeight: '800', color: '#0f172a', fontVariant: ['tabular-nums'] },
});
