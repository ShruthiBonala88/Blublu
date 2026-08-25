import { create } from 'zustand';

export type UserRole = 'passenger' | 'driver' | 'admin';

export interface VehicleInfo {
  id?: string;
  name: string;
  type: string;
  seats: string;
  number: string;
  color: string;
}

export interface VehicleItem {
  id: string;
  name: string;
  type: string;
  seats: string;
  number: string;
  color: string;
  active: boolean;
}

export interface UserState {
  role: UserRole;
  phone: string;
  isLoggedIn: boolean;
  token: string | null;
  userId: string;
  driverId: string;

  // Passenger profile info
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;

  // Driver profile info
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  vehicle: VehicleInfo;
  vehicles: VehicleItem[];

  // Actions
  setAuth: (data: { token?: string; userId?: string; role?: UserRole; phone?: string; email?: string; name?: string }) => void;
  setToken: (token: string | null) => void;
  setUserId: (userId: string) => void;
  setDriverId: (driverId: string) => void;
  setRole: (role: UserRole) => void;
  setPhone: (phone: string) => void;
  setPassengerProfile: (data: Partial<{ name: string; phone: string; email: string }>) => void;
  setDriverProfile: (data: Partial<{ name: string; phone: string; email: string }>) => void;
  setVehicle: (vehicle: Partial<VehicleInfo>) => void;
  addVehicle: (vehicle: Omit<VehicleItem, 'id' | 'active'> & { id?: string; active?: boolean }) => void;
  updateVehicle: (id: string, updated: Partial<VehicleItem>) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  logout: () => void;
}

// Fixed default UUIDs for reliable standalone development/testing
const DEFAULT_USER_ID = 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1';
const DEFAULT_DRIVER_ID = 'd8b4b445-b199-4ee4-a8d6-e6d8c9d8b2d0';
const DEFAULT_VEHICLE_ID = 'c7a3a334-a088-4dd3-97c5-d5c7b8c7a1c9';

export const useUserStore = create<UserState>((set) => ({
  role: 'passenger',
  phone: '',
  isLoggedIn: false,
  token: null,
  userId: '',
  driverId: '',

  passengerName: '',
  passengerPhone: '',
  passengerEmail: '',

  driverName: '',
  driverPhone: '',
  driverEmail: '',

  vehicle: {
    id: DEFAULT_VEHICLE_ID,
    name: 'Hyundai Creta',
    type: 'SUV',
    seats: '4 seats',
    number: 'TS 09 AB 1234',
    color: 'White',
  },

  vehicles: [
    {
      id: DEFAULT_VEHICLE_ID,
      name: 'Hyundai Creta',
      number: 'TS 09 AB 1234',
      type: 'SUV',
      seats: '4 seats',
      color: 'White',
      active: true,
    },
    {
      id: 'b6929223-9f77-4cc2-86b4-c4b6a7b6a0b8',
      name: 'Honda City',
      number: 'TS 10 CD 5678',
      type: 'Sedan',
      seats: '4 seats',
      color: 'Grey',
      active: false,
    },
  ],

  setAuth: (data) =>
    set((state) => ({
      isLoggedIn: true,
      token: data.token !== undefined ? data.token : state.token,
      userId: data.userId || state.userId,
      role: data.role || state.role,
      phone: data.phone || state.phone,
      passengerPhone: data.phone || state.passengerPhone,
      driverPhone: data.phone || state.driverPhone,
      passengerEmail: data.email || state.passengerEmail,
      passengerName: data.name || state.passengerName,
    })),

  setToken: (token) => set({ token }),
  setUserId: (userId) => set({ userId }),
  setDriverId: (driverId) => set({ driverId }),

  setRole: (role) => set({ role }),
  setPhone: (phone) =>
    set({
      phone,
      passengerPhone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      driverPhone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
    }),
  setPassengerProfile: (data) =>
    set((state) => ({
      passengerName: data.name ?? state.passengerName,
      passengerPhone: data.phone ?? state.passengerPhone,
      passengerEmail: data.email ?? state.passengerEmail,
    })),
  setDriverProfile: (data) =>
    set((state) => ({
      driverName: data.name ?? state.driverName,
      driverPhone: data.phone ?? state.driverPhone,
      driverEmail: data.email ?? state.driverEmail,
    })),
  setVehicle: (newVehicle) =>
    set((state) => ({
      vehicle: { ...state.vehicle, ...newVehicle },
    })),
  addVehicle: (newVehicle) =>
    set((state) => {
      const isFirst = state.vehicles.length === 0;
      const shouldBeActive = newVehicle.active ?? isFirst;
      const vehicleItem: VehicleItem = {
        id: newVehicle.id || Date.now().toString(),
        name: newVehicle.name.trim(),
        type: newVehicle.type.trim(),
        seats: newVehicle.seats.trim(),
        number: newVehicle.number.trim(),
        color: (newVehicle.color || 'White').trim(),
        active: shouldBeActive,
      };

      const updatedVehicles = shouldBeActive
        ? state.vehicles.map((v) => ({ ...v, active: false })).concat(vehicleItem)
        : [...state.vehicles, vehicleItem];

      return {
        vehicles: updatedVehicles,
        vehicle: shouldBeActive
          ? {
              id: vehicleItem.id,
              name: vehicleItem.name,
              type: vehicleItem.type,
              seats: vehicleItem.seats,
              number: vehicleItem.number,
              color: vehicleItem.color,
            }
          : state.vehicle,
      };
    }),
  updateVehicle: (id, updated) =>
    set((state) => {
      const updatedVehicles = state.vehicles.map((v) => {
        if (v.id !== id) {
          return updated.active ? { ...v, active: false } : v;
        }
        return { ...v, ...updated };
      });

      const activeVeh = updatedVehicles.find((v) => v.active) || updatedVehicles[0];
      return {
        vehicles: updatedVehicles,
        vehicle: activeVeh
          ? {
              id: activeVeh.id,
              name: activeVeh.name,
              type: activeVeh.type,
              seats: activeVeh.seats,
              number: activeVeh.number,
              color: activeVeh.color,
            }
          : state.vehicle,
      };
    }),
  deleteVehicle: (id) =>
    set((state) => {
      const remaining = state.vehicles.filter((v) => v.id !== id);
      let updatedVehicles = remaining;
      let activeVeh = remaining.find((v) => v.active);

      if (!activeVeh && remaining.length > 0) {
        remaining[0].active = true;
        activeVeh = remaining[0];
        updatedVehicles = [...remaining];
      }

      return {
        vehicles: updatedVehicles,
        vehicle: activeVeh
          ? {
              id: activeVeh.id,
              name: activeVeh.name,
              type: activeVeh.type,
              seats: activeVeh.seats,
              number: activeVeh.number,
              color: activeVeh.color,
            }
          : state.vehicle,
      };
    }),
  setActiveVehicle: (id) =>
    set((state) => {
      const updatedVehicles = state.vehicles.map((v) => ({
        ...v,
        active: v.id === id,
      }));
      const activeVeh = updatedVehicles.find((v) => v.id === id);
      return {
        vehicles: updatedVehicles,
        vehicle: activeVeh
          ? {
              id: activeVeh.id,
              name: activeVeh.name,
              type: activeVeh.type,
              seats: activeVeh.seats,
              number: activeVeh.number,
              color: activeVeh.color,
            }
          : state.vehicle,
      };
    }),
  logout: () =>
    set({
      isLoggedIn: false,
      token: null,
    }),
}));
