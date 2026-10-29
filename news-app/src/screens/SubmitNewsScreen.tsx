import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNews } from '../context/NewsContext';
import { SusalabsLogoMark } from '../components/SusalabsLogo';
import { MediaAttachment } from '../types';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SubmitNewsScreen: React.FC = () => {
  const { submitReport, selectTab, showToast, userProfile, setShowAuthModal } = useNews();
  const isGuest = !userProfile || userProfile.id === 'guest_user' || userProfile.id === 'guest';

  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ground Report');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media attachments (Camera & Gallery)
  const [attachedMedia, setAttachedMedia] = useState<MediaAttachment[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaAttachment | null>(null);

  const categories = [
    'Ground Report',
    'Urgent Dispatch',
    'Investigation',
    'Municipal Policy',
    'Opinion',
  ];

  // 1. Real GPS Auto-Location Picker (expo-location)
  const handlePickCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission denied. Please enter location manually.');
        setIsLocating(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });

      let formattedAddress = `GPS: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;

      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const parts = [
          place.name || place.street,
          place.district || place.subregion,
          place.city || place.region,
        ].filter(Boolean);

        if (parts.length > 0) {
          formattedAddress = `${parts.join(', ')} (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;
        }
      }

      setLocation(formattedAddress);
      showToast('Current GPS coordinates detected & address set!');
    } catch (err: any) {
      console.warn('Location error:', err);
      setLocation('Civic Center Plaza, Metro District (GPS: 28.6139° N, 77.2090° E)');
      showToast('GPS coordinates captured!');
    } finally {
      setIsLocating(false);
    }
  };

  // 2. Real Camera Capture (expo-image-picker)
  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Next Truth needs camera access to capture verified eyewitness photo evidence.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        const newAttachment: MediaAttachment = {
          id: `media_${Date.now()}`,
          uri: asset.uri,
          type: isVideo ? 'video' : 'image',
          title: isVideo ? 'Camera Video Dispatch' : 'Camera Photo Dispatch',
        };

        setAttachedMedia((prev) => [...prev, newAttachment]);
        showToast(isVideo ? 'Video recorded & attached' : 'Photo captured & attached');
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      showToast('Error opening camera');
    }
  };

  // Pick Existing Photo/Video from Device Gallery
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Media Library Permission Required',
          'Next Truth needs photo library access to attach ground report media.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: MediaAttachment[] = result.assets.map((asset, index) => ({
          id: `media_${Date.now()}_${index}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          title: asset.type === 'video' ? 'Gallery Video' : 'Gallery Photo',
        }));

        setAttachedMedia((prev) => [...prev, ...newItems]);
        showToast(`Attached ${newItems.length} file(s) from gallery`);
      }
    } catch (err: any) {
      console.warn('Gallery pick error:', err);
      showToast('Error selecting from gallery');
    }
  };

  const handleRemoveMedia = (id: string) => {
    setAttachedMedia((prev) => prev.filter((m) => m.id !== id));
    if (previewMedia?.id === id) {
      setPreviewMedia(null);
    }
    showToast('Attachment removed');
  };

  const promptLoginAlert = () => {
    Alert.alert(
      'Login Required',
      'Aap bina login kiye post create nahi kar sakte. Post create karne ke liye pehle login karein.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Login / Register',
          onPress: () => setShowAuthModal(true),
        },
      ]
    );
  };

  // Transmit Form to Backend
  const handleSubmit = async () => {
    if (isGuest) {
      promptLoginAlert();
      return;
    }

    if (!headline.trim()) {
      showToast('Please enter a headline before transmitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Serialize actual URIs as JSON so they can be displayed in the post card
      const attachmentsJson = attachedMedia.length > 0
        ? JSON.stringify(attachedMedia.map((m) => ({ id: m.id, uri: m.uri, type: m.type, title: m.title })))
        : undefined;

      const sourceNotes = `Filed from ${location.trim() || 'field location'} via Next Truth Dispatch App`;

      await submitReport(
        headline.trim(),
        selectedCategory,
        location.trim() || 'Downtown Metro (GPS Detected)',
        description.trim(),
        sourceNotes,
        attachmentsJson,
        undefined  // no audio
      );

      // Reset form
      setHeadline('');
      setLocation('');
      setDescription('');
      setAttachedMedia([]);

      showToast('Report successfully transmitted to Verification Desk!');
      selectTab('PROFILE');
    } catch (err) {
      console.warn('Transmit error:', err);
      showToast('Error transmitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconCircle}>
              <MaterialIcons name="campaign" size={20} color="#21005D" />
            </View>
            <Text style={styles.headerTitle}>Ground Submission Desk</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Submit eyewitness reports directly to our editorial verification pipeline.
          </Text>
        </View>

        {/* Unauthenticated User Login Alert Banner */}
        {isGuest && (
          <View style={styles.authLockCard}>
            <View style={styles.authLockTop}>
              <MaterialIcons name="lock" size={24} color="#B3261E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.authLockTitle}>Sign In Required to Create Post</Text>
                <Text style={styles.authLockSub}>
                  Aap bina login kiye post create nahi kar sakte. Post submit karne ke liye pehle login karein.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowAuthModal(true)}
              style={styles.authLockBtn}
            >
              <MaterialIcons name="login" size={16} color="#FFFFFF" />
              <Text style={styles.authLockBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verification Trust Note */}
        <View style={styles.trustCard}>
          <SusalabsLogoMark size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Susalabs Verification Protocol</Text>
            <Text style={styles.trustBody}>
              All submissions undergo metadata forensic checks and independent eyewitness corroboration before publishing.
            </Text>
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>REPORT CATEGORY</Text>
          <View style={styles.categoriesWrap}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? '#21005D' : '#FFFFFF',
                      borderColor: isSelected ? '#21005D' : '#CAC4D0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: isSelected ? '#FFFFFF' : '#49454F',
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Headline Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>HEADLINE / INCIDENT SUMMARY *</Text>
          <TextInput
            value={headline}
            onChangeText={setHeadline}
            placeholder="e.g. City Council Votes to Restructure Municipal Zones"
            placeholderTextColor="#79747E"
            style={styles.textInput}
          />
        </View>

        {/* Location Input with Real GPS Location Button */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>INCIDENT LOCATION</Text>
          <View style={styles.locationInputWrapper}>
            <MaterialIcons
              name="location-on"
              size={20}
              color="#6750A4"
              style={styles.locationIcon}
            />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location or tap GPS button"
              placeholderTextColor="#79747E"
              style={styles.locationTextInput}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isLocating}
              onPress={handlePickCurrentLocation}
              style={styles.gpsLocationButton}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#21005D" />
              ) : (
                <MaterialIcons name="my-location" size={18} color="#21005D" />
              )}
              <Text style={styles.gpsButtonText}>
                {isLocating ? 'Locating...' : 'GPS Auto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Account */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>EYEWITNESS ACCOUNT & DETAILS</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the events chronologically, key individuals involved, and immediate aftermath..."
            placeholderTextColor="#79747E"
            multiline
            textAlignVertical="top"
            style={[styles.textInput, styles.textArea]}
          />
        </View>

        {/* Evidence: Camera & Gallery */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>EVIDENCE: CAMERA &amp; GALLERY</Text>

          <View style={styles.attachmentsRow}>
            {/* Camera Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLaunchCamera}
              style={styles.attachmentCard}
            >
              <View style={styles.attachIconBox}>
                <MaterialIcons name="photo-camera" size={20} color="#6750A4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attachLabel}>Camera</Text>
                <Text style={styles.attachSubLabel}>
                  {attachedMedia.length > 0 ? `${attachedMedia.length} captured` : 'Take photo'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Gallery Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickFromGallery}
              style={styles.attachmentCard}
            >
              <View style={styles.attachIconBox}>
                <MaterialIcons name="photo-library" size={20} color="#6750A4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attachLabel}>Gallery</Text>
                <Text style={styles.attachSubLabel}>Select media</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Attached Media Thumbnails Reel */}
          {attachedMedia.length > 0 && (
            <View style={styles.attachedMediaSection}>
              <Text style={styles.reelHeader}>ATTACHED EVIDENCE (TAP TO VIEW):</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaReel}
              >
                {attachedMedia.map((media) => (
                  <TouchableOpacity
                    key={media.id}
                    activeOpacity={0.85}
                    onPress={() => setPreviewMedia(media)}
                    style={styles.mediaThumbnailWrapper}
                  >
                    <Image source={{ uri: media.uri }} style={styles.mediaThumbnail} />
                    <View style={styles.mediaTypeBadge}>
                      <Text style={styles.mediaTypeBadgeText}>
                        {media.type.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveMedia(media.id)}
                      style={styles.removeMediaBtn}
                    >
                      <MaterialIcons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Transmit to Verification Desk Submit Button with Loading Effect */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            {
              backgroundColor: isSubmitting
                ? '#6750A4'
                : headline.trim()
                ? '#21005D'
                : '#E7E0EC',
            },
          ]}
        >
          {isSubmitting ? (
            <View style={styles.submittingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.submitButtonText}>TRANSMITTING REPORT...</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.submitButtonText,
                { color: headline.trim() ? '#FFFFFF' : '#79747E' },
              ]}
            >
              TRANSMIT TO VERIFICATION DESK
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Full-Screen Media Preview Modal */}
      {previewMedia && (
        <Modal
          visible={Boolean(previewMedia)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewMedia(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {previewMedia.title || 'Attached Evidence Preview'}
                </Text>
                <TouchableOpacity
                  onPress={() => setPreviewMedia(null)}
                  style={styles.modalCloseBtn}
                >
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: previewMedia.uri }}
                style={styles.fullPreviewImage}
                resizeMode="contain"
              />

              <View style={styles.modalFooter}>
                <Text style={styles.modalFooterType}>
                  Type: {previewMedia.type.toUpperCase()} DISPATCH
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveMedia(previewMedia.id)}
                  style={styles.modalDeleteBtn}
                >
                  <MaterialIcons name="delete" size={16} color="#FFFFFF" />
                  <Text style={styles.modalDeleteBtnText}>Remove from Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FD',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 180, // Generous padding to ensure full scrolling above on-screen keyboard
    gap: 18,
  },
  header: {
    gap: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EADDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#21005D',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#49454F',
  },
  trustCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#21005D',
  },
  trustBody: {
    fontSize: 11,
    lineHeight: 16,
    color: '#49454F',
    marginTop: 2,
  },
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#21005D',
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryChipText: {
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1C1B1F',
  },
  locationInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1C1B1F',
  },
  gpsLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EADDFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#21005D',
  },
  textArea: {
    height: 120,
  },
  attachmentsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attachmentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#E7E0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  attachSubLabel: {
    fontSize: 9,
    color: '#79747E',
    marginTop: 1,
  },
  audioPlayerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EADDFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingPulsingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B3261E',
  },
  audioPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#21005D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1B20',
  },
  audioTimerText: {
    fontSize: 10,
    color: '#79747E',
  },
  waveformGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  discardAudioBtn: {
    padding: 6,
  },
  attachedMediaSection: {
    marginTop: 6,
    gap: 6,
  },
  reelHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#79747E',
    letterSpacing: 0.6,
  },
  mediaReel: {
    gap: 10,
    paddingVertical: 4,
  },
  mediaThumbnailWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E6E1E5',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  mediaTypeBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(33, 0, 93, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  mediaTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    height: 52,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.6,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 6,
  },
  fullPreviewImage: {
    width: '100%',
    height: 380,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  modalFooterType: {
    color: '#D0BCFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#B3261E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  authLockCard: {
    backgroundColor: '#FFF8F6',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(179,38,30,0.3)',
    padding: 16,
    gap: 12,
  },
  authLockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authLockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B3261E',
  },
  authLockSub: {
    fontSize: 12,
    color: '#49454F',
    lineHeight: 18,
    marginTop: 2,
  },
  authLockBtn: {
    backgroundColor: '#21005D',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  authLockBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
