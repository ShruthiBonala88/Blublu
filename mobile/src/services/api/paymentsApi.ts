import { apiClient } from './client';

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}

export const paymentsApi = {
  createOrder: (bookingId: string) => {
    return apiClient.post(`/api/v1/bookings/${bookingId}/payment/order`);
  },
  verifyPayment: (payload: VerifyPaymentPayload) => {
    return apiClient.post('/api/v1/payments/verify', payload);
  },
};
