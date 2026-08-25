import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams();
  const bookingId = (params.bookingId as string) || 'BLU-2026-00125';
  const from = (params.from as string) || 'Hyderabad';
  const to = (params.to as string) || 'Bengaluru';
  const seat = (params.seat as string) || '1A';
  const price = (params.price as string) || '650';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Apple Success Badge */}
        <View style={styles.successCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.title}>
          Booking Confirmed!
        </Text>

        <Text style={styles.subtitle}>
          Your ride from {from} to {to} has been successfully reserved.
        </Text>

        {/* Ticket Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.label}>BOOKING ID</Text>
              <Text style={styles.bookingId}>{bookingId}</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>✓ Confirmed</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Route</Text>
            <Text style={styles.rowValue}>{from} → {to}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date & Time</Text>
            <Text style={styles.rowValue}>Today, 6:30 PM</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Driver</Text>
            <Text style={styles.rowValue}>Rahul Sharma (⭐ 4.9)</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Seat</Text>
            <Text style={[styles.rowValue, styles.seatValue]}>Seat {seat}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Amount Paid</Text>
            <Text style={styles.price}>₹{price}</Text>
          </View>
        </View>

        {/* Arrival note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={styles.infoText}>
            Your boarding pass is ready. Please arrive at the pickup spot 10 minutes before departure.
          </Text>
        </View>

        {/* Buttons (Apple Pill) */}
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/trips')}
        >
          <Text style={styles.primaryText}>
            View My Trips
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.secondaryText}>
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Apple Canvas
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#34C759', // Apple Green
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(52, 199, 89, 0.35)',
      },
      default: {
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },

  check: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
    color: '#86868B',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
  },

  bookingId: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  verifiedTag: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  verifiedTagText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  rowLabel: {
    fontSize: 13,
    color: '#86868B',
  },

  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
    maxWidth: '60%',
    textAlign: 'right',
  },

  seatValue: {
    color: '#0071E3',
    fontWeight: '800',
  },

  price: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#86868B',
  },

  primaryButton: {
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

  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },

  secondaryText: {
    color: '#0071E3',
    fontSize: 15,
    fontWeight: '700',
  },
});