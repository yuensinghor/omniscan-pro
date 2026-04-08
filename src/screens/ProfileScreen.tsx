import React, { useState, useEffect } from 'react';
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
  BackHandler,
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
  onOpenFamilySharing: () => void;
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

// ─── Feedback Panel ──────────────────────────────────────────────────────────

const FeedbackPanel: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [text, setText] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await supabase.from('feedback').insert({ message: text.trim() });
    } catch (_) {
      // feedback table may not exist yet — still show success to user
    }
    setSent(true);
  };

  if (sent) {
    return (
      <View style={fbStyles.container}>
        <Text style={fbStyles.sentIcon}>🎉</Text>
        <Text style={fbStyles.sentTitle}>Thank you!</Text>
        <Text style={fbStyles.sentSub}>Your feedback helps us build a better app.</Text>
        <TouchableOpacity style={fbStyles.doneBtn} onPress={onDone}>
          <Text style={fbStyles.doneBtnText}>Back to Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={fbStyles.container}>
      <Text style={fbStyles.title}>We'd love to hear from you 👋</Text>
      <Text style={fbStyles.sub}>
        What features would you like to see? Any bugs or issues? Tell us anything!
      </Text>
      <TextInput
        style={fbStyles.input}
        placeholder="Type your feedback here…"
        placeholderTextColor="#94a3b8"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        autoFocus
      />
      <TouchableOpacity
        style={[fbStyles.sendBtn, !text.trim() && fbStyles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Text style={fbStyles.sendBtnText}>Send Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};

const fbStyles = StyleSheet.create({
  container:    { paddingHorizontal: 20, paddingTop: 28, alignItems: 'center' },
  title:        { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 10 },
  sub:          { fontSize: 13, color: '#64748b', fontWeight: '500', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  input:        { width: '100%', minHeight: 140, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontWeight: '500', color: '#0f172a', marginBottom: 16 },
  sendBtn:      { width: '100%', backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#bfdbfe' },
  sendBtnText:  { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  sentIcon:     { fontSize: 48, marginBottom: 16, marginTop: 20 },
  sentTitle:    { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  sentSub:      { fontSize: 13, color: '#64748b', fontWeight: '500', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  doneBtn:      { backgroundColor: '#f1f5f9', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  doneBtnText:  { fontSize: 13, fontWeight: '700', color: '#64748b' },
});

// ─── Profile Screen ───────────────────────────────────────────────────────────

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  visible,
  onClose,
  onAddDevice,
  onOpenHistory,
  onOpenFamilySharing,
}) => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Reset upgrade/feedback view whenever modal closes
  useEffect(() => {
    if (!visible) {
      setShowUpgrade(false);
      setFeedbackText('');
      setFeedbackSent(false);
    }
  }, [visible]);

  // Hardware back: fully owned by ProfileScreen while modal is visible
  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showUpgrade) {
        // Upgrade sub-view open → back to Account page
        setShowUpgrade(false);
        return true;
      }
      // Account page → close profile, return to main item list
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, showUpgrade, onClose]);
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
                    style={[styles.actionCard, styles.actionCardFeedback]}
                    onPress={() => setShowUpgrade(true)}
                  >
                    <Text style={styles.actionCardIcon}>💬</Text>
                    <Text style={styles.actionCardLabel}>Feedback</Text>
                  </TouchableOpacity>
                </View>

                {/* Family Sharing */}
                <TouchableOpacity
                  style={styles.familyCard}
                  onPress={() => { onClose(); onOpenFamilySharing(); }}
                >
                  <View style={styles.familyCardLeft}>
                    <Text style={styles.familyCardIcon}>👨‍👩‍👧</Text>
                    <View>
                      <Text style={styles.familyCardTitle}>Family Sharing</Text>
                      <Text style={styles.familyCardSub}>Invite members · Manage access</Text>
                    </View>
                  </View>
                  <Text style={styles.familyCardArrow}>›</Text>
                </TouchableOpacity>

                <View style={{ height: 1 }}>
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
                <Text style={styles.headerTitle}>Share Your Feedback</Text>
                <View style={{ width: 40 }} />
              </View>

              <FeedbackPanel onDone={() => setShowUpgrade(false)} />
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
  actionCardUpgrade: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }, // kept for compat
  actionCardFeedback: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
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
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  familyCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  familyCardIcon: { fontSize: 32 },
  familyCardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  familyCardSub:   { fontSize: 12, color: '#64748b', fontWeight: '500' },
  familyCardArrow: { fontSize: 24, color: '#94a3b8', fontWeight: '300' },
  upgradeNote: {
    fontSize: 12, color: '#94a3b8', fontWeight: '500',
    textAlign: 'center', lineHeight: 18,
    paddingVertical: 20, paddingHorizontal: 16,
  },
});
