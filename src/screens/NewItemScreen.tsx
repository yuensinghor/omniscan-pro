// src/screens/NewItemScreen.tsx
// When a new barcode is scanned:
//   1. Upsert product metadata into `products` table
//   2. Insert quantity event into `inventory_logs`

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { ScanMode } from '../types';

interface NewItemScreenProps {
  barcode: string;
  mode: ScanMode;
  userId: string;
  ownerId: string;
  visible: boolean;
  onSaved: () => void;
  onCancel: () => void;
}

export const NewItemScreen: React.FC<NewItemScreenProps> = ({
  barcode,
  mode,
  userId,
  ownerId,
  visible,
  onSaved,
  onCancel,
}) => {
  const [name, setName]                   = useState('');
  const [category, setCategory]           = useState('');
  const [imageUrl, setImageUrl]           = useState('');
  const [looking, setLooking]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [lookupFailed, setLookupFailed]   = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Auto-detect product when modal opens
  useEffect(() => {
    if (visible && barcode) {
      setName('');
      setCategory('');
      setImageUrl('');
      setLookupFailed(false);
      autoDetect();
    }
  }, [visible, barcode]);

  const autoDetect = async () => {
    setLooking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('swift-action', {
        body: { barcode: barcode.trim() },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;

      const data = response.data;
      if (data?.products?.length > 0) {
        const product = data.products[0];
        setName(product.product_name || '');
        const cat = product.category
          ? product.category.split('>').pop()?.trim() || 'General'
          : 'General';
        setCategory(cat);
        if (product.images?.length > 0) setImageUrl(product.images[0]);
      } else {
        setName(`Unknown (${barcode})`);
        setCategory('General');
        setLookupFailed(true);
      }
    } catch {
      setName(`Unknown (${barcode})`);
      setCategory('General');
      setLookupFailed(true);
    } finally {
      setLooking(false);
    }
  };

  // ── Photo picker ──────────────────────────────────────────────────────────
  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() || 'jpg';
    const path = `${userId}/${barcode}.${ext}`;

    setUploadingPhoto(true);
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, arrayBuffer, { contentType: `image/${ext}`, upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }
    setSaving(true);
    try {
      // Step 1 — Upsert product metadata into products table
      const { error: productError } = await supabase
        .from('products')
        .upsert({
          barcode:   barcode,
          owner_id:  ownerId,
          name:      name.trim(),
          category:  category.trim() || 'General',
          image_url: imageUrl || null,
        }, {
          onConflict: 'barcode,owner_id',
        });

      if (productError) throw productError;

      // Step 2 — Insert quantity event into inventory_logs
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          barcode,
          action_type: mode === 'LOOKUP' ? 'IN' : mode,
          device_id:   'MOBILE_SCANNER',
          owner_id:    ownerId,
          quantity:    1,
        });

      if (logError) throw logError;

      onSaved();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Item Detected</Text>
            <View style={styles.scanBadge}>
              <Text style={styles.scanBadgeText}>{mode}</Text>
            </View>
          </View>

          <View style={styles.body}>
            {/* Product image — tappable to change photo */}
            <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  {uploadingPhoto
                    ? <ActivityIndicator color="#10b981" size="large" />
                    : <Text style={styles.imagePlaceholderIcon}>📦</Text>
                  }
                </View>
              )}
              <Text style={styles.changePhotoHint}>
                {uploadingPhoto ? 'Uploading…' : 'Tap to add / change photo'}
              </Text>
            </TouchableOpacity>

            {/* Barcode chip */}
            <View style={styles.barcodeChip}>
              <Text style={styles.barcodeChipDot}>●</Text>
              <Text style={styles.barcodeChipText}>Barcode: {barcode}</Text>
            </View>

            {/* Lookup failed notice */}
            {lookupFailed && (
              <View style={styles.warnBox}>
                <Text style={styles.warnText}>
                  Product not found in database. Please fill in the details manually.
                </Text>
              </View>
            )}

            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>PRODUCT NAME</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={looking ? 'Auto-detecting…' : 'e.g. Lychee in Syrup'}
                  placeholderTextColor="#94a3b8"
                />
                {looking && (
                  <ActivityIndicator
                    style={styles.inputSpinner}
                    color="#10b981"
                    size="small"
                  />
                )}
              </View>
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

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (saving || looking || uploadingPhoto) && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving || looking || uploadingPhoto}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>CONFIRM STOCK</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18, color: '#64748b' },
  scanBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scanBadgeText: { fontSize: 10, fontWeight: '800', color: '#059669', letterSpacing: 1 },
  body: { padding: 20 },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: { fontSize: 48 },
  changePhotoHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
    marginBottom: 16,
    fontWeight: '600',
  },
  barcodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  barcodeChipDot: { color: '#10b981', fontSize: 8 },
  barcodeChipText: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  warnBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warnText: { fontSize: 13, fontWeight: '600', color: '#92400e' },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 8 },
  inputWrap: { position: 'relative' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingRight: 44,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  inputSpinner: { position: 'absolute', right: 14, top: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  saveBtn: {
    flex: 1, backgroundColor: '#0f172a', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
});
