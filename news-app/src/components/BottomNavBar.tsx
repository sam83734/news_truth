import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MainTab } from '../types';
import { Colors } from '../theme/colors';

interface BottomNavBarProps {
  currentTab: MainTab;
  onTabSelected: (tab: MainTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabSelected,
}) => {
  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <NavBarItem
        label="Home"
        isSelected={currentTab === 'HOME'}
        selectedIcon="home"
        unselectedIcon="home"
        onClick={() => onTabSelected('HOME')}
      />

      {/* Video Tab */}
      <NavBarItem
        label="Video"
        isSelected={currentTab === 'VIDEO'}
        selectedIcon="movie"
        unselectedIcon="movie"
        onClick={() => onTabSelected('VIDEO')}
      />

      {/* Post Tab (Special Action Button) */}
      <NavBarItem
        label="Post"
        isSelected={currentTab === 'POST'}
        selectedIcon="add-circle"
        unselectedIcon="add-circle"
        isSpecialAction={true}
        onClick={() => onTabSelected('POST')}
      />

      {/* Columns Tab */}
      <NavBarItem
        label="Columns"
        isSelected={currentTab === 'COLUMNS'}
        selectedIcon="edit-note"
        unselectedIcon="edit-note"
        onClick={() => onTabSelected('COLUMNS')}
      />

      {/* Profile Tab */}
      <NavBarItem
        label="Profile"
        isSelected={currentTab === 'PROFILE'}
        selectedIcon="person"
        unselectedIcon="person-outline"
        onClick={() => onTabSelected('PROFILE')}
      />
    </View>
  );
};

interface NavBarItemProps {
  label: string;
  isSelected: boolean;
  selectedIcon: keyof typeof MaterialIcons.glyphMap;
  unselectedIcon: keyof typeof MaterialIcons.glyphMap;
  isSpecialAction?: boolean;
  onClick: () => void;
}

const NavBarItem: React.FC<NavBarItemProps> = ({
  label,
  isSelected,
  selectedIcon,
  unselectedIcon,
  isSpecialAction = false,
  onClick,
}) => {
  const activePillColor = '#D0BCFF';
  const activeIconColor = '#21005D';
  const inactiveColor = '#49454F';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onClick}
      style={styles.navItem}
    >
      {isSpecialAction ? (
        <View
          style={[
            styles.specialActionPill,
            { backgroundColor: isSelected ? '#21005D' : '#6750A4' },
          ]}
        >
          <MaterialIcons name={selectedIcon} size={22} color="#FFFFFF" />
        </View>
      ) : (
        <View
          style={[
            styles.standardPill,
            {
              backgroundColor: isSelected ? activePillColor : 'transparent',
            },
          ]}
        >
          <MaterialIcons
            name={isSelected ? selectedIcon : unselectedIcon}
            size={22}
            color={isSelected ? activeIconColor : inactiveColor}
          />
        </View>
      )}

      <Text
        style={[
          styles.itemLabel,
          {
            color: isSelected ? activeIconColor : inactiveColor,
            fontWeight: isSelected ? '800' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3EDF7',
    borderTopWidth: 1,
    borderTopColor: 'rgba(202, 196, 208, 0.6)',
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    paddingVertical: 2,
    borderRadius: 24,
  },
  specialActionPill: {
    width: 60,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardPill: {
    width: 60,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 11,
    marginTop: 3,
  },
});
