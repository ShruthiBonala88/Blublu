import { apiClient } from './client';

export interface RouteCalculationPayload {
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
}

export const mapsApi = {
  calculateRoute: (payload: RouteCalculationPayload) => {
    return apiClient.post('/api/v1/route/calculate', payload);
  },
};
