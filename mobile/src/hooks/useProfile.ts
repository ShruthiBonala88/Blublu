import { useState, useCallback } from 'react';
import { usersApi } from '../services/api/usersApi';
import { UserProfile, UpdateUserRequest } from '../types';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getById(userId);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Failed to fetch user profile');
        return null;
      }
      setProfile(res.data);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Profile fetch error');
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, payload: UpdateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.update(userId, payload);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Failed to update profile');
        return null;
      }
      setProfile(res.data);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Profile update error');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    profile,
    fetchProfile,
    updateProfile,
  };
};
