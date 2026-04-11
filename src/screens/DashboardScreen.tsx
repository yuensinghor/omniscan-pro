import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Animated,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  RefreshControl,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { AppUser, InventorySummary, ScanMode } from '../types';
import { shouldShowAds } from '../config/adConfig';

// ─── Ad Banner ────────────────────────────────────────────────────────────────
const AdBanner: React.FC = () => (
  <View style={adStyles.container}>
    <View style={adStyles.banner}>
      <Text style={adStyles.label}>AD</Text>
      <Text style={adStyles.placeholder}>Advertisement</Text>
    </View>
  </View>
);

interface WorkspaceOption {
  ownerId:    string;
  ownerEmail: string;
  role:       'owner' | 'editor' | 'viewer';
  isOwn:      boolean;
}

interface DashboardScreenProps {
  user: AppUser;
  userType?: string;
  onOpenProfile: () => void;
  workspaceRole?: 'owner' | 'editor' | 'viewer' | null;
  workspaceOwnerId?: string | null;
  availableWorkspaces?: WorkspaceOption[];
  onSwitchWorkspace?: (option: WorkspaceOption) => void;
  onOpenScanner: (mode: ScanMode) => void;
  onEditItem: (item: InventorySummary) => void;
  onOpenHistory: () => void;
  summary: InventorySummary[];
  loading: boolean;
  onRefresh: () => void;
  registerBackHandler?: (handler: () => boolean) => void;
}

// ─── Numpad Modal ─────────────────────────────────────────────────────────────

interface NumpadModalProps {
  visible: boolean;
  initialQty: number;
  itemName: string;
  onConfirm: (newQty: number) => void;
  onClose: () => void;
}

const NumpadModal: React.FC<NumpadModalProps> = ({ visible, initialQty, itemName, onConfirm, onClose }) => {
  const [input, setInput] = useState(String(initialQty));

  // Reset input whenever modal opens with a new item
  useEffect(() => {
    if (visible) setInput(String(initialQty));
  }, [visible, initialQty]);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setInput(prev => {
        const next = prev === '0' ? key : prev + key;
        // Cap at 4 digits (max 9999)
        return next.length > 4 ? prev : next;
      });
    }
  };

  const handleConfirm = () => {
    const newQty = Math.max(0, parseInt(input, 10) || 0);
    onConfirm(newQty);
  };

  const keys = ['1','2','3','4','5','6','7','8','9','0','⌫'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={numpadStyles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={numpadStyles.sheet}>
          {/* Handle bar */}
          <View style={numpadStyles.handle} />

          {/* Item name */}
          <Text style={numpadStyles.itemName} numberOfLines={1}>{itemName}</Text>
          <Text style={numpadStyles.label}>SET QUANTITY</Text>

          {/* Display */}
          <View style={numpadStyles.display}>
            <Text style={numpadStyles.displayText}>{input}</Text>
          </View>

          {/* Keys grid */}
          <View style={numpadStyles.grid}>
            {keys.map((key) => (
              <TouchableOpacity
                key={key}
                style={[numpadStyles.key, key === '⌫' && numpadStyles.keyBackspace]}
                onPress={() => handleKey(key)}
                activeOpacity={0.7}
              >
                <Text style={[numpadStyles.keyText, key === '⌫' && numpadStyles.keyBackspaceText]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={numpadStyles.actions}>
            <TouchableOpacity style={numpadStyles.cancelBtn} onPress={onClose}>
              <Text style={numpadStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={numpadStyles.confirmBtn} onPress={handleConfirm}>
              <Text style={numpadStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Category Drawer ──────────────────────────────────────────────────────────

interface DrawerProps {
  visible: boolean;
  categories: { id: string; name: string; count: number }[];
  activeCategory: string;
  onSelect: (id: string) => void;
  onOpenHistory: () => void;
  onClose: () => void;
}

const CategoryDrawer: React.FC<DrawerProps> = ({
  visible, categories, activeCategory, onSelect, onOpenHistory, onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={drawerStyles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={drawerStyles.drawer}>
        <Text style={drawerStyles.heading}>CATEGORIES</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={drawerStyles.scrollArea}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[drawerStyles.item, activeCategory === cat.id && drawerStyles.itemActive]}
              onPress={() => { onSelect(cat.id); onClose(); }}
            >
              <Text style={[drawerStyles.itemText, activeCategory === cat.id && drawerStyles.itemTextActive]}>
                {cat.name}
              </Text>
              <View style={[drawerStyles.badge, activeCategory === cat.id && drawerStyles.badgeActive]}>
                <Text style={[drawerStyles.badgeText, activeCategory === cat.id && drawerStyles.badgeTextActive]}>
                  {cat.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={drawerStyles.divider} />
          <TouchableOpacity style={drawerStyles.item} onPress={() => { onOpenHistory(); onClose(); }}>
            <Text style={drawerStyles.itemText}>⏱  Activity Log</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ─── Photo Viewer ─────────────────────────────────────────────────────────────

const PhotoViewer: React.FC<{
  uri: string | null;
  onClose: () => void;
}> = ({ uri, onClose }) => (
  <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 52, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
        onPress={onClose}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>✕</Text>
      </TouchableOpacity>
      {uri && (
        <Image
          source={{ uri }}
          style={{ width: '90%', height: '70%' }}
          resizeMode="contain"
        />
      )}
    </View>
  </Modal>
);

// ─── Inventory Card ───────────────────────────────────────────────────────────

interface InventoryCardProps {
  item: InventorySummary;
  localQty: number;
  onEdit: () => void;
  onAdjust: (delta: number) => void;
  onViewPhoto: (uri: string) => void;
  onTapQty: () => void;
  isViewer: boolean;
  pendingDelta: number | null;       // null = idle, +1/-1 = waiting for confirmation
  onPendingChange: (delta: number) => void;
  onPendingConfirm: () => void;
  onPendingCancel: () => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  item, localQty, onEdit, onAdjust, onViewPhoto, onTapQty,
  isViewer, pendingDelta, onPendingChange, onPendingConfirm, onPendingCancel,
}) => {
  const previewQty = pendingDelta !== null ? Math.max(0, localQty + pendingDelta) : null;

  return (
    <View style={cardStyles.card}>
      {/* Photo + category badge */}
      <Pressable
        onPress={() => item.image_url ? onViewPhoto(item.image_url) : undefined}
        android_ripple={item.image_url ? { color: '#e2e8f0', borderless: false } : undefined}
        style={{ position: 'relative' }}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={cardStyles.image} resizeMode="cover" />
        ) : (
          <View style={[cardStyles.image, cardStyles.imagePlaceholder]}>
            <Text style={cardStyles.imagePlaceholderIcon}>📷</Text>
          </View>
        )}
        {!!item.category && (
          <View style={cardStyles.categoryBadge}>
            <Text style={cardStyles.categoryBadgeText} numberOfLines={1}>{item.category}</Text>
          </View>
        )}
      </Pressable>

      {/* Name only */}
      <Pressable
        onPress={isViewer ? undefined : onEdit}
        style={cardStyles.info}
        android_ripple={isViewer ? undefined : { color: '#f1f5f9', borderless: true }}
      >
        <Text style={cardStyles.name} numberOfLines={2}>{item.name || item.barcode}</Text>
      </Pressable>

      {/* Quantity control row */}
      <View style={cardStyles.qtyRow}>
        {pendingDelta !== null ? (
          // ── Pending confirmation state ──────────────────────────────────────
          <>
            {/* Cancel */}
            <TouchableOpacity
              style={[cardStyles.qtyBtn, cardStyles.qtyBtnCancel]}
              onPress={onPendingCancel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            >
              <Text style={cardStyles.qtyBtnTextCancel}>✕</Text>
            </TouchableOpacity>

            {/* Preview qty with direction indicator */}
            <View style={cardStyles.qtyPreviewBox}>
              <Text style={[cardStyles.qtyNum, { color: pendingDelta > 0 ? '#059669' : '#e11d48' }]}>
                {previewQty}
              </Text>
              <Text style={cardStyles.qtyDelta}>
                {pendingDelta > 0 ? '▲' : '▼'}
              </Text>
            </View>

            {/* Confirm */}
            <TouchableOpacity
              style={[cardStyles.qtyBtn, cardStyles.qtyBtnConfirm]}
              onPress={onPendingConfirm}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Text style={cardStyles.qtyBtnTextConfirm}>✓</Text>
            </TouchableOpacity>
          </>
        ) : (
          // ── Normal state ────────────────────────────────────────────────────
          <>
            <TouchableOpacity
              style={[cardStyles.qtyBtn, cardStyles.qtyBtnMinus, isViewer && { opacity: 0.3 }]}
              onPress={() => !isViewer && onPendingChange(-1)}
              disabled={isViewer}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            >
              <Text style={[cardStyles.qtyBtnText, cardStyles.qtyBtnTextMinus]}>－</Text>
            </TouchableOpacity>

            {/* Tap qty → numpad */}
            <TouchableOpacity
              onPress={isViewer ? undefined : onTapQty}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              disabled={isViewer}
            >
              <Text style={[cardStyles.qtyNum, !isViewer && cardStyles.qtyNumTappable]}>
                {localQty}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[cardStyles.qtyBtn, cardStyles.qtyBtnPlus, isViewer && { opacity: 0.3 }]}
              onPress={() => !isViewer && onPendingChange(1)}
              disabled={isViewer}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Text style={[cardStyles.qtyBtnText, cardStyles.qtyBtnTextPlus]}>＋</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// ─── Scan Bar ─────────────────────────────────────────────────────────────────

const ScanBar: React.FC<{ onSelect: (mode: ScanMode) => void }> = ({ onSelect }) => (
  <View style={sheetStyles.bar}>
    {([
      { mode: 'IN',     label: 'SCAN IN',  icon: '⬇️', color: '#ecfdf5', border: '#a7f3d0', textColor: '#059669' },
      { mode: 'LOOKUP', label: 'LOOKUP',   icon: '🔍', color: '#eff6ff', border: '#bfdbfe', textColor: '#2563eb' },
      { mode: 'OUT',    label: 'SCAN OUT', icon: '⬆️', color: '#fff1f2', border: '#fecdd3', textColor: '#e11d48' },
    ] as const).map(({ mode, label, icon, color, border, textColor }) => (
      <TouchableOpacity
        key={mode}
        style={[sheetStyles.actionBtn, { backgroundColor: color, borderColor: border }]}
        onPress={() => onSelect(mode)}
      >
        <Text style={sheetStyles.actionIconText}>{icon}</Text>
        <Text style={[sheetStyles.actionLabel, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user, userType, onOpenProfile, onOpenScanner, onEditItem, onOpenHistory,
  workspaceRole, workspaceOwnerId, availableWorkspaces = [], onSwitchWorkspace,
  summary, loading, onRefresh, registerBackHandler,
}) => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [photoUri, setPhotoUri]             = useState<string | null>(null);

  // Numpad modal state
  const [numpadItem, setNumpadItem] = useState<InventorySummary | null>(null);

  // Pending +/- confirmation: barcode → delta (+1 or -1)
  const [pendingMap, setPendingMap] = useState<Record<string, number>>({});

  const isViewer = workspaceRole === 'viewer';

  useEffect(() => {
    if (!registerBackHandler) return;
    registerBackHandler(() => {
      // Cancel any pending confirmations first
      if (Object.keys(pendingMap).length > 0) {
        setPendingMap({});
        return true;
      }
      if (activeCategory !== 'all') {
        setActiveCategory('all');
        return true;
      }
      return false;
    });
  }, [registerBackHandler, activeCategory, pendingMap]);

  const [qtyOverrides, setQtyOverrides] = useState<Record<string, number>>({});
  const [recentOrder, setRecentOrder]   = useState<string[]>([]);

  const bumpToTop = useCallback((barcode: string) => {
    setRecentOrder(prev => [barcode, ...prev.filter(b => b !== barcode)]);
  }, []);

  // ─── Undo toast ───────────────────────────────────────────────────────────
  const [undoAction, setUndoAction]   = useState<{ barcode: string; itemName: string; delta: number } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastAnim    = useRef(new Animated.Value(0)).current;

  const prevSummaryRef = useRef<InventorySummary[]>([]);
  useEffect(() => {
    const prev = prevSummaryRef.current;
    for (const item of summary) {
      const old = prev.find(p => p.barcode === item.barcode);
      if (!old || old.quantity !== item.quantity) {
        bumpToTop(item.barcode);
        break;
      }
    }
    prevSummaryRef.current = summary;
  }, [summary]);

  useEffect(() => {
    setQtyOverrides(prev => {
      const next = { ...prev };
      let changed = false;
      for (const barcode of Object.keys(next)) {
        const serverItem = summary.find(i => i.barcode === barcode && i.owner_id === user.id);
        if (serverItem && serverItem.quantity === next[barcode]) {
          delete next[barcode];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [summary, user.id]);

  // ─── Core adjust (called after confirmation) ──────────────────────────────
  const adjustQuantity = useCallback(async (barcode: string, delta: number) => {
    const item = summary.find(i => i.barcode === barcode && i.owner_id === user.id);
    if (!item) return;

    const currentQty = qtyOverrides[barcode] ?? item.quantity;
    if (delta < 0 && currentQty <= 0) {
      Alert.alert('Out of Stock', 'Cannot reduce quantity below 0.');
      return;
    }

    const expectedQty = Math.max(0, currentQty + delta);
    if (expectedQty === currentQty) return;

    setQtyOverrides(prev => ({ ...prev, [barcode]: expectedQty }));

    try {
      const { error } = await supabase.from('inventory_logs').insert({
        barcode,
        action_type: delta > 0 ? 'IN' : 'OUT',
        device_id:   'MOBILE_DASHBOARD',
        owner_id:    user.id,
        quantity:    delta,
      });
      if (error) throw error;

      showToast(barcode, item.name || barcode, delta);
      bumpToTop(barcode);
    } catch (err: any) {
      setQtyOverrides(prev => {
        const next = { ...prev };
        delete next[barcode];
        return next;
      });
      Alert.alert('Error', err.message);
    }
  }, [summary, user.id, qtyOverrides]);

  // ─── Set quantity directly (from numpad) ─────────────────────────────────
  const setQuantityDirect = useCallback(async (barcode: string, newQty: number) => {
    const item = summary.find(i => i.barcode === barcode && i.owner_id === user.id);
    if (!item) return;

    const currentQty = qtyOverrides[barcode] ?? item.quantity;
    const delta = newQty - currentQty;
    if (delta === 0) return; // nothing changed

    await adjustQuantity(barcode, delta);
  }, [summary, user.id, qtyOverrides, adjustQuantity]);

  // ─── Pending +/- handlers ─────────────────────────────────────────────────
  const handlePendingChange = useCallback((barcode: string, delta: number) => {
    // If already pending for same direction, stack it; opposite direction cancels
    setPendingMap(prev => {
      const existing = prev[barcode];
      if (existing !== undefined && existing !== delta) {
        // Opposite direction → cancel
        const next = { ...prev };
        delete next[barcode];
        return next;
      }
      return { ...prev, [barcode]: delta };
    });
  }, []);

  const handlePendingConfirm = useCallback((barcode: string) => {
    const delta = pendingMap[barcode];
    if (delta === undefined) return;
    setPendingMap(prev => {
      const next = { ...prev };
      delete next[barcode];
      return next;
    });
    adjustQuantity(barcode, delta);
  }, [pendingMap, adjustQuantity]);

  const handlePendingCancel = useCallback((barcode: string) => {
    setPendingMap(prev => {
      const next = { ...prev };
      delete next[barcode];
      return next;
    });
  }, []);

  // ─── Toast helpers ────────────────────────────────────────────────────────
  const hideToast = useCallback(() => {
    Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      .start(() => setToastVisible(false));
  }, [toastAnim]);

  const showToast = useCallback((barcode: string, itemName: string, delta: number) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setUndoAction({ barcode, itemName, delta });
    setToastVisible(true);
    Animated.spring(toastAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    toastTimeout.current = setTimeout(() => hideToast(), 3500);
  }, [toastAnim, hideToast]);

  const handleUndo = useCallback(async () => {
    if (!undoAction) return;
    if (toastTimeout.current) clearTimeout(toastTimeout.current);

    const currentItem = summary.find(i => i.barcode === undoAction.barcode);
    const currentQty  = qtyOverrides[undoAction.barcode] ?? currentItem?.quantity ?? 0;
    const restoredQty = currentQty - undoAction.delta;

    setQtyOverrides(prev => ({ ...prev, [undoAction.barcode]: restoredQty }));

    try {
      await supabase.from('inventory_logs').insert({
        barcode:     undoAction.barcode,
        action_type: undoAction.delta > 0 ? 'OUT' : 'IN',
        device_id:   'MOBILE_UNDO',
        owner_id:    user!.id,
        quantity:    -undoAction.delta,
      });
    } catch (err: any) {
      const currentQtyNow = qtyOverrides[undoAction.barcode] ?? 0;
      setQtyOverrides(prev => ({ ...prev, [undoAction.barcode]: currentQtyNow }));
      Alert.alert('Undo failed', err.message);
    }
    hideToast();
  }, [undoAction, hideToast, user, summary, qtyOverrides]);

  const handleShare = async (item: InventorySummary) => {
    try {
      const { data: existing } = await supabase
        .from('shared_items')
        .select('token')
        .eq('barcode', item.barcode)
        .eq('owner_id', user.id)
        .single();

      let token = existing?.token;

      if (!token) {
        const { data: created, error } = await supabase
          .from('shared_items')
          .insert({ barcode: item.barcode, owner_id: user.id })
          .select('token')
          .single();
        if (error) throw error;
        token = created.token;
      }

      const shareUrl = `https://omniscanpro.app/share/${token}`;
      await Share.share({
        title: item.name || item.barcode,
        message: `Check out ${item.name || 'this product'} — ${shareUrl}\n\nBuild your own Mini Market with OmniScan Pro 🛒`,
      });
    } catch (err: any) {
      Alert.alert('Share failed', err.message);
    }
  };

  // ─── Derived data ─────────────────────────────────────────────────────────
  // When viewing a shared workspace, filter by that owner's ID
  const activeOwnerId = workspaceOwnerId || user.id;

  const activeItems = useMemo(() => {
    const base = summary
      .filter(i => i.owner_id === activeOwnerId)
      .filter(i => (qtyOverrides[i.barcode] ?? i.quantity) > 0);

    return [...base].sort((a, b) => {
      const ai = recentOrder.indexOf(a.barcode);
      const bi = recentOrder.indexOf(b.barcode);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    });
  }, [summary, activeOwnerId, qtyOverrides, recentOrder]);

  const zeroItems = useMemo(() =>
    summary
      .filter(i => i.owner_id === activeOwnerId)
      .filter(i => (qtyOverrides[i.barcode] ?? i.quantity) === 0),
    [summary, activeOwnerId, qtyOverrides]
  );

  const normalizeCategory = useCallback((raw: string): string => {
    const s = raw.trim().toLowerCase();
    if (s.endsWith('s') && s.length > 3 && !s.endsWith('ss') && !s.endsWith('ce') && !s.endsWith('se')) {
      return s.slice(0, -1);
    }
    return s;
  }, []);

  const titleCase = useCallback((s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1), []);

  const categories = useMemo(() => {
    const catMap = new Map<string, { displayName: string; count: number }>();
    for (const item of activeItems) {
      if (!item.category) continue;
      const key = normalizeCategory(item.category);
      const qty = qtyOverrides[item.barcode] ?? item.quantity;
      if (catMap.has(key)) {
        catMap.get(key)!.count += qty;
      } else {
        catMap.set(key, { displayName: titleCase(key), count: qty });
      }
    }
    const cats = [
      { id: 'all', name: 'All', count: activeItems.reduce((a, i) => a + (qtyOverrides[i.barcode] ?? i.quantity), 0) },
      ...[...catMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => ({
        id: key,
        name: val.displayName,
        count: val.count,
      })),
    ];
    if (zeroItems.length > 0) {
      cats.push({ id: 'out-of-stock', name: '📦 Out of Stock', count: zeroItems.length });
    }
    return cats;
  }, [activeItems, qtyOverrides, zeroItems, normalizeCategory, titleCase]);

  const filtered = useMemo(() => {
    if (activeCategory === 'out-of-stock') {
      return zeroItems.filter(item =>
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return activeItems.filter(item => {
      const matchSearch =
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        activeCategory === 'all' ||
        normalizeCategory(item.category || '') === activeCategory;
      return matchSearch && matchCat;
    });
  }, [activeItems, zeroItems, searchQuery, activeCategory]);

  const userName   = user.user_metadata?.full_name || user.email.split('@')[0];
  const avatarSeed = user.user_metadata?.avatar_seed || user.email;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarRow} onPress={onOpenProfile}>
          <Image
            source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}` }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.appLabel}>OmniScan Pro</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsBtn} onPress={onOpenProfile}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items or barcodes…"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Ad Banner */}
      {shouldShowAds(userType) && <AdBanner />}

      {/* Workspace switcher banner — shown when user has access to shared workspaces */}
      {availableWorkspaces.length > 1 && (
        <View style={styles.workspaceBanner}>
          <Text style={styles.workspaceBannerLabel}>VIEWING</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workspacePills}>
            {availableWorkspaces.map((ws) => {
              const isActive = ws.isOwn ? !workspaceOwnerId : workspaceOwnerId === ws.ownerId;
              return (
                <TouchableOpacity
                  key={ws.ownerId}
                  style={[styles.workspacePill, isActive && styles.workspacePillActive]}
                  onPress={() => onSwitchWorkspace?.(ws)}
                >
                  <Text style={[styles.workspacePillText, isActive && styles.workspacePillTextActive]}>
                    {ws.isOwn ? '👤 My Inventory' : `👥 ${ws.ownerEmail.split('@')[0]}`}
                  </Text>
                  {!ws.isOwn && (
                    <View style={[styles.roleBadge, isActive && styles.roleBadgeActive]}>
                      <Text style={[styles.roleBadgeText, isActive && styles.roleBadgeTextActive]}>
                        {ws.role.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Title + category filter */}
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.categoryTitle}>
          {categories.find(c => c.id === activeCategory)?.name ?? 'All'} ·{' '}
          {categories.find(c => c.id === activeCategory)?.count ?? 0}{' '}
          {activeCategory === 'out-of-stock' ? 'items' : 'units'}
        </Text>
      </View>

      {/* List */}
      {loading && filtered.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.barcode}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#10b981" />}
          renderItem={({ item }) =>
            activeCategory === 'out-of-stock' ? (
              <View style={styles.zeroCard}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.zeroCardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.zeroCardImage, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 36, opacity: 0.2 }}>📷</Text>
                  </View>
                )}
                <View style={styles.zeroInfo}>
                  <Text style={styles.zeroName} numberOfLines={2}>{item.name || item.barcode}</Text>
                  <Text style={styles.zeroBarcode} numberOfLines={1}>{item.barcode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.reAddBtn}
                  onPress={() => adjustQuantity(item.barcode, 1)}
                  disabled={isViewer}
                >
                  <Text style={styles.reAddBtnText}>＋ Re-add</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <InventoryCard
                item={item}
                localQty={qtyOverrides[item.barcode] ?? item.quantity}
                onEdit={() => onEditItem(item)}
                isViewer={isViewer}
                onAdjust={(delta) => adjustQuantity(item.barcode, delta)}
                onViewPhoto={(uri) => setPhotoUri(uri)}
                onTapQty={() => setNumpadItem(item)}
                pendingDelta={pendingMap[item.barcode] ?? null}
                onPendingChange={(delta) => handlePendingChange(item.barcode, delta)}
                onPendingConfirm={() => handlePendingConfirm(item.barcode)}
                onPendingCancel={() => handlePendingCancel(item.barcode)}
              />
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>{activeCategory === 'out-of-stock' ? '✅' : '📦'}</Text>
              <Text style={styles.emptyText}>{activeCategory === 'out-of-stock' ? 'ALL IN STOCK' : 'NO ITEMS FOUND'}</Text>
            </View>
          }
        />
      )}

      {/* Scan bar + undo toast */}
      <View style={{ position: 'relative' }}>
        {toastVisible && undoAction && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, elevation: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff', flex: 1 }} numberOfLines={1}>
              {undoAction.itemName}  {undoAction.delta > 0 ? '＋1' : '－1'}
            </Text>
            <TouchableOpacity onPress={handleUndo} style={{ marginLeft: 16, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#334155', borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#38bdf8' }}>Undo</Text>
            </TouchableOpacity>
          </View>
        )}
        {!isViewer && <ScanBar onSelect={onOpenScanner} />}
      </View>

      {/* Photo viewer */}
      <PhotoViewer uri={photoUri} onClose={() => setPhotoUri(null)} />

      {/* Numpad modal */}
      <NumpadModal
        visible={!!numpadItem}
        initialQty={numpadItem ? (qtyOverrides[numpadItem.barcode] ?? numpadItem.quantity) : 0}
        itemName={numpadItem?.name || numpadItem?.barcode || ''}
        onConfirm={(newQty) => {
          if (numpadItem) setQuantityDirect(numpadItem.barcode, newQty);
          setNumpadItem(null);
        }}
        onClose={() => setNumpadItem(null)}
      />

      {/* Category Drawer */}
      <CategoryDrawer
        visible={drawerOpen}
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onOpenHistory={() => { onOpenHistory(); setDrawerOpen(false); }}
        onClose={() => setDrawerOpen(false)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { position: 'relative', flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9' },
  appLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5 },
  userName: { fontSize: 16, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  settingsBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 20 },
  searchRow: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
  clearIcon: { fontSize: 14, color: '#94a3b8' },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 20 },
  categoryTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
  list: { paddingHorizontal: 10, paddingBottom: 16 },
  row: { justifyContent: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  zeroCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', margin: 6, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden', opacity: 0.7 },
  zeroCardImage: { width: '100%', height: 130, backgroundColor: '#f8fafc' },
  zeroInfo: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  zeroName: { fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 2 },
  zeroBarcode: { fontSize: 9, fontWeight: '500', color: '#cbd5e1', fontVariant: ['tabular-nums'] },
  reAddBtn: { margin: 8, backgroundColor: '#ecfdf5', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#a7f3d0' },
  reAddBtnText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },
  // Workspace switcher
  workspaceBanner:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 10 },
  workspaceBannerLabel:  { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5 },
  workspacePills:        { flexDirection: 'row', flexGrow: 0 },
  workspacePill:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  workspacePillActive:   { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  workspacePillText:     { fontSize: 12, fontWeight: '700', color: '#64748b' },
  workspacePillTextActive: { color: '#059669' },
  roleBadge:             { backgroundColor: '#e2e8f0', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  roleBadgeActive:       { backgroundColor: '#d1fae5' },
  roleBadgeText:         { fontSize: 8, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  roleBadgeTextActive:   { color: '#059669' },
});

const cardStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', margin: 6, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  image: { width: '100%', height: 155, backgroundColor: '#f8fafc' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  imagePlaceholderIcon: { fontSize: 36, opacity: 0.3 },
  categoryBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(15,23,42,0.55)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, maxWidth: '70%' },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  info: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  name: { fontSize: 12, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  qtyBtn: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  qtyBtnPlus:      { backgroundColor: '#ecfdf5' },
  qtyBtnMinus:     { backgroundColor: '#fff1f2' },
  qtyBtnConfirm:   { backgroundColor: '#ecfdf5', width: 34, height: 34, borderRadius: 11 },
  qtyBtnCancel:    { backgroundColor: '#fff1f2', width: 34, height: 34, borderRadius: 11 },
  qtyBtnText:      { fontSize: 16, fontWeight: '700' },
  qtyBtnTextPlus:  { color: '#10b981' },
  qtyBtnTextMinus: { color: '#e11d48' },
  qtyBtnTextConfirm: { fontSize: 15, fontWeight: '900', color: '#059669' },
  qtyBtnTextCancel:  { fontSize: 13, fontWeight: '900', color: '#e11d48' },
  qtyNum:          { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  qtyNumTappable:  { textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: '#94a3b8' },
  qtyPreviewBox:   { alignItems: 'center', flexDirection: 'row', gap: 3 },
  qtyDelta:        { fontSize: 9, fontWeight: '700', color: '#94a3b8' },
  // unused stubs
  qtyBox: { alignItems: 'center' },
  category: { fontSize: 10, fontWeight: '700', color: '#10b981' },
  qtyLabel: { fontSize: 8, color: '#94a3b8' },
  shareBtnText: { fontSize: 10, color: '#0284c7' },
  _shareBtn_unused: {},
});

const numpadStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 36, paddingTop: 16 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 20 },
  itemName: { fontSize: 15, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 2, textAlign: 'center', marginBottom: 16 },
  display: { backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 18, alignItems: 'center', marginBottom: 20 },
  displayText: { fontSize: 40, fontWeight: '900', color: '#0f172a', letterSpacing: 2, fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  key: { width: '30%', aspectRatio: 1.6, backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  keyBackspace: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  keyText: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  keyBackspaceText: { fontSize: 20, color: '#e11d48' },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '800', color: '#64748b' },
  confirmBtn: { flex: 2, paddingVertical: 16, borderRadius: 16, backgroundColor: '#10b981', alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '900', color: '#fff' },
});

const drawerStyles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  drawer: { width: '55%', flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8, maxHeight: '100%' },
  scrollArea: { flex: 1, marginBottom: 20 },
  heading: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 2, marginBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, marginBottom: 6 },
  itemActive: { backgroundColor: '#ecfdf5' },
  itemText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  itemTextActive: { color: '#059669' },
  badge: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeActive: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  badgeTextActive: { color: '#059669' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
});

const sheetStyles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 24, gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 18, borderWidth: 1, gap: 6 },
  actionIconText: { fontSize: 16 },
  actionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});

const adStyles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', paddingVertical: 6, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  banner: { width: 320, height: 50, backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 1.5, backgroundColor: '#e2e8f0', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  placeholder: { fontSize: 12, fontWeight: '600', color: '#cbd5e1' },
  toast: { backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  toastText:     { fontSize: 13, fontWeight: '700', color: '#fff', flex: 1, flexShrink: 1 },
  toastUndo:     { marginLeft: 16, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#334155', borderRadius: 8 },
  toastUndoText: { fontSize: 12, fontWeight: '800', color: '#38bdf8' },
});