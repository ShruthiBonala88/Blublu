import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Button, Card, Loading, ErrorState, HighwayCostCalculator } from '../../../components';
import { tripsApi } from '../../../services/api/tripsApi';
import { mockPassengerTrips } from '../../../features/passenger/search/mockData';
import { Trip } from '../../../types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export default function TripDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; passengers?: string }>();
  const rawTripId = params.id;
  const tripId = rawTripId || 'trip-102';
  const passengerCount = parseInt(params.passengers || '1', 10);

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');

  const fetchTripDetails = async () => {
    setLoading(true);
    setError('');

    const defaultMock = mockPassengerTrips.find((t) => t.id === tripId) || mockPassengerTrips[0];
    const fallbackTripObj: Trip = {
      id: defaultMock.id,
      driver_id: 'd-mock-1',
      vehicle_id: 'v-mock-1',
      origin_name: defaultMock.origin,
      destination_name: defaultMock.destination,
      origin_latitude: 17.3850,
      origin_longitude: 78.4867,
      destination_latitude: 12.9716,
      destination_longitude: 77.5946,
      departure_time: defaultMock.departureIso,
      estimated_arrival_time: defaultMock.departureIso,
      distance_meters: 580000,
      duration_seconds: 28800,
      total_seats: defaultMock.totalSeats,
      available_seats: defaultMock.availableSeats,
      price_per_seat: defaultMock.pricePerSeat,
      trip_status: 'scheduled',
      notes: 'Clean AC vehicle, 1 luggage allowed per seat.',
    };

    try {
      const res = await tripsApi.getById(tripId);
      setLoading(false);

      if (res.data) {
        setTrip(res.data);
      } else {
        setTrip(fallbackTripObj);
      }
    } catch {
      setLoading(false);
      setTrip(fallbackTripObj);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  if (loading) {
    return (
      <Screen>
        <Loading message="Loading trip details..." />
      </Screen>
    );
  }

  if (error || !trip) {
    return (
      <Screen style={styles.container}>
        <ErrorState message={error || 'Trip not found'} onRetry={fetchTripDetails} />
        <Button
          title="Back to Search"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </Screen>
    );
  }

  const formatDateTime = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const distanceKm = Math.round(trip.distance_meters / 1000) || 580;
  const durationHrs = Math.floor(trip.duration_seconds / 3600) || 8;
  const durationMins = Math.floor((trip.duration_seconds % 3600) / 60) || 30;

  return (
    <Screen style={styles.container} scrollable>
      {/* Route & Header Summary */}
      <Card elevated style={styles.heroCard}>
        <Text style={styles.routeHeader}>
          {trip.origin_name} ➔ {trip.destination_name}
        </Text>
        <Text style={styles.departureTimeText}>
          Departure: {formatDateTime(trip.departure_time)}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distanceKm} km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Est. Duration</Text>
            <Text style={styles.statValue}>
              {durationHrs}h {durationMins}m
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Available Seats</Text>
            <Text style={styles.statValue}>{trip.available_seats}</Text>
          </View>
        </View>
      </Card>

      {/* Driver Information Card */}
      <Card elevated style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Driver Information</Text>

        <View style={styles.driverRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>Verified Driver</Text>
            <Text style={styles.driverMeta}>Government ID & License Verified ✅</Text>
            <Text style={styles.ratingStars}>⭐ 4.9 (48 ratings)</Text>
          </View>
        </View>
      </Card>

      {/* Vehicle Details Card */}
      <Card elevated style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>

        <View style={styles.vehicleRow}>
          <Text style={styles.vehicleIcon}>🚘</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleModel}>Comfort AC Sedan / SUV</Text>
            <Text style={styles.vehicleMeta}>
              Total Capacity: {trip.total_seats} seats • Clean & sanitized
            </Text>
          </View>
        </View>
      </Card>

      {/* 🛣️ Interactive FASTag Toll & Fuel Split Calculator Component */}
      <HighwayCostCalculator
        origin={trip.origin_name}
        destination={trip.destination_name}
        distanceKm={distanceKm}
        initialSeats={trip.total_seats}
      />

      {/* Notes / Ride Rules */}
      {trip.notes ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Trip Notes & Rules</Text>
          <Text style={styles.notesText}>{trip.notes}</Text>
        </Card>
      ) : null}

      {/* Price Breakdown Footer */}
      <Card elevated style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price per seat:</Text>
          <Text style={styles.priceValue}>₹{trip.price_per_seat}</Text>
        </View>
        <Text style={styles.priceSubtext}>
          Total for {passengerCount} passenger{passengerCount > 1 ? 's' : ''}: ₹
          {trip.price_per_seat * passengerCount}
        </Text>

        <Button
          title="Select Seats"
          onPress={() =>
            router.push({
              pathname: '/(main)/seat-selection/[id]' as any,
              params: {
                id: trip.id,
                vehicle_id: trip.vehicle_id,
                price: trip.price_per_seat.toString(),
                passengers: passengerCount.toString(),
              },
            })
          }
          style={styles.actionBtn}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  backButton: {
    marginTop: 16,
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
  },
  routeHeader: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  departureTimeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.lg,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.subtle,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
    fontSize: 22,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  driverMeta: {
    fontSize: typography.sizes.xs,
    color: colors.status.success,
    marginBottom: 2,
  },
  ratingStars: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIcon: {
    fontSize: 32,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  vehicleMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  priceCard: {
    padding: 20,
    marginBottom: 32,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  priceSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 16,
  },
  actionBtn: {
    marginTop: 4,
  },
});
