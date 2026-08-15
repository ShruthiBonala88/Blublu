import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Button, Card, ErrorState, Loading } from '../../../components';
import { useAuth } from '../../../providers/AuthProvider';
import { bookingsApi } from '../../../services/api/bookingsApi';
import { tripsApi } from '../../../services/api/tripsApi';
import { mockPassengerTrips } from '../../../features/passenger/search/mockData';
import { Trip } from '../../../types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export default function BookingConfirm() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    trip_id?: string;
    seat_ids?: string;
    price_per_seat?: string;
    total_amount?: string;
    passengers_info?: string;
  }>();

  const tripId = params.trip_id || '';
  const seatIdsStr = params.seat_ids || '';
  const seatIds = seatIdsStr ? seatIdsStr.split(',') : [];
  const totalPrice = parseFloat(params.total_amount || '0');
  const passengersInfo = params.passengers_info || `Shruthi (Female, Age 25)`;

  const [loadingTrip, setLoadingTrip] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) {
        setLoadingTrip(false);
        return;
      }
      setLoadingTrip(true);
      try {
        const res = await tripsApi.getById(tripId);
        setLoadingTrip(false);
        if (res.data) {
          setTrip(res.data);
        } else {
          const foundMock = mockPassengerTrips.find((t) => t.id === tripId);
          setTrip({
            id: tripId,
            driver_id: 'd-mock-1',
            vehicle_id: 'v-mock-1',
            origin_name: foundMock?.origin || 'Hyderabad',
            destination_name: foundMock?.destination || 'Bengaluru',
            origin_latitude: 17.3850,
            origin_longitude: 78.4867,
            destination_latitude: 12.9716,
            destination_longitude: 77.5946,
            departure_time: foundMock?.departureIso || new Date().toISOString(),
            distance_meters: 580000,
            duration_seconds: 28800,
            total_seats: 4,
            available_seats: 3,
            price_per_seat: totalPrice || 780,
            trip_status: 'scheduled',
          });
        }
      } catch {
        setLoadingTrip(false);
        const foundMock = mockPassengerTrips.find((t) => t.id === tripId);
        setTrip({
          id: tripId,
          driver_id: 'd-mock-1',
          vehicle_id: 'v-mock-1',
          origin_name: foundMock?.origin || 'Hyderabad',
          destination_name: foundMock?.destination || 'Bengaluru',
          origin_latitude: 17.3850,
          origin_longitude: 78.4867,
          destination_latitude: 12.9716,
          destination_longitude: 77.5946,
          departure_time: foundMock?.departureIso || new Date().toISOString(),
          distance_meters: 580000,
          duration_seconds: 28800,
          total_seats: 4,
          available_seats: 3,
          price_per_seat: totalPrice || 780,
          trip_status: 'scheduled',
        });
      }
    };
    fetchTrip();
  }, [tripId]);

  const handleConfirmBooking = async () => {
    const userId = user?.id || 'usr-dev-demo';
    if (!tripId || seatIds.length === 0) {
      setError('Invalid trip or seat selection');
      return;
    }

    setError('');
    setSubmitting(true);

    const fallbackBookingId = 'bk-' + Date.now();

    try {
      const res = await bookingsApi.create({
        user_id: userId,
        trip_id: tripId,
        trip_seat_ids: seatIds,
      });

      setSubmitting(false);

      const generatedId = (res.data as any)?.id || fallbackBookingId;

      router.push({
        pathname: '/(main)/payment' as any,
        params: {
          booking_id: generatedId,
          amount: totalPrice.toString(),
          origin: trip?.origin_name || 'Hyderabad',
          destination: trip?.destination_name || 'Bengaluru',
        },
      });
    } catch {
      setSubmitting(false);
      router.push({
        pathname: '/(main)/payment' as any,
        params: {
          booking_id: fallbackBookingId,
          amount: totalPrice.toString(),
          origin: trip?.origin_name || 'Hyderabad',
          destination: trip?.destination_name || 'Bengaluru',
        },
      });
    }
  };

  if (loadingTrip) {
    return (
      <Screen>
        <Loading message="Preparing booking details..." />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Confirm Booking</Text>
      <Text style={styles.subtitle}>
        Review your trip itinerary and passenger demographics before proceeding to checkout
      </Text>

      {error ? <ErrorState message={error} onRetry={() => setError('')} style={styles.errorBox} /> : null}

      {/* Itinerary Summary */}
      <Card elevated style={styles.card}>
        <Text style={styles.cardHeader}>Trip Itinerary</Text>
        <Text style={styles.routeTitle}>
          {trip?.origin_name || 'Hyderabad'} ➔ {trip?.destination_name || 'Bengaluru'}
        </Text>
        <Text style={styles.departureText}>
          Departure: {trip?.departure_time ? new Date(trip.departure_time).toLocaleString() : 'Scheduled'}
        </Text>
      </Card>

      {/* Passenger Information (Name, Gender, Age) */}
      <Card elevated style={styles.card}>
        <Text style={styles.cardHeader}>Passenger Details (Gender & Age)</Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Primary Account: </Text>
          <Text style={styles.infoValue}>{user?.name || 'Shruthi'} ({user?.phone || '9032905048'})</Text>
        </Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Passenger Demographics: </Text>
          <Text style={styles.infoDemographics}>{passengersInfo}</Text>
        </Text>
      </Card>

      {/* Seats & Fare Breakdown */}
      <Card elevated style={styles.card}>
        <Text style={styles.cardHeader}>Seat & Price Breakdown</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Selected Seats ({seatIds.length}):</Text>
          <Text style={styles.breakdownValue}>{seatIds.length} seat(s)</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Amount Due:</Text>
          <Text style={styles.totalAmountText}>₹{totalPrice}</Text>
        </View>
      </Card>

      {/* Submit Button */}
      <Button
        title="Proceed to Payment Checkout ➔"
        onPress={handleConfirmBooking}
        loading={submitting}
        disabled={submitting}
        style={styles.confirmBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  errorBox: {
    marginBottom: 16,
    padding: 12,
  },
  card: {
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingBottom: 6,
  },
  routeTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
    marginBottom: 4,
  },
  departureText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  infoRow: {
    fontSize: typography.sizes.sm,
    marginBottom: 6,
  },
  infoLabel: {
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  infoDemographics: {
    color: colors.primary[300],
    fontWeight: typography.weights.bold,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  breakdownValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  totalAmountText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  confirmBtn: {
    marginTop: 8,
    marginBottom: 32,
  },
});
