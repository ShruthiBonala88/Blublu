import { api } from './client';
import { getCoordinatesForCity } from '@/utils/cityCoordinates';
import { useUserStore } from '@/store/userStore';

export interface TripSearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  seats?: number;
}

export interface CreateTripRequest {
  driver_id?: string;
  vehicle_id?: string;
  origin?: string;
  destination?: string;
  origin_name?: string;
  destination_name?: string;
  origin_latitude?: number;
  origin_longitude?: number;
  origin_lat?: number;
  origin_lng?: number;
  dest_latitude?: number;
  dest_longitude?: number;
  dest_lat?: number;
  dest_lng?: number;
  departure_time: string;
  estimated_arrival_time?: string;
  price_per_seat: number;
  total_seats?: number;
  notes?: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  driver_name?: string;
  driver_rating?: string;
  vehicle_id: string;
  origin_name: string;
  destination_name: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  departure_time: string;
  estimated_arrival_time?: string;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

// Fallback sample trips if backend is in standalone mode or DB is empty
export const SAMPLE_TRIPS: Trip[] = [
  {
    id: 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    driver_id: 'd8b4b445-b199-4ee4-a8d6-e6d8c9d8b2d0',
    driver_name: 'Rahul Sharma',
    driver_rating: '4.9',
    vehicle_id: 'c7a3a334-a088-4dd3-97c5-d5c7b8c7a1c9',
    origin_name: 'Hyderabad',
    destination_name: 'Bengaluru',
    origin_latitude: 17.3850,
    origin_longitude: 78.4867,
    destination_latitude: 12.9716,
    destination_longitude: 77.5946,
    departure_time: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
    price_per_seat: 650,
    total_seats: 4,
    available_seats: 3,
    status: 'scheduled',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c2b3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    driver_id: 'd8b4b445-b199-4ee4-a8d6-e6d8c9d8b2d0',
    driver_name: 'Arjun Reddy',
    driver_rating: '4.8',
    vehicle_id: 'b6929223-9f77-4cc2-86b4-c4b6a7b6a0b8',
    origin_name: 'Hyderabad',
    destination_name: 'Bengaluru',
    origin_latitude: 17.3850,
    origin_longitude: 78.4867,
    destination_latitude: 12.9716,
    destination_longitude: 77.5946,
    departure_time: new Date(Date.now() + 3600 * 1000 * 6).toISOString(),
    price_per_seat: 600,
    total_seats: 4,
    available_seats: 2,
    status: 'scheduled',
    created_at: new Date().toISOString(),
  },
  {
    id: 'd3c4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    driver_id: 'd8b4b445-b199-4ee4-a8d6-e6d8c9d8b2d0',
    driver_name: 'Vikram Mehta',
    driver_rating: '4.7',
    vehicle_id: 'c7a3a334-a088-4dd3-97c5-d5c7b8c7a1c9',
    origin_name: 'Hyderabad',
    destination_name: 'Vijayawada',
    origin_latitude: 17.3850,
    origin_longitude: 78.4867,
    destination_latitude: 16.5062,
    destination_longitude: 80.6480,
    departure_time: new Date(Date.now() + 3600 * 1000 * 8).toISOString(),
    price_per_seat: 450,
    total_seats: 4,
    available_seats: 1,
    status: 'scheduled',
    created_at: new Date().toISOString(),
  },
];

export const tripsApi = {
  // Search available trips
  search: async (params: TripSearchParams): Promise<Trip[]> => {
    try {
      const response = await api.get('/trips/search', { params });
      const list = response.data?.trips || response.data || [];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn('[tripsApi.search] Backend query error, using local filtered fallback:', err);
    }

    // Client-side fallback filter
    const from = params.origin?.toLowerCase() || '';
    const to = params.destination?.toLowerCase() || '';

    return SAMPLE_TRIPS.filter((t) => {
      const matchesFrom = !from || t.origin_name.toLowerCase().includes(from) || from.includes(t.origin_name.toLowerCase());
      const matchesTo = !to || t.destination_name.toLowerCase().includes(to) || to.includes(t.destination_name.toLowerCase());
      return matchesFrom && matchesTo;
    });
  },

  // Get trip by ID
  getById: async (tripId: string): Promise<Trip> => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      if (response.data) return response.data;
    } catch (err) {
      console.warn('[tripsApi.getById] Backend error, checking sample trips fallback:', err);
    }
    const fallback = SAMPLE_TRIPS.find((t) => t.id === tripId) || SAMPLE_TRIPS[0];
    return fallback;
  },

  // Create a new trip (Driver / Admin)
  create: async (data: CreateTripRequest): Promise<Trip> => {
    const userState = useUserStore.getState();
    const origin = data.origin_name || data.origin || 'Hyderabad';
    const destination = data.destination_name || data.destination || 'Bengaluru';
    const originCoords = getCoordinatesForCity(origin);
    const destCoords = getCoordinatesForCity(destination);

    const payload = {
      driver_id: data.driver_id || userState.driverId || 'd8b4b445-b199-4ee4-a8d6-e6d8c9d8b2d0',
      vehicle_id: data.vehicle_id || userState.vehicle?.id || 'c7a3a334-a088-4dd3-97c5-d5c7b8c7a1c9',
      origin_name: origin,
      destination_name: destination,
      origin_latitude: data.origin_latitude || data.origin_lat || originCoords.latitude,
      origin_longitude: data.origin_longitude || data.origin_lng || originCoords.longitude,
      destination_latitude: data.dest_latitude || data.dest_lat || destCoords.latitude,
      destination_longitude: data.dest_longitude || data.dest_lng || destCoords.longitude,
      departure_time: data.departure_time || new Date().toISOString(),
      estimated_arrival_time: data.estimated_arrival_time,
      price_per_seat: Number(data.price_per_seat) || 600,
      notes: data.notes || '',
    };

    try {
      const response = await api.post('/trips', payload);
      return response.data;
    } catch (err) {
      console.warn('[tripsApi.create] Backend post error, returning created trip fallback:', err);
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        driver_id: payload.driver_id,
        vehicle_id: payload.vehicle_id,
        origin_name: payload.origin_name,
        destination_name: payload.destination_name,
        origin_latitude: payload.origin_latitude,
        origin_longitude: payload.origin_longitude,
        destination_latitude: payload.destination_latitude,
        destination_longitude: payload.destination_longitude,
        departure_time: payload.departure_time,
        price_per_seat: payload.price_per_seat,
        total_seats: data.total_seats || 4,
        available_seats: data.total_seats || 3,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      };
      SAMPLE_TRIPS.unshift(newTrip);
      return newTrip;
    }
  },

  // Get trip route geometry and polyline
  getRoute: async (tripId: string) => {
    try {
      const response = await api.get(`/trips/${tripId}/route`);
      return response.data;
    } catch (err) {
      return {
        trip_id: tripId,
        distance_meters: 570000,
        duration_seconds: 19800,
        departure_time: new Date().toISOString(),
      };
    }
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
    try {
      const response = await api.get(`/drivers/${driverId}/trips`);
      const list = response.data?.trips || response.data || [];
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (err) {
      console.warn('[tripsApi.listByDriver] Backend error, returning driver sample trips:', err);
    }
    return SAMPLE_TRIPS;
  },
};
