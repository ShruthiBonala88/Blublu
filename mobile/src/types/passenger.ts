export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  origin_name: string;
  destination_name: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  departure_time: string;
  estimated_arrival_time?: string;
  distance_meters: number;
  duration_seconds: number;
  total_seats: number;
  available_seats: number;
  price_per_seat: number;
  trip_status: 'scheduled' | 'started' | 'completed' | 'cancelled';
  notes?: string;
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleSeat {
  id: string;
  vehicle_id: string;
  seat_number: number;
  seat_position: 'front_passenger' | 'rear_left' | 'rear_center' | 'rear_right' | string;
  is_window_seat: boolean;
  is_available: boolean;
}

export interface BookingSeat {
  id?: string;
  booking_id?: string;
  trip_seat_id: string;
  seat_number?: number;
  seat_position?: string;
  is_window_seat: boolean;
  price: number;
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  booking_status: 'confirmed' | 'cancelled' | 'completed';
  payment_status?: string;
  total_amount: number;
  seats: BookingSeat[];
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
  origin_name?: string;
  destination_name?: string;
  departure_time?: string;
}

export interface PassengerRide {
  booking_id: string;
  trip_id: string;
  user_id: string;
  seat_number?: number;
  seat_position?: string;
  is_window_seat?: boolean;
  seats?: BookingSeat[];
  origin_name: string;
  destination_name: string;
  departure_time: string;
  price_per_seat?: number;
  total_amount: number;
  booking_status: string;
  trip_status: string;
  payment_status: string;
  ride_category: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
