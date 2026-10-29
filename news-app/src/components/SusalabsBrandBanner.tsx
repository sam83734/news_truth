import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

const SusalabsImage = require('../../assets/susalabs.jpg');

export const SusalabsBrandBanner: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* 4-Color Top Rainbow Ribbon */}
      <View style={styles.ribbonRow}>
        <View style={[styles.ribbonSegment, { backgroundColor: Colors.susalabsOrange, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }]} />
        <View style={[styles.ribbonSegment, { backgroundColor: Colors.susalabsGreen }]} />
        <View style={[styles.ribbonSegment, { backgroundColor: Colors.susalabsTeal }]} />
        <View style={[styles.ribbonSegment, { backgroundColor: Colors.susalabsSkyBlue, borderTopRightRadius: 2, borderBottomRightRadius: 2 }]} />
      </View>

      <Image
        source={SusalabsImage}
        style={styles.bannerLogo}
        resizeMode="contain"
      />

      <Text style={styles.bannerText}>
        Empowering fearless investigative reporting and ground truth verification worldwide.
      </Text>

      <View style={styles.badgesRow}>
        <View style={styles.badge1}>
          <Text style={styles.badge1Text}>VERIFIED NETWORK</Text>
        </View>
        <View style={styles.badge2}>
          <Text style={styles.badge2Text}>LABS VERIFICATION DESK</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    padding: 18,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ribbonRow: {
    width: 160,
    height: 3,
    flexDirection: 'row',
  },
  ribbonSegment: {
    flex: 1,
    height: 3,
  },
  bannerLogo: {
    height: 64,
    width: 200,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#49454F',
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge1: {
    backgroundColor: '#FEF7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge1Text: {
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#21005D',
  },
  badge2: {
    backgroundColor: '#EADDFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0BCFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge2Text: {
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#21005D',
  },
});
