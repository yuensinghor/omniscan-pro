import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { AppUser, InventorySummary, ScanMode } from '../types';

interface DashboardScreenProps {
  user: AppUser;
  onOpenProfile: () => void;
  onOpenScanner: (mode: ScanMode) => void;
  onEditItem: (item: InventorySummary) => void;
  onOpenHistory: () => void;
  summary: InventorySummary[];
  loading: boolean;
  onRefresh: () => void;
}

// ─── Category Drawer ─────────────────────────────────────────────────────────

interface DrawerProps {
  visible: boolean;
  categories: { id: string; name: string; count: number }[];
  activeCategory: string;
  onSelect: (id: string) => void;
  onOpenHistory: () => void;
  onClose: () => void;
}

const CategoryDrawer: React.FC<DrawerProps> = ({
  visible,
  categories,
  activeCategory,
  onSelect,
  onOpenHistory,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={drawerStyles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={drawerStyles.drawer}>
        <Text style={drawerStyles.heading}>CATEGORIES</Text>
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
        <TouchableOpacity
          style={drawerStyles.item}
          onPress={() => { onOpenHistory(); onClose(); }}
        >
          <Text style={drawerStyles.itemText}>⏱  Activity Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Inventory Card ───────────────────────────────────────────────────────────

const InventoryCard: React.FC<{
  item: InventorySummary;
  userId: string;
  onEdit: () => void;
  onAdjust: (delta: number) => void;
}> = ({ item, onEdit, onAdjust }) => (
  <TouchableOpacity style={cardStyles.card} onPress={onEdit} activeOpacity={0.7}>
    <Image
      source={{ uri: item.image_url || `https://picsum.photos/seed/${item.barcode}/200/200` }}
      style={cardStyles.image}
      resizeMode="contain"
    />
    <View style={cardStyles.info}>
      <Text style={cardStyles.name} numberOfLines={2}>
        {item.name || item.barcode}
      </Text>
      <Text style={cardStyles.category}>{item.category || 'General'}</Text>
      <Text style={cardStyles.barcode} numberOfLines={1}>{item.barcode}</Text>
    </View>
    <View style={cardStyles.qtyCol}>
      <TouchableOpacity style={cardStyles.qtyBtn} onPress={() => onAdjust(1)}>
        <Text style={cardStyles.qtyBtnText}>＋</Text>
      </TouchableOpacity>
      <View style={cardStyles.qtyBox}>
        <Text style={cardStyles.qtyNum}>{item.quantity}</Text>
        <Text style={cardStyles.qtyLabel}>QTY</Text>
      </View>
      <TouchableOpacity style={[cardStyles.qtyBtn, cardStyles.qtyBtnMinus]} onPress={() => onAdjust(-1)}>
        <Text style={[cardStyles.qtyBtnText, cardStyles.qtyBtnTextMinus]}>－</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ─── Scan Action Sheet ────────────────────────────────────────────────────────

const ScanSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (mode: ScanMode) => void;
}> = ({ visible, onClose, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={sheetStyles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.handle} />
        <View style={sheetStyles.row}>
          {([
            { mode: 'IN',     label: 'SCAN IN',  icon: '⬇️', color: '#ecfdf5', border: '#a7f3d0', textColor: '#059669' },
            { mode: 'LOOKUP', label: 'LOOKUP',   icon: '🔍', color: '#eff6ff', border: '#bfdbfe', textColor: '#2563eb' },
            { mode: 'OUT',    label: 'SCAN OUT', icon: '⬆️', color: '#fff1f2', border: '#fecdd3', textColor: '#e11d48' },
          ] as const).map(({ mode, label, icon, color, border, textColor }) => (
            <TouchableOpacity
              key={mode}
              style={[sheetStyles.actionBtn, { backgroundColor: color, borderColor: border }]}
              onPress={() => { onClose(); onSelect(mode); }}
            >
              <View style={[sheetStyles.actionIcon, { borderColor: border }]}>
                <Text style={sheetStyles.actionIconText}>{icon}</Text>
              </View>
              <Text style={[sheetStyles.actionLabel, { color: textColor }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={sheetStyles.cancel} onPress={onClose}>
          <Text style={sheetStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onOpenProfile,
  onOpenScanner,
  onEditItem,
  onOpenHistory,
  summary,
  loading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [scanSheetOpen, setScanSheetOpen]   = useState(false);

  const adjustQuantity = useCallback(async (barcode: string, delta: number) => {
    try {
      const item = summary.find(i => i.barcode === barcode);
      if (!item) return;
      if (delta < 0 && item.quantity <= 0) {
        Alert.alert('Out of Stock', 'Cannot reduce quantity below 0.');
        return;
      }
      const { error } = await supabase.from('inventory_logs').insert({
        barcode,
        action_type: delta > 0 ? 'IN' : 'OUT',
        device_id: 'MOBILE_DASHBOARD',
        owner_id: user.id,
        quantity: delta,
        name: item.name,
        category: item.category,
        image_url: item.image_url,
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }, [summary, user.id]);

  const activeItems = useMemo(
    () => summary.filter(i => i.quantity > 0 && i.owner_id === user.id),
    [summary, user.id],
  );

  const categories = useMemo(() => {
    const dynamicCats = Array.from(
      new Set(activeItems.map(i => i.category).filter(Boolean))
    ) as string[];

    return [
      {
        id: 'all',
        name: 'All',
        count: activeItems.reduce((a, i) => a + i.quantity, 0),
      },
      ...dynamicCats.sort().map(name => ({
        id: name.toLowerCase(),
        name,
        count: activeItems
          .filter(i => i.category?.toLowerCase() === name.toLowerCase())
          .reduce((a, i) => a + i.quantity, 0),
      })),
    ];
  }, [activeItems]);

  const filtered = useMemo(() => {
    return activeItems.filter(item => {
      const matchSearch =
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        activeCategory === 'all' ||
        item.category?.toLowerCase() === activeCategory;
      return matchSearch && matchCat;
    });
  }, [activeItems, searchQuery, activeCategory]);

  const userName =
    user.user_metadata?.full_name || user.email.split('@')[0];
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

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search inventory..."
            placeholderTextColor="#cbd5e1"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category / Title row */}
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.categoryTitle}>
          {categories.find(c => c.id === activeCategory)?.name || 'Inventory'}
        </Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.barcode}
          renderItem={({ item }) => (
            <InventoryCard
              item={item}
              userId={user.id}
              onEdit={() => onEditItem(item)}
              onAdjust={(delta) => adjustQuantity(item.barcode, delta)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#10b981" />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setScanSheetOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>⎷</Text>
      </TouchableOpacity>

      {/* Modals */}
      <CategoryDrawer
        visible={drawerOpen}
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onOpenHistory={() => { onOpenHistory(); setDrawerOpen(false); }}
        onClose={() => setDrawerOpen(false)}
      />
      <ScanSheet
        visible={scanSheetOpen}
        onClose={() => setScanSheetOpen(false)}
        onSelect={(mode) => onOpenScanner(mode)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9' },
  appLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5 },
  userName: { fontSize: 16, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 20 },
  searchRow: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
  clearIcon: { fontSize: 14, color: '#94a3b8' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 20 },
  categoryTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 5,
    borderColor: '#fff',
  },
  fabIcon: { fontSize: 30, color: '#fff', fontWeight: '900' },
});

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 14,
    marginVertical: 6,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  category: { fontSize: 10, fontWeight: '700', color: '#10b981', letterSpacing: 0.5, marginBottom: 3 },
  barcode: { fontSize: 10, fontWeight: '500', color: '#94a3b8', fontVariant: ['tabular-nums'] },
  qtyCol: { alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnMinus: { backgroundColor: '#fff1f2' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  qtyBtnTextMinus: { color: '#e11d48' },
  qtyBox: { alignItems: 'center' },
  qtyNum: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  qtyLabel: { fontSize: 8, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },
});

const drawerStyles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  drawer: {
    width: '55%',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  heading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  itemActive: { backgroundColor: '#ecfdf5' },
  itemText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  itemTextActive: { color: '#059669' },
  badge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeActive: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  badgeTextActive: { color: '#059669' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
});

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    paddingBottom: 40,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: { fontSize: 24 },
  actionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  cancel: { paddingVertical: 18, alignItems: 'center' },
  cancelText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
});
