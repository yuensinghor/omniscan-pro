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
 * Workspace model:
 *   - User always owns their own inventory (default view on login)
 *   - If user is a member of someone else's workspace, they can SWITCH to it
 *   - Switching is explicit — never automatic on login
 *   - workspaceOwnerId = null means viewing own inventory
 *   - workspaceOwnerId = someId means viewing that user's inventory
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
global.Buffer = Buffer;

import { supabase } from './src/lib/supabase';
import { AppUser, InventorySummary, ScanMode } from './src/types';

import { AuthScreen }           from './src/screens/AuthScreen';
import { DashboardScreen }      from './src/screens/DashboardScreen';
import { ScanScreen }           from './src/screens/ScanScreen';
import { HistoryScreen }        from './src/screens/HistoryScreen';
import ProvisioningScreen       from './src/screens/ProvisioningScreen';
import { EditItemScreen }       from './src/screens/EditItemScreen';
import { NewItemScreen }        from './src/screens/NewItemScreen';
import { ProfileScreen }        from './src/screens/ProfileScreen';
import { FamilySharingScreen }  from './src/screens/FamilySharingScreen';

type Screen = 'dashboard' | 'history' | 'provisioning';

// Represents a workspace the user has access to (their own or shared)
export interface WorkspaceOption {
  ownerId:    string;
  ownerEmail: string;
  role:       'owner' | 'editor' | 'viewer';
  isOwn:      boolean; // true = this is the user's own inventory
}

export default function App() {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('dashboard');

  // ─── Inventory data ───────────────────────────────────────────────────────
  const [summary, setSummary]         = useState<InventorySummary[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ─── Modal/overlay state ──────────────────────────────────────────────────
  const [scanMode, setScanMode]             = useState<ScanMode | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<{ barcode: string; mode: ScanMode } | null>(null);
  const [editingItem, setEditingItem]       = useState<InventorySummary | null>(null);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [familySharingOpen, setFamilySharingOpen] = useState(false);

  const dashboardBackHandlerRef = useRef<(() => boolean) | null>(null);
  const returnToProfileRef      = useRef(false);
  const profileBackHandlerRef   = useRef<(() => boolean) | null>(null);

  // ─── Workspace state ──────────────────────────────────────────────────────
  // null = viewing own inventory. Set to another user's ID when switching.
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState<string | null>(null);
  const [workspaceRole, setWorkspaceRole]       = useState<'owner' | 'editor' | 'viewer' | null>(null);
  // All workspaces this user has access to (own + any shared)
  const [availableWorkspaces, setAvailableWorkspaces] = useState<WorkspaceOption[]>([]);

  // ─── Auth lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id:            session.user.id,
          email:         session.user.email || '',
          user_metadata: session.user.user_metadata,
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id:            session.user.id,
            email:         session.user.email || '',
            user_metadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
          setSummary([]);
          setWorkspaceOwnerId(null);
          setWorkspaceRole(null);
          setAvailableWorkspaces([]);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Inventory fetch ───────────────────────────────────────────────────────
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

  // ─── Instant local update from realtime payload ────────────────────────────
  const applyLogEvent = useCallback((payload: any) => {
    const log = payload.new;
    if (!log?.barcode || log.quantity == null) return;

    setSummary(prev => {
      const existing = prev.find(item => item.barcode === log.barcode);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + log.quantity);
        return prev.map(item =>
          item.barcode === log.barcode ? { ...item, quantity: newQty } : item
        );
      } else {
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

  const syncInventory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_summary')
        .select('barcode, quantity, name, category, image_url, log_id, owner_id')
        .eq('owner_id', userId);
      if (error) throw error;
      setSummary(data || []);
    } catch (_) {}
  }, []);

  // ─── Load workspace memberships on login ──────────────────────────────────
  // Always default to own inventory. Build availableWorkspaces list for switcher.
  const loadWorkspaces = useCallback(async (userId: string, userEmail: string) => {
    try {
      const { data } = await supabase.rpc('get_my_workspace', { p_user_id: userId });

      const workspaces: WorkspaceOption[] = [
        // Own inventory is always first
        { ownerId: userId, ownerEmail: userEmail, role: 'owner', isOwn: true },
      ];

      // If member of another workspace, add it as an option
      if (data?.member && data.owner_id !== userId) {
        workspaces.push({
          ownerId:    data.owner_id,
          ownerEmail: data.owner_email || 'Shared Workspace',
          role:       data.role || 'editor',
          isOwn:      false,
        });
      }

      setAvailableWorkspaces(workspaces);

      // Always start on own inventory — never auto-switch
      setWorkspaceOwnerId(null);
      setWorkspaceRole('owner');
      fetchInventory(userId);
    } catch (_) {
      // Fallback — just load own inventory
      setWorkspaceOwnerId(null);
      setWorkspaceRole('owner');
      fetchInventory(userId);
    }
  }, [fetchInventory]);

  // ─── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    loadWorkspaces(user.id, user.email);

    // Subscribe to the currently viewed inventory owner
    const activeOwnerId = workspaceOwnerId || user.id;

    const channel = supabase
      .channel('app_inventory_channel')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'inventory_logs',
        filter: `owner_id=eq.${activeOwnerId}`,
      }, applyLogEvent)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'products',
        filter: `owner_id=eq.${activeOwnerId}`,
      }, () => syncInventory(activeOwnerId))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Re-subscribe when workspace switches
  useEffect(() => {
    if (!user) return;
    const activeOwnerId = workspaceOwnerId || user.id;

    const channel = supabase
      .channel('app_inventory_switch_channel')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'inventory_logs',
        filter: `owner_id=eq.${activeOwnerId}`,
      }, applyLogEvent)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'products',
        filter: `owner_id=eq.${activeOwnerId}`,
      }, () => syncInventory(activeOwnerId))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspaceOwnerId]);

  // ─── Workspace switcher ────────────────────────────────────────────────────
  const handleSwitchWorkspace = useCallback((option: WorkspaceOption) => {
    if (option.isOwn) {
      setWorkspaceOwnerId(null);
      setWorkspaceRole('owner');
      fetchInventory(user!.id);
    } else {
      setWorkspaceOwnerId(option.ownerId);
      setWorkspaceRole(option.role);
      fetchInventory(option.ownerId);
    }
  }, [user, fetchInventory]);

  // ─── Android hardware back button ─────────────────────────────────────────
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (scanMode)         { setScanMode(null);         return true; }
      if (pendingBarcode)   { setPendingBarcode(null);   return true; }
      if (editingItem)      { setEditingItem(null);      return true; }
      if (familySharingOpen) {
        setFamilySharingOpen(false);
        setProfileOpen(true);
        returnToProfileRef.current = false;
        return true;
      }
      if (screen !== 'dashboard') {
        setScreen('dashboard');
        if (returnToProfileRef.current) {
          returnToProfileRef.current = false;
          setProfileOpen(true);
        }
        return true;
      }
      if (dashboardBackHandlerRef.current?.()) return true;

      Alert.alert(
        'Exit OmniScan Pro',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true;
    });

    return () => handler.remove();
  }, [scanMode, pendingBarcode, editingItem, profileOpen, familySharingOpen, screen]);

  // ─── Scan result handler ──────────────────────────────────────────────────
  const handleScanResult = async (barcode: string) => {
    if (!user || !scanMode) return;
    const mode = scanMode;
    setScanMode(null);

    const existing = summary.find(i => i.barcode === barcode && i.owner_id === user.id);

    if (mode === 'LOOKUP') {
      if (existing) { setEditingItem(existing); }
      else { Alert.alert('Not Found', `Barcode "${barcode}" is not in your inventory.`); }
      return;
    }

    if (mode === 'OUT') {
      if (!existing) { Alert.alert('Not in Inventory', 'This item is not in your inventory.'); return; }
      if (existing.quantity <= 0) { Alert.alert('Out of Stock', 'Cannot reduce quantity below 0.'); return; }
    }

    if (mode === 'IN' && !existing) {
      setPendingBarcode({ barcode, mode });
      return;
    }

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
      Alert.alert('Error', err.message);
    }
  };

  // ─── Loading splash ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <AuthScreen onLogin={setUser} />
      </SafeAreaProvider>
    );
  }

  // ─── Main app ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {screen === 'dashboard' && (
        <DashboardScreen
          user={user}
          summary={summary}
          loading={dataLoading}
          onRefresh={() => fetchInventory(workspaceOwnerId || user.id)}
          workspaceRole={workspaceRole}
          workspaceOwnerId={workspaceOwnerId}
          availableWorkspaces={availableWorkspaces}
          onSwitchWorkspace={handleSwitchWorkspace}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenScanner={(mode) => setScanMode(mode)}
          onEditItem={setEditingItem}
          onOpenHistory={() => setScreen('history')}
          registerBackHandler={(handler) => { dashboardBackHandlerRef.current = handler; }}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen
          userId={workspaceOwnerId || user.id}
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

      {scanMode && (
        <View style={StyleSheet.absoluteFill}>
          <ScanScreen
            mode={scanMode}
            onScan={handleScanResult}
            onClose={() => setScanMode(null)}
          />
        </View>
      )}

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

      {editingItem && (
        <EditItemScreen
          item={editingItem}
          userId={user.id}
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            fetchInventory(workspaceOwnerId || user.id);
          }}
        />
      )}

      <ProfileScreen
        user={user}
        visible={profileOpen}
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
        registerBackHandler={(handler) => { profileBackHandlerRef.current = handler; }}
      />

      <FamilySharingScreen
        userId={user.id}
        userEmail={user.email}
        visible={familySharingOpen}
        onClose={() => setFamilySharingOpen(false)}
        onWorkspaceChanged={() => {
          // Reload workspace list after any change
          loadWorkspaces(user.id, user.email);
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
});