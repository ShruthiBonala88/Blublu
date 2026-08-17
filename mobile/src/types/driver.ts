export interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  license_expiry_date: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_verified: boolean;
  total_rides: number;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  vehicle_type: string;
  make: string;
  model: string;
  manufacture_year?: number;
  registration_number: string;
  total_seats: number;
}

export interface DriverEarningsSummary {
  driver_id: string;
  gross_earnings: number;
  platform_fees: number;
  net_earnings: number;
  pending_amount: number;
  payable_amount: number;
  paid_amount: number;
  currency: string;
}

export interface DriverEarning {
  id: string;
  driver_id: string;
  trip_id: string;
  booking_id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DriverPayout {
  id: string;
  driver_id: string;
  amount: number;
  currency: string;
  status: 'requested' | 'processing' | 'approved' | 'processed' | 'rejected';
  payment_reference?: string;
  failure_reason?: string;
  requested_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEarnings {
  data: DriverEarning[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedPayouts {
  data: DriverPayout[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
