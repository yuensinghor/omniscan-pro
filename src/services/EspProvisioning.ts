import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import crypto from 'react-native-quick-crypto';
import { session, wifi_config } from '../proto/compiled';

// --- Constants ---
const SERVICE_UUID  = '0000ffff-0000-1000-8000-00805f9b34fb';
const SESSION_UUID  = '0000ff51-0000-1000-8000-00805f9b34fb';
const CONFIG_UUID   = '0000ff52-0000-1000-8000-00805f9b34fb';
const POP           = '12345678'; // Proof of Possession — must match ESP32 code

export class EspProvisioning {
  private manager: BleManager;
  private device: Device | null = null;

  // Session state
  private sessionKey: Buffer | null = null;
  private deviceNonce: Buffer | null = null;

  // AES-CTR message counters (CRITICAL: must increment per message)
  private encryptCounter = 0;
  private decryptCounter = 0;

  constructor() {
    this.manager = new BleManager();
  }

  // ─── Scan ────────────────────────────────────────────────────────────────

  scanForDevices(onDeviceFound: (device: Device) => void) {
    this.manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
      if (error) { console.error('Scan error:', error); return; }
      if (device?.name?.startsWith('SCANNER_')) {
        onDeviceFound(device);
      }
    });
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  // ─── Connect ─────────────────────────────────────────────────────────────

  async connect(deviceId: string): Promise<void> {
    this.device = await this.manager.connectToDevice(deviceId);
    await this.device.discoverAllServicesAndCharacteristics();
    console.log('BLE connected and services discovered');
  }

  // ─── Security 1 Handshake ─────────────────────────────────────────────────
  //
  // Espressif Security 1 flow:
  //   1. Client sends  SessionCmd0  { client_pub_key }
  //   2. Device sends  SessionResp0 { device_pub_key, device_random, status }
  //   3. Both derive:  session_key  = SHA256(ECDH_secret || device_random || POP)
  //   4. Client sends  SessionCmd1  { client_verify_data = HMAC-SHA256(session_key, device_pub_key) }
  //   5. Device sends  SessionResp1 { device_verify_data, status }
  //   6. Client checks device_verify_data == HMAC-SHA256(session_key, client_pub_key)
  //   All subsequent messages are AES-256-CTR encrypted with session_key.
  //   IV for each message = device_nonce XOR (counter as 16-byte little-endian)

  async startSession(): Promise<void> {
    if (!this.device) throw new Error('No device connected');

    // Reset counters for fresh session
    this.encryptCounter = 0;
    this.decryptCounter = 0;
    this.sessionKey = null;
    this.deviceNonce = null;

    // Step 1 — Generate client Curve25519 key pair
    const ecdh = crypto.createECDH('curve25519');
    const clientPubKey = ecdh.generateKeys(); // Returns Buffer

    // Step 2 — Send SessionCmd0
    const cmd0 = session.SessionData.encode(
      session.SessionData.create({
        secVer: session.SecSchemeVersion.SecScheme1,
        sec1: {
          sc0: session.SessionCmd0.create({ clientPubkey: clientPubKey })
        }
      })
    ).finish();

    await this.writeCharacteristic(SESSION_UUID, cmd0);

    // Step 3 — Read SessionResp0
    const resp0Raw = await this.readCharacteristic(SESSION_UUID);
    const resp0Session = session.SessionData.decode(resp0Raw);

    if (resp0Session.sec1?.sr0?.status !== session.Status.Success) {
      throw new Error(`SessionResp0 failed: status ${resp0Session.sec1?.sr0?.status}`);
    }

    const devicePubKey  = Buffer.from(resp0Session.sec1.sr0.devicePubkey);
    this.deviceNonce    = Buffer.from(resp0Session.sec1.sr0.deviceRandom);

    console.log('Got device pubkey and nonce');

    // Step 4 — Derive session key: SHA256(ECDH_secret || device_random || POP)
    const sharedSecret = ecdh.computeSecret(devicePubKey);
    const hash = crypto.createHash('sha256');
    hash.update(sharedSecret);
    hash.update(this.deviceNonce);
    hash.update(Buffer.from(POP, 'utf8'));
    this.sessionKey = hash.digest() as Buffer;

    console.log('Session key derived');

    // Step 5 — Send SessionCmd1 with HMAC verify token
    const hmacClient = crypto.createHmac('sha256', this.sessionKey);
    hmacClient.update(devicePubKey);
    const clientVerifyData = hmacClient.digest();

    const cmd1 = session.SessionData.encode(
      session.SessionData.create({
        secVer: session.SecSchemeVersion.SecScheme1,
        sec1: {
          sc1: session.SessionCmd1.create({ clientVerifyData })
        }
      })
    ).finish();

    await this.writeCharacteristic(SESSION_UUID, cmd1);

    // Step 6 — Read SessionResp1
    const resp1Raw = await this.readCharacteristic(SESSION_UUID);
    const resp1Session = session.SessionData.decode(resp1Raw);

    if (resp1Session.sec1?.sr1?.status !== session.Status.Success) {
      throw new Error(`SessionResp1 failed: status ${resp1Session.sec1?.sr1?.status}`);
    }

    // Step 7 — Verify device token: HMAC-SHA256(session_key, client_pub_key)
    const hmacDevice = crypto.createHmac('sha256', this.sessionKey);
    hmacDevice.update(clientPubKey);
    const expectedDeviceToken = hmacDevice.digest();
    const receivedDeviceToken = Buffer.from(resp1Session.sec1.sr1.deviceVerifyData);

    if (!receivedDeviceToken.equals(expectedDeviceToken)) {
      throw new Error('Device authentication failed — verify token mismatch');
    }

    console.log('Secure session established ✓');
  }

  // ─── WiFi Config ──────────────────────────────────────────────────────────

  async sendWifiConfig(ssid: string, password: string): Promise<void> {
    if (!this.sessionKey) throw new Error('Session not established');

    console.log(`Sending SSID: ${ssid}`);

    // CmdSetConfig
    const setConfigPayload = wifi_config.WiFiConfigPayload.encode(
      wifi_config.WiFiConfigPayload.create({
        msg: wifi_config.WiFiConfigMsgType.TypeCmdSetConfig,
        cmdSetConfig: wifi_config.CmdSetConfig.create({
          ssid: Buffer.from(ssid, 'utf8'),
          passphrase: Buffer.from(password, 'utf8'),
        })
      })
    ).finish();

    await this.writeCharacteristic(CONFIG_UUID, this.encrypt(setConfigPayload));

    const respSetRaw = this.decrypt(await this.readCharacteristic(CONFIG_UUID));
    const respSet = wifi_config.WiFiConfigPayload.decode(respSetRaw);
    if (respSet.respSetConfig?.status !== wifi_config.Status.Success) {
      throw new Error(`SetConfig failed: ${respSet.respSetConfig?.status}`);
    }

    // CmdApplyConfig
    const applyPayload = wifi_config.WiFiConfigPayload.encode(
      wifi_config.WiFiConfigPayload.create({
        msg: wifi_config.WiFiConfigMsgType.TypeCmdApplyConfig,
        cmdApplyConfig: wifi_config.CmdApplyConfig.create({})
      })
    ).finish();

    await this.writeCharacteristic(CONFIG_UUID, this.encrypt(applyPayload));

    const respApplyRaw = this.decrypt(await this.readCharacteristic(CONFIG_UUID));
    const respApply = wifi_config.WiFiConfigPayload.decode(respApplyRaw);
    if (respApply.respApplyConfig?.status !== wifi_config.Status.Success) {
      throw new Error(`ApplyConfig failed: ${respApply.respApplyConfig?.status}`);
    }

    console.log('WiFi config sent and applied ✓');
  }

  // ─── Poll WiFi Status ─────────────────────────────────────────────────────

  async waitForConnection(): Promise<string> {
    console.log('Polling WiFi connection status...');

    for (let i = 0; i < 30; i++) {
      const statusPayload = wifi_config.WiFiConfigPayload.encode(
        wifi_config.WiFiConfigPayload.create({
          msg: wifi_config.WiFiConfigMsgType.TypeCmdGetStatus,
          cmdGetStatus: wifi_config.CmdGetStatus.create({})
        })
      ).finish();

      await this.writeCharacteristic(CONFIG_UUID, this.encrypt(statusPayload));
      const respRaw = this.decrypt(await this.readCharacteristic(CONFIG_UUID));
      const resp = wifi_config.WiFiConfigPayload.decode(respRaw);
      const status = resp.respGetStatus;

      console.log(`Poll ${i + 1}: state = ${status?.staState}`);

      if (status?.staState === wifi_config.WifiStationState.Connected) {
        return status.connected?.ip4Addr || '0.0.0.0';
      }

      if (status?.staState === wifi_config.WifiStationState.ConnectionFailed) {
        if (status.failReason === wifi_config.WifiConnectFailedReason.AuthError) {
          throw new Error('Wrong WiFi password');
        }
        if (status.failReason === wifi_config.WifiConnectFailedReason.NetworkNotFound) {
          throw new Error('WiFi network not found — check SSID and ensure 2.4GHz');
        }
        throw new Error(`Connection failed: reason ${status.failReason}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Connection timeout after 30 seconds');
  }

  // ─── AES-256-CTR Encrypt/Decrypt ─────────────────────────────────────────
  //
  // IV = device_nonce XOR counter (counter as 16-byte little-endian)
  // Each message uses the NEXT counter value — this is critical.

  private makeIV(counter: number): Buffer {
    if (!this.deviceNonce) throw new Error('No device nonce');
    const iv = Buffer.from(this.deviceNonce); // copy
    // XOR first 4 bytes with little-endian counter
    iv[0]  ^= (counter >>> 0)  & 0xff;
    iv[1]  ^= (counter >>> 8)  & 0xff;
    iv[2]  ^= (counter >>> 16) & 0xff;
    iv[3]  ^= (counter >>> 24) & 0xff;
    return iv;
  }

  private encrypt(data: Uint8Array): Uint8Array {
    if (!this.sessionKey) throw new Error('No session key');
    const iv = this.makeIV(this.encryptCounter++);
    const cipher = crypto.createCipheriv('aes-256-ctr', this.sessionKey, iv);
    return new Uint8Array(Buffer.concat([cipher.update(data), cipher.final()]));
  }

  private decrypt(data: Uint8Array): Uint8Array {
    if (!this.sessionKey) throw new Error('No session key');
    const iv = this.makeIV(this.decryptCounter++);
    const decipher = crypto.createDecipheriv('aes-256-ctr', this.sessionKey, iv);
    return new Uint8Array(Buffer.concat([decipher.update(data), decipher.final()]));
  }

  // ─── BLE Helpers ──────────────────────────────────────────────────────────

  private async writeCharacteristic(uuid: string, data: Uint8Array): Promise<void> {
    if (!this.device) throw new Error('No device connected');
    const base64 = Buffer.from(data).toString('base64');
    await this.device.writeCharacteristicWithResponseForService(SERVICE_UUID, uuid, base64);
  }

  private async readCharacteristic(uuid: string): Promise<Uint8Array> {
    if (!this.device) throw new Error('No device connected');
    const char = await this.device.readCharacteristicForService(SERVICE_UUID, uuid);
    if (!char.value) throw new Error('Read failed: empty value');
    return new Uint8Array(Buffer.from(char.value, 'base64'));
  }
}
