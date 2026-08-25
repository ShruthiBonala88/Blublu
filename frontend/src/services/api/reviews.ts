import { api } from './client';

export interface RateDriverPayload {
  rating: number; // 1 to 5
  feedback?: string;
}

export interface RatePassengerPayload {
  rating: number; // 1 to 5
  feedback?: string;
}

export const reviewsApi = {
  // Passenger rates Driver for booking
  rateDriver: async (bookingId: string, data: RateDriverPayload) => {
    const response = await api.post(`/bookings/${bookingId}/rating`, data);
    return response.data;
  },

  // Driver rates Passenger for booking
  ratePassenger: async (bookingId: string, data: RatePassengerPayload) => {
    const response = await api.post(`/driver/bookings/${bookingId}/rating`, data);
    return response.data;
  },

  // Get user reviews
  getUserReviews: async (userId: string, page = 1, limit = 10) => {
    const response = await api.get(`/users/${userId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get driver rating summary
  getDriverRatingSummary: async (driverId: string) => {
    const response = await api.get(`/drivers/${driverId}/rating`);
    return response.data;
  },

  // Get driver reviews
  getDriverReviews: async (driverId: string, page = 1, limit = 10) => {
    const response = await api.get(`/drivers/${driverId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },
};
