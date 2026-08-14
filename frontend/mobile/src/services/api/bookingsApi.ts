import { apiClient } from './client';
import { Booking } from '../../types';

export interface CreateBookingPayload {
  user_id: string;
  trip_id: string;
  trip_seat_ids: string[];
}

export interface CancelBookingPayload {
  user_id: string;
  reason?: string;
}

export const bookingsApi = {
  create: (payload: CreateBookingPayload) => {
    return apiClient.post<Booking>('/api/v1/bookings', payload);
  },
  getById: (bookingId: string) => {
    return apiClient.get<Booking>(`/api/v1/bookings/${bookingId}`);
  },
  cancel: (bookingId: string, payload: CancelBookingPayload) => {
    return apiClient.post<Booking>(`/api/v1/bookings/${bookingId}/cancel`, payload);
  },
  rateDriver: (bookingId: string, rating: number, comment?: string) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/rating`, { rating, comment });
  },
  verifyRideOtp: (bookingId: string, otp: string) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/verify-ride-otp`, { otp });
  },
  getPayment: (bookingId: string) => {
    return apiClient.get(`/api/v1/bookings/${bookingId}/payment`);
  },
  createPaymentOrder: (bookingId: string) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/payment/order`);
  },
};
