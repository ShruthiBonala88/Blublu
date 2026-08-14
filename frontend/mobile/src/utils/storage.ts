import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { UserProfile } from '../app/providers/AuthProvider';

const TOKEN_KEY = 'blublu_auth_token';
const USER_KEY = 'blublu_user_data';

export const storage = {
  saveToken: async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Failed to save auth token to secure storage', e);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to read auth token from secure storage', e);
      return null;
    }
  },

  deleteToken: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to delete auth token from secure storage', e);
    }
  },

  saveUser: async (user: UserProfile): Promise<void> => {
    try {
      const json = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, json);
      } else {
        await SecureStore.setItemAsync(USER_KEY, json);
      }
    } catch (e) {
      console.warn('Failed to save user data to secure storage', e);
    }
  },

  getUser: async (): Promise<UserProfile | null> => {
    try {
      let json: string | null = null;
      if (Platform.OS === 'web') {
        json = localStorage.getItem(USER_KEY);
      } else {
        json = await SecureStore.getItemAsync(USER_KEY);
      }
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.warn('Failed to read user data from secure storage', e);
      return null;
    }
  },

  deleteUser: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to delete user data from secure storage', e);
    }
  },

  clearAll: async (): Promise<void> => {
    await storage.deleteToken();
    await storage.deleteUser();
  },
};
