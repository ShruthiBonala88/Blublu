import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Screen } from '../../../components';
import { HeaderSection } from './components/HeaderSection';
import { AvailabilityToggle } from './components/AvailabilityToggle';
import { OverviewSection } from './components/OverviewSection';
import { QuickActionsSection } from './components/QuickActionsSection';
import { UpcomingTripCard } from './components/UpcomingTripCard';
import { EarningsSummaryCard } from './components/EarningsSummaryCard';
import { SafetySection } from './components/SafetySection';
import {
  mockDriverProfile,
  mockTodayOverview,
  mockUpcomingTrip,
  mockEarningsSummary,
} from './mockData';

export const DriverDashboardScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(mockDriverProfile.isOnline);

  const handleToggleOnline = (newStatus: boolean) => {
    setIsOnline(newStatus);
  };

  return (
    <Screen style={styles.container} scrollable>
      {/* 1. Header Section */}
      <HeaderSection
        driverName={mockDriverProfile.name}
        isOnline={isOnline}
        avatarUrl={mockDriverProfile.avatarUrl}
      />

      {/* 2. Driver Availability Toggle */}
      <AvailabilityToggle
        isOnline={isOnline}
        onToggle={handleToggleOnline}
      />

      {/* 3. Today's Overview */}
      <OverviewSection overview={mockTodayOverview} />

      {/* 4. Quick Actions Grid */}
      <QuickActionsSection />

      {/* 5. Upcoming Trip Section */}
      <UpcomingTripCard trip={mockUpcomingTrip} />

      {/* 6. Earnings Summary Card */}
      <EarningsSummaryCard earnings={mockEarningsSummary} />

      {/* 7. Safety & SOS Section */}
      <SafetySection />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
});
