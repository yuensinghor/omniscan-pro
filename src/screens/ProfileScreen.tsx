import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { AppUser, UserTier } from '../types';

interface ProfileScreenProps {
  user: AppUser;
  visible: boolean;
  onClose: () => void;
  onAddDevice: () => void;
  onOpenHistory: () => void;
}

const TIER_PLANS = [
  {
    id: 'FREE' as UserTier,
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['Basic Inventory', 'Manual Entry', 'Up to 100 items'],
    color: '#f1f5f9',
    accent: '#64748b',
  },
  {
    id: 'PRO' as UserTier,
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: ['Unlimited Items', 'Cloud Sync', 'Advanced Analytics', 'CSV Export'],
    color: '#ecfdf5',
    accent: '#059669',
  },
  {
    id: 'SCANNER_BUNDLE' as UserTier,
    name: 'Scanner Bundle',
    price: '$29.99',
    period: '/month',
    features: ['All Pro Features', 'Hardware BLE Scanner', 'Priority Support'],
    color: '#f5f3ff',
    accent: '#7c3aed',
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  visible,
  onClose,
  onAddDevice,
  onOpenHistory,
}) => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [displayName, setDisplayName] = useState(
    user.user_metadata?.full_name || user.email.split('@')[0],
  );
  const [avatarSeed, setAvatarSeed] = useState(
    user.user_metadata?.avatar_seed || user.email,
  );

  const tier: UserTier      = user.user_metadata?.tier || 'FREE';
  const validUntil          = user.user_metadata?.valid_until;
  const tierPlan            = TIER_PLANS.find(p => p.id === tier) || TIER_PLANS[0];

  const handleBlur = async () => {
    await supabase.auth.updateUser({
      data: { full_name: displayName, avatar_seed: avatarSeed },
    });
  };

  const handleRandomAvatar = async () => {
    const seed = Math.random().toString(36).slice(2, 9);
    setAvatarSeed(seed);
    await supabase.auth.updateUser({ data: { avatar_seed: seed } });
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          onClose();
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {!showUpgrade ? (
            <>
              {/* Header row */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account</Text>
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>

              {/* Avatar */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}` }}
                    style={styles.avatar}
                  />
                  <TouchableOpacity style={styles.avatarEditBtn} onPress={handleRandomAvatar}>
                    <Text style={styles.avatarEditIcon}>🎲</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.email}>{user.email}</Text>
                <View style={[styles.tierBadge, { backgroundColor: tierPlan.color }]}>
                  <Text style={[styles.tierBadgeText, { color: tierPlan.accent }]}>
                    {tier.replace('_', ' ')}
                  </Text>
                  {validUntil && (
                    <Text style={[styles.tierExpiry, { color: tierPlan.accent }]}>
                      Valid until {new Date(validUntil).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.body}>
                {/* Display name */}
                <View style={styles.field}>
                  <Text style={styles.label}>DISPLAY NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    onBlur={handleBlur}
                    placeholder="Your Name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Quick actions */}
                <View style={styles.actionGrid}>
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => { onClose(); onAddDevice(); }}
                  >
                    <Text style={styles.actionCardIcon}>📡</Text>
                    <Text style={styles.actionCardLabel}>Add Scanner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => { onClose(); onOpenHistory(); }}
                  >
                    <Text style={styles.actionCardIcon}>📋</Text>
                    <Text style={styles.actionCardLabel}>Activity Log</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionCard, styles.actionCardUpgrade]}
                    onPress={() => setShowUpgrade(true)}
                  >
                    <Text style={styles.actionCardIcon}>💳</Text>
                    <Text style={styles.actionCardLabel}>Upgrade</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Upgrade Header */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowUpgrade(false)}>
                  <Text style={styles.closeBtnText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose Your Plan</Text>
                <View style={{ width: 40 }} />
              </View>

              <View style={styles.body}>
                {TIER_PLANS.map(plan => (
                  <View
                    key={plan.id}
                    style={[
                      styles.planCard,
                      { backgroundColor: plan.color },
                      tier === plan.id && styles.planCardActive,
                    ]}
                  >
                    <View style={styles.planHeader}>
                      <View>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planFeatures}>
                          {plan.features.join('  ·  ')}
                        </Text>
                      </View>
                      <View style={styles.planPriceBox}>
                        <Text style={[styles.planPrice, { color: plan.accent }]}>
                          {plan.price}
                        </Text>
                        <Text style={styles.planPeriod}>{plan.period}</Text>
                      </View>
                    </View>
                    {tier === plan.id && (
                      <Text style={[styles.currentPlanBadge, { color: plan.accent }]}>
                        ✓ CURRENT PLAN
                      </Text>
                    )}
                  </View>
                ))}

                <Text style={styles.upgradeNote}>
                  To upgrade, contact support or visit our website. In-app purchases coming soon.
                </Text>
              </View>
            </>
          )}
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 22, color: '#64748b', fontWeight: '300', lineHeight: 28 },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  signOutText: { fontSize: 13, fontWeight: '700', color: '#e11d48' },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#f1f5f9',
    borderWidth: 4, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarEditIcon: { fontSize: 14 },
  email: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 10 },
  tierBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tierBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  tierExpiry: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  body: { paddingHorizontal: 20 },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 14,
    fontSize: 15, fontWeight: '600', color: '#0f172a',
  },
  actionGrid: { flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 20 },
  actionCard: {
    flex: 1, backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 20, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  actionCardUpgrade: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  actionCardIcon: { fontSize: 28 },
  actionCardLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 1 },
  planCard: {
    borderRadius: 20, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'transparent',
  },
  planCardActive: { borderColor: '#10b981' },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  planFeatures: { fontSize: 12, fontWeight: '500', color: '#64748b', lineHeight: 18 },
  planPriceBox: { alignItems: 'flex-end' },
  planPrice: { fontSize: 20, fontWeight: '900' },
  planPeriod: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },
  currentPlanBadge: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 10 },
  upgradeNote: {
    fontSize: 12, color: '#94a3b8', fontWeight: '500',
    textAlign: 'center', lineHeight: 18,
    paddingVertical: 20, paddingHorizontal: 16,
  },
});
