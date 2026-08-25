import { api } from './client';

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  total_seats: number;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  total_seats: number;
  is_verified: boolean;
  created_at: string;
}

export const vehiclesApi = {
  create: async (data: CreateVehicleRequest): Promise<Vehicle> => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  listSeats: async (vehicleId: string) => {
    const response = await api.get(`/vehicles/${vehicleId}/seats`);
    return response.data;
  },
};
