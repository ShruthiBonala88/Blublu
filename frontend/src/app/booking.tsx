import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { bookingsApi } from '@/services/api';

export default function BookingScreen() {
  const params = useLocalSearchParams();
  const tripId = (params.tripId as string) || 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const from = (params.from as string) || 'Hyderabad';
  const to = (params.to as string) || 'Bengaluru';
  const seatLabel = (params.seatLabel as string) || (params.seat as string) || '1A';
  const price = (params.price as string) || '650';

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const booking = await bookingsApi.create({
        trip_id: tripId,
        seats_booked: 1,
        pickup_point: `${from} - Central Junction`,
        drop_point: `${to} - Tech Hub`,
      });

      router.push({
        pathname: '/confirmation',
        params: {
          bookingId: booking.id,
          tripId,
          from,
          to,
          seat: seatLabel,
          price,
        },
      });
    } catch (err: any) {
      console.error('Booking failed:', err);
      Alert.alert('Booking Error', err?.response?.data?.error || 'Unable to create booking on backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Confirm Booking</Text>

          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.heading}>Review your trip</Text>
        <Text style={styles.subtitle}>
          Check details before confirming your 1-Tap reservation.
        </Text>

        {/* Trip Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Route & Schedule</Text>
            <View style={styles.directTag}>
              <Text style={styles.directTagText}>Direct</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={styles.routeDots}>
              <View style={styles.blueDot} />
              <View style={styles.line} />
              <View style={styles.greenDot} />
            </View>

            <View style={styles.routeDetails}>
              <View>
                <Text style={styles.city}>Hyderabad</Text>
                <Text style={styles.time}>6:30 PM • Gachibowli Junction</Text>
              </View>

              <Text style={styles.duration}>⏱ 5h 30m non-stop journey</Text>

              <View>
                <Text style={styles.city}>Bengaluru</Text>
                <Text style={styles.time}>12:00 AM • Silk Board / Electronic City</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Driver</Text>

          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Rahul Sharma</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ 4.9</Text>
                <Text style={styles.verifiedDot}>•</Text>
                <Text style={styles.verifiedText}>Verified Driver</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reservation Details</Text>

          <InfoRow label="Travel Date" value="Today, 24 Aug" />
          <InfoRow label="Departure" value="6:30 PM" />
          <InfoRow label="Selected Seat" value={`Seat ${seatLabel}`} highlight />
          <InfoRow label="Passengers" value="1 Adult" />
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>

          <InfoRow label="1x Co-traveller Seat" value={`₹${price}`} />
          <InfoRow label="Platform & Booking Fee" value="₹0 (Free)" />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.total}>₹{price}</Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By confirming this booking, you agree to BLUBLU{"'"}s terms and ride policies.
        </Text>

        <Pressable
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>
            Confirm Booking • ₹{price}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Apple Canvas
  },

  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 14,
    color: '#86868B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  directTag: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  directTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0071E3',
  },

  routeRow: {
    flexDirection: 'row',
  },

  routeDots: {
    width: 18,
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 3,
  },

  blueDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#0071E3',
  },

  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#34C759',
  },

  line: {
    width: 2,
    height: 48,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },

  routeDetails: {
    flex: 1,
  },

  city: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  time: {
    marginTop: 1,
    fontSize: 12,
    color: '#86868B',
  },

  duration: {
    marginVertical: 6,
    fontSize: 11,
    color: '#0071E3',
    fontWeight: '600',
  },

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  avatarText: {
    fontSize: 20,
  },

  driverInfo: {
    marginLeft: 12,
  },

  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },

  rating: {
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '600',
  },

  verifiedDot: {
    color: '#86868B',
  },

  verifiedText: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 13,
    color: '#86868B',
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  infoValueHighlight: {
    color: '#0071E3',
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  total: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  terms: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 18,
    color: '#86868B',
    textAlign: 'center',
  },

  confirmButton: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});