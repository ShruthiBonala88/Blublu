import {
  DriverProfileInfo,
  TodayOverviewData,
  DriverUpcomingTripData,
  DriverEarningsSummaryData,
} from './types';

export const mockDriverProfile: DriverProfileInfo = {
  id: 'driver-101',
  name: 'Vikram Singh',
  avatarUrl: undefined,
  isOnline: true,
  rating: 4.92,
  verificationStatus: 'verified',
};

export const mockTodayOverview: TodayOverviewData = {
  todayEarnings: 2850,
  completedTrips: 3,
  totalPassengers: 9,
  rating: 4.9,
};

export const mockUpcomingTrip: DriverUpcomingTripData = {
  id: 'trip-2026-088',
  date: 'Today, 18 Aug 2026',
  origin: 'Hyderabad (Hitec City)',
  destination: 'Bengaluru (Koramangala)',
  departureTime: '05:30 PM',
  availableSeats: 2,
  totalSeats: 4,
  pricePerSeat: 850,
};

export const mockEarningsSummary: DriverEarningsSummaryData = {
  today: 2850,
  thisWeek: 14200,
  thisMonth: 58600,
  currency: '₹',
};
