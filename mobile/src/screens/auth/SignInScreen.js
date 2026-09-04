import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen({ navigation }) {
  const { user, isAdmin, signIn, signOut, apiUrl, updateApiUrl } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Server Settings Modal for mobile testing
  const [showServerModal, setShowServerModal] = useState(false);
  const [customIp, setCustomIp] = useState(apiUrl);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await signIn(email.trim(), password.trim());
      if (!res.success) {
        Alert.alert('Login Failed', res.message || 'Invalid email or password.');
      }
    } catch (e) {
      Alert.alert(
        'Connection Error',
        `Could not reach server at ${apiUrl}. If on a physical phone, make sure to set your computer's local Wi-Fi IP address in Server Settings.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    if (customIp.trim()) {
      updateApiUrl(customIp.trim());
      setShowServerModal(false);
      Alert.alert('Server Updated', `API base URL set to: ${customIp.trim()}`);
    }
  };

  // If user is already authenticated, show their profile & admin portal entry
  if (user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.profileContainer}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          {isAdmin ? (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.warning} />
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          ) : (
            <View style={styles.userBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.userBadgeText}>Event Explorer</Text>
            </View>
          )}

          <View style={styles.profileSection}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminPortalBtn}
                onPress={() => navigation.navigate('AdminTab')}
              >
                <View style={styles.adminBtnLeft}>
                  <View style={styles.adminIconWrap}>
                    <Ionicons name="speedometer" size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.adminBtnTitle}>Admin Command Center</Text>
                    <Text style={styles.adminBtnSubtitle}>Manage events, layouts & banners</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setShowServerModal(true)}
            >
              <View style={styles.settingsRowLeft}>
                <Ionicons name="server-outline" size={20} color={colors.info} />
                <View>
                  <Text style={styles.settingsRowTitle}>Server Configuration</Text>
                  <Text style={styles.settingsRowSubtitle} numberOfLines={1}>
                    {apiUrl}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Server Modal */}
        <Modal visible={showServerModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Server Connection Settings</Text>
              <Text style={styles.modalSubtitle}>
                On Android emulator use http://10.0.2.2:5000. On a physical phone, enter your computer's Wi-Fi IP (e.g. http://192.168.1.5:5000).
              </Text>
              <TextInput
                style={styles.modalInput}
                value={customIp}
                onChangeText={setCustomIp}
                placeholder="http://192.168.x.x:5000"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowServerModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveApiUrl}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Ionicons name="sparkles" size={28} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>WAHAP</Text>
          <Text style={styles.brandSubtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupPromptRow}>
            <Text style={styles.signupPromptText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Credentials */}
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Quick Admin Sign-In Credentials:</Text>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => {
                setEmail('admin@wahap.com');
                setPassword('admin123');
              }}
            >
              <Text style={styles.demoPillText}>Auto-fill: admin@wahap.com</Text>
            </TouchableOpacity>
          </View>

          {/* Server Config Link */}
          <TouchableOpacity
            style={styles.serverSettingsLink}
            onPress={() => setShowServerModal(true)}
          >
            <Ionicons name="settings-outline" size={14} color={colors.textMuted} />
            <Text style={styles.serverSettingsText}>Server Host: {apiUrl}</Text>
          </TouchableOpacity>
        </View>

        {/* Server Modal */}
        <Modal visible={showServerModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Server Connection Settings</Text>
              <Text style={styles.modalSubtitle}>
                On Android emulator use http://10.0.2.2:5000. On a physical phone, enter your computer's Wi-Fi IP (e.g. http://192.168.1.5:5000).
              </Text>
              <TextInput
                style={styles.modalInput}
                value={customIp}
                onChangeText={setCustomIp}
                placeholder="http://192.168.x.x:5000"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowServerModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveApiUrl}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupPromptText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  signupLink: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  demoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  demoPill: {
    backgroundColor: 'rgba(255, 8, 68, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  serverSettingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  serverSettingsText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  profileContainer: {
    padding: 24,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 20,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adminBadgeText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  userBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  profileSection: {
    width: '100%',
    marginTop: 28,
    gap: 12,
  },
  adminPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adminBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBtnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  adminBtnSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  settingsRowSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    fontSize: 13,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
