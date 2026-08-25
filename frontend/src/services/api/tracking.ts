import { api } from './client';

export interface LocationUpdatePayload {
  latitude: number;
  longitude: number;
  speed?: number;
  bearing?: number;
}

export const trackingApi = {
  // Driver updates live location for a trip
  updateLocation: async (tripId: string, data: LocationUpdatePayload) => {
    const response = await api.post(`/tracking/trips/${tripId}/location`, data);
    return response.data;
  },

  // Passenger / Driver gets live trip location
  getLocation: async (tripId: string) => {
    const response = await api.get(`/tracking/trips/${tripId}/location`);
    return response.data;
  },
};
