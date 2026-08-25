import { api } from './client';

export interface AdminDashboardMetrics {
  total_users: number;
  total_drivers: number;
  total_trips: number;
  total_bookings: number;
  total_revenue: number;
  active_trips: number;
}

export const adminApi = {
  // Get admin overview metrics
  getDashboard: async (): Promise<AdminDashboardMetrics> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get paginated users
  getUsers: async (page = 1, limit = 20, search?: string, roleFilter?: string) => {
    const response = await api.get('/admin/users', {
      params: { page, limit, search, role: roleFilter },
    });
    return response.data;
  },

  // Get paginated drivers
  getDrivers: async (page = 1, limit = 20) => {
    const response = await api.get('/admin/drivers', {
      params: { page, limit },
    });
    return response.data;
  },

  // Approve driver
  approveDriver: async (driverId: string) => {
    const response = await api.post(`/admin/drivers/${driverId}/approve`);
    return response.data;
  },

  // Reject driver
  rejectDriver: async (driverId: string) => {
    const response = await api.post(`/admin/drivers/${driverId}/reject`);
    return response.data;
  },

  // Process payout
  processPayout: async (payoutId: string) => {
    const response = await api.post(`/admin/payouts/${payoutId}/process`);
    return response.data;
  },

  // Reject payout
  rejectPayout: async (payoutId: string) => {
    const response = await api.post(`/admin/payouts/${payoutId}/reject`);
    return response.data;
  },
};
