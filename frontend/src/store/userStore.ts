import { create } from 'zustand';

export type UserRole = 'passenger' | 'driver' | 'admin';

export interface VehicleInfo {
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
  setRole: (role: UserRole) => void;
  setPhone: (phone: string) => void;
  setPassengerProfile: (data: Partial<{ name: string; phone: string; email: string }>) => void;
  setDriverProfile: (data: Partial<{ name: string; phone: string; email: string }>) => void;
  setVehicle: (vehicle: Partial<VehicleInfo>) => void;
  addVehicle: (vehicle: Omit<VehicleItem, 'id' | 'active'> & { active?: boolean }) => void;
  updateVehicle: (id: string, updated: Partial<VehicleItem>) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  role: 'passenger',
  phone: '+91 98765 43210',
  isLoggedIn: true,

  passengerName: 'Vaishnavi',
  passengerPhone: '+91 98765 43210',
  passengerEmail: 'vaishnavi@example.com',

  driverName: 'BLUBLU Driver',
  driverPhone: '+91 98765 43210',
  driverEmail: 'driver@blublu.com',

  vehicle: {
    name: 'Hyundai Creta',
    type: 'SUV',
    seats: '4 seats',
    number: 'TS 09 AB 1234',
    color: 'White',
  },

  vehicles: [
    {
      id: '1',
      name: 'Hyundai Creta',
      number: 'TS 09 AB 1234',
      type: 'SUV',
      seats: '4 seats',
      color: 'White',
      active: true,
    },
    {
      id: '2',
      name: 'Honda City',
      number: 'TS 10 CD 5678',
      type: 'Sedan',
      seats: '4 seats',
      color: 'Grey',
      active: false,
    },
  ],

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
        id: Date.now().toString(),
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
    }),
}));
