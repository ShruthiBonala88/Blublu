import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Loading } from '../../../components';
import { SearchHeader } from './components/SearchHeader';
import { SearchForm } from './components/SearchForm';
import { PopularSearches } from './components/PopularSearches';
import { FilterBar } from './components/FilterBar';
import { RideCard } from './components/RideCard';
import { EmptySearchState } from './components/EmptySearchState';
import { mockPassengerTrips, mockPopularRoutes } from './mockData';
import { PassengerSearchFilters } from './types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export const PassengerSearchScreen: React.FC = () => {
  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState('Bengaluru');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  const [filters, setFilters] = useState<PassengerSearchFilters>({
    timeOfDay: 'all',
    sortBy: 'departure_asc',
    vehicleType: 'all',
    minRating: 0,
  });

  const handleSearchTrigger = () => {
    setLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  const handleSelectPopularRoute = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
    handleSearchTrigger();
  };

  const handleFilterChange = (updated: Partial<PassengerSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      timeOfDay: 'all',
      sortBy: 'departure_asc',
      vehicleType: 'all',
      minRating: 0,
    });
  };

  // Filter & sort mock trips dynamically
  const filteredTrips = useMemo(() => {
    let list = mockPassengerTrips.filter((t) => {
      const matchOrigin =
        !origin || t.origin.toLowerCase().includes(origin.toLowerCase().trim());
      const matchDest =
        !destination || t.destination.toLowerCase().includes(destination.toLowerCase().trim());
      const matchVehicle =
        filters.vehicleType === 'all' || t.vehicleType === filters.vehicleType;

      return matchOrigin && matchDest && matchVehicle;
    });

    if (filters.sortBy === 'price_asc') {
      list.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    } else if (filters.sortBy === 'rating_desc') {
      list.sort((a, b) => b.driverRating - a.driverRating);
    } else {
      list.sort(
        (a, b) =>
          new Date(a.departureIso).getTime() - new Date(b.departureIso).getTime()
      );
    }

    return list;
  }, [origin, destination, filters]);

  return (
    <Screen style={styles.container} scrollable>
      {/* 1. Header */}
      <SearchHeader title="Find a Ride" />

      {/* 2. Search Form */}
      <SearchForm
        origin={origin}
        destination={destination}
        date={date}
        passengers={passengers}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onDateChange={setDate}
        onPassengersChange={setPassengers}
        onSearch={handleSearchTrigger}
      />

      {/* 3. Popular Route Shortcuts */}
      <PopularSearches
        routes={mockPopularRoutes}
        onSelectRoute={handleSelectPopularRoute}
      />

      {/* 4. Results Header & Filter Bar */}
      <View style={styles.resultsHeaderRow}>
        <Text style={styles.resultsTitle}>Available Rides</Text>
        <Text style={styles.resultsCountText}>
          {filteredTrips.length} ride{filteredTrips.length === 1 ? '' : 's'} available
        </Text>
      </View>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* 5. Results List or Loading / Empty States */}
      {loading ? (
        <Loading message="Searching available rides..." />
      ) : filteredTrips.length === 0 ? (
        <EmptySearchState
          origin={origin}
          destination={destination}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <View style={styles.tripsList}>
          {filteredTrips.map((trip) => (
            <RideCard
              key={trip.id}
              trip={trip}
              passengerCount={passengers}
            />
          ))}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  resultsCountText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  tripsList: {
    marginBottom: 32,
  },
});
