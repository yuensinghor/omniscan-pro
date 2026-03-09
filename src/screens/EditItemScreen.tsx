import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { InventorySummary } from '../types';

interface EditItemScreenProps {
  item: InventorySummary;
  userId: string;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const EditItemScreen: React.FC<EditItemScreenProps> = ({
  item,
  userId,
  visible,
  onClose,
  onSaved,
}) => {
  const [name, setName]         = useState(item.name || '');
  const [category, setCategory] = useState(item.category || '');
  const [imageUrl, setImageUrl] = useState(item.image_url || '');
  const [saving, setSaving]     = useState(false);

  const takePicture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission denied', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }
    setSaving(true);
    try {
      // inventory_logs is append-only — insert a zero-quantity log row
      // to update the item's name/category/image metadata.
      // inventory_summary view picks up the latest non-null name/category.
      const { error } = await supabase.from('inventory_logs').insert({
        barcode:     item.barcode,
        action_type: 'IN',
        device_id:   'MOBILE_EDIT',
        owner_id:    userId,
        quantity:    0,
        name:        name.trim(),
        category:    category.trim() || 'General',
        image_url:   imageUrl || item.image_url,
      });

      if (error) throw error;
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Save failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Item',
      'This will zero out the stock and remove the item from your dashboard. History will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('inventory_logs').insert({
                barcode:     item.barcode,
                action_type: 'DELETE',
                device_id:   'MOBILE_DELETE',
                owner_id:    userId,
                quantity:    -item.quantity,
                name:        item.name,
                category:    item.category,
                image_url:   item.image_url,
              });
              if (error) throw error;
              onSaved();
              onClose();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Item</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Image */}
            <TouchableOpacity style={styles.imageTap} onPress={takePicture}>
              <Image
                source={{ uri: imageUrl || `https://picsum.photos/seed/${item.barcode}/400/300` }}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageOverlayText}>📷  Retake Photo</Text>
              </View>
            </TouchableOpacity>

            {/* Barcode (read-only) */}
            <View style={styles.barcodeRow}>
              <Text style={styles.barcodeLabel}>BARCODE</Text>
              <Text style={styles.barcodeValue}>{item.barcode}</Text>
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>PRODUCT NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Lychee in Syrup"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Category */}
            <View style={styles.field}>
              <Text style={styles.label}>CATEGORY</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Canned Food"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Qty display (adjustments are from dashboard cards) */}
            <View style={styles.qtyRow}>
              <Text style={styles.label}>CURRENT STOCK</Text>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Text style={styles.qtyUnit}>units</Text>
              </View>
            </View>

            {/* Action row */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18, color: '#64748b' },
  deleteBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 18 },
  body: { padding: 20 },
  imageTap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
  },
  image: { width: '100%', height: 200 },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageOverlayText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  barcodeRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barcodeLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5 },
  barcodeValue: { fontSize: 13, fontWeight: '700', color: '#0f172a', fontVariant: ['tabular-nums'] },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
  },
  qtyBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  qtyValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  qtyUnit: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
});
