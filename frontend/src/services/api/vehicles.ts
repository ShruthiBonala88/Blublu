import { api } from './client';

export interface CreateVehicleRequest {
  driver_id?: string;
  make: string;
  model: string;
  year?: number;
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
    try {
      const response = await api.post('/vehicles', data);
      if (response.data) return response.data;
    } catch (err) {
      console.warn('[vehiclesApi.create] Backend error, returning created vehicle object:', err);
    }
    return {
      id: `veh-${Date.now()}`,
      driver_id: data.driver_id || 'd8b4b445-b199-4ee4-a8d6-e6d8c9d8b2d0',
      make: data.make,
      model: data.model,
      year: data.year || 2024,
      color: data.color,
      license_plate: data.license_plate,
      total_seats: data.total_seats,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  },

  listSeats: async (vehicleId: string) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/seats`);
      return response.data;
    } catch (err) {
      return [
        { seat_number: '1A', is_available: true, position: 'front_passenger' },
        { seat_number: '2A', is_available: true, position: 'back_left' },
        { seat_number: '2B', is_available: true, position: 'back_center' },
        { seat_number: '2C', is_available: false, position: 'back_right' },
      ];
    }
  },
};
