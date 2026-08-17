import { apiClient } from './client';
import { Trip } from '../../types';

export interface CreateTripPayload {
  driver_id: string;
  vehicle_id: string;
  origin_name: string;
  destination_name: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  departure_time: string;
  price_per_seat: number;
  notes?: string;
}

export interface TripSearchParams {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
}

export const tripsApi = {
  create: (payload: CreateTripPayload) => {
    return apiClient.post<Trip>('/api/v1/trips', payload);
  },
  search: (params: TripSearchParams) => {
    const query = new URLSearchParams(params as unknown as Record<string, string>).toString();
    return apiClient.get<Trip[]>(`/api/v1/trips/search?${query}`);
  },
  getById: (tripId: string) => {
    return apiClient.get<Trip>(`/api/v1/trips/${tripId}`);
  },
  getRoute: (tripId: string) => {
    return apiClient.get(`/api/v1/trips/${tripId}/route`);
  },
  lockSeat: (tripId: string, seatId: string, userId: string) => {
    return apiClient.post(`/api/v1/trips/${tripId}/seats/${seatId}/lock`, { user_id: userId });
  },
  start: (tripId: string) => {
    return apiClient.post(`/api/v1/trips/${tripId}/start`);
  },
  complete: (tripId: string) => {
    return apiClient.post(`/api/v1/trips/${tripId}/complete`);
  },
  cancel: (tripId: string) => {
    return apiClient.post(`/api/v1/trips/${tripId}/cancel`);
  },
};
