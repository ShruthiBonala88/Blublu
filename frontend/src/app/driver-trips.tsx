import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import RoleGuard from '@/components/auth/RoleGuard';

export default function DriverTripsScreen() {
  const handleCancel = () => {
    Alert.alert(
      'Cancel Trip',
      'Are you sure you want to cancel this trip?',
      [
        {
          text: 'Keep Trip',
          style: 'cancel',
        },
        {
          text: 'Cancel Trip',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Trip Cancelled',
              'Your trip has been cancelled and passengers will be notified.',
            ),
        },
      ],
    );
  };

  return (
    <RoleGuard allowedRoles={['driver', 'admin']}>
      <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButtonTop} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Driver Dashboard</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            value="12"
            label="Trips"
          />

          <StatCard
            value="₹12.4K"
            label="Earnings"
          />

          <StatCard
            value="4.9 ★"
            label="Driver Rating"
          />
        </View>

        <Text style={styles.sectionTitle}>Upcoming Drives</Text>

        {/* Active Trip Card */}
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View>
              <Text style={styles.route}>Hyderabad → Bengaluru</Text>
              <Text style={styles.date}>Today • 6:30 PM</Text>
            </View>

            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>● LIVE / ACTIVE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.routeRow}>
            <View style={styles.routePoints}>
              <View style={styles.blueDot} />
              <View style={styles.routeLine} />
              <View style={styles.greenDot} />
            </View>

            <View style={styles.routeDetails}>
              <View>
                <Text style={styles.city}>Hyderabad</Text>
                <Text style={styles.time}>6:30 PM (Gachibowli)</Text>
              </View>

              <Text style={styles.duration}>⏱ 5h 30m non-stop</Text>

              <View>
                <Text style={styles.city}>Bengaluru</Text>
                <Text style={styles.time}>12:00 AM (Silk Board)</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.passengerRow}>
            <View>
              <Text style={styles.smallLabel}>PASSENGERS BOOKED</Text>
              <Text style={styles.value}>2 of 3 seats filled</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.smallLabel}>TOTAL EARNINGS</Text>
              <Text style={styles.earning}>₹1,300</Text>
            </View>
          </View>

          <Pressable
            style={styles.manageButton}
            onPress={() =>
              Alert.alert(
                'Trip Details',
                'Passenger list and manifest will be displayed here.',
              )
            }
          >
            <Text style={styles.manageText}>Manage Passengers & Trip</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancel this Drive</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Completed Journeys</Text>

        <PreviousTrip
          route="Bengaluru → Hyderabad"
          date="10 Aug • 7:00 AM"
          earnings="₹1,950"
          passengers="3 passengers"
        />

        <PreviousTrip
          route="Hyderabad → Chennai"
          date="7 Aug • 8:30 AM"
          earnings="₹1,300"
          passengers="2 passengers"
        />

        <PreviousTrip
          route="Chennai → Bengaluru"
          date="3 Aug • 6:00 AM"
          earnings="₹1,950"
          passengers="3 passengers"
        />

        <Pressable
          style={styles.backDashboardButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Main Screen</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  </RoleGuard>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PreviousTrip({
  route,
  date,
  earnings,
  passengers,
}: {
  route: string;
  date: string;
  earnings: string;
  passengers: string;
}) {
  return (
    <View style={styles.previousCard}>
      <View style={styles.previousIcon}>
        <Text style={styles.previousIconEmoji}>✓</Text>
      </View>

      <View style={styles.previousInfo}>
        <Text style={styles.previousRoute}>{route}</Text>
        <Text style={styles.previousDate}>{date} • {passengers}</Text>
      </View>

      <Text style={styles.previousEarning}>{earnings}</Text>
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
    marginBottom: 20,
  },

  backButtonTop: {
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

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
    fontWeight: '600',
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
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
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

  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  route: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  date: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
  },

  activeBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34C759',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 14,
  },

  routeRow: {
    flexDirection: 'row',
  },

  routePoints: {
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

  routeLine: {
    width: 2,
    height: 44,
    backgroundColor: '#E5E5EA',
    marginVertical: 3,
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
    fontSize: 11,
    color: '#86868B',
  },

  duration: {
    marginVertical: 4,
    fontSize: 11,
    color: '#0071E3',
    fontWeight: '600',
  },

  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  smallLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#86868B',
  },

  value: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  earning: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '900',
    color: '#34C759',
  },

  manageButton: {
    marginTop: 16,
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  manageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  cancelButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },

  cancelText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
  },

  previousCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  previousIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previousIconEmoji: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '900',
  },

  previousInfo: {
    flex: 1,
    marginLeft: 12,
  },

  previousRoute: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  previousDate: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
  },

  previousEarning: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  backDashboardButton: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  backButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '700',
  },
});