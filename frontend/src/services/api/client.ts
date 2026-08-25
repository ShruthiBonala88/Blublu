import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 1. On Web Browser
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api/v1';
  }

  // 2. On Physical Mobile Device (Expo Go): Dynamically get computer IP from Expo Host URI
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    '';

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8080/api/v1`;
    }
  }

  // 3. Emulators fallback
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;