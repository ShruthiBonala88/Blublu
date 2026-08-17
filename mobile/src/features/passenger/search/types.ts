export interface PassengerTrip {
  id: string;
  driverName: string;
  driverAvatar?: string;
  driverRating: number;
  totalRides: number;
  isVerifiedDriver: boolean;
  origin: string;
  destination: string;
  departureTime: string;
  departureIso: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  vehicleType: 'Sedan' | 'SUV' | 'EV' | 'Luxury' | string;
  vehicleModel: string;
}

export interface PassengerSearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface PassengerSearchFilters {
  timeOfDay: 'all' | 'morning' | 'afternoon' | 'evening';
  sortBy: 'departure_asc' | 'price_asc' | 'rating_desc';
  vehicleType: 'all' | 'Sedan' | 'SUV' | 'EV';
  minRating: number;
}

export interface PopularRoute {
  id: string;
  origin: string;
  destination: string;
  priceEstimate: number;
}
