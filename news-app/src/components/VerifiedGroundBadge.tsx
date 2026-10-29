import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export const VerifiedGroundBadge: React.FC<{ text?: string }> = ({ text = 'VERIFIED GROUND' }) => {
  return (
    <View style={styles.badge}>
      <MaterialIcons name="verified" size={13} color="#21005D" />
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#EADDFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0BCFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 10,
    color: '#21005D',
  },
});
