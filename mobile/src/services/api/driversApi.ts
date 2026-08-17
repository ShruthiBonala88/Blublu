import { apiClient } from './client';
import {
  Driver,
  DriverEarningsSummary,
  PaginatedEarnings,
  PaginatedPayouts,
  DriverPayout,
  Trip,
} from '../../types';

export interface CreateDriverPayload {
  user_id: string;
  license_number: string;
  license_expiry_date: string; // YYYY-MM-DD
}

export const driversApi = {
  create: (payload: CreateDriverPayload) => {
    return apiClient.post<Driver>('/api/v1/drivers', payload);
  },
  getEarningsSummary: (driverId: string) => {
    return apiClient.get<DriverEarningsSummary>(`/api/v1/drivers/${driverId}/earnings/summary`);
  },
  getEarningsHistory: (driverId: string) => {
    return apiClient.get<PaginatedEarnings>(`/api/v1/drivers/${driverId}/earnings`);
  },
  getPayouts: (driverId: string) => {
    return apiClient.get<PaginatedPayouts>(`/api/v1/drivers/${driverId}/payouts`);
  },
  requestPayout: (driverId: string, amount: number) => {
    return apiClient.post<DriverPayout>(`/api/v1/drivers/${driverId}/payouts`, { amount });
  },
  getPayoutById: (driverId: string, payoutId: string) => {
    return apiClient.get<DriverPayout>(`/api/v1/drivers/${driverId}/payouts/${payoutId}`);
  },
  getRatingSummary: (driverId: string) => {
    return apiClient.get(`/api/v1/drivers/${driverId}/rating`);
  },
  getReviews: (driverId: string) => {
    return apiClient.get(`/api/v1/drivers/${driverId}/reviews`);
  },
  getTrips: (driverId: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<Trip[]>(`/api/v1/drivers/${driverId}/trips${query}`);
  },
  getTripById: (driverId: string, tripId: string) => {
    return apiClient.get<Trip>(`/api/v1/drivers/${driverId}/trips/${tripId}`);
  },
};
