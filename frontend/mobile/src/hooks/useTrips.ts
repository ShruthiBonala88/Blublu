import { useState, useCallback } from 'react';
import { tripsApi, TripSearchParams, CreateTripPayload } from '../services/api/tripsApi';
import { Trip } from '../types';

export const useTrips = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  const searchTrips = useCallback(async (params: TripSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsApi.search(params);
      setLoading(false);
      if (res.error) {
        setError(res.error);
        setTrips([]);
        return [];
      }
      const data = res.data || [];
      setTrips(data);
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Search failed');
      return [];
    }
  }, []);

  const getTripDetails = useCallback(async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsApi.getById(tripId);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Trip not found');
        return null;
      }
      setCurrentTrip(res.data);
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to fetch trip');
      return null;
    }
  }, []);

  const createTrip = useCallback(async (payload: CreateTripPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsApi.create(payload);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Failed to create trip');
        return null;
      }
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Trip creation error');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    trips,
    currentTrip,
    searchTrips,
    getTripDetails,
    createTrip,
  };
};
