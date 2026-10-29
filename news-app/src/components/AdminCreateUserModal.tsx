import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserRole } from '../types';
import { Colors } from '../theme/colors';

interface AdminCreateUserModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreateUser: (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    bio?: string;
  }) => Promise<void>;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  visible,
  onDismiss,
  onCreateUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('JOURNALIST');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setErrorText('Full name and email are required');
      return;
    }
    setErrorText(null);
    setIsSubmitting(true);
    try {
      await onCreateUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || undefined,
        role,
        bio: bio.trim(),
      });
      setName('');
      setEmail('');
      setPassword('');
      setBio('');
      onDismiss();
    } catch (err: any) {
      setErrorText(err.message || 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { role: UserRole; title: string; subtitle: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    {
      role: 'JOURNALIST',
      title: 'Staff Journalist',
      subtitle: 'Authorized field reporter with publishing permissions',
      icon: 'badge',
    },
    {
      role: 'EXPERT',
      title: 'Ground Expert',
      subtitle: 'Investigative analyst & verified op-ed writer',
      icon: 'verified',
    },
    {
      role: 'USER',
      title: 'Citizen Reporter',
      subtitle: 'Standard community contributor',
      icon: 'person',
    },
    {
      role: 'ADMIN',
      title: 'Chief Editor / Admin',
      subtitle: 'Platform administrator with verification desk rights',
      icon: 'admin-panel-settings',
    },
  ];

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
              <View style={styles.adminBadgeIcon}>
                <MaterialIcons name="person-add" size={20} color="#B3261E" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Issue Press Credential</Text>
                <Text style={styles.headerSubtitle}>Admin Staff & Expert Onboarding</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#49454F" />
            </TouchableOpacity>
          </View>

          {errorText ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={16} color="#B3261E" />
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Full Name */}
            <Text style={styles.formLabel}>FULL NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. David Vance"
              placeholderTextColor="#79747E"
              style={styles.input}
            />

            {/* Email Address */}
            <Text style={styles.formLabel}>OFFICIAL EMAIL ADDRESS</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. david.vance@nexttruth.media"
              placeholderTextColor="#79747E"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            {/* Initial Password */}
            <Text style={styles.formLabel}>ASSIGN INITIAL PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password (e.g. journalist123)"
                placeholderTextColor="#79747E"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggleBtn}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#79747E"
                />
              </TouchableOpacity>
            </View>

            {/* Role Selection */}
            <Text style={styles.formLabel}>ASSIGN CREDENTIAL ROLE</Text>
            <View style={styles.rolePickerList}>
              {roles.map((r) => {
                const isSelected = role === r.role;
                return (
                  <TouchableOpacity
                    key={r.role}
                    activeOpacity={0.8}
                    onPress={() => setRole(r.role)}
                    style={[
                      styles.roleItemCard,
                      {
                        backgroundColor: isSelected ? '#FEF7FF' : '#FFFFFF',
                        borderColor: isSelected ? '#21005D' : '#E6E1E5',
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={r.icon}
                      size={20}
                      color={isSelected ? '#21005D' : '#79747E'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.roleItemTitle,
                          { color: isSelected ? '#21005D' : '#1D1B20' },
                        ]}
                      >
                        {r.title}
                      </Text>
                      <Text style={styles.roleItemSubtitle}>{r.subtitle}</Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={18} color="#21005D" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Editorial Bio */}
            <Text style={styles.formLabel}>EDITORIAL FOCUS / BIO</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Specialization, municipal beats, or investigative background..."
              placeholderTextColor="#79747E"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 64, textAlignVertical: 'top' }]}
            />

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>ISSUE ACCOUNT & CREDENTIALS</Text>
              )}
            </TouchableOpacity>
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
    maxHeight: '85%',
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
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFF4',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9DEDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1B20',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#79747E',
  },
  closeBtn: {
    padding: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9DEDC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#B3261E',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollBody: {
    paddingBottom: 12,
    gap: 8,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#21005D',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1B1F',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1B1F',
  },
  passwordToggleBtn: {
    padding: 6,
  },
  rolePickerList: {
    gap: 8,
  },
  roleItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  roleItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleItemSubtitle: {
    fontSize: 11,
    color: '#49454F',
  },
  submitBtn: {
    backgroundColor: '#21005D',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
