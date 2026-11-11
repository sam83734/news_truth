import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ImageLightboxModalProps {
  imageUri: string | null;
  onDismiss: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUri,
  onDismiss,
}) => {
  if (!imageUri) return null;

  return (
    <Modal
      visible={Boolean(imageUri)}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onDismiss}
          style={styles.backdropTouch}
        >
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH * 0.96,
    height: SCREEN_HEIGHT * 0.78,
  },
});

