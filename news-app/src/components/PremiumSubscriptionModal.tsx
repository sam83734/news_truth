import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PremiumSubscriptionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubscribe: () => void;
}

export const PremiumSubscriptionModal: React.FC<PremiumSubscriptionModalProps> = ({
  visible,
  onDismiss,
  onSubscribe,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="lock" size={28} color="#21005D" />
            </View>

            <Text style={styles.headline}>Unlock Next Truth Premium</Text>

            <Text style={styles.subtext}>
              Unfiltered ground investigations, subscriber-only columns, and deep forensic dossiers.
            </Text>

            {/* Benefits box */}
            <View style={styles.benefitsBox}>
              <PremiumBenefitRow text="Unrestricted access to all deep-dive investigations" />
              <PremiumBenefitRow text="Direct Q&A dispatches with verified ground correspondents" />
              <PremiumBenefitRow text="Ad-free reading experience across mobile & desktop" />
              <PremiumBenefitRow text="Priority submission verification at the editorial desk" />
            </View>

            {/* PayPal Subscribe Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onSubscribe}
              style={styles.subscribeButton}
            >
              <MaterialIcons name="payment" size={20} color="#FFFFFF" />
              <Text style={styles.subscribeButtonText}>Subscribe with PayPal</Text>
            </TouchableOpacity>

            <Text style={styles.cancelNotice}>Cancel anytime. $4.99/month.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const PremiumBenefitRow: React.FC<{ text: string }> = ({ text }) => {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.checkCircle}>
        <MaterialIcons name="check" size={14} color="#21005D" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CAC4D0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EADDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#21005D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    color: '#49454F',
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsBox: {
    width: '100%',
    backgroundColor: '#FEF7FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EADDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1B1F',
  },
  subscribeButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#21005D',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelNotice: {
    fontSize: 11,
    color: '#79747E',
    marginTop: 4,
  },
});
