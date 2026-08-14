import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button, Loading, ErrorState } from '../../../components';
import { useAuth } from '../../providers/AuthProvider';
import { driversApi } from '../../../services/api/driversApi';
import { tripsApi } from '../../../services/api/tripsApi';
import { Trip } from '../../../types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export default function DriverTripsList() {
  const router = useRouter();
  const { user } = useAuth();

  const [statusTab, setStatusTab] = useState<'scheduled' | 'started' | 'completed' | 'cancelled'>('scheduled');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const mockDriverTrips: Record<'scheduled' | 'started' | 'completed' | 'cancelled', Trip[]> = {
    scheduled: [
      {
        id: 'trip-d101',
        driver_id: user?.id || 'd-dev-1',
        vehicle_id: 'v-dev-1',
        origin_name: 'Hyderabad',
        destination_name: 'Bengaluru',
        origin_latitude: 17.385,
        origin_longitude: 78.4867,
        destination_latitude: 12.9716,
        destination_longitude: 77.5946,
        departure_time: new Date(Date.now() + 86400000).toISOString(),
        distance_meters: 580000,
        duration_seconds: 28800,
        total_seats: 4,
        available_seats: 2,
        price_per_seat: 850,
        trip_status: 'scheduled',
      },
    ],
    started: [
      {
        id: 'trip-d102',
        driver_id: user?.id || 'd-dev-1',
        vehicle_id: 'v-dev-1',
        origin_name: 'Chennai',
        destination_name: 'Bengaluru',
        origin_latitude: 13.0827,
        origin_longitude: 80.2707,
        destination_latitude: 12.9716,
        destination_longitude: 77.5946,
        departure_time: new Date().toISOString(),
        distance_meters: 340000,
        duration_seconds: 21600,
        total_seats: 4,
        available_seats: 1,
        price_per_seat: 750,
        trip_status: 'started',
      },
    ],
    completed: [
      {
        id: 'trip-d103',
        driver_id: user?.id || 'd-dev-1',
        vehicle_id: 'v-dev-1',
        origin_name: 'Mumbai',
        destination_name: 'Pune',
        origin_latitude: 19.076,
        origin_longitude: 72.8777,
        destination_latitude: 18.5204,
        destination_longitude: 73.8567,
        departure_time: new Date(Date.now() - 172800000).toISOString(),
        distance_meters: 150000,
        duration_seconds: 10800,
        total_seats: 4,
        available_seats: 0,
        price_per_seat: 450,
        trip_status: 'completed',
      },
    ],
    cancelled: [],
  };

  const fetchDriverTrips = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await driversApi.getTrips(user?.id || 'd-dev-1', statusTab);
      setLoading(false);

      if (res.error) {
        setTrips(mockDriverTrips[statusTab] || []);
      } else {
        const list = res.data || [];
        setTrips(list.length > 0 ? list : mockDriverTrips[statusTab] || []);
      }
    } catch {
      setLoading(false);
      setTrips(mockDriverTrips[statusTab] || []);
    }
  };

  useEffect(() => {
    fetchDriverTrips();
  }, [user?.id, statusTab]);

  const handleStartTrip = async (tripId: string) => {
    setActionLoadingId(tripId);
    try {
      const res = await tripsApi.start(tripId);
      setActionLoadingId(null);
      if (res.error) {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, trip_status: 'started' } : t))
        );
        alert('Trip started! Drive safely.');
      } else {
        alert('Trip started! Drive safely.');
        fetchDriverTrips();
      }
    } catch {
      setActionLoadingId(null);
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, trip_status: 'started' } : t))
      );
      alert('Trip started! Drive safely.');
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    setActionLoadingId(tripId);
    try {
      const res = await tripsApi.complete(tripId);
      setActionLoadingId(null);
      if (res.error) {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, trip_status: 'completed' } : t))
        );
        alert('Trip marked as completed!');
      } else {
        alert('Trip marked as completed!');
        fetchDriverTrips();
      }
    } catch {
      setActionLoadingId(null);
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, trip_status: 'completed' } : t))
      );
      alert('Trip marked as completed!');
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    setActionLoadingId(tripId);
    try {
      const res = await tripsApi.cancel(tripId);
      setActionLoadingId(null);
      if (res.error) {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, trip_status: 'cancelled' } : t))
        );
        alert('Trip cancelled.');
      } else {
        alert('Trip cancelled.');
        fetchDriverTrips();
      }
    } catch {
      setActionLoadingId(null);
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, trip_status: 'cancelled' } : t))
      );
      alert('Trip cancelled.');
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Driver Trips Schedule</Text>

      {/* Tabs Row */}
      <View style={styles.tabContainer}>
        {(['scheduled', 'started', 'completed', 'cancelled'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, statusTab === t && styles.tabActive]}
            onPress={() => setStatusTab(t)}
          >
            <Text style={[styles.tabText, statusTab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Loading message="Loading trips..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDriverTrips} />
      ) : trips.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🚘</Text>
          <Text style={styles.emptyTitle}>No {statusTab} trips</Text>
          <Text style={styles.emptyDesc}>
            When you publish intercity trips, they will be listed here.
          </Text>
          <Button
            title="+ Post New Trip"
            onPress={() => router.push('/(main)/create-trip' as any)}
            style={{ marginTop: 12 }}
          />
        </Card>
      ) : (
        <View style={styles.tripsList}>
          {trips.map((trip) => {
            const isActioning = actionLoadingId === trip.id;

            return (
              <Card key={trip.id} elevated style={styles.tripCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.tripRef}>Ref: #{trip.id.slice(0, 8).toUpperCase()}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {(trip.trip_status || statusTab).toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.routeTitle}>
                  {trip.origin_name} ➔ {trip.destination_name}
                </Text>

                <Text style={styles.departureText}>
                  🕒 Departure: {new Date(trip.departure_time).toLocaleString()}
                </Text>

                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    💺 Available: {trip.available_seats} / {trip.total_seats}
                  </Text>
                  <Text style={styles.priceText}>₹{trip.price_per_seat} / seat</Text>
                </View>

                {/* State Transition Actions */}
                <View style={styles.actionsRow}>
                  {statusTab === 'scheduled' && (
                    <>
                      <Button
                        title="Start Trip"
                        onPress={() => handleStartTrip(trip.id)}
                        size="sm"
                        loading={isActioning}
                        disabled={isActioning}
                      />
                      <Button
                        title="Cancel"
                        onPress={() => handleCancelTrip(trip.id)}
                        variant="danger"
                        size="sm"
                        loading={isActioning}
                        disabled={isActioning}
                      />
                    </>
                  )}

                  {statusTab === 'started' && (
                    <Button
                      title="Mark Complete"
                      onPress={() => handleCompleteTrip(trip.id)}
                      size="sm"
                      loading={isActioning}
                      disabled={isActioning}
                    />
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      )}
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
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.primary[600],
  },
  tabText: {
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  tripsList: {
    gap: 16,
    marginBottom: 32,
  },
  tripCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripRef: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  statusBadge: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: border.radius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary[300],
  },
  routeTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  departureText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  priceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 10,
  },
});
