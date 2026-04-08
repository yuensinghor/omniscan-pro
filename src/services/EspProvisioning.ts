// src/services/EspProvisioning.ts
// Uses @orbital-systems/react-native-esp-idf-provisioning
// — all crypto, BLE scanning, and session management handled by the native SDK.

import {
  ESPProvisionManager,
  ESPDevice,
  ESPTransport,
  ESPSecurity,
  ESPWifiAuthMode,
} from '@orbital-systems/react-native-esp-idf-provisioning';

export interface WiFiNetwork {
  ssid: string;
  authMode: ESPWifiAuthMode;
  rssi: number;
}

export interface ProvisionResult {
  success: boolean;
  ip?: string;
  error?: string;
}

// Must match your ESP32 firmware config exactly
const DEVICE_PREFIX = 'SCANNER_';
const POP           = '12345678';

export class EspProvisioning {

  // --- Scan for nearby ESP32 devices ----------------------------------------

  async scanForDevices(): Promise<ESPDevice[]> {
    const devices = await ESPProvisionManager.searchESPDevices(
      DEVICE_PREFIX,
      ESPTransport.ble,
      ESPSecurity.secure  // Security 1 — matches WiFiProv WIFI_PROV_SECURITY_1
    );
    return devices;
  }

  // --- Connect + establish secure session ------------------------------------

  async connect(device: ESPDevice): Promise<void> {
    await device.connect(POP);
    // The SDK handles the full Security 1 handshake (ECDH + AES-CTR) internally
  }

  // --- Scan WiFi networks visible to the ESP32 ------------------------------

  async scanWifiNetworks(device: ESPDevice): Promise<WiFiNetwork[]> {
    const networks = await device.scanWifiList();
    return (networks ?? []).map(n => ({
      ssid:     n.ssid,
      authMode: n.auth,
      rssi:     n.rssi,
    }));
  }

  // --- Send WiFi credentials and wait for connection ------------------------

  async provision(
    device: ESPDevice,
    ssid: string,
    password: string
  ): Promise<ProvisionResult> {
    try {
      const status = await device.provision(ssid, password);

      console.log('Provision status raw:', JSON.stringify(status));

      // SDK may return a string 'success', or an object like { status: 'success' }
      const isSuccess =
        status === 'success' ||
        (typeof status === 'object' &&
          status !== null &&
          ((status as any).status === 'success' || (status as any).success === true));

      if (isSuccess) {
        return { success: true };
      } else {
        const errDetail = typeof status === 'string'
          ? status
          : JSON.stringify(status);
        return { success: false, error: `Provisioning failed: ${errDetail}` };
      }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Unknown error' };
    }
  }

  // --- Disconnect ------------------------------------------------------------

  async disconnect(device: ESPDevice): Promise<void> {
    await device.disconnect();
  }
}
