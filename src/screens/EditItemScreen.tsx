// src/screens/EditItemScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView, Modal, ActivityIndicator, Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { InventorySummary } from '../types';
import { CameraModal } from '../components/CameraModal';
import { t } from '../i18n';

interface EditItemScreenProps {
  item: InventorySummary;
  userId: string;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  isLookup?: boolean; // true = view-only, hide Save/Cancel/Delete/Edit fields
}

import { SUPABASE_URL } from '@env';

const BUCKET = 'product-images';

// Upload a local file:// URI to Supabase Storage, return public URL
async function uploadPhoto(localUri: string, barcode: string, userId: string): Promise<string> {
  const ext      = 'jpg';
  const path     = `${userId}/${barcode}_${Date.now()}.${ext}`;
  const mimeType = 'image/jpeg';

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert base64 to Uint8Array using Buffer (React Native safe, no atob)
  const bytes = new Uint8Array(Buffer.from(base64, 'base64'));

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const EditItemScreen: React.FC<EditItemScreenProps> = ({
  item, userId, visible, onClose, onSaved, isLookup = false,
}) => {
  const [name, setName]               = useState(item.name || '');
  const [category, setCategory]       = useState(item.category || '');
  const [imageUrl, setImageUrl]       = useState(item.image_url || '');
  const [saving, setSaving]           = useState(false);
  const [cameraOpen, setCameraOpen]   = useState(false);
  const [modalPaused, setModalPaused] = useState(false);
  // pendingUri holds a local file:// URI before upload
  const [pendingUri, setPendingUri]   = useState<string | null>(null);

  // ─── Camera ───────────────────────────────────────────────────────────────

  const handleCameraOpen = () => setCameraOpen(true);

  const handlePhotoTaken = (uri: string) => {
    setPendingUri(uri);   // store locally for preview
    setImageUrl(uri);     // show preview immediately
    setCameraOpen(false);
  };

  // ─── Gallery ──────────────────────────────────────────────────────────────

  const handleGallery = async () => {
    setModalPaused(true);
    await new Promise(r => setTimeout(r, 400));
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission denied', t.permissionDenied);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setPendingUri(uri);
        setImageUrl(uri);
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', t.galleryError);
    } finally {
      setModalPaused(false);
    }
  };

  const handleImagePress = () => {
    Alert.alert('Product Photo', 'Choose a source', [
      { text: 'Take Photo',          onPress: handleCameraOpen },
      { text: 'Choose from Gallery', onPress: handleGallery },
      { text: t.cancel, style: 'cancel' },
    ]);
  };

  // ─── Share ───────────────────────────────────────────────────────────────────

  const handleShare = async () => {
    try {
      const { data: existing } = await supabase
        .from('shared_items')
        .select('token')
        .eq('barcode', item.barcode)
        .eq('owner_id', userId)
        .single();

      let token = existing?.token;

      if (!token) {
        const { data: created, error } = await supabase
          .from('shared_items')
          .insert({ barcode: item.barcode, owner_id: userId })
          .select('token')
          .single();
        if (error) throw error;
        token = created.token;
      }

      const shareUrl = `${SUPABASE_URL}/functions/v1/share-item?token=${token}`;
      await Share.share({
        title: item.name || item.barcode,
        message: `Check out ${item.name || 'this product'} — ${shareUrl}\n\nBuild your own Mini Market with OmniScan Pro 🛒`,
      });
    } catch (err: any) {
      Alert.alert('Share Unavailable', t.shareUnavailable);
    }
  };

  // ─── Save (upload photo first if pending, then upsert products) ───────────


  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a product name.'); return; }
    setSaving(true);
    try {
      let finalImageUrl = imageUrl;

      // If user picked a new photo, upload it first
      if (pendingUri) {
        try {
          finalImageUrl = await uploadPhoto(pendingUri, item.barcode, userId);
        } catch (uploadErr: any) {
          Alert.alert(
            'Upload failed',
            uploadErr.message + '\n\nSaving without image update.',
          );
          finalImageUrl = item.image_url || null;
        }
      }

      const { error } = await supabase.from('products').upsert({
        barcode:   item.barcode,
        owner_id:  userId,
        name:      name.trim(),
        category:  category.trim() || 'General',
        image_url: finalImageUrl || null,
      }, { onConflict: 'barcode,owner_id' });

      if (error) throw error;
      setPendingUri(null);
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Save Failed', t.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert(
      t.removeItem,
      'This will zero out the stock and remove the item from your dashboard. History will be preserved.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.remove, style: 'destructive',
          onPress: async () => {
            try {
              if (!item.barcode) throw new Error('Item barcode is missing.');

              // Step 1: Delete all inventory logs for this barcode (zeroes out quantity)
              const { error: logDeleteError } = await supabase
                .from('inventory_logs')
                .delete()
                .eq('barcode', item.barcode)
                .eq('owner_id', userId);
              if (logDeleteError) throw logDeleteError;

              // Step 2: Delete the product record itself
              const { error: prodError } = await supabase
                .from('products')
                .delete()
                .eq('barcode', item.barcode)
                .eq('owner_id', userId);
              if (prodError) throw prodError;

              onSaved();
              onClose();
            } catch (err: any) {
              Alert.alert('Delete Failed', t.deleteFailed);
            }
          },
        },
      ],
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <CameraModal
        visible={cameraOpen}
        onPhotoTaken={handlePhotoTaken}
        onCancel={() => setCameraOpen(false)}
      />

      <Modal visible={visible && !modalPaused} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{isLookup ? t.itemDetails : t.editItem}</Text>
              {!isLookup ? (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              ) : <View style={{ width: 40 }} />}
            </View>

            <View style={styles.body}>
              <TouchableOpacity style={styles.imageTap} onPress={isLookup ? undefined : handleImagePress} activeOpacity={isLookup ? 1 : 0.8}>
                {imageUrl ? (
                  <>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    {!isLookup && (
                      <View style={styles.imageOverlay}>
                        <Text style={styles.imageOverlayText}>
                          {pendingUri ? t.unsavedPhoto : t.changePhoto}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderIcon}>📷</Text>
                    {!isLookup && <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>}
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.barcodeRow}>
                <Text style={styles.barcodeLabel}>BARCODE</Text>
                <Text style={styles.barcodeValue}>{item.barcode}</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PRODUCT NAME</Text>
                <TextInput style={styles.input} value={name} onChangeText={isLookup ? undefined : setName}
                  placeholder="e.g. Lychee in Syrup" placeholderTextColor="#94a3b8"
                  editable={!isLookup} />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>CATEGORY</Text>
                <TextInput style={styles.input} value={category} onChangeText={isLookup ? undefined : setCategory}
                  placeholder="e.g. Canned Food" placeholderTextColor="#94a3b8"
                  editable={!isLookup} />
              </View>

              <View style={styles.qtyRow}>
                <Text style={styles.label}>CURRENT STOCK</Text>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <Text style={styles.qtyUnit}>units</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareBtnText}>↗  Share this product</Text>
              </TouchableOpacity>

              {!isLookup && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={handleSave} disabled={saving}
                  >
                    {saving
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: '#64748b' },
  deleteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 18 },
  body: { padding: 20 },
  imageTap: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 20, backgroundColor: '#f8fafc' },
  image: { width: '100%', height: 200 },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 10, alignItems: 'center' },
  imageOverlayText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  barcodeRow: { backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barcodeLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5 },
  barcodeValue: { fontSize: 13, fontWeight: '700', color: '#0f172a', fontVariant: ['tabular-nums'] },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, fontWeight: '600', color: '#0f172a' },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 28 },
  qtyBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  qtyValue: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  qtyUnit: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderIcon: { fontSize: 40, opacity: 0.3 },
  imagePlaceholderText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  saveBtn: { flex: 1, backgroundColor: '#0f172a', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  saveBtnDisabled: { opacity: 0.5 },
  shareBtn: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  shareBtnText: { color: '#0284c7', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
});
