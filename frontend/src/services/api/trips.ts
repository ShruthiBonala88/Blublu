import { api } from './client';

export interface TripSearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  seats?: number;
}

export interface CreateTripRequest {
  vehicle_id: string;
  origin: string;
  destination: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  notes?: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  origin: string;
  destination: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export const tripsApi = {
  // Search available trips
  search: async (params: TripSearchParams): Promise<Trip[]> => {
    const response = await api.get('/trips/search', { params });
    return response.data?.trips || response.data || [];
  },

  // Get trip by ID
  getById: async (tripId: string): Promise<Trip> => {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  },

  // Create a new trip (Driver / Admin)
  create: async (data: CreateTripRequest): Promise<Trip> => {
    const response = await api.post('/trips', data);
    return response.data;
  },

  // Get trip route geometry and polyline
  getRoute: async (tripId: string) => {
    const response = await api.get(`/trips/${tripId}/route`);
    return response.data;
  },

  // Start trip
  start: async (tripId: string) => {
    const response = await api.post(`/trips/${tripId}/start`);
    return response.data;
  },

  // Complete trip
  complete: async (tripId: string) => {
    const response = await api.post(`/trips/${tripId}/complete`);
    return response.data;
  },

  // Cancel trip
  cancel: async (tripId: string) => {
    const response = await api.post(`/trips/${tripId}/cancel`);
    return response.data;
  },

  // List driver trips
  listByDriver: async (driverId: string): Promise<Trip[]> => {
    const response = await api.get(`/drivers/${driverId}/trips`);
    return response.data?.trips || response.data || [];
  },
};
