import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

type Ride = {
  id: string;
  driver: string;
  rating: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: string;
  seats: string;
};

const rides: Ride[] = [
  {
    id: 'BLU-001',
    driver: 'Rahul Sharma',
    rating: '4.9',
    from: 'Hyderabad',
    to: 'Bengaluru',
    departure: '6:30 PM',
    arrival: '12:00 AM',
    duration: '5h 30m',
    price: '650',
    seats: '2 seats',
  },
  {
    id: 'BLU-002',
    driver: 'Arjun Reddy',
    rating: '4.8',
    from: 'Hyderabad',
    to: 'Bengaluru',
    departure: '8:00 PM',
    arrival: '1:30 AM',
    duration: '5h 30m',
    price: '600',
    seats: '3 seats',
  },
  {
    id: 'BLU-003',
    driver: 'Vikram Mehta',
    rating: '4.7',
    from: 'Hyderabad',
    to: 'Bengaluru',
    departure: '9:30 PM',
    arrival: '3:00 AM',
    duration: '5h 30m',
    price: '550',
    seats: '1 seat',
  },
];

export default function SearchScreen() {
  const [from, setFrom] = useState('Hyderabad');
  const [to, setTo] = useState('Bengaluru');
  const [date] = useState('Today');

  const filteredRides = rides.filter(
    (ride) =>
      ride.from.toLowerCase().includes(from.toLowerCase()) &&
      ride.to.toLowerCase().includes(to.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Find a Ride</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Apple Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.label}>LEAVING FROM</Text>

          <View style={styles.inputContainer}>
            <View style={styles.blueDotIcon} />

            <TextInput
              style={styles.input}
              value={from}
              onChangeText={setFrom}
              placeholder="Starting location"
              placeholderTextColor="#86868B"
            />
          </View>

          <View style={styles.connector} />

          <Text style={styles.label}>GOING TO</Text>

          <View style={styles.inputContainer}>
            <View style={styles.greenDotIcon} />

            <TextInput
              style={styles.input}
              value={to}
              onChangeText={setTo}
              placeholder="Destination"
              placeholderTextColor="#86868B"
            />
          </View>

          <Text style={styles.label}>DATE</Text>

          <Pressable style={styles.dateButton}>
            <Text style={styles.dateIcon}>📅</Text>

            <Text style={styles.dateText}>
              {date}
            </Text>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.searchButton}>
            <Text style={styles.searchButtonText}>
              Search Rides
            </Text>
          </Pressable>
        </View>

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Available Rides
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.resultsCount}>
              {filteredRides.length} available
            </Text>
          </View>
        </View>

        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🚗
            </Text>

            <Text style={styles.emptyTitle}>
              No rides found
            </Text>

            <Text style={styles.emptyText}>
              Try adjusting your starting location or destination.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RideCard({ ride }: { ride: Ride }) {
  const handleSelectRide = () => {
    router.push({
      pathname: '/trip-details',
      params: {
        from: ride.from,
        to: ride.to,
        departure: ride.departure,
        arrival: ride.arrival,
        duration: ride.duration,
        price: ride.price,
        driver: ride.driver,
      },
    });
  };

  return (
    <Pressable
      style={styles.rideCard}
      onPress={handleSelectRide}
    >
      {/* Driver */}
      <View style={styles.driverRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>
            {ride.driver}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {ride.rating}</Text>
            <Text style={styles.verifiedDot}>•</Text>
            <Text style={styles.verifiedText}>Verified Driver</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ₹{ride.price}
          </Text>

          <Text style={styles.perSeat}>
            per seat
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.routePoints}>
          <View style={styles.blueDot} />
          <View style={styles.routeLine} />
          <View style={styles.greenDot} />
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.locationRow}>
            <View>
              <Text style={styles.city}>
                {ride.from}
              </Text>

              <Text style={styles.time}>
                {ride.departure}
              </Text>
            </View>
          </View>

          <Text style={styles.duration}>
            {ride.duration} (Direct Route)
          </Text>

          <View>
            <Text style={styles.city}>
              {ride.to}
            </Text>

            <Text style={styles.time}>
              {ride.arrival}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.seatsBadge}>
          <Text style={styles.seats}>
            🪑 {ride.seats} available
          </Text>
        </View>

        <Text style={styles.viewDetails}>
          View Details →
        </Text>
      </View>
    </Pressable>
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

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
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

  label: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#86868B',
  },

  inputContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 12,
  },

  blueDotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0071E3',
  },

  greenDotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },

  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1D1D1F',
    fontWeight: '600',
  },

  connector: {
    width: 2,
    height: 12,
    backgroundColor: '#E5E5EA',
    marginLeft: 15,
    marginVertical: 2,
  },

  dateButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    backgroundColor: '#F5F5F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  dateIcon: {
    fontSize: 16,
  },

  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '600',
  },

  arrow: {
    fontSize: 20,
    color: '#86868B',
  },

  searchButton: {
    marginTop: 18,
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  countBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  resultsCount: {
    fontSize: 12,
    color: '#0071E3',
    fontWeight: '700',
  },

  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
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
    flex: 1,
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

  priceContainer: {
    alignItems: 'flex-end',
  },

  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  perSeat: {
    fontSize: 10,
    color: '#86868B',
  },

  route: {
    flexDirection: 'row',
    marginTop: 16,
  },

  routePoints: {
    width: 20,
    alignItems: 'center',
  },

  blueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0071E3',
  },

  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
  },

  routeLine: {
    width: 2,
    height: 32,
    backgroundColor: '#E5E5EA',
  },

  routeInfo: {
    flex: 1,
    marginLeft: 10,
  },

  locationRow: {
    flexDirection: 'row',
  },

  city: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  time: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
    fontWeight: '500',
  },

  duration: {
    marginVertical: 6,
    fontSize: 11,
    color: '#86868B',
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 14,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seatsBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  seats: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '700',
  },

  viewDetails: {
    fontSize: 13,
    color: '#0071E3',
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    color: '#86868B',
  },
});