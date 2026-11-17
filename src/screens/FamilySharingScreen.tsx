// src/screens/FamilySharingScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, RefreshControl,
  Alert, ActivityIndicator, ScrollView, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

interface Member {
  user_id:   string;
  email:     string;
  role:      string;
  joined_at: string;
}

interface FamilySharingScreenProps {
  userId:   string;
  visible:  boolean;
  onClose:  () => void;
  onWorkspaceChanged: (ownerIdToLoad: string | null) => void;
}

export const FamilySharingScreen: React.FC<FamilySharingScreenProps> = ({
  userId, visible, onClose, onWorkspaceChanged,
}) => {
  const [loading, setLoading]           = useState(true);
  const [members, setMembers]           = useState<Member[]>([]);
  const [isOwner, setIsOwner]           = useState(false);
  const [isMember, setIsMember]         = useState(false);
  const [memberRole, setMemberRole]     = useState<'editor' | 'viewer'>('viewer');
  const [ownerEmail, setOwnerEmail]     = useState<string | null>(null);
  const [workspaceId, setWorkspaceId]   = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null); // user_id being updated

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_my_workspace', { p_user_id: userId });
      if (error) throw error;
      if (data?.member) {
        setWorkspaceId(data.workspace_id);
        if (data.owner_id === userId) {
          setIsOwner(true);
          setIsMember(false);
          setMembers(
            (data.members || [])
              .filter((m: Member) => m.user_id !== userId)
              .map((m: Member) => ({ ...m, role: m.role || 'viewer' }))
          );
          setOwnerEmail(null);
        } else {
          setIsOwner(false);
          setIsMember(true);
          setMemberRole(data.role === 'editor' ? 'editor' : 'viewer');
          setOwnerEmail(data.owner_email || null);
          setMembers([]);
        }
      } else {
        setIsOwner(false); setIsMember(false);
        setMemberRole('viewer');
        setWorkspaceId(null); setMembers([]); setOwnerEmail(null);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not load sharing info. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { if (visible) load(); }, [visible, load]);

  // Keep the owner’s member list current and show a member’s new role promptly.
  useEffect(() => {
    if (!visible) return;
    const channel = supabase
      .channel(`family_members_${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'workspace_members',
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [visible, userId, load]);

  // ── Generate invite link and open share sheet ──────────────────────────────
  const handleShareInvite = async () => {
    setGeneratingLink(true);
    try {
      // Ensure workspace exists
      const { data: wsId, error: wsErr } = await supabase.rpc('ensure_user_workspace', {
        p_user_id: userId, p_name: 'My Workspace',
      });
      if (wsErr) throw wsErr;

      // Create open invite (no specific email)
      const { data: invite, error: invErr } = await supabase
        .from('workspace_invites')
        .insert({
          workspace_id: wsId,
          invited_by:   userId,
          role:         'viewer',        // default: viewer, owner can upgrade later
          accepted:     false,
          expires_at:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('token')
        .single();
      if (invErr) throw invErr;

      const inviteUrl = `https://barcodesscanner.com/invite/${invite.token}`;
      const msg =
        `📦 I'd like to share my inventory with you on Barcodes Scanner Pro!\n\n` +
        `Tap the link to join:\n${inviteUrl}\n\n` +
        `• Link opens the app directly if installed\n` +
        `• Or takes you to the Play Store to download first\n` +
        `• Link expires in 7 days`;

      await Share.share({ message: msg });
      await load();
    } catch (err: any) {
      Alert.alert('Error', 'Could not generate invite link. Please try again.');
    } finally {
      setGeneratingLink(false);
    }
  };

  // ── Toggle member role: viewer ↔ editor ────────────────────────────────────
  const handleToggleRole = async (member: Member) => {
    if (!workspaceId) return;
    const newRole = member.role === 'editor' ? 'viewer' : 'editor';
    setUpdatingRole(member.user_id);
    try {
      const { data, error } = await supabase.rpc('update_member_role', {
        p_workspace_id: workspaceId,
        p_user_id:      member.user_id,
        p_role:         newRole,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Update local state immediately
      setMembers(prev =>
        prev.map(m => m.user_id === member.user_id ? { ...m, role: newRole } : m)
      );
    } catch (err: any) {
      Alert.alert('Error', 'Could not update role. Please try again.');
    } finally {
      setUpdatingRole(null);
    }
  };

  // ── Remove member ──────────────────────────────────────────────────────────
  const handleRemove = (member: Member) => {
    Alert.alert(t.removeMember, t.removeConfirm(member.email), [
      { text: t.cancel, style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          const { error } = await supabase.from('workspace_members')
            .delete()
            .eq('user_id', member.user_id)
            .eq('workspace_id', workspaceId);
          if (error) throw error;
          await load();
        } catch {
          Alert.alert('Error', 'Could not remove member. Please try again.');
        }
      }},
    ]);
  };

  // ── Leave workspace (member view) ──────────────────────────────────────────
  const handleLeave = () => {
    Alert.alert(t.leaveWorkspace, t.leaveWorkspaceMsg, [
      { text: t.cancel, style: 'cancel' },
      { text: t.leave, style: 'destructive', onPress: async () => {
        try {
          const { error } = await supabase.from('workspace_members')
            .delete().eq('user_id', userId);
          if (error) throw error;
          onWorkspaceChanged(null);
          onClose();
        } catch {
          Alert.alert('Error', 'Could not leave workspace. Please try again.');
        }
      }},
    ]);
  };

  // ── Role badge ─────────────────────────────────────────────────────────────
  const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
    <View style={[styles.roleBadge, role === 'editor' ? styles.roleBadgeEditor : styles.roleBadgeViewer]}>
      <Text style={[styles.roleBadgeText, role === 'editor' ? styles.roleBadgeTextEditor : styles.roleBadgeTextViewer]}>
        {role === 'editor' ? '✏️  Editor' : '👁  Viewer'}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Sharing</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>

        ) : isMember ? (
          /* ── Member view: joined someone else's workspace ── */
          <ScrollView
            contentContainerStyle={styles.section}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#10b981" />}
          >
            <View style={styles.membershipCard}>
              <Text style={styles.membershipIcon}>👥</Text>
              <Text style={styles.membershipTitle}>YOU'RE SHARING</Text>
              <Text style={styles.membershipName}>{ownerEmail ?? 'a shared workspace'}</Text>
              <Text style={styles.membershipSub}>
                You have access to {ownerEmail ? `${ownerEmail}'s` : 'this'} inventory.
              </Text>
              <View style={styles.accessLevel}>
                <Text style={styles.accessLevelTitle}>YOUR ACCESS</Text>
                <Text style={styles.accessLevelValue}>
                  {memberRole === 'viewer' ? '👁 Viewer · Read only' : '✏️ Editor · Can scan and edit'}
                </Text>
              </View>
              <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
                <Text style={styles.leaveBtnText}>Leave Workspace</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        ) : (
          /* ── Owner view ── */
          <ScrollView
            contentContainerStyle={styles.section}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#10b981" />}
          >

            {/* Invite card */}
            <View style={styles.inviteCard}>
              <Text style={styles.inviteCardTitle}>Invite via Link</Text>
              <Text style={styles.inviteCardSub}>
                Share a link through WhatsApp, Telegram, SMS or any messenger.
                The recipient opens the app directly — or gets sent to the Play Store if they don't have it yet.
              </Text>
              <TouchableOpacity
                style={[styles.shareBtn, generatingLink && styles.btnDisabled]}
                onPress={handleShareInvite}
                disabled={generatingLink}
              >
                {generatingLink
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.shareBtnText}>🔗  Generate &amp; Share Invite Link</Text>}
              </TouchableOpacity>
              <Text style={styles.inviteNote}>Link expires in 7 days · New members join as Viewer</Text>
            </View>

            {/* Members list */}
            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
              Members {members.length > 0 ? `(${members.length})` : ''}
            </Text>

            {members.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👤</Text>
                <Text style={styles.emptyTitle}>No members yet</Text>
                <Text style={styles.emptySub}>Share an invite link above to add someone to your inventory.</Text>
              </View>
            ) : (
              members.map(m => (
                <View key={m.user_id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{m.email.charAt(0).toUpperCase()}</Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberEmail} numberOfLines={1}>{m.email}</Text>
                    <Text style={styles.memberJoined}>
                      Joined {new Date(m.joined_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Role toggle */}
                  {updatingRole === m.user_id ? (
                    <ActivityIndicator size="small" color="#10b981" style={{ marginRight: 8 }} />
                  ) : (
                    <TouchableOpacity onPress={() => handleToggleRole(m)}>
                      <RoleBadge role={m.role} />
                    </TouchableOpacity>
                  )}

                  {/* Remove */}
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(m)}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {members.length > 0 && (
              <Text style={styles.roleHint}>
                Tap the role badge to switch between Viewer (read-only) and Editor (can scan &amp; edit).
              </Text>
            )}

          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container:             { flex: 1, backgroundColor: '#fff' },
  header:                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle:           { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  closeBtn:              { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:          { fontSize: 26, color: '#64748b', fontWeight: '300', lineHeight: 30 },
  center:                { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section:               { padding: 24 },
  sectionTitle:          { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 12 },

  // Invite card
  inviteCard:            { backgroundColor: '#f0fdf4', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#bbf7d0' },
  inviteCardTitle:       { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  inviteCardSub:         { fontSize: 13, color: '#64748b', lineHeight: 20, marginBottom: 20 },
  shareBtn:              { backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnDisabled:           { opacity: 0.5 },
  shareBtnText:          { color: '#fff', fontWeight: '800', fontSize: 14 },
  inviteNote:            { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 },

  // Members
  memberRow:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginBottom: 10, gap: 10 },
  memberAvatar:          { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  memberAvatarText:      { color: '#fff', fontWeight: '800', fontSize: 16 },
  memberInfo:            { flex: 1 },
  memberEmail:           { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  memberJoined:          { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  removeBtn:             { width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' },
  removeBtnText:         { fontSize: 12, color: '#ef4444', fontWeight: '700' },
  roleHint:              { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 16, lineHeight: 16 },

  // Role badge
  roleBadge:             { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  roleBadgeViewer:       { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  roleBadgeEditor:       { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  roleBadgeText:         { fontSize: 11, fontWeight: '700' },
  roleBadgeTextViewer:   { color: '#64748b' },
  roleBadgeTextEditor:   { color: '#059669' },

  // Member view
  membershipCard:        { backgroundColor: '#f0fdf4', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' },
  membershipIcon:        { fontSize: 48, marginBottom: 12 },
  membershipTitle:       { fontSize: 11, fontWeight: '700', color: '#059669', letterSpacing: 1.5, marginBottom: 6 },
  membershipName:        { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 10, textAlign: 'center' },
  membershipSub:         { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  accessLevel:           { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: -12, marginBottom: 24, alignItems: 'center' },
  accessLevelTitle:      { fontSize: 10, color: '#94a3b8', fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  accessLevelValue:      { fontSize: 13, color: '#0f172a', fontWeight: '800', textAlign: 'center' },
  leaveBtn:              { borderWidth: 1.5, borderColor: '#fecaca', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  leaveBtnText:          { color: '#ef4444', fontWeight: '700', fontSize: 13 },

  // Empty
  emptyState:            { alignItems: 'center', paddingVertical: 40 },
  emptyIcon:             { fontSize: 48, marginBottom: 12 },
  emptyTitle:            { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  emptySub:              { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 18 },
});
