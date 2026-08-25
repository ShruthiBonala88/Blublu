import { api } from './client';

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  // Create payment order for booking
  createOrder: async (bookingId: string): Promise<CreateOrderResponse> => {
    const response = await api.post(`/bookings/${bookingId}/payment/order`);
    return response.data;
  },

  // Get payment status for booking
  getPaymentByBooking: async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}/payment`);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (data: VerifyPaymentRequest) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },
};
