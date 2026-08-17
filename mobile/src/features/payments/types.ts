export type PaymentMethodType = 'wallet' | 'upi' | 'card' | 'cash';

export interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
}

export interface PaymentDetails {
  bookingId: string;
  tripId: string;
  amount: number;
  currency: string;
  baseFare: number;
  platformFee: number;
  discount: number;
  netPayable: number;
}
