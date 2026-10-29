import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SusalabsLogoMark } from './SusalabsLogo';
import { Colors } from '../theme/colors';

interface TopHeaderBarProps {
  unreadCount?: number;
  userAvatarUrl?: string;
  onLogoClick: () => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  unreadCount = 0,
  userAvatarUrl,
  onLogoClick,
  onSearchClick,
  onNotificationsClick,
  onProfileClick,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Logo Area - Clicking redirects to HOME */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onLogoClick}
        style={styles.brandContainer}
      >
        <SusalabsLogoMark size={38} />

        <View>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>Susalabs</Text>
            <View style={styles.dispatchBadge}>
              <Text style={styles.dispatchBadgeText}>DISPATCH</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>Next Truth Investigative Desk</Text>
        </View>
      </TouchableOpacity>

      {/* Right Actions: Search Icon + Profile Avatar + Notification Bell */}
      <View style={styles.rightActions}>
        {/* Search Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSearchClick}
          style={styles.actionIconButton}
        >
          <MaterialIcons name="search" size={21} color="#21005D" />
        </TouchableOpacity>

        {/* Profile Avatar Button (Guest compatible) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onProfileClick}
          style={styles.profileAvatarButton}
        >
          {userAvatarUrl ? (
            <Image
              source={{ uri: userAvatarUrl }}
              style={styles.profileAvatar}
            />
          ) : (
            <View style={styles.guestAvatarPlaceholder}>
              <MaterialIcons name="person" size={20} color="#6750A4" />
            </View>
          )}
        </TouchableOpacity>

        {/* Notification Bell Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNotificationsClick}
          style={styles.notificationButton}
        >
          <MaterialIcons name="notifications-none" size={20} color="#21005D" />
          {unreadCount > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.susalabsOrange,
    letterSpacing: -0.2,
  },
  dispatchBadge: {
    backgroundColor: '#FEF7FF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  dispatchBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#21005D',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#49454F',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#E7E0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#6750A4',
  },
  guestAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECE6F0',
    borderWidth: 1,
    borderColor: '#CAC4D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EADDFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B3261E',
  },
});
