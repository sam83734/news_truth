import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Developer computer LAN IP
const LOCAL_LAN_IP = '192.168.1.35';

const getDevHost = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const rawHost = hostUri.split(':')[0];
    // Check if hostUri is a real local IP address (e.g. 192.168.1.x)
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(rawHost);
    if (isIpAddress && rawHost !== '127.0.0.1') {
      return `http://${rawHost}:5000`;
    }
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // Real Android / iOS devices connecting over local Wi-Fi / LAN
  return `http://${LOCAL_LAN_IP}:5000`;
};

export let CURRENT_API_HOST = getDevHost();

export const getApiBaseUrl = () => `${CURRENT_API_HOST}/api`;

export const setCustomApiHost = (host: string) => {
  let cleanHost = host.trim();
  if (!cleanHost.startsWith('http://') && !cleanHost.startsWith('https://')) {
    cleanHost = `http://${cleanHost}`;
  }
  if (cleanHost.endsWith('/')) {
    cleanHost = cleanHost.slice(0, -1);
  }
  CURRENT_API_HOST = cleanHost;
  return CURRENT_API_HOST;
};

export const API_BASE_URL = getApiBaseUrl();
