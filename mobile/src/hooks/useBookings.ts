import { useState, useCallback } from 'react';
import { bookingsApi, CreateBookingPayload } from '../services/api/bookingsApi';
import { usersApi } from '../services/api/usersApi';
import { Booking, PassengerRide } from '../types';

export const useBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rides, setRides] = useState<PassengerRide[]>([]);

  const createBooking = useCallback(async (payload: CreateBookingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.create(payload);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Failed to create booking');
        return null;
      }
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Booking submission error');
      return null;
    }
  }, []);

  const fetchPassengerRides = useCallback(async (userId: string, category: string = 'upcoming') => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getRides(userId, category as any);
      setLoading(false);
      if (res.error) {
        setError(res.error);
        setRides([]);
        return [];
      }
      const data = (res.data as any)?.data || res.data || [];
      setRides(data);
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to fetch rides');
      return [];
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string, userId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.cancel(bookingId, { user_id: userId, reason });
      setLoading(false);
      if (res.error) {
        setError(res.error);
        return null;
      }
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Cancellation error');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    rides,
    createBooking,
    fetchPassengerRides,
    cancelBooking,
  };
};
