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
// Placeholder sized to standard AdMob banner (320×50).
// When AdMob SDK is ready, replace the View contents with:
//   import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
//   <BannerAd unitId={AD_CONFIG.bannerAdUnitId} size={BannerAdSize.BANNER} />

const AdBanner: React.FC = () => (
  <View style={adStyles.container}>
    <View style={adStyles.banner}>
      <Text style={adStyles.label}>AD</Text>
      <Text style={adStyles.placeholder}>Advertisement</Text>
    </View>
  </View>
);

interface DashboardScreenProps {
  user: AppUser;
  userType?: string; // 'free' | 'pro' | 'scanner_owner' — undefined treated as free
  onOpenProfile: () => void;
  workspaceRole?: 'owner' | 'editor' | 'viewer' | null;
  onOpenScanner: (mode: ScanMode) => void;
  onEditItem: (item: InventorySummary) => void;
  onOpenHistory: () => void;
  summary: InventorySummary[];
  loading: boolean;
  onRefresh: () => void;
  // App.tsx calls this once to register the dashboard back-press handler
  registerBackHandler?: (handler: () => boolean) => void;
}

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

// ─── Photo Viewer ────────────────────────────────────────────────────────────

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

// ─── Inventory Card (grid tile) ──────────────────────────────────────────────

const InventoryCard: React.FC<{
  item: InventorySummary;
  localQty: number;
  onEdit: () => void;
  onAdjust: (delta: number) => void;
  onViewPhoto: (uri: string) => void;
  isViewer: boolean;
}> = ({ item, localQty, onEdit, onAdjust, onViewPhoto, isViewer }) => (
  <View style={cardStyles.card}>
    {/* Photo — tap opens full-screen viewer. Blank if no image_url */}
    <Pressable
      onPress={() => item.image_url ? onViewPhoto(item.image_url) : undefined}
      android_ripple={item.image_url ? { color: '#e2e8f0', borderless: false } : undefined}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={cardStyles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[cardStyles.image, cardStyles.imagePlaceholder]}>
          <Text style={cardStyles.imagePlaceholderIcon}>📷</Text>
        </View>
      )}
    </Pressable>

    {/* Name + barcode — tap opens item detail */}
    <Pressable
      onPress={isViewer ? undefined : onEdit}
      style={cardStyles.info}
      android_ripple={isViewer ? undefined : { color: '#f1f5f9', borderless: true }}
    >
      <Text style={cardStyles.name} numberOfLines={2}>{item.name || item.barcode}</Text>
      <Text style={cardStyles.barcode} numberOfLines={1}>{item.barcode}</Text>
    </Pressable>

    {/* Quantity control row */}
    <View style={cardStyles.qtyRow}>
      <TouchableOpacity
        style={[cardStyles.qtyBtn, cardStyles.qtyBtnMinus, isViewer && { opacity: 0.3 }]}
        onPress={() => onAdjust(-1)}
        disabled={isViewer}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
      >
        <Text style={[cardStyles.qtyBtnText, cardStyles.qtyBtnTextMinus]}>－</Text>
      </TouchableOpacity>
      <Text style={cardStyles.qtyNum}>{localQty}</Text>
      <TouchableOpacity
        style={[cardStyles.qtyBtn, cardStyles.qtyBtnPlus, isViewer && { opacity: 0.3 }]}
        onPress={() => onAdjust(1)}
        disabled={isViewer}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
      >
        <Text style={[cardStyles.qtyBtnText, cardStyles.qtyBtnTextPlus]}>＋</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Scan Bar (permanent bottom bar) ─────────────────────────────────────────

const ScanBar: React.FC<{
  onSelect: (mode: ScanMode) => void;
}> = ({ onSelect }) => (
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
  user, userType, onOpenProfile, onOpenScanner, onEditItem, onOpenHistory, workspaceRole,
  summary, loading, onRefresh, registerBackHandler,
}) => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [photoUri, setPhotoUri]             = useState<string | null>(null);

  const isViewer = workspaceRole === 'viewer';

  // Register back-press handler with App.tsx so hardware back can reset category filter
  useEffect(() => {
    if (!registerBackHandler) return;
    registerBackHandler(() => {
      if (activeCategory !== 'all') {
        setActiveCategory('all');
        return true; // consumed
      }
      return false; // not consumed — let App.tsx handle (exit confirmation)
    });
  }, [registerBackHandler, activeCategory]);


  // Optimistic quantity overrides: barcode → expected qty after local changes
  // Cleared only when the summary prop from the server catches up to our expected value
  const [qtyOverrides, setQtyOverrides] = useState<Record<string, number>>({});

  // Tracks recency order this session — index 0 = most recently scanned
  const [recentOrder, setRecentOrder] = useState<string[]>([]);

  const bumpToTop = useCallback((barcode: string) => {
    setRecentOrder(prev => [barcode, ...prev.filter(b => b !== barcode)]);
  }, []);

  // ─── Undo toast ───────────────────────────────────────────────────────────
  const [undoAction, setUndoAction] = useState<{
    barcode: string;
    itemName: string;
    delta: number;
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // When summary changes from Realtime, bump the most recently updated barcode to top
  const prevSummaryRef = useRef<InventorySummary[]>([]);
  useEffect(() => {
    const prev = prevSummaryRef.current;
    for (const item of summary) {
      const old = prev.find(p => p.barcode === item.barcode);
      if (!old || old.quantity !== item.quantity) {
        bumpToTop(item.barcode);
        break; // only bump one per Realtime event
      }
    }
    prevSummaryRef.current = summary;
  }, [summary]);

  // When summary updates from server, clear any override that has been satisfied
  React.useEffect(() => {
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

  const adjustQuantity = useCallback(async (barcode: string, delta: number) => {
    const item = summary.find(i => i.barcode === barcode && i.owner_id === user.id);
    if (!item) return;

    const currentQty = qtyOverrides[barcode] ?? item.quantity;
    if (delta < 0 && currentQty <= 0) {
      Alert.alert('Out of Stock', 'Cannot reduce quantity below 0.');
      return;
    }

    // Hard floor at 0 — never allow negative quantity
    const expectedQty = Math.max(0, currentQty + delta);
    if (expectedQty === currentQty) return; // nothing changed (already at 0)

    // Optimistic update — instant UI response
    setQtyOverrides(prev => ({ ...prev, [barcode]: expectedQty }));

    try {
      const { data, error } = await supabase.from('inventory_logs').insert({
        barcode,
        action_type: delta > 0 ? 'IN' : 'OUT',
        device_id:   'MOBILE_DASHBOARD',
        owner_id:    user.id,
        quantity:    delta,
      }).select('log_id').single();
      if (error) throw error;

      showToast(barcode, item.name || barcode, delta);
      bumpToTop(barcode);
    } catch (err: any) {
      // Rollback on failure
      setQtyOverrides(prev => {
        const next = { ...prev };
        delete next[barcode];
        return next;
      });
      Alert.alert('Error', err.message);
    }
  }, [summary, user.id, qtyOverrides]);

  const hideToast = useCallback(() => {
    Animated.timing(toastAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setToastVisible(false));
  }, [toastAnim]);

  const showToast = useCallback((barcode: string, itemName: string, delta: number) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setUndoAction({ barcode, itemName, delta });
    setToastVisible(true);
    Animated.spring(toastAnim, {
      toValue: 1, useNativeDriver: true, tension: 80, friction: 10,
    }).start();
    toastTimeout.current = setTimeout(() => hideToast(), 3500);
  }, [toastAnim, hideToast]);

  const handleUndo = useCallback(async () => {
    if (!undoAction) return;
    if (toastTimeout.current) clearTimeout(toastTimeout.current);

    // Use actual item quantity from summary as the base, not the override
    const currentItem = summary.find(i => i.barcode === undoAction.barcode);
    const currentQty  = qtyOverrides[undoAction.barcode] ?? currentItem?.quantity ?? 0;
    const restoredQty = currentQty - undoAction.delta;

    setQtyOverrides(prev => ({
      ...prev,
      [undoAction.barcode]: restoredQty,
    }));

    try {
      await supabase.from('inventory_logs').insert({
        barcode:     undoAction.barcode,
        action_type: undoAction.delta > 0 ? 'OUT' : 'IN',
        device_id:   'MOBILE_UNDO',
        owner_id:    user!.id,
        quantity:    -undoAction.delta,
      });
    } catch (err: any) {
      // Rollback the optimistic undo
      setQtyOverrides(prev => ({
        ...prev,
        [undoAction.barcode]: currentQty,
      }));
      Alert.alert('Undo failed', err.message);
    }
    hideToast();
  }, [undoAction, hideToast, user, summary, qtyOverrides]);

  const handleShare = async (item: InventorySummary) => {
    try {
      // Generate or fetch existing share token from Supabase
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

  const activeItems = useMemo(() => {
    const base = summary
      .filter(i => i.owner_id === user.id)
      .filter(i => (qtyOverrides[i.barcode] ?? i.quantity) > 0);

    return [...base].sort((a, b) => {
      const ai = recentOrder.indexOf(a.barcode);
      const bi = recentOrder.indexOf(b.barcode);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    });
  }, [summary, user.id, qtyOverrides, recentOrder]);

  // Items that hit zero — shown at bottom so user can re-add
  const zeroItems = useMemo(() => {
    return summary
      .filter(i => i.owner_id === user.id)
      .filter(i => (qtyOverrides[i.barcode] ?? i.quantity) === 0);
  }, [summary, user.id, qtyOverrides]);

  // Normalize a category string: trim whitespace + lowercase + singularize common suffixes
  // so "Snacks", "snack", "snacks", "SNACK" all map to the same bucket
  const normalizeCategory = useCallback((raw: string): string => {
    const s = raw.trim().toLowerCase();
    // Remove trailing 's' for simple plurals (snacks→snack, sources→source)
    // but protect words that naturally end in 's' like 'sauce', 'juice'
    if (s.endsWith('s') && s.length > 3 && !s.endsWith('ss') && !s.endsWith('ce') && !s.endsWith('se')) {
      return s.slice(0, -1);
    }
    return s;
  }, []);

  // Title-case for display
  const titleCase = useCallback((s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1)
  , []);

  const categories = useMemo(() => {
    // Group items by normalized category key
    const catMap = new Map<string, { displayName: string; count: number }>();
    for (const item of activeItems) {
      if (!item.category) continue;
      const key = normalizeCategory(item.category);
      const qty = qtyOverrides[item.barcode] ?? item.quantity;
      if (catMap.has(key)) {
        catMap.get(key)!.count += qty;
      } else {
        // Use title-case of normalized key as display name
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
    // Out of Stock category shows zeroItems, not activeItems
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

      {/* Ad Banner — shown to free users only */}
      {shouldShowAds(userType) && <AdBanner />}

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

      {/* Permanent scan bar + toast container */}
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

      {/* Modals */}
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
  container: {
    position: 'relative', flex: 1, backgroundColor: '#fff' },
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
  zeroCategory: { fontSize: 9, fontWeight: '700', color: '#cbd5e1', marginTop: 2 },
  reAddBtn: { margin: 8, backgroundColor: '#ecfdf5', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#a7f3d0' },
  reAddBtnText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },

});

const cardStyles = StyleSheet.create({
  // Vertical grid tile
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    margin: 6,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 130, backgroundColor: '#f8fafc' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  imagePlaceholderIcon: { fontSize: 36, opacity: 0.3 },
  info: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  name: { fontSize: 12, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  barcode: { fontSize: 9, fontWeight: '500', color: '#94a3b8', fontVariant: ['tabular-nums'] },
  // Quantity control row at bottom of card
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnPlus:      { backgroundColor: '#ecfdf5' },
  qtyBtnMinus:     { backgroundColor: '#fff1f2' },
  qtyBtnText:      { fontSize: 16, fontWeight: '700' },
  qtyBtnTextPlus:  { color: '#10b981' },
  qtyBtnTextMinus: { color: '#e11d48' },
  qtyNum:          { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  // unused stubs kept to avoid TS errors
  qtyBox: { alignItems: 'center' },
  category: { fontSize: 10, fontWeight: '700', color: '#10b981' },
  qtyLabel: { fontSize: 8, color: '#94a3b8' },
  shareBtnText: { fontSize: 10, color: '#0284c7' },
  _shareBtn_unused: {},
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
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  actionIconText: { fontSize: 16 },
  actionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});

const adStyles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  banner: {
    width: 320,
    height: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.5,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  placeholder: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  toast: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText:     { fontSize: 13, fontWeight: '700', color: '#fff', flex: 1, flexShrink: 1 },
  toastUndo:     { marginLeft: 16, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#334155', borderRadius: 8 },
  toastUndoText: { fontSize: 12, fontWeight: '800', color: '#38bdf8' },
});
