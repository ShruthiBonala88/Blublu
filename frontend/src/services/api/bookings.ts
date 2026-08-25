import { api } from './client';

export interface CreateBookingRequest {
  trip_id: string;
  seats_booked: number;
  pickup_point?: string;
  drop_point?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  seats_booked: number;
  total_fare: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  pickup_point?: string;
  drop_point?: string;
  created_at: string;
}

export const bookingsApi = {
  // Create a new booking
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  // Get booking by ID
  getById: async (bookingId: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // List passenger bookings
  listByUser: async (userId: string, page = 1, limit = 10) => {
    const response = await api.get(`/users/${userId}/bookings`, {
      params: { page, limit },
    });
    return response.data;
  },

  // List passenger rides with filter (upcoming, active, completed, cancelled)
  listRides: async (userId: string, filter: 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled' = 'all') => {
    const response = await api.get(`/users/${userId}/rides/${filter === 'all' ? '' : filter}`);
    return response.data;
  },

  // Cancel booking
  cancel: async (bookingId: string) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Verify ride OTP
  verifyRideOtp: async (bookingId: string, otp: string, userId: string) => {
    const response = await api.post(`/bookings/${bookingId}/verify-ride-otp`, {
      otp,
      user_id: userId,
    });
    return response.data;
  },
};
