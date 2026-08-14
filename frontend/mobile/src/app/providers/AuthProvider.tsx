import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { apiClient } from '../../services/api/client';

export type UserRole = 'passenger' | 'driver';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  isDriverApproved?: boolean;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  status: AuthStatus;
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  role: UserRole;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<UserRole>('passenger');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          setRoleState(savedUser.role || 'passenger');
          apiClient.setAuthToken(savedToken);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch (e) {
        console.warn('Failed to restore auth state', e);
        setStatus('unauthenticated');
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    setRoleState(newUser.role);
    apiClient.setAuthToken(newToken);

    await storage.saveToken(newToken);
    await storage.saveUser(newUser);

    setStatus('authenticated');
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setRoleState('passenger');
    apiClient.setAuthToken(null);

    await storage.clearAll();

    setStatus('unauthenticated');
  };

  const setRole = async (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      await storage.saveUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        isAuthenticated: status === 'authenticated',
        token,
        user,
        role,
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
