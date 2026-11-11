import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNews } from '../context/NewsContext';
import { newsApi } from '../api/newsApi';

interface ServerConfigModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onDismiss,
}) => {
  const { refreshData, showToast } = useNews();
  const [hostInput, setHostInput] = useState<string>(() => newsApi.getHost());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (visible) {
      setHostInput(newsApi.getHost());
      setTestResult(null);
    }
  }, [visible]);

  const presets = [
    { label: 'Current LAN Wi-Fi (192.168.1.48)', value: 'http://192.168.1.48:5000' },
    { label: 'Android Emulator (10.0.2.2)', value: 'http://10.0.2.2:5000' },
    { label: 'Localhost (Web/Simulator)', value: 'http://localhost:5000' },
  ];

  const handleTestConnection = async () => {
    if (!hostInput.trim()) {
      Alert.alert('Invalid URL', 'Please enter a server address.');
      return;
    }
    setTesting(true);
    setTestResult(null);

    // Temporarily set host to test
    const previousHost = newsApi.getHost();
    newsApi.setHost(hostInput.trim());

    try {
      const res = await newsApi.testHealth();
      setTestResult({
        tested: true,
        ok: res.ok,
        message: res.message,
      });
    } catch (e: any) {
      setTestResult({
        tested: true,
        ok: false,
        message: e?.message || 'Server unreachable at this address',
      });
    } finally {
      // Revert if not saved yet
      newsApi.setHost(previousHost);
      setTesting(false);
    }
  };

  const handleSaveAndConnect = async () => {
    if (!hostInput.trim()) {
      Alert.alert('Invalid URL', 'Please enter a server address.');
      return;
    }

    const newHost = newsApi.setHost(hostInput.trim());
    showToast(`Backend server set to ${newHost}`);
    onDismiss();

    // Reload all news data with new host
    try {
      await refreshData();
    } catch {
      // Ignored
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="dns" size={24} color="#6750A4" />
              <Text style={styles.title}>Backend Server Connection</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#49454F" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              Configure the REST API server URL so your phone can reach the backend over local Wi-Fi.
            </Text>

            {/* Input field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Server Base URL (Port 5000):</Text>
              <TextInput
                style={styles.textInput}
                value={hostInput}
                onChangeText={setHostInput}
                placeholder="http://192.168.1.48:5000"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Presets */}
            <Text style={styles.presetsLabel}>Quick Presets:</Text>
            <View style={styles.presetsContainer}>
              {presets.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  activeOpacity={0.7}
                  onPress={() => setHostInput(preset.value)}
                  style={[
                    styles.presetChip,
                    hostInput === preset.value && styles.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      hostInput === preset.value && styles.presetTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Test Connection Feedback */}
            {testing && (
              <View style={styles.feedbackRow}>
                <ActivityIndicator size="small" color="#6750A4" />
                <Text style={styles.feedbackText}>Testing server health ping...</Text>
              </View>
            )}

            {testResult && !testing && (
              <View
                style={[
                  styles.resultBox,
                  testResult.ok ? styles.resultSuccess : styles.resultError,
                ]}
              >
                <MaterialIcons
                  name={testResult.ok ? 'check-circle' : 'error-outline'}
                  size={18}
                  color={testResult.ok ? '#059669' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.resultText,
                    { color: testResult.ok ? '#065F46' : '#991B1B' },
                  ]}
                >
                  {testResult.ok ? 'Connection Successful! ' : 'Connection Failed: '}
                  {testResult.message}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTestConnection}
                disabled={testing}
                style={styles.testBtn}
              >
                <Text style={styles.testBtnText}>Test Ping</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveAndConnect}
                disabled={testing}
                style={styles.saveBtn}
              >
                <MaterialIcons name="check" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save & Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1B20',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 14,
  },
  description: {
    fontSize: 13,
    color: '#49454F',
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  presetsContainer: {
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#EADDFF',
    borderColor: '#6750A4',
  },
  presetText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  presetTextActive: {
    color: '#21005D',
    fontWeight: '700',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  feedbackText: {
    fontSize: 12,
    color: '#6750A4',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  resultError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resultText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6750A4',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

