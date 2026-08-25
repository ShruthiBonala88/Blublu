import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';

export default function TripsScreen() {
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    date?: string;
    time?: string;
    price?: string;
    seats?: string;
  }>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Trips</Text>
            <Text style={styles.subtitle}>
              Manage your upcoming journeys & tickets
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>

        {/* Upcoming Trip Card */}
        <Text style={styles.sectionTitle}>Upcoming Journey</Text>

        <Pressable
          style={styles.tripCard}
          onPress={() => router.push('/trip-details')}
        >
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ CONFIRMED</Text>
            </View>

            <Text style={styles.bookingId}>BLU-2026-00125</Text>
          </View>

          {/* Route Graphic */}
          <View style={styles.routeContainer}>
            <View style={styles.routePoints}>
              <View style={styles.blueDot} />
              <View style={styles.line} />
              <View style={styles.greenDot} />
            </View>

            <View style={styles.routeInfo}>
              <View>
                <Text style={styles.city}>{params.from || 'Hyderabad'}</Text>
                <Text style={styles.time}>{params.time || 'Today, 6:30 PM'}</Text>
              </View>

              <Text style={styles.duration}>⏱ 5h 30m non-stop</Text>

              <View>
                <Text style={styles.city}>{params.to || 'Bengaluru'}</Text>
                <Text style={styles.time}>12:00 AM</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Driver & Price */}
          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Rahul Sharma</Text>
              <Text style={styles.rating}>⭐ 4.9 • Verified Driver</Text>
            </View>

            <Text style={styles.price}>{params.price ? `₹${params.price}` : '₹650'}</Text>
          </View>

          <View style={styles.tripButton}>
            <Text style={styles.tripButtonText}>View Boarding Ticket →</Text>
          </View>
        </Pressable>

        {/* Previous Trips Section */}
        <Text style={styles.sectionTitle}>Previous Trips</Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🧳</Text>
          <Text style={styles.emptyTitle}>No past trips yet</Text>
          <Text style={styles.emptyText}>
            Your completed journeys will automatically archive here.
          </Text>
        </View>

        {/* Find Ride CTA */}
        <Pressable
          style={styles.findButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.findButtonText}>Find Another Ride</Text>
        </Pressable>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#86868B',
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },

  profileIcon: {
    fontSize: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '800',
  },

  bookingId: {
    fontSize: 11,
    color: '#86868B',
    fontWeight: '600',
  },

  routeContainer: {
    flexDirection: 'row',
    marginTop: 18,
  },

  routePoints: {
    width: 18,
    alignItems: 'center',
  },

  blueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0071E3',
  },

  line: {
    width: 2,
    height: 38,
    backgroundColor: '#E5E5EA',
    marginVertical: 3,
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
  },

  routeInfo: {
    flex: 1,
    marginLeft: 10,
  },

  city: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  time: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
  },

  duration: {
    marginVertical: 6,
    fontSize: 11,
    color: '#0071E3',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 14,
  },

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  avatarEmoji: {
    fontSize: 18,
  },

  driverInfo: {
    flex: 1,
    marginLeft: 10,
  },

  driverName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  rating: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
  },

  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  tripButton: {
    marginTop: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  tripButtonText: {
    color: '#0071E3',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  emptyText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#86868B',
  },

  findButton: {
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

  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
