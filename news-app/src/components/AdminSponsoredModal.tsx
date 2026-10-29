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
import { SponsoredBannerData, TargetAudience } from '../types';
import { Colors } from '../theme/colors';

interface AdminSponsoredModalProps {
  visible: boolean;
  initialBanner?: SponsoredBannerData | null;
  onDismiss: () => void;
  onSave: (banner: Partial<SponsoredBannerData>) => Promise<void>;
}

export const AdminSponsoredModal: React.FC<AdminSponsoredModalProps> = ({
  visible,
  initialBanner,
  onDismiss,
  onSave,
}) => {
  const [title, setTitle] = useState(initialBanner?.title || 'Susalabs Research Initiative');
  const [sponsorName, setSponsorName] = useState(initialBanner?.sponsorName || 'Susalabs Intelligence');
  const [subtitle, setSubtitle] = useState(
    initialBanner?.subtitle || 'Decentralized cryptographic verification protocol for modern civic reporting.'
  );
  const [badge, setBadge] = useState(initialBanner?.badge || 'COMMUNITY SPONSOR');
  const [ctaText, setCtaText] = useState(initialBanner?.ctaText || 'LEARN MORE');
  const [actionUrl, setActionUrl] = useState(initialBanner?.actionUrl || 'https://susalabs.com');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    initialBanner?.targetAudience || 'ALL'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audienceOptions: { key: TargetAudience; label: string; desc: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    {
      key: 'ALL',
      label: 'All Readers (Global)',
      desc: 'Display across all citizen and staff feeds',
      icon: 'public',
    },
    {
      key: 'PREMIUM_ONLY',
      label: 'Premium Subscribers',
      desc: 'Target paying subscribers and ground supporters',
      icon: 'workspace-premium',
    },
    {
      key: 'COMMUNITY_ONLY',
      label: 'Community & Citizen',
      desc: 'Target local citizen journalists and public readers',
      icon: 'groups',
    },
    {
      key: 'INVESTIGATIVE',
      label: 'Policy & Tech Beats',
      desc: 'Display primarily on municipal & infrastructure articles',
      icon: 'policy',
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        sponsorName,
        subtitle,
        badge,
        ctaText,
        actionUrl,
        targetAudience,
      });
      onDismiss();
    } catch (err) {
      console.warn('Error saving banner:', err);
    } finally {
      setIsSubmitting(false);
    }
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
              <View style={styles.iconCircle}>
                <MaterialIcons name="campaign" size={20} color="#6750A4" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Sponsored Desk Campaign</Text>
                <Text style={styles.headerSubtitle}>Manage Ad Cards & Audience Targeting</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#49454F" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Sponsor Brand Name */}
            <Text style={styles.formLabel}>SPONSOR PARTNER NAME</Text>
            <TextInput
              value={sponsorName}
              onChangeText={setSponsorName}
              placeholder="e.g. Susalabs Intelligence"
              placeholderTextColor="#79747E"
              style={styles.input}
            />

            {/* Campaign Headline */}
            <Text style={styles.formLabel}>CAMPAIGN HEADLINE</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Susalabs Research Initiative"
              placeholderTextColor="#79747E"
              style={styles.input}
            />

            {/* Subtitle / Description */}
            <Text style={styles.formLabel}>PROMOTIONAL SUBTEXT</Text>
            <TextInput
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder="Short description of the initiative or sponsor offer..."
              placeholderTextColor="#79747E"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            />

            {/* Destination URL */}
            <Text style={styles.formLabel}>DESTINATION CTA URL</Text>
            <TextInput
              value={actionUrl}
              onChangeText={setActionUrl}
              placeholder="https://..."
              placeholderTextColor="#79747E"
              autoCapitalize="none"
              style={styles.input}
            />

            {/* Target Audience Segmentation */}
            <Text style={styles.formLabel}>TARGET AUDIENCE SEGMENT</Text>
            <View style={styles.audienceList}>
              {audienceOptions.map((opt) => {
                const isSelected = targetAudience === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.85}
                    onPress={() => setTargetAudience(opt.key)}
                    style={[
                      styles.audienceCard,
                      {
                        backgroundColor: isSelected ? '#FEF7FF' : '#FFFFFF',
                        borderColor: isSelected ? '#21005D' : '#E6E1E5',
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={opt.icon}
                      size={20}
                      color={isSelected ? '#21005D' : '#79747E'}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.audienceTitle,
                          { color: isSelected ? '#21005D' : '#1D1B20' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={styles.audienceDesc}>{opt.desc}</Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={18} color="#21005D" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={styles.saveBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>DEPLOY CAMPAIGN TO APP</Text>
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EADDFF',
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
  scrollBody: {
    paddingBottom: 12,
    gap: 6,
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
  audienceList: {
    gap: 8,
  },
  audienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  audienceTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  audienceDesc: {
    fontSize: 11,
    color: '#49454F',
  },
  saveBtn: {
    backgroundColor: '#21005D',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
