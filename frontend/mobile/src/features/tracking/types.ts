export interface TrackingLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed_kmh?: number;
  updated_at: string;
}

export interface TripTrackingState {
  trip_id: string;
  driver_name: string;
  driver_phone: string;
  driver_rating: number;
  vehicle_model: string;
  vehicle_number: string;
  origin_name: string;
  destination_name: string;
  current_location: TrackingLocation;
  origin_coords: { latitude: number; longitude: number };
  destination_coords: { latitude: number; longitude: number };
  distance_remaining_km: number;
  estimated_time_remaining: string;
  status: 'on_the_way' | 'arriving' | 'in_transit' | 'completed';
}
