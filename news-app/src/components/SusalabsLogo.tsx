import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

const SusalabsImage = require('../../assets/susalabs.jpg');

export const SusalabsLogoMark: React.FC<{ size?: number }> = ({ size = 38 }) => {
  return (
    <View style={[styles.logoMarkContainer, { width: size, height: size }]}>
      <Image
        source={SusalabsImage}
        style={{ width: size - 4, height: size - 4 }}
        resizeMode="contain"
      />
    </View>
  );
};

export const SusalabsLogo: React.FC<{
  iconSize?: number;
  showSubtitle?: boolean;
  subtitleText?: string;
}> = ({ iconSize = 40, showSubtitle = true, subtitleText = 'Investigative Journalism Network' }) => {
  return (
    <View style={styles.brandHeader}>
      <Image
        source={SusalabsImage}
        style={[styles.logoImage, { width: iconSize, height: iconSize }]}
        resizeMode="contain"
      />
      <View>
        <Text style={[styles.wordmark, { fontSize: iconSize * 0.52 }]}>Susalabs</Text>
        {showSubtitle && <Text style={styles.subtitle}>{subtitleText}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoMarkContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    borderRadius: 8,
  },
  wordmark: {
    fontWeight: '800',
    color: Colors.susalabsOrange,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: '#49454F',
  },
});
