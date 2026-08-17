import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevHost = (): string => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'localhost';
  }
  const hostUri = Constants.expoConfig?.hostUri || Constants.experienceUrl;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const defaultHost = getDevHost();

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:8080`,
  API_TIMEOUT: 3000,
  APP_NAME: 'Blublu',
  VERSION: '1.0.0',
};

export const getApiUrl = (endpoint: string): string => {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};
