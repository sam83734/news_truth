import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  visible: boolean;
  notifications: NotificationItem[];
  onDismiss: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  notifications,
  onDismiss,
}) => {
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
            <Text style={styles.headerTitle}>Ground Alerts</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#49454F" />
            </TouchableOpacity>
          </View>

          {/* Notification items */}
          <FlatList<NotificationItem>
            data={notifications}
            keyExtractor={(item: NotificationItem) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: NotificationItem }) => (
              <View
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: item.isUrgent ? '#FEF7FF' : '#FFFFFF',
                    borderColor: item.isUrgent ? '#F2B8B5' : '#E7E0EC',
                  },
                ]}
              >
                <View style={styles.itemHeader}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: item.isUrgent ? '#B3261E' : '#21005D' },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.itemTime}>{item.timeAgo}</Text>
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
              </View>
            )}
          />

          {/* Confirm Button */}
          <TouchableOpacity onPress={onDismiss} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#21005D',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    gap: 10,
    paddingBottom: 8,
  },
  notificationItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemTime: {
    fontSize: 11,
    color: '#79747E',
  },
  itemMessage: {
    fontSize: 12,
    lineHeight: 16,
    color: '#49454F',
  },
  doneBtn: {
    alignSelf: 'flex-end',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6750A4',
  },
});
