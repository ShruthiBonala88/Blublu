export interface DriverProfileInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  rating: number;
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

export interface TodayOverviewData {
  todayEarnings: number;
  completedTrips: number;
  totalPassengers: number;
  rating: number;
}

export interface DriverUpcomingTripData {
  id: string;
  date: string; // e.g. "18 Aug 2026"
  origin: string;
  destination: string;
  departureTime: string; // e.g. "08:00 AM"
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
}

export interface DriverEarningsSummaryData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  currency: string;
}
