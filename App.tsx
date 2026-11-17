/**
 * BarcodesScanner Pro — Native Mobile App (React Native / Expo)
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

import { useInterstitialAd } from './src/hooks/useInterstitialAd';
import { userTierToAdUserType } from './src/config/adConfig';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  AppState,
  Alert,
  StatusBar,
  BackHandler,
  Linking,
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
  //useInterstitialAd
  // ─── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const adUserType = userTierToAdUserType(user?.user_metadata?.tier);
  const { showInterstitialIfReady } = useInterstitialAd(adUserType);

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
  const [workspaceRole, setWorkspaceRole]       = useState<'owner' | 'editor' | 'viewer'>('viewer');
  const fetchInventoryRef = useRef<(userId: string) => void>(() => {});
  const pendingInviteTokenRef = useRef<string | null>(null);
  const inventoryOwnerId = workspaceOwnerId || user?.id || '';
  const previousInventoryOwnerRef = useRef(inventoryOwnerId);

  useEffect(() => {
    if (previousInventoryOwnerRef.current !== inventoryOwnerId) {
      previousInventoryOwnerRef.current = inventoryOwnerId;
      setSummary([]);
      setEditingItem(null);
      setIsLookupMode(false);
      setPendingBarcode(null);
      setScanMode(null);
    }
  }, [inventoryOwnerId]);

  const applyUser = useCallback((nextUser: AppUser) => {
    setUser(nextUser);
  }, []);

  // ─── Language init — load saved preference before first render ──────────────
  useEffect(() => {
    initLang(); // loads saved lang from AsyncStorage, reloads if different from current
  }, []);

  // ─── Deep link handler (invite links) ────────────────────────────────────
  const handleInviteUrl = useCallback(async (url: string) => {
    const match = url.match(/\/invite\/([a-zA-Z0-9_-]+)/);
    if (!match) return;
    const token = match[1];

    // Must be logged in to accept
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Store token, user will be prompted after login
      pendingInviteTokenRef.current = token;
      Alert.alert(
        'Invite Link',
        'Please sign in or create an account to join this shared inventory.',
      );
      return;
    }

    try {
      const { data, error } = await supabase.rpc('accept_invite_by_token', { p_token: token });
      if (error) throw error;
      if (data?.error) {
        Alert.alert('Could not join', data.error);
        return;
      }
      // Joined successfully — reload inventory for new workspace owner
      Alert.alert('✅ Joined!', 'You now have access to the shared inventory.');
      setWorkspaceOwnerId(data.owner_id);
      setWorkspaceRole(data.role === 'editor' ? 'editor' : 'viewer');
      fetchInventoryRef.current(data.owner_id);
    } catch (err: any) {
      Alert.alert('Error', 'Could not process invite link. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!user || !pendingInviteTokenRef.current) return;
    const token = pendingInviteTokenRef.current;
    pendingInviteTokenRef.current = null;
    handleInviteUrl(`https://barcodesscanner.com/invite/${token}`);
  }, [user?.id, handleInviteUrl]);

  useEffect(() => {
    // App opened via deep link while closed
    Linking.getInitialURL().then(url => { if (url) handleInviteUrl(url); });
    // App already open, link tapped
    const sub = Linking.addEventListener('url', ({ url }) => handleInviteUrl(url));
    return () => sub.remove();
  }, [handleInviteUrl]);

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
  useEffect(() => { fetchInventoryRef.current = fetchInventory; }, [fetchInventory]);

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

  // ─── Resolve the signed-in user's workspace and inventory owner ────────────
  useEffect(() => {
    if (!user) {
      setWorkspaceOwnerId(null);
      setWorkspaceRole('viewer');
      setSummary([]);
      return;
    }
    const userId = user.id;
    let active = true;
    setWorkspaceOwnerId(null);
    setWorkspaceRole('viewer');
    setSummary([]);
    setDataLoading(true);
    supabase.rpc('get_my_workspace', { p_user_id: userId }).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setWorkspaceRole('viewer');
        setDataLoading(false);
        Alert.alert('Sharing unavailable', 'Could not verify your workspace access. Please try again.');
      } else if (data?.member && data.owner_id !== userId) {
        setWorkspaceOwnerId(data.owner_id);
        setWorkspaceRole(data.role === 'editor' ? 'editor' : 'viewer');
      } else {
        setWorkspaceOwnerId(null);
        setWorkspaceRole('owner');
      }
    });
    return () => { active = false; };
  }, [user?.id]);

  // Refresh membership when the app returns to the foreground so role changes
  // and removals made by the owner take effect without requiring a reinstall.
  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      supabase.rpc('get_my_workspace', { p_user_id: user.id }).then(({ data, error }) => {
        if (error) return;
        if (data?.member && data.owner_id !== user.id) {
          setWorkspaceOwnerId(data.owner_id);
          setWorkspaceRole(data.role === 'editor' ? 'editor' : 'viewer');
        } else if (data?.member) {
          setWorkspaceOwnerId(null);
          setWorkspaceRole('owner');
        } else {
          if (workspaceOwnerId !== null) setSummary([]);
          setWorkspaceOwnerId(null);
          setWorkspaceRole('owner');
        }
      });
    });
    return () => subscription.remove();
  }, [user?.id, workspaceOwnerId]);

  // Apply role changes and membership removal immediately while the app is open.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`workspace_role_${user.id}`)
      .on('postgres_changes', {
        // RLS limits received rows to this user’s membership or, for an owner,
        // the members of their own workspace. No client filter is used because
        // Realtime cannot reliably filter DELETE events by non-primary-key fields.
        event: '*', schema: 'public', table: 'workspace_members',
      }, () => {
        supabase.rpc('get_my_workspace', { p_user_id: user.id }).then(({ data, error }) => {
          if (error) return;
          if (data?.member && data.owner_id !== user.id) {
            setWorkspaceOwnerId(data.owner_id);
            setWorkspaceRole(data.role === 'editor' ? 'editor' : 'viewer');
          } else if (data?.member) {
            setWorkspaceOwnerId(null);
            setWorkspaceRole('owner');
          } else {
            setSummary([]);
            setWorkspaceOwnerId(null);
            setWorkspaceRole('owner');
          }
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // ─── Inventory fetch and realtime subscription for the resolved workspace ──
  useEffect(() => {
    if (!user || !inventoryOwnerId || workspaceRole === 'viewer' && workspaceOwnerId === null) return;
    fetchInventory(inventoryOwnerId);

    const channel = supabase
      .channel('app_inventory_channel')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'inventory_logs',
        filter: `owner_id=eq.${inventoryOwnerId}`,
      }, (payload) => {
        applyLogEvent(payload);
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'products',
        filter: `owner_id=eq.${inventoryOwnerId}`,
      }, () => {
        // Product metadata changed (name/image/category) — need full sync
        syncInventory(inventoryOwnerId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, inventoryOwnerId, workspaceRole, fetchInventory, syncInventory, applyLogEvent]);

  // ─── Android hardware back button ─────────────────────────────────────────
  // Priority order (highest first): overlays close before screens pop
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 1. Close scan screen
      if (scanMode) {
        setScanMode(null);
        showInterstitialIfReady();
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
    if (workspaceRole === 'viewer') {
      Alert.alert('Read-only access', 'Ask the workspace owner to change your role if you need to edit inventory.');
      return;
    }
    const mode = scanMode;
    setScanMode(null); // close scanner immediately
    showInterstitialIfReady(); 

    const existing = summary.find(i => i.barcode === barcode && i.owner_id === inventoryOwnerId);

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
        owner_id:    inventoryOwnerId,
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
          userType={adUserType}
          ownerId={inventoryOwnerId}
          summary={summary}
          loading={dataLoading}
          onRefresh={() => fetchInventory(inventoryOwnerId)}
          workspaceRole={workspaceRole}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenScanner={(mode) => setScanMode(mode)}
          onEditItem={(item) => { setIsLookupMode(workspaceRole === 'viewer'); setEditingItem(item); }}
          onOpenHistory={() => setScreen('history')}
          registerBackHandler={(handler) => { dashboardBackHandlerRef.current = handler; }}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          userId={inventoryOwnerId}
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
            onClose={() => { setScanMode(null); showInterstitialIfReady(); }}
          />
        </View>
      )}

      {/* New item form — triggered when scanning IN an unknown barcode */}
      {pendingBarcode && (
        <NewItemScreen
          barcode={pendingBarcode.barcode}
          mode={pendingBarcode.mode}
          userId={user.id}
          ownerId={inventoryOwnerId}
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
          ownerId={inventoryOwnerId}
          canShare={workspaceRole === 'owner'}
          visible={!!editingItem}
          isLookup={isLookupMode || workspaceRole === 'viewer'}
          onClose={() => { setEditingItem(null); setIsLookupMode(false); }}
          onSaved={() => {
            setEditingItem(null);
            setIsLookupMode(false);
            fetchInventory(inventoryOwnerId);
          }}
        />
      )}

      {/* Profile / settings */}
      <ProfileScreen
        user={user}
        canManageDevices={workspaceRole === 'owner'}
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
              setWorkspaceRole('viewer');
              fetchInventory(ownerId);
            } else {
              setWorkspaceOwnerId(null);
              setWorkspaceRole('owner');
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
