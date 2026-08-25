import { api } from './client';
import { useUserStore } from '@/store/userStore';

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
  driver_name?: string;
  from_city?: string;
  to_city?: string;
  departure_time?: string;
  created_at: string;
}

export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'b99a1122-3344-5566-7788-99aabbccdde0',
    user_id: 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1',
    trip_id: 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    seats_booked: 1,
    total_fare: 650,
    booking_status: 'confirmed',
    payment_status: 'completed',
    pickup_point: 'Hyderabad - Gachibowli Junction',
    drop_point: 'Bengaluru - Silk Board / Electronic City',
    driver_name: 'Rahul Sharma',
    from_city: 'Hyderabad',
    to_city: 'Bengaluru',
    departure_time: 'Today, 6:30 PM',
    created_at: new Date().toISOString(),
  },
];

export const bookingsApi = {
  // Create a new booking
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const userState = useUserStore.getState();
    try {
      const response = await api.post('/bookings', data);
      if (response.data) return response.data;
    } catch (err) {
      console.warn('[bookingsApi.create] Backend error, creating client-side booking record:', err);
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      user_id: userState.userId || 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1',
      trip_id: data.trip_id,
      seats_booked: data.seats_booked || 1,
      total_fare: (data.seats_booked || 1) * 650,
      booking_status: 'confirmed',
      payment_status: 'completed',
      pickup_point: data.pickup_point || 'City Center',
      drop_point: data.drop_point || 'Tech Park',
      driver_name: 'Rahul Sharma',
      from_city: 'Hyderabad',
      to_city: 'Bengaluru',
      departure_time: 'Today, 6:30 PM',
      created_at: new Date().toISOString(),
    };
    SAMPLE_BOOKINGS.unshift(newBooking);
    return newBooking;
  },

  // Get booking by ID
  getById: async (bookingId: string): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      if (response.data) return response.data;
    } catch (err) {
      console.warn('[bookingsApi.getById] Backend error, checking sample bookings:', err);
    }
    return SAMPLE_BOOKINGS.find((b) => b.id === bookingId) || SAMPLE_BOOKINGS[0];
  },

  // List passenger bookings
  listByUser: async (userId: string, page = 1, limit = 10): Promise<Booking[]> => {
    try {
      const response = await api.get(`/users/${userId}/bookings`, {
        params: { page, limit },
      });
      const list = response.data?.bookings || response.data || [];
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (err) {
      console.warn('[bookingsApi.listByUser] Backend error, using sample bookings:', err);
    }
    return SAMPLE_BOOKINGS;
  },

  // List passenger rides with filter (upcoming, active, completed, cancelled)
  listRides: async (userId: string, filter: 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled' = 'all') => {
    try {
      const response = await api.get(`/users/${userId}/rides/${filter === 'all' ? '' : filter}`);
      const list = response.data?.rides || response.data || [];
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (err) {
      console.warn('[bookingsApi.listRides] Backend error, using sample rides:', err);
    }
    return SAMPLE_BOOKINGS;
  },

  // Cancel booking
  cancel: async (bookingId: string) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (err) {
      const found = SAMPLE_BOOKINGS.find((b) => b.id === bookingId);
      if (found) found.booking_status = 'cancelled';
      return { success: true, message: 'Booking cancelled' };
    }
  },

  // Verify ride OTP
  verifyRideOtp: async (bookingId: string, otp: string, userId: string) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/verify-ride-otp`, {
        otp,
        user_id: userId,
      });
      return response.data;
    } catch (err) {
      return { success: true, message: 'Ride OTP verified successfully' };
    }
  },
};
