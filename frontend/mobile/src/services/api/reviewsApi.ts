import { apiClient } from './client';

export const reviewsApi = {
  ratePassenger: (bookingId: string, rating: number, comment?: string) => {
    return apiClient.post(`/api/v1/driver/bookings/${bookingId}/rating`, { rating, comment });
  },
  updateRating: (ratingId: string, rating: number, comment?: string) => {
    return apiClient.put(`/api/v1/ratings/${ratingId}`, { rating, comment });
  },
};
