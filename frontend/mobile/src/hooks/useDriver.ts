import { useState, useCallback } from 'react';
import { driversApi } from '../services/api/driversApi';
import { vehiclesApi, CreateVehiclePayload } from '../services/api/vehiclesApi';
import { DriverEarningsSummary, DriverPayout, Trip, Vehicle } from '../types';

export const useDriver = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earningsSummary, setEarningsSummary] = useState<DriverEarningsSummary | null>(null);
  const [driverTrips, setDriverTrips] = useState<Trip[]>([]);

  const fetchEarningsSummary = useCallback(async (driverId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await driversApi.getEarningsSummary(driverId);
      setLoading(false);
      if (res.data) {
        setEarningsSummary(res.data);
        return res.data;
      }
      return null;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to fetch earnings');
      return null;
    }
  }, []);

  const fetchDriverTrips = useCallback(async (driverId: string, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await driversApi.getTrips(driverId, status);
      setLoading(false);
      if (res.data) {
        setDriverTrips(res.data);
        return res.data;
      }
      return [];
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to fetch driver trips');
      return [];
    }
  }, []);

  const registerVehicle = useCallback(async (payload: CreateVehiclePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await vehiclesApi.create(payload);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Failed to register vehicle');
        return null;
      }
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Vehicle registration failed');
      return null;
    }
  }, []);

  const requestPayout = useCallback(async (driverId: string, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await driversApi.requestPayout(driverId, amount);
      setLoading(false);
      if (res.error || !res.data) {
        setError(res.error || 'Payout request failed');
        return null;
      }
      return res.data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Payout request error');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    earningsSummary,
    driverTrips,
    fetchEarningsSummary,
    fetchDriverTrips,
    registerVehicle,
    requestPayout,
  };
};
