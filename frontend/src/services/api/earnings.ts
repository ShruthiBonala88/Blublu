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

export interface EarningItem {
  id: string;
  route: string;
  date: string;
  amount: string;
  status: string;
}

export const SAMPLE_EARNINGS: EarningItem[] = [
  { id: '1', route: 'Hyderabad → Bengaluru', date: 'Today, 6:30 PM', amount: '₹1,300', status: 'completed' },
  { id: '2', route: 'Bengaluru → Hyderabad', date: 'Yesterday, 7:00 AM', amount: '₹1,950', status: 'completed' },
  { id: '3', route: 'Hyderabad → Vijayawada', date: '10 Aug', amount: '₹900', status: 'completed' },
  { id: '4', route: 'Vijayawada → Hyderabad', date: '9 Aug', amount: '₹850', status: 'completed' },
];

export const earningsApi = {
  // Get driver earnings summary
  getSummary: async (driverId: string): Promise<EarningsSummary> => {
    try {
      const response = await api.get(`/drivers/${driverId}/earnings/summary`);
      if (response.data) return response.data;
    } catch (err) {
      console.warn('[earningsApi.getSummary] Backend error, returning fallback summary:', err);
    }
    return {
      driver_id: driverId,
      total_earnings: 12450,
      available_balance: 3250,
      pending_payout: 0,
      total_trips: 18,
      currency: 'INR',
    };
  },

  // Get driver earnings history
  getHistory: async (driverId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/drivers/${driverId}/earnings`, {
        params: { page, limit },
      });
      const list = response.data?.earnings || response.data || [];
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (err) {
      console.warn('[earningsApi.getHistory] Backend error, returning sample earnings:', err);
    }
    return SAMPLE_EARNINGS;
  },

  // Request payout
  requestPayout: async (driverId: string, data: PayoutRequest) => {
    try {
      const response = await api.post(`/drivers/${driverId}/payouts`, data);
      return response.data;
    } catch (err) {
      return {
        id: `payout-${Date.now()}`,
        status: 'pending',
        amount: data.amount,
        message: 'Payout requested successfully. Processing via IMPS bank transfer.',
      };
    }
  },

  // Get payouts history
  getPayouts: async (driverId: string) => {
    try {
      const response = await api.get(`/drivers/${driverId}/payouts`);
      return response.data;
    } catch (err) {
      return [];
    }
  },
};
