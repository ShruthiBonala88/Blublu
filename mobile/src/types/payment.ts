export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_reference?: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentOrder {
  order_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  key_id?: string;
}
