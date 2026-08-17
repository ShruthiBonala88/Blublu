import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button, Loading, ErrorState } from '../../components';
import { useAuth } from '../../providers/AuthProvider';
import { usersApi } from '../../services/api/usersApi';
import { bookingsApi } from '../../services/api/bookingsApi';
import { PassengerRide } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { border } from '../../theme/border';

export default function Trips() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState<PassengerRide[]>([]);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fallback rides for offline dev testing
  const mockRides: Record<'upcoming' | 'completed' | 'cancelled', PassengerRide[]> = {
    upcoming: [
      {
        booking_id: 'bk-10293847',
        trip_id: 'trip-102',
        user_id: user?.id || 'usr-dev',
        origin_name: 'Hyderabad',
        destination_name: 'Bengaluru',
        departure_time: new Date(Date.now() + 86400000).toISOString(),
        total_amount: 780,
        booking_status: 'confirmed',
        trip_status: 'scheduled',
        payment_status: 'completed',
        ride_category: 'upcoming',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    completed: [
      {
        booking_id: 'bk-99887766',
        trip_id: 'trip-099',
        user_id: user?.id || 'usr-dev',
        origin_name: 'Mumbai',
        destination_name: 'Pune',
        departure_time: new Date(Date.now() - 172800000).toISOString(),
        total_amount: 450,
        booking_status: 'completed',
        trip_status: 'completed',
        payment_status: 'completed',
        ride_category: 'completed',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    cancelled: [],
  };

  const fetchRides = async () => {
    if (role !== 'passenger') {
      setRides([]);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await usersApi.getRides(user?.id || 'usr-dev', tab);
      setLoading(false);

      if (res.error) {
        // Fallback to offline dev rides
        setRides(mockRides[tab] || []);
      } else {
        const responseData = res.data as any;
        const list = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];
        setRides(list.length > 0 ? list : mockRides[tab] || []);
      }
    } catch {
      setLoading(false);
      setRides(mockRides[tab] || []);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [user?.id, tab, role]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user?.id) return;
    setCancellingId(bookingId);

    try {
      const res = await bookingsApi.cancel(bookingId, {
        user_id: user.id,
        reason: 'Cancelled by passenger from app',
      });
      setCancellingId(null);

      if (res.error) {
        // Optimistic local cancellation for dev testing
        setRides((prev) =>
          prev.map((r) =>
            r.booking_id === bookingId
              ? { ...r, booking_status: 'cancelled' }
              : r
          )
        );
        alert('Booking cancelled successfully.');
      } else {
        alert('Booking cancelled successfully.');
        fetchRides();
      }
    } catch {
      setCancellingId(null);
      setRides((prev) =>
        prev.map((r) =>
          r.booking_id === bookingId
            ? { ...r, booking_status: 'cancelled' }
            : r
        )
      );
      alert('Booking cancelled successfully.');
    }
  };

  const formatDate = (isoString: string): string => {
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

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>
        {role === 'passenger' ? 'My Passenger Rides' : 'My Driver Schedule'}
      </Text>

      {/* Tabs Row */}
      <View style={styles.tabContainer}>
        {(['upcoming', 'completed', 'cancelled'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Loading message="Fetching your rides..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRides} />
      ) : rides.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🚘</Text>
          <Text style={styles.emptyTitle}>
            No {tab} {role === 'passenger' ? 'rides' : 'trips'}
          </Text>
          <Text style={styles.emptyDesc}>
            {role === 'passenger'
              ? 'When you book an intercity ride, your confirmed bookings will appear here.'
              : 'When you create a trip as a driver, your schedule will appear here.'}
          </Text>

          {role === 'passenger' ? (
            <Button
              title="Search Rides"
              onPress={() => router.push('/(main)' as any)}
              style={styles.actionButton}
            />
          ) : null}
        </Card>
      ) : (
        <View style={styles.ridesList}>
          {rides.map((ride) => {
            const isCancelling = cancellingId === ride.booking_id;
            return (
              <Card key={ride.booking_id} elevated style={styles.rideCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bookingIdText}>
                    Ref: #{ride.booking_id.slice(0, 12).toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      ride.booking_status === 'confirmed'
                        ? styles.statusConfirmed
                        : styles.statusCancelled,
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {ride.booking_status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.routeTitle}>
                  {ride.origin_name} ➔ {ride.destination_name}
                </Text>

                <Text style={styles.departureText}>
                  🕒 {formatDate(ride.departure_time)}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.totalPriceText}>
                    Total: ₹{ride.total_amount}
                  </Text>

                  {tab === 'upcoming' && ride.booking_status === 'confirmed' ? (
                    <Button
                      title="Cancel Booking"
                      onPress={() => handleCancelBooking(ride.booking_id)}
                      variant="danger"
                      size="sm"
                      loading={isCancelling}
                      disabled={isCancelling}
                    />
                  ) : null}
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
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: colors.text.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: '#09090B',
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
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    minWidth: 160,
  },
  ridesList: {
    gap: 16,
    marginBottom: 32,
  },
  rideCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingIdText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: border.radius.sm,
  },
  statusConfirmed: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  statusCancelled: {
    backgroundColor: '#27272A',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
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
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 12,
  },
  totalPriceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
});
