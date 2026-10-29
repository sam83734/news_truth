import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNews } from '../context/NewsContext';

export const SponsoredBanner: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { sponsoredBanner } = useNews();

  if (!sponsoredBanner) return null;

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }
    const rawUrl = sponsoredBanner?.actionUrl;
    if (rawUrl) {
      let finalUrl = rawUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
      try {
        await Linking.openURL(finalUrl);
      } catch (err) {
        console.warn('[SponsoredBanner] Unable to open URL:', finalUrl, err);
      }
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.card}>
      {/* Top purple/violet line */}
      <View style={styles.topAccent} />

      {/* Sponsored Badge Top Right */}
      <View style={styles.sponsoredBadge}>
        <Text style={styles.sponsoredText}>{sponsoredBanner.badge || 'SPONSORED'}</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.leftInfo}>
          <View style={styles.iconBox}>
            <MaterialIcons name="campaign" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.sponsorNameRow}>
              <Text style={styles.sponsorName}>{sponsoredBanner.sponsorName || 'Featured Sponsor'}</Text>
              {sponsoredBanner.targetAudience && sponsoredBanner.targetAudience !== 'ALL' && (
                <View style={styles.targetAudienceTag}>
                  <Text style={styles.targetAudienceText}>{sponsoredBanner.targetAudience.replace('_', ' ')}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{sponsoredBanner.title}</Text>
            {sponsoredBanner.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>{sponsoredBanner.subtitle}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>{sponsoredBanner.ctaText || 'VIEW'}</Text>
          <MaterialIcons name="arrow-forward" size={14} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 4,
  },
  topAccent: {
    height: 4,
    backgroundColor: Colors.primary,
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 4,
    right: 0,
    backgroundColor: '#E8DEF8',
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 2,
  },
  sponsoredText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#21005D',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3EDF7',
    borderWidth: 1,
    borderColor: '#E7E0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sponsorName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6750A4',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  targetAudienceTag: {
    backgroundColor: '#EADDFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  targetAudienceText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#21005D',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1B1F',
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 0.2,
    color: '#49454F',
    marginTop: 2,
    lineHeight: 15,
  },
  ctaButton: {
    backgroundColor: '#21005D',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
