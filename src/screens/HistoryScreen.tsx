import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { InventoryLog } from '../types';

interface HistoryScreenProps {
  userId: string;
  onBack: () => void;
}

const ActionIcon: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { icon: string; bg: string; color: string }> = {
    IN:     { icon: '⬇️', bg: '#ecfdf5', color: '#059669' },
    OUT:    { icon: '⬆️', bg: '#fff1f2', color: '#e11d48' },
    DELETE: { icon: '🗑', bg: '#fef9c3', color: '#b45309' },
  };
  const cfg = map[type] || map.IN;
  return (
    <View style={[historyStyles.icon, { backgroundColor: cfg.bg }]}>
      <Text style={historyStyles.iconText}>{cfg.icon}</Text>
    </View>
  );
};

const LogRow: React.FC<{ log: InventoryLog }> = ({ log }) => {
  const qty = log.quantity;
  const isPositive = qty > 0;
  const date  = new Date(log.created_at);
  const time  = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day   = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const source = log.device_id.replace('MOBILE_', '').replace('WEB_', '').replace('_', ' ');

  return (
    <View style={historyStyles.row}>
      <ActionIcon type={log.action_type} />
      <View style={historyStyles.info}>
        <Text style={historyStyles.name} numberOfLines={1}>
          {log.name || `Barcode: ${log.barcode}`}
        </Text>
        <View style={historyStyles.meta}>
          <Text style={historyStyles.metaText}>{time}</Text>
          <View style={historyStyles.dot} />
          <Text style={historyStyles.metaText}>{day}</Text>
          <View style={historyStyles.dot} />
          <Text style={historyStyles.metaText}>{source}</Text>
        </View>
      </View>
      <Text style={[historyStyles.qty, isPositive ? historyStyles.qtyIn : historyStyles.qtyOut]}>
        {isPositive ? `+${qty}` : qty}
      </Text>
    </View>
  );
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ userId, onBack }) => {
  const [logs, setLogs]       = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setLogs(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('history_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_logs' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Activity Log</Text>
          <Text style={styles.subtitle}>YOUR INVENTORY HISTORY</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && logs.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.log_id}
          renderItem={({ item }) => <LogRow log={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No activity yet</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#10b981" />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: '#0f172a', fontWeight: '300', lineHeight: 30 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 2, marginTop: 2 },
  refreshBtn: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: { fontSize: 20, color: '#64748b' },
  errorBox: {
    margin: 16,
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    padding: 14,
  },
  errorText: { color: '#e11d48', fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 60 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 13, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },
});

const historyStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 14,
    marginVertical: 5,
    gap: 14,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#cbd5e1' },
  qty: { fontSize: 15, fontWeight: '900' },
  qtyIn:  { color: '#059669' },
  qtyOut: { color: '#e11d48' },
});
