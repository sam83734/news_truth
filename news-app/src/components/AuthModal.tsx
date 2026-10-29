import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserRole } from '../types';
import { SusalabsLogoMark } from './SusalabsLogo';
import { newsApi } from '../api/newsApi';

interface AuthModalProps {
  visible: boolean;
  onDismiss: () => void;
  onLogin: (role?: UserRole, email?: string, password?: string) => Promise<void>;
  onRegister: (name: string, email: string, role: UserRole, bio?: string, password?: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onDismiss,
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Server Diagnostics State
  const [serverHost, setServerHost] = useState(newsApi.getHost());
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [showServerConfig, setShowServerConfig] = useState(false);

  const checkConnection = async () => {
    setIsCheckingServer(true);
    try {
      const res = await newsApi.testHealth();
      setServerStatus(res);
    } catch (e: any) {
      setServerStatus({ ok: false, message: e.message || 'Connection failed' });
    } finally {
      setIsCheckingServer(false);
    }
  };

  useEffect(() => {
    if (visible) {
      checkConnection();
    }
  }, [visible]);

  const handleApplyCustomHost = () => {
    if (serverHost.trim()) {
      newsApi.setHost(serverHost.trim());
      checkConnection();
    }
  };

  const handleFormLogin = async () => {
    if (!email.trim()) {
      setErrorText('Please enter your email address');
      return;
    }
    setErrorText(null);
    setIsSubmitting(true);
    try {
      console.log(`[AUTH] Attempting login with email: ${email.trim()}`);
      await onLogin(undefined, email.trim(), password);
      onDismiss();
    } catch (err: any) {
      console.error('[AUTH ERROR]', err);
      setErrorText(err.message || 'Login failed. Check server connection or credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormRegister = async () => {
    if (!name.trim() || !email.trim()) {
      setErrorText('Full name and email are required');
      return;
    }
    setErrorText(null);
    setIsSubmitting(true);
    try {
      console.log(`[AUTH] Attempting registration for: ${email.trim()}`);
      await onRegister(name.trim(), email.trim(), 'USER', bio.trim(), password.trim() || 'citizen123');
      onDismiss();
    } catch (err: any) {
      console.error('[AUTH REGISTER ERROR]', err);
      setErrorText(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickCredential = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorText(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <SusalabsLogoMark size={30} />
              <View>
                <Text style={styles.headerTitle}>Next Truth Editorial</Text>
                <Text style={styles.headerSubtitle}>Verified Journalism Network</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#49454F" />
            </TouchableOpacity>
          </View>

          {/* Backend Server Status Badge */}
          <View style={styles.serverStatusContainer}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: serverStatus?.ok ? '#2E7D32' : '#C62828' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: serverStatus?.ok ? '#2E7D32' : '#C62828' },
                ]}
                numberOfLines={1}
              >
                {isCheckingServer
                  ? 'Connecting to backend...'
                  : serverStatus?.ok
                  ? `Backend Live: ${newsApi.getHost()}`
                  : `Server Offline (${newsApi.getHost()})`}
              </Text>
              <TouchableOpacity onPress={checkConnection} style={styles.retryBtn}>
                <MaterialIcons name="refresh" size={16} color="#6750A4" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowServerConfig(!showServerConfig)}
                style={styles.settingsBtn}
              >
                <MaterialIcons name="settings" size={16} color="#6750A4" />
              </TouchableOpacity>
            </View>

            {/* Server IP Override Box */}
            {showServerConfig && (
              <View style={styles.serverConfigBox}>
                <Text style={styles.configLabel}>BACKEND HOST URL (IP:PORT):</Text>
                <View style={styles.configInputRow}>
                  <TextInput
                    value={serverHost}
                    onChangeText={setServerHost}
                    placeholder="http://192.168.1.35:5000"
                    placeholderTextColor="#79747E"
                    autoCapitalize="none"
                    style={styles.configInput}
                  />
                  <TouchableOpacity
                    onPress={handleApplyCustomHost}
                    style={styles.configSaveBtn}
                  >
                    <Text style={styles.configSaveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => { setActiveTab('LOGIN'); setErrorText(null); }}
              style={[styles.tabBtn, activeTab === 'LOGIN' && styles.activeTabBtn]}
            >
              <Text style={[styles.tabText, activeTab === 'LOGIN' && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setActiveTab('REGISTER'); setErrorText(null); }}
              style={[styles.tabBtn, activeTab === 'REGISTER' && styles.activeTabBtn]}
            >
              <Text style={[styles.tabText, activeTab === 'REGISTER' && styles.activeTabText]}>
                Create Citizen Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorText ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color="#B3261E" />
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. Real Login Mode */}
            {activeTab === 'LOGIN' && (
              <View style={styles.formContainer}>
                <Text style={styles.formLabel}>REGISTERED EMAIL ADDRESS</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorText(null); }}
                  placeholder="e.g. admin@nexttruth.media"
                  placeholderTextColor="#79747E"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />

                <Text style={styles.formLabel}>ACCOUNT PASSWORD</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrorText(null); }}
                    placeholder="Enter password"
                    placeholderTextColor="#79747E"
                    secureTextEntry={!showPassword}
                    style={styles.passwordTextInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIconButton}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#6750A4"
                    />
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={isSubmitting}
                  onPress={handleFormLogin}
                  style={styles.primaryActionBtn}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>SIGN IN TO NEXT TRUTH</Text>
                  )}
                </TouchableOpacity>

                {/* Quick Credential Shortcuts */}
                <View style={styles.credentialHelperCard}>
                  <Text style={styles.helperHeader}>1-TAP SEEDED LOGINS (OFFICIAL ROLES):</Text>
                  <View style={styles.credentialsGrid}>
                    <TouchableOpacity
                      onPress={() => fillQuickCredential('admin@nexttruth.media', 'admin123')}
                      style={styles.credChip}
                    >
                      <Text style={styles.credRole}>👑 Admin</Text>
                      <Text style={styles.credPass}>admin123</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => fillQuickCredential('sarah.jenkins@nexttruth.media', 'journalist123')}
                      style={styles.credChip}
                    >
                      <Text style={styles.credRole}>📰 Journalist</Text>
                      <Text style={styles.credPass}>journalist123</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => fillQuickCredential('elias.thorne@nexttruth.media', 'expert123')}
                      style={styles.credChip}
                    >
                      <Text style={styles.credRole}>🔬 Expert</Text>
                      <Text style={styles.credPass}>expert123</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => fillQuickCredential('citizen@nexttruth.media', 'citizen123')}
                      style={styles.credChip}
                    >
                      <Text style={styles.credRole}>👤 Citizen</Text>
                      <Text style={styles.credPass}>citizen123</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 2. Public Citizen Registration Mode */}
            {activeTab === 'REGISTER' && (
              <View style={styles.formContainer}>
                <Text style={styles.formLabel}>FULL NAME *</Text>
                <TextInput
                  value={name}
                  onChangeText={(t) => { setName(t); setErrorText(null); }}
                  placeholder="e.g. Rohan Sharma"
                  placeholderTextColor="#79747E"
                  style={styles.input}
                />

                <Text style={styles.formLabel}>EMAIL ADDRESS *</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrorText(null); }}
                  placeholder="e.g. rohan.sharma@nexttruth.media"
                  placeholderTextColor="#79747E"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />

                <Text style={styles.formLabel}>CREATE PASSWORD</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrorText(null); }}
                    placeholder="Set a password"
                    placeholderTextColor="#79747E"
                    secureTextEntry={!showPassword}
                    style={styles.passwordTextInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIconButton}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#6750A4"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.formLabel}>BIO / LOCATION FOCUS</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="e.g. Community reader and eyewitness reporter in Sector 4."
                  placeholderTextColor="#79747E"
                  style={styles.input}
                />

                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={isSubmitting}
                  onPress={handleFormRegister}
                  style={styles.primaryActionBtn}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>CREATE CITIZEN ACCOUNT</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.infoNoticeBox}>
                  <MaterialIcons name="verified" size={16} color="#21005D" />
                  <Text style={styles.infoNoticeText}>
                    Staff Journalist & Ground Expert credentials are issued exclusively by the Chief Editor.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFF4',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#21005D',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#79747E',
  },
  closeBtn: {
    padding: 6,
  },
  serverStatusContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  retryBtn: {
    padding: 4,
  },
  settingsBtn: {
    padding: 4,
  },
  serverConfigBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
  },
  configLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#495057',
    marginBottom: 4,
  },
  configInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  configInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    color: '#212529',
  },
  configSaveBtn: {
    backgroundColor: '#21005D',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  configSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3EDF7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#49454F',
  },
  activeTabText: {
    color: '#21005D',
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9DEDC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F2B8B5',
  },
  errorText: {
    flex: 1,
    color: '#B3261E',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  scrollBody: {
    paddingBottom: 10,
  },
  formContainer: {
    gap: 6,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#21005D',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1B1F',
  },
  passwordInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
  },
  passwordTextInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1B1F',
  },
  eyeIconButton: {
    padding: 6,
  },
  primaryActionBtn: {
    backgroundColor: '#21005D',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  credentialHelperCard: {
    backgroundColor: '#FAF8FD',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EADDFF',
    marginTop: 10,
    gap: 6,
  },
  helperHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6750A4',
    letterSpacing: 0.6,
  },
  credentialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  credChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CAC4D0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D1B20',
  },
  credPass: {
    fontSize: 9,
    color: '#6750A4',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F7F2FA',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EADDFF',
    marginTop: 10,
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 10,
    color: '#49454F',
    lineHeight: 14,
  },
});
