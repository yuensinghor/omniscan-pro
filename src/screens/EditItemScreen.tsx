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

interface EditItemScreenProps {
  item: InventorySummary;
  userId: string;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const BUCKET = 'product-images';
const SUPABASE_URL = 'https://lfvpknapbzplcxrqqhbp.supabase.co';

// Upload a local file:// URI to Supabase Storage, return public URL
async function uploadPhoto(localUri: string, barcode: string, userId: string): Promise<string> {
  const ext      = 'jpg';
  const path     = `${userId}/${barcode}_${Date.now()}.${ext}`;
  const mimeType = 'image/jpeg';

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert base64 to Uint8Array
  const binaryStr = atob(base64);
  const bytes     = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const EditItemScreen: React.FC<EditItemScreenProps> = ({
  item, userId, visible, onClose, onSaved,
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
        Alert.alert('Permission denied', 'Allow Photos in Settings → Apps → OmniScan Pro → Permissions.');
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
      Alert.alert('Error', err.message ?? 'Could not open gallery');
    } finally {
      setModalPaused(false);
    }
  };

  const handleImagePress = () => {
    Alert.alert('Product Photo', 'Choose a source', [
      { text: 'Take Photo',          onPress: handleCameraOpen },
      { text: 'Choose from Gallery', onPress: handleGallery },
      { text: 'Cancel', style: 'cancel' },
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

      const shareUrl = `https://lfvpknapbzplcxrqqhbp.supabase.co/functions/v1/share-item?token=${token}`;
      await Share.share({
        title: item.name || item.barcode,
        message: `Check out ${item.name || 'this product'} — ${shareUrl}\n\nBuild your own Mini Market with OmniScan Pro 🛒`,
      });
    } catch (err: any) {
      Alert.alert('Share failed', err.message);
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
      }, { onConflict: 'barcode' });

      if (error) throw error;
      setPendingUri(null);
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Save failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert(
      'Remove Item',
      'This will zero out the stock and remove the item from your dashboard. History will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              const { error: logError } = await supabase.from('inventory_logs').insert({
                barcode: item.barcode, action_type: 'DELETE',
                device_id: 'MOBILE_DELETE', owner_id: userId, quantity: -item.quantity,
              });
              if (logError) throw logError;
              const { error: prodError } = await supabase.from('products').delete().eq('barcode', item.barcode);
              if (prodError) throw prodError;
              onSaved(); onClose();
            } catch (err: any) { Alert.alert('Error', err.message); }
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
              <Text style={styles.headerTitle}>Edit Item</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <TouchableOpacity style={styles.imageTap} onPress={handleImagePress}>
                <Image
                  source={{ uri: imageUrl || `https://picsum.photos/seed/${item.barcode}/400/300` }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.imageOverlay}>
                  {pendingUri
                    ? <Text style={styles.imageOverlayText}>⚠️  Unsaved — tap SAVE CHANGES</Text>
                    : <Text style={styles.imageOverlayText}>📷  Change Photo</Text>
                  }
                </View>
              </TouchableOpacity>

              <View style={styles.barcodeRow}>
                <Text style={styles.barcodeLabel}>BARCODE</Text>
                <Text style={styles.barcodeValue}>{item.barcode}</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PRODUCT NAME</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName}
                  placeholder="e.g. Lychee in Syrup" placeholderTextColor="#94a3b8" />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>CATEGORY</Text>
                <TextInput style={styles.input} value={category} onChangeText={setCategory}
                  placeholder="e.g. Canned Food" placeholderTextColor="#94a3b8" />
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
