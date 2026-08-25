import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useUserStore } from '@/store/userStore';

const getBaseURL = () => {
  // 1. On Web Browser: direct localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api/v1';
  }

  // 2. On Physical Mobile (Expo Go) / Emulator: Extract computer IP from Expo host URI
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

  // 3. If environment variable is set
  if (process.env.EXPO_PUBLIC_API_URL) {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.149';
      return envUrl.replace(/localhost|127\.0\.0\.1/, fallbackHost);
    }
    return envUrl;
  }

  // 4. Default Android emulator / Local Wi-Fi IP
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://192.168.0.149:8080/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Auto-inject JWT Token from store into Authorization header
api.interceptors.request.use(
  (config) => {
    try {
      const state = useUserStore.getState();
      const token = state?.token;
      const userId = state?.userId;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (userId) {
        config.headers['X-User-ID'] = userId;
        if (state.role === 'admin') {
          config.headers['X-Admin-User-ID'] = userId;
        }
      }
    } catch (e) {
      // Ignore in non-react environments
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent response data & error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn(`[API ERROR] ${error?.config?.method?.toUpperCase()} ${error?.config?.url}:`, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;