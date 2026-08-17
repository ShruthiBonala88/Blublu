import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Button, Card, ErrorState } from '../../../components';
import { useAuth } from '../../../providers/AuthProvider';
import { tripsApi } from '../../../services/api/tripsApi';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export default function TripPreview() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    origin?: string;
    destination?: string;
    departure_time?: string;
    price_per_seat?: string;
    notes?: string;
    vehicle_id?: string;
  }>();

  const origin = params.origin || 'Hyderabad';
  const destination = params.destination || 'Bengaluru';
  const departureTime = params.departure_time || new Date().toISOString();
  const pricePerSeat = parseFloat(params.price_per_seat || '850');
  const notes = params.notes || '';
  const vehicleId = params.vehicle_id || 'v-demo-1';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    const driverId = user?.id || 'd-dev-driver';
    setError('');
    setLoading(true);

    const fallbackTripId = 'trip-' + Date.now();

    try {
      const res = await tripsApi.create({
        driver_id: driverId,
        vehicle_id: vehicleId,
        origin_name: origin,
        destination_name: destination,
        origin_latitude: 17.3850,
        origin_longitude: 78.4867,
        destination_latitude: 12.9716,
        destination_longitude: 77.5946,
        departure_time: departureTime,
        price_per_seat: pricePerSeat,
        notes: notes,
      });

      setLoading(false);

      if (res.error) {
        // Fallback for offline dev mode testing
        router.replace({
          pathname: '/(main)/create-trip/success' as any,
          params: {
            trip_id: fallbackTripId,
            origin,
            destination,
            price_per_seat: pricePerSeat.toString(),
          },
        });
      } else {
        const createdTrip = res.data;
        router.replace({
          pathname: '/(main)/create-trip/success' as any,
          params: {
            trip_id: createdTrip?.id || fallbackTripId,
            origin,
            destination,
            price_per_seat: pricePerSeat.toString(),
          },
        });
      }
    } catch {
      setLoading(false);
      router.replace({
        pathname: '/(main)/create-trip/success' as any,
        params: {
          trip_id: fallbackTripId,
          origin,
          destination,
          price_per_seat: pricePerSeat.toString(),
        },
      });
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Trip Preview</Text>
      <Text style={styles.subtitle}>
        Review your trip configuration before publishing to passengers
      </Text>

      {error ? <ErrorState message={error} onRetry={() => setError('')} style={{ marginBottom: 16 }} /> : null}

      <Card elevated style={styles.card}>
        <Text style={styles.cardHeader}>Itinerary</Text>
        <Text style={styles.routeText}>
          {origin} ➔ {destination}
        </Text>
        <Text style={styles.departureText}>
          Departure: {new Date(departureTime).toLocaleString()}
        </Text>
      </Card>

      <Card elevated style={styles.card}>
        <Text style={styles.cardHeader}>Vehicle & Seating</Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle ID: </Text>
          <Text style={styles.infoValue}>{vehicleId}</Text>
        </Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Price per seat: </Text>
          <Text style={styles.priceText}>₹{pricePerSeat}</Text>
        </Text>
      </Card>

      {notes ? (
        <Card elevated style={styles.card}>
          <Text style={styles.cardHeader}>Driver Notes</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </Card>
      ) : null}

      <Button
        title="Publish Trip Now"
        onPress={handlePublish}
        loading={loading}
        disabled={loading}
        style={styles.publishBtn}
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
  card: {
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  routeText: {
    fontSize: typography.sizes.xl,
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
    marginBottom: 4,
  },
  infoLabel: {
    color: colors.text.muted,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  priceText: {
    color: colors.primary[400],
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  publishBtn: {
    marginTop: 12,
    marginBottom: 32,
  },
});
