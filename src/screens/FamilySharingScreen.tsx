// src/screens/FamilySharingScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

interface Member {
  user_id:   string;
  email:     string;
  role:      string;
  joined_at: string;
}

interface FamilySharingScreenProps {
  userId:    string;
  userEmail: string;
  visible:   boolean;
  onClose:   () => void;
  // Called after any membership change so App.tsx can reload workspace list
  onWorkspaceChanged: () => void;
}

export const FamilySharingScreen: React.FC<FamilySharingScreenProps> = ({
  userId, userEmail, visible, onClose, onWorkspaceChanged,
}) => {
  const [loading, setLoading]         = useState(true);
  const [members, setMembers]         = useState<Member[]>([]);
  const [isOwner, setIsOwner]         = useState(false);
  const [isMember, setIsMember]       = useState(false);
  const [ownerEmail, setOwnerEmail]   = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [email, setEmail]             = useState('');
  const [inviting, setInviting]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_my_workspace', { p_user_id: userId });
      if (error) throw error;

      if (data?.member) {
        setWorkspaceId(data.workspace_id);
        if (data.owner_id === userId) {
          // User is the owner — show their members list
          setIsOwner(true);
          setIsMember(false);
          setMembers(
            (data.members || []).filter((m: Member) => m.user_id !== userId)
          );
          setOwnerEmail(null);
        } else {
          // User is a member of someone else's workspace
          setIsOwner(false);
          setIsMember(true);
          setOwnerEmail(data.owner_email || null);
          setMembers([]);
        }
      } else {
        // User has no workspace at all yet
        setIsOwner(false);
        setIsMember(false);
        setWorkspaceId(null);
        setMembers([]);
        setOwnerEmail(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { if (visible) load(); }, [visible, load]);

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (trimmed === userEmail.toLowerCase()) {
      Alert.alert('Invalid', 'You cannot add yourself.');
      return;
    }
    setInviting(true);
    try {
      const { data: wsId, error: wsErr } = await supabase.rpc('ensure_user_workspace', {
        p_user_id: userId, p_name: 'My Workspace',
      });
      if (wsErr) throw wsErr;

      const { error: invErr } = await supabase.rpc('create_workspace_invite', {
        p_workspace_id: wsId, p_invited_by: userId, p_role: 'editor', p_email: trimmed,
      });
      if (invErr) throw invErr;

      // Send notification email (non-blocking)
      supabase.functions.invoke('send-invite', {
        body: { to_email: trimmed, workspace_name: 'My Workspace' },
      }).catch(() => {});

      Alert.alert('✅ Added!', `${trimmed} can now log in and access your inventory.`);
      setEmail('');
      await load();
      onWorkspaceChanged();
    } catch (err: any) {
      Alert.alert('Invite failed', err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = (member: Member) => {
    Alert.alert('Remove Member', `Remove ${member.email} from your workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            const { error } = await supabase.rpc('remove_workspace_member', {
              p_workspace_id: workspaceId,
              p_user_id:      member.user_id,
              p_owner_id:     userId,
            });
            if (error) throw error;
            await load();
            onWorkspaceChanged();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Workspace',
      'You will return to your own inventory. You can be re-added later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave', style: 'destructive', onPress: async () => {
            try {
              const { error } = await supabase
                .from('workspace_members')
                .delete()
                .eq('user_id', userId);
              if (error) throw error;
              onWorkspaceChanged();
              onClose();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family Sharing</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : isMember ? (
          // ── Member view: user belongs to someone else's workspace ──────────
          <ScrollView contentContainerStyle={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>👥</Text>
              <Text style={styles.infoTitle}>SHARED ACCESS</Text>
              <Text style={styles.infoName}>{ownerEmail ?? 'a shared workspace'}</Text>
              <Text style={styles.infoSub}>
                You have access to {ownerEmail ? `${ownerEmail}'s` : 'this'} inventory.
                You can switch between your own inventory and theirs from the dashboard.
              </Text>
              <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
                <Text style={styles.leaveBtnText}>Leave Workspace</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // ── Owner view: manage members ────────────────────────────────────
          <ScrollView contentContainerStyle={styles.section}>

            {/* How it works info box */}
            <View style={styles.howItWorks}>
              <Text style={styles.howTitle}>How it works</Text>
              <Text style={styles.howText}>
                Add someone's email below. Once they log in with that email, they'll see a switch in their dashboard to view your inventory. They keep their own inventory too.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Add a Member</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.inviteBtn, inviting && styles.inviteBtnDisabled]}
              onPress={handleInvite}
              disabled={inviting}
            >
              {inviting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.inviteBtnText}>＋  Add Member</Text>
              }
            </TouchableOpacity>

            {/* Members list */}
            {members.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 36 }]}>Current Members</Text>
                {members.map(m => (
                  <View key={m.user_id} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {m.email.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberEmail} numberOfLines={1}>{m.email}</Text>
                      <View style={styles.memberMeta}>
                        <View style={styles.roleChip}>
                          <Text style={styles.roleChipText}>{(m.role || 'editor').toUpperCase()}</Text>
                        </View>
                        <Text style={styles.memberJoined}>
                          Added {new Date(m.joined_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(m)}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {members.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👤</Text>
                <Text style={styles.emptyTitle}>No members yet</Text>
                <Text style={styles.emptySub}>
                  Add someone's email above to share your inventory with them.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle:      { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  closeBtn:         { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:     { fontSize: 26, color: '#64748b', fontWeight: '300', lineHeight: 30 },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section:          { padding: 24 },
  sectionTitle:     { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  howItWorks:       { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: '#bbf7d0' },
  howTitle:         { fontSize: 12, fontWeight: '800', color: '#059669', marginBottom: 6, letterSpacing: 0.5 },
  howText:          { fontSize: 13, color: '#374151', lineHeight: 20 },
  input:            { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 14 },
  inviteBtn:        { backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  inviteBtnDisabled:{ opacity: 0.5 },
  inviteBtnText:    { color: '#fff', fontWeight: '800', fontSize: 14 },
  memberRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  memberAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  memberInfo:       { flex: 1 },
  memberEmail:      { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  memberMeta:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleChip:         { backgroundColor: '#e0f2fe', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  roleChipText:     { fontSize: 9, fontWeight: '800', color: '#0284c7', letterSpacing: 0.5 },
  memberJoined:     { fontSize: 11, color: '#94a3b8' },
  removeBtn:        { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' },
  removeBtnText:    { fontSize: 12, color: '#ef4444', fontWeight: '700' },
  // Member view
  infoCard:         { backgroundColor: '#f0fdf4', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  infoIcon:         { fontSize: 48, marginBottom: 12 },
  infoTitle:        { fontSize: 11, fontWeight: '700', color: '#059669', letterSpacing: 1.5, marginBottom: 6 },
  infoName:         { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 10, textAlign: 'center' },
  infoSub:          { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  leaveBtn:         { borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  leaveBtnText:     { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  // Empty state
  emptyState:       { alignItems: 'center', paddingVertical: 40 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyTitle:       { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  emptySub:         { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 18 },
});