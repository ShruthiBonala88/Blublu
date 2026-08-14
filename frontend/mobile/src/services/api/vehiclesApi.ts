import { apiClient } from './client';
import { VehicleSeat, Vehicle } from '../../types';

export interface CreateVehiclePayload {
  driver_id: string;
  vehicle_type: string;
  make: string;
  model: string;
  manufacture_year?: number;
  registration_number: string;
  total_seats: number;
}

export const vehiclesApi = {
  create: (payload: CreateVehiclePayload) => {
    return apiClient.post<Vehicle>('/api/v1/vehicles', payload);
  },
  getSeats: (vehicleId: string) => {
    return apiClient.get<VehicleSeat[]>(`/api/v1/vehicles/${vehicleId}`);
  },
};
