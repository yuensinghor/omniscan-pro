/**
 * OmniScan Pro — Native Mobile App (React Native / Expo)
 *
 * Architecture:
 *   - Single App.tsx manages global state (auth, inventory, active screen)
 *   - Screens are rendered conditionally — no navigation library needed for the
 *     simple flow used here, keeping the dependency surface small.
 *   - Supabase realtime subscription keeps inventory_summary in sync across
 *     scanner hardware, web dashboard, and this mobile app simultaneously.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { Buffer } from 'buffer';
global.Buffer = Buffer; // needed by protobuf / BLE crypto

import { supabase } from './src/lib/supabase';
import { AppUser, InventorySummary, ScanMode } from './src/types';

import { AuthScreen }        from './src/screens/AuthScreen';
import { DashboardScreen }   from './src/screens/DashboardScreen';
import { ScanScreen }        from './src/screens/ScanScreen';
import { HistoryScreen }     from './src/screens/HistoryScreen';
import { ProvisioningScreen } from './src/screens/ProvisioningScreen';
import { EditItemScreen }    from './src/screens/EditItemScreen';
import { NewItemScreen }     from './src/screens/NewItemScreen';
import { ProfileScreen }     from './src/screens/ProfileScreen';

// ─── Screen type ──────────────────────────────────────────────────────────────
type Screen = 'dashboard' | 'history' | 'provisioning';

export default function App() {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser]       = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Navigation ──────────────────────────────────────────────────────────
  const [screen, setScreen]   = useState<Screen>('dashboard');

  // ─── Inventory data ───────────────────────────────────────────────────────
  const [summary, setSummary]     = useState<InventorySummary[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─── Modal/overlay state ──────────────────────────────────────────────────
  const [scanMode, setScanMode]           = useState<ScanMode | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<{ barcode: string; mode: ScanMode } | null>(null);
  const [editingItem, setEditingItem]     = useState<InventorySummary | null>(null);
  const [profileOpen, setProfileOpen]     = useState(false);

  // ─── Auth lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
          setSummary([]);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Inventory fetch ──────────────────────────────────────────────────────
  const fetchInventory = useCallback(async (userId: string) => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_summary')
        .select('barcode, quantity, name, category, image_url, log_id, owner_id')
        .eq('owner_id', userId);

      if (error) throw error;
      setSummary(data || []);
    } catch (err: any) {
      Alert.alert('Sync Error', err.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ─── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchInventory(user.id);

    const channel = supabase
      .channel('app_inventory_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_logs' }, () => {
        fetchInventory(user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchInventory]);

  // ─── Scan result handler ──────────────────────────────────────────────────
  const handleScanResult = async (barcode: string) => {
    if (!user || !scanMode) return;
    const mode = scanMode;
    setScanMode(null); // close scanner immediately

    const existing = summary.find(i => i.barcode === barcode && i.owner_id === user.id);

    if (mode === 'LOOKUP') {
      if (existing) {
        setEditingItem(existing);
      } else {
        Alert.alert('Not Found', `Barcode "${barcode}" is not in your inventory.`);
      }
      return;
    }

    if (mode === 'OUT') {
      if (!existing) {
        Alert.alert('Not in Inventory', 'This item is not in your inventory.');
        return;
      }
      if (existing.quantity <= 0) {
        Alert.alert('Out of Stock', 'Cannot reduce quantity below 0.');
        return;
      }
    }

    // New item on IN — show NewItemScreen to get name/category
    if (mode === 'IN' && !existing) {
      setPendingBarcode({ barcode, mode });
      return;
    }

    // Known item — log directly
    try {
      const { error } = await supabase.from('inventory_logs').insert({
        barcode,
        action_type: mode,
        device_id:   'MOBILE_SCANNER',
        owner_id:    user.id,
        quantity:    mode === 'IN' ? 1 : -1,
        name:        existing?.name,
        category:    existing?.category,
        image_url:   existing?.image_url,
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // ─── Loading splash ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // ─── Auth gate ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <AuthScreen onLogin={setUser} />
      </SafeAreaProvider>
    );
  }

  // ─── Main app ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Active screen ───────────────────────────────────────────────── */}
      {screen === 'dashboard' && (
        <DashboardScreen
          user={user}
          summary={summary}
          loading={dataLoading}
          onRefresh={() => fetchInventory(user.id)}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenScanner={(mode) => setScanMode(mode)}
          onEditItem={setEditingItem}
          onOpenHistory={() => setScreen('history')}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          userId={user.id}
          onBack={() => setScreen('dashboard')}
        />
      )}

      {screen === 'provisioning' && (
        <ProvisioningScreen
          userId={user.id}
          onComplete={() => setScreen('dashboard')}
          onCancel={() => setScreen('dashboard')}
        />
      )}

      {/* ── Overlays (rendered on top regardless of active screen) ──────── */}

      {/* Camera barcode scanner */}
      {scanMode && (
        <View style={StyleSheet.absoluteFill}>
          <ScanScreen
            mode={scanMode}
            onScan={handleScanResult}
            onClose={() => setScanMode(null)}
          />
        </View>
      )}

      {/* New item form — triggered when scanning IN an unknown barcode */}
      {pendingBarcode && (
        <NewItemScreen
          barcode={pendingBarcode.barcode}
          mode={pendingBarcode.mode}
          userId={user.id}
          visible={!!pendingBarcode}
          onSaved={() => setPendingBarcode(null)}
          onCancel={() => setPendingBarcode(null)}
        />
      )}

      {/* Edit item form */}
      {editingItem && (
        <EditItemScreen
          item={editingItem}
          userId={user.id}
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            fetchInventory(user.id);
          }}
        />
      )}

      {/* Profile / settings */}
      <ProfileScreen
        user={user}
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        onAddDevice={() => {
          setProfileOpen(false);
          setScreen('provisioning');
        }}
        onOpenHistory={() => {
          setProfileOpen(false);
          setScreen('history');
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
});
