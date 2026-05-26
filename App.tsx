/**
 * OmniScan Pro — Native Mobile App (React Native / Expo)
 *
 * Architecture:
 *   - Single App.tsx manages global state (auth, inventory, active screen)
 *   - Screens are rendered conditionally — no navigation library needed for the
 *     simple flow used here, keeping the dependency surface small.
 *   - Supabase realtime subscription keeps inventory_summary in sync across
 *     scanner hardware, web dashboard, and this mobile app simultaneously.
 *
 * Data architecture:
 *   - products table       → product metadata (name, category, image_url)
 *   - inventory_logs table → quantity events only (IN/OUT/DELETE)
 *   - inventory_summary    → view joining both
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { Buffer } from 'buffer';
global.Buffer = Buffer; // needed by protobuf / BLE crypto

import { supabase } from './src/lib/supabase';
import { AppUser, InventorySummary, ScanMode } from './src/types';
import { t, initLang } from './src/i18n';

import { AuthScreen }        from './src/screens/AuthScreen';
import { DashboardScreen }   from './src/screens/DashboardScreen';
import { ScanScreen }        from './src/screens/ScanScreen';
import { HistoryScreen }     from './src/screens/HistoryScreen';
import ProvisioningScreen    from './src/screens/ProvisioningScreen';
import { EditItemScreen }    from './src/screens/EditItemScreen';
import { NewItemScreen }     from './src/screens/NewItemScreen';
import { ProfileScreen }        from './src/screens/ProfileScreen';
import { FamilySharingScreen }  from './src/screens/FamilySharingScreen';

// ─── Screen type ──────────────────────────────────────────────────────────────
type Screen = 'dashboard' | 'history' | 'provisioning';

export default function App() {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Navigation ──────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('dashboard');

  // ─── Inventory data ───────────────────────────────────────────────────────
  const [summary, setSummary]         = useState<InventorySummary[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─── Modal/overlay state ──────────────────────────────────────────────────
  const [scanMode, setScanMode]             = useState<ScanMode | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<{ barcode: string; mode: ScanMode } | null>(null);
  const [editingItem, setEditingItem]       = useState<InventorySummary | null>(null);
  const [isLookupMode, setIsLookupMode]     = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [familySharingOpen, setFamilySharingOpen] = useState(false);

  // Ref to DashboardScreen's back-press handler (category reset etc.)
  const dashboardBackHandlerRef = useRef<(() => boolean) | null>(null);
  // Track whether a sub-screen was opened from Profile, so back returns to Profile
  const returnToProfileRef = useRef(false);

  // ─── Workspace / family sharing ───────────────────────────────────────────
  // workspaceOwnerId: if set, we load inventory for this owner (not our own)
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState<string | null>(null);
  const [workspaceRole, setWorkspaceRole]       = useState<'owner' | 'editor' | 'viewer' | null>(null);

  const applyUser = useCallback((nextUser: AppUser) => {
    setUser(nextUser);
  }, []);

  // ─── Language init — load saved preference before first render ──────────────
  useEffect(() => {
    initLang(); // loads saved lang from AsyncStorage, reloads if different from current
  }, []);

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
      async (event, session) => {
        if (event === 'USER_UPDATED') {
          // user_metadata changed (e.g. avatar upload) — re-fetch fresh session
          // because the session object passed here may be a stale reference
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata,
            });
          }
          return;
        }
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
      Alert.alert('Sync Error', t.errorUpdateQty);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ─── Instant local update from realtime payload ─────────────────────────
  // Instead of re-fetching the whole inventory_summary view (slow, 4-6s),
  // we apply the new log row directly to local state. Zero HTTP calls.
  const applyLogEvent = useCallback((payload: any) => {
    const log = payload.new;
    if (!log?.barcode || log.quantity == null) return;

    setSummary(prev => {
      const existing = prev.find(item => item.barcode === log.barcode);
      if (existing) {
        // Update quantity — hard floor at 0, never allow negative
        const newQty = Math.max(0, existing.quantity + log.quantity);
        return prev.map(item =>
          item.barcode === log.barcode
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        // New item — add it to list
        return [...prev, {
          barcode:   log.barcode,
          quantity:  Math.max(0, log.quantity),
          name:      log.name      || log.barcode,
          category:  log.category  || 'General',
          image_url: log.image_url || '',
          log_id:    log.log_id,
          owner_id:  log.owner_id,
        }];
      }
    });
  }, []);

  // Silent background sync — used for products table changes (name/image edits)
  const syncInventory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_summary')
        .select('barcode, quantity, name, category, image_url, log_id, owner_id')
        .eq('owner_id', userId);
      if (error) throw error;
      setSummary(data || []);
    } catch (_) {
      // Silent — don't alert on background sync failures
    }
  }, []);

  // ─── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    // Check if user is a member of someone else's workspace
    supabase.rpc('get_my_workspace', { p_user_id: userId }).then(({ data }) => {
      if (data?.member && data.owner_id !== userId) {
        setWorkspaceOwnerId(data.owner_id);
        setWorkspaceRole(data.role);
        fetchInventory(data.owner_id);
      } else {
        setWorkspaceOwnerId(null);
        setWorkspaceRole(null);
        fetchInventory(userId);
      }
    });

    const channel = supabase
      .channel('app_inventory_channel')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'inventory_logs',
        filter: `owner_id=eq.${userId}`,
      }, (payload) => {
        applyLogEvent(payload);
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'products',
        filter: `owner_id=eq.${userId}`,
      }, () => {
        // Product metadata changed (name/image/category) — need full sync
        syncInventory(userId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchInventory, syncInventory, applyLogEvent]);

  // ─── Android hardware back button ─────────────────────────────────────────
  // Priority order (highest first): overlays close before screens pop
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 1. Close scan screen
      if (scanMode) {
        setScanMode(null);
        return true;
      }
      // 2. Close new item form
      if (pendingBarcode) {
        setPendingBarcode(null);
        return true;
      }
      // 3. Close edit item form
      if (editingItem) {
        setEditingItem(null);
        return true;
      }
      // 4. Profile modal open — ProfileScreen owns its back button internally (upgrade sub-view etc.)
      //    Do NOT handle here; ProfileScreen's BackHandler takes priority as it is registered later.
      // 5. Family sharing open — always return to profile first
      if (familySharingOpen) {
        setFamilySharingOpen(false);
        setProfileOpen(true); // always reopen profile
        returnToProfileRef.current = false;
        return true;
      }
      // 6. History/Provisioning open — back to profile if came from there, else dashboard
      if (screen !== 'dashboard') {
        setScreen('dashboard');
        if (returnToProfileRef.current) {
          returnToProfileRef.current = false;
          setProfileOpen(true);
        }
        return true;
      }
      // 7. Let Dashboard handle (e.g. reset category filter)
      if (dashboardBackHandlerRef.current?.()) {
        return true;
      }
      // 8. Nothing open — confirm before exiting
      Alert.alert(
        t.exitTitle,
        t.exitMsg,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.exit, style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true;
    });

    return () => handler.remove();
  }, [scanMode, pendingBarcode, editingItem, profileOpen, familySharingOpen, screen]);

  // ─── Scan result handler ──────────────────────────────────────────────────
  // inventory_logs stores quantity events ONLY.
  // Product metadata (name, category, image) lives in the products table.
  const handleScanResult = async (barcode: string) => {
    if (!user || !scanMode) return;
    const mode = scanMode;
    setScanMode(null); // close scanner immediately

    const existing = summary.find(i => i.barcode === barcode && i.owner_id === user.id);

    if (mode === 'LOOKUP') {
      if (existing) {
        setIsLookupMode(true);
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

    // Known item — log quantity event only (no metadata needed)
    try {
      const { error } = await supabase.from('inventory_logs').insert({
        barcode,
        action_type: mode,
        device_id:   'MOBILE_SCANNER',
        owner_id:    user.id,
        quantity:    mode === 'IN' ? 1 : -1,
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Scan Error', 'Failed to record scan. Please try again.');
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
          workspaceRole={workspaceRole}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenScanner={(mode) => setScanMode(mode)}
          onEditItem={(item) => { setIsLookupMode(false); setEditingItem(item); }}
          onOpenHistory={() => setScreen('history')}
          registerBackHandler={(handler) => { dashboardBackHandlerRef.current = handler; }}
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
          isLookup={isLookupMode}
          onClose={() => { setEditingItem(null); setIsLookupMode(false); }}
          onSaved={() => {
            setEditingItem(null);
            setIsLookupMode(false);
            fetchInventory(user.id);
          }}
        />
      )}

      {/* Profile / settings */}
      <ProfileScreen
        user={user}
        visible={profileOpen}
        onUserUpdated={applyUser}
        onClose={() => setProfileOpen(false)}
        onAddDevice={() => {
          setProfileOpen(false);
          returnToProfileRef.current = true;
          setScreen('provisioning');
        }}
        onOpenFamilySharing={() => {
          setProfileOpen(false);
          returnToProfileRef.current = true;
          setFamilySharingOpen(true);
        }}
        onOpenHistory={() => {
          setProfileOpen(false);
          returnToProfileRef.current = true;
          setScreen('history');
        }}
      />
      {/* Family Sharing */}
      {user && (
        <FamilySharingScreen
          userId={user.id}
          visible={familySharingOpen}
          onClose={() => setFamilySharingOpen(false)}
          onWorkspaceChanged={(ownerId) => {
            if (ownerId && ownerId !== user.id) {
              setWorkspaceOwnerId(ownerId);
              setWorkspaceRole('viewer'); // will be updated on next load
              fetchInventory(ownerId);
            } else {
              setWorkspaceOwnerId(null);
              setWorkspaceRole(null);
              fetchInventory(user.id);
            }
          }}
        />
      )}
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
