// src/screens/ProvisioningScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { ESPDevice } from '@orbital-systems/react-native-esp-idf-provisioning';
import { EspProvisioning, WiFiNetwork } from '../services/EspProvisioning';

type Step = 'scan' | 'select_device' | 'scan_wifi' | 'enter_password' | 'provisioning' | 'done';

const provisioner = new EspProvisioning();

// ─── Runtime permission request (Android 12+) ─────────────────────────────────
async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const grants = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const allGranted = Object.values(grants).every(
      v => v === PermissionsAndroid.RESULTS.GRANTED
    );

    return allGranted;
  } catch (err) {
    console.error('Permission request error:', err);
    return false;
  }
}

export default function ProvisioningScreen({ userId, onComplete, onCancel }: {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [step, setStep]                     = useState<Step>('scan');
  const [devices, setDevices]               = useState<ESPDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<ESPDevice | null>(null);
  const [networks, setNetworks]             = useState<WiFiNetwork[]>([]);
  const [selectedSsid, setSelectedSsid]     = useState('');
  const [password, setPassword]             = useState('');
  const [loading, setLoading]               = useState(false);
  const [statusMessage, setStatusMessage]   = useState('');

  // ─── Step 1: Request permissions then scan ────────────────────────────────

  const handleScan = useCallback(async () => {
    // Request permissions first on Android
    const granted = await requestBluetoothPermissions();
    if (!granted) {
      Alert.alert(
        'Permissions Required',
        'Please grant Bluetooth and Location permissions to scan for devices. Go to Settings → Apps → OmniScan Pro → Permissions.',
      );
      return;
    }

    setLoading(true);
    setStatusMessage('Scanning for OmniScan devices…');
    setDevices([]);

    try {
      const found = await provisioner.scanForDevices();
      if (found.length === 0) {
        Alert.alert(
          'No devices found',
          'Make sure the scanner is powered on and in provisioning mode (LED blinking).',
        );
      } else {
        setDevices(found);
        setStep('select_device');
      }
    } catch (err: any) {
      Alert.alert('Scan failed', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }, []);

  // ─── Step 2: Connect to selected device ───────────────────────────────────

  const handleSelectDevice = useCallback(async (device: ESPDevice) => {
    setSelectedDevice(device);
    setLoading(true);
    setStatusMessage(`Connecting to ${device.name}…`);

    try {
      await provisioner.connect(device);
      setStatusMessage('Scanning for WiFi networks…');
      const nets = await provisioner.scanWifiNetworks(device);

      if (nets.length === 0) {
        Alert.alert('No networks found', 'Move closer to your WiFi router and try again.');
        setStep('scan');
      } else {
        setNetworks(nets);
        setStep('scan_wifi');
      }
    } catch (err: any) {
      Alert.alert('Connection failed', err?.message ?? 'Could not connect to device');
      setStep('scan');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }, []);

  // ─── Step 3: User selects WiFi network ────────────────────────────────────

  const handleSelectNetwork = useCallback((ssid: string) => {
    setSelectedSsid(ssid);
    setStep('enter_password');
  }, []);

  // ─── Step 4: Provision with entered password ───────────────────────────────

  const handleProvision = useCallback(async () => {
    if (!selectedDevice) return;
    if (!selectedSsid) return;

    setLoading(true);
    setStep('provisioning');
    setStatusMessage(`Connecting ${selectedDevice.name} to "${selectedSsid}"…`);

    try {
      const result = await provisioner.provision(selectedDevice, selectedSsid, password);

      if (result.success) {
        setStep('done');
      } else {
        const errMsg = typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error) ?? 'Unknown error';
        Alert.alert('Provisioning failed', errMsg);
        setStep('enter_password');
      }
    } catch (err: any) {
      const errMsg = err?.message ?? JSON.stringify(err) ?? 'Unknown error';
      Alert.alert('Provisioning failed', errMsg);
      setStep('enter_password');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }, [selectedDevice, selectedSsid, password]);

  // ─── Done / Cancel ────────────────────────────────────────────────────────

  const handleDone = useCallback(async () => {
    if (selectedDevice) {
      await provisioner.disconnect(selectedDevice).catch(() => {});
    }
    onComplete();
  }, [selectedDevice, onComplete]);

  const handleReset = useCallback(() => {
    setStep('scan');
    setDevices([]);
    setSelectedDevice(null);
    setNetworks([]);
    setSelectedSsid('');
    setPassword('');
  }, []);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderSignalBars = (rssi: number) => {
    if (rssi >= -50) return '████';
    if (rssi >= -65) return '███░';
    if (rssi >= -75) return '██░░';
    return '█░░░';
  };

  // ─── Screens ──────────────────────────────────────────────────────────────

  if (step === 'scan' || (step === 'select_device' && devices.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>Add Scanner Device</Text>
          <Text style={styles.subtitle}>
            Power on your OmniScan hardware and make sure Bluetooth is enabled on your phone.
          </Text>

          {loading ? (
            <>
              <ActivityIndicator size="large" color="#2563EB" style={styles.spinner} />
              <Text style={styles.statusText}>{statusMessage}</Text>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={handleScan}>
                <Text style={styles.primaryButtonText}>Scan for Devices</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'select_device') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Select Your Scanner</Text>
        <Text style={styles.subtitle}>{devices.length} device(s) found nearby</Text>

        <FlatList
          data={devices}
          keyExtractor={d => d.name}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelectDevice(item)}
            >
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <Text style={styles.listItemSub}>Tap to connect</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
          <Text style={styles.secondaryButtonText}>Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <Text style={[styles.secondaryButtonText, { color: '#6B7280' }]}>Cancel</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (step === 'scan_wifi') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Select WiFi Network</Text>
        <Text style={styles.subtitle}>Networks visible to {selectedDevice?.name}</Text>

        <FlatList
          data={networks}
          keyExtractor={n => n.ssid}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelectNetwork(item.ssid)}
            >
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemTitle}>{item.ssid}</Text>
                <Text style={styles.listItemSub}>{renderSignalBars(item.rssi)}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (step === 'enter_password') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centered}
        >
          <Text style={styles.title}>Enter WiFi Password</Text>
          <Text style={styles.subtitle}>Network: {selectedSsid}</Text>

          <TextInput
            style={styles.input}
            placeholder="WiFi Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.primaryButton, !password && styles.disabledButton]}
            onPress={handleProvision}
            disabled={!password}
          >
            <Text style={styles.primaryButtonText}>Connect Scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('scan_wifi')}>
            <Text style={styles.secondaryButtonText}>Choose Different Network</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (step === 'provisioning') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" style={styles.spinner} />
          <Text style={styles.title}>Setting Up Scanner</Text>
          <Text style={styles.statusText}>{statusMessage}</Text>
          <Text style={styles.hint}>This usually takes 15–30 seconds.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.title}>Scanner Connected!</Text>
          <Text style={styles.subtitle}>
            {selectedDevice?.name} is now connected to "{selectedSsid}" and ready to use.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  hint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  spinner: {
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 64,
    color: '#10B981',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listItemSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: '#D1D5DB',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249,250,251,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
