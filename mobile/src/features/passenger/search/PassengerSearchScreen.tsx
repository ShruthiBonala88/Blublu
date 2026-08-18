import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Loading } from '../../../components';
import { SearchHeader } from './components/SearchHeader';
import { SearchForm } from './components/SearchForm';
import { PopularSearches } from './components/PopularSearches';
import { FilterBar } from './components/FilterBar';
import { RideCard } from './components/RideCard';
import { EmptySearchState } from './components/EmptySearchState';
import { mockPassengerTrips, mockPopularRoutes } from './mockData';
import { PassengerSearchFilters, PassengerTripCard } from './types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { tripsApi } from '../../../services/api/tripsApi';

export const PassengerSearchScreen: React.FC = () => {
  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState('Bengaluru');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [liveTrips, setLiveTrips] = useState<PassengerTripCard[]>([]);

  const fetchLiveTrips = async (orig: string, dest: string, dateStr: string) => {
    setLoading(true);
    try {
      const res = await tripsApi.search({ origin: orig, destination: dest, date: dateStr });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: PassengerTripCard[] = res.data.map((t: any) => ({
          id: t.id,
          driverName: t.driver_name || 'Verified Driver',
          driverRating: 4.8,
          driverPhoto: undefined,
          vehicleMakeModel: t.vehicle_model || 'Standard Sedan',
          vehicleType: t.vehicle_type || 'car',
          isAc: true,
          origin: t.origin_name || orig,
          destination: t.destination_name || dest,
          departureIso: t.departure_time || new Date().toISOString(),
          departureTimeText: '10:00 AM',
          estimatedDurationText: '3h 30m',
          availableSeats: t.available_seats || 4,
          totalSeats: 4,
          pricePerSeat: t.price_per_seat || 350,
          genderPreference: 'any',
        }));
        setLiveTrips(mapped);
      } else {
        setLiveTrips([]);
      }
    } catch {
      setLiveTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTrips(origin, destination, date);
  }, []);

  const handleSearchTrigger = () => {
    fetchLiveTrips(origin, destination, date);
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

  // Filter & sort trips dynamically
  const filteredTrips = useMemo(() => {
    const sourceList = liveTrips.length > 0 ? liveTrips : mockPassengerTrips;
    let list = sourceList.filter((t) => {
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
  }, [origin, destination, filters, liveTrips]);

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
