import { api } from './client';

export interface EarningsSummary {
  driver_id: string;
  total_earnings: number;
  available_balance: number;
  pending_payout: number;
  total_trips: number;
  currency: string;
}

export interface PayoutRequest {
  amount: number;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

export const earningsApi = {
  // Get driver earnings summary
  getSummary: async (driverId: string): Promise<EarningsSummary> => {
    const response = await api.get(`/drivers/${driverId}/earnings/summary`);
    return response.data;
  },

  // Get driver earnings history
  getHistory: async (driverId: string, page = 1, limit = 10) => {
    const response = await api.get(`/drivers/${driverId}/earnings`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Request payout
  requestPayout: async (driverId: string, data: PayoutRequest) => {
    const response = await api.post(`/drivers/${driverId}/payouts`, data);
    return response.data;
  },

  // Get payouts history
  getPayouts: async (driverId: string) => {
    const response = await api.get(`/drivers/${driverId}/payouts`);
    return response.data;
  },
};
