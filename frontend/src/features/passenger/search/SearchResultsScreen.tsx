import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { tripsApi, Trip } from '@/services/api';

export default function SearchResultsScreen() {
  const searchParams = useLocalSearchParams<{ from?: string; to?: string }>();
  const from = searchParams.from || 'Hyderabad';
  const to = searchParams.to || 'Bengaluru';

  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await tripsApi.search({ origin: from, destination: to });
        setTrips(data);
      } catch (err) {
        console.warn('Search results error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [from, to]);

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

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{from} → {to}</Text>
            <Text style={styles.headerSubtitle}>Today • 1 passenger • Direct</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.resultText}>{trips.length} carpools available</Text>
          <Pressable style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>⚡ Instant Booking</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0071E3" />
            <Text style={{ marginTop: 12, color: '#86868B', fontSize: 13 }}>Finding best verified carpools...</Text>
          </View>
        ) : (
          trips.map((t, idx) => {
            const depTime = t.departure_time ? new Date(t.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:30 AM';
            return (
              <Pressable
                key={t.id || idx}
                onPress={() =>
                  router.push({
                    pathname: '/trip-details',
                    params: {
                      tripId: t.id,
                      from: t.origin_name || from,
                      to: t.destination_name || to,
                      price: String(t.price_per_seat || 650),
                      driver: t.driver_name || 'Rahul Sharma',
                      departure: depTime,
                    },
                  })
                }
              >
                <RideCard
                  depTime={depTime}
                  arrTime="12:00 PM"
                  duration="5h 30m"
                  from={t.origin_name || from}
                  to={t.destination_name || to}
                  driver={t.driver_name || 'Rahul Sharma'}
                  rating={t.driver_rating || '4.9'}
                  tripsCount="128 rides"
                  price={`₹${t.price_per_seat || 650}`}
                  seats={`${t.available_seats || 3} seats left`}
                  carModel="Hyundai Creta • White"
                  isInstant={true}
                  maxTwo={true}
                />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RideCard({
  depTime,
  arrTime,
  duration,
  from,
  to,
  driver,
  rating,
  tripsCount,
  price,
  seats,
  carModel,
  isInstant,
  maxTwo,
}: {
  depTime: string;
  arrTime: string;
  duration: string;
  from: string;
  to: string;
  driver: string;
  rating: string;
  tripsCount: string;
  price: string;
  seats: string;
  carModel: string;
  isInstant: boolean;
  maxTwo: boolean;
}) {
  return (
    <Pressable
      style={styles.rideCard}
      onPress={() => router.push('/trip-details')}
    >
      {/* Badges Row */}
      <View style={styles.badgeRow}>
        {isInstant && (
          <View style={styles.instantBadge}>
            <Text style={styles.instantBadgeText}>⚡ Instant Booking</Text>
          </View>
        )}
        {maxTwo && (
          <View style={styles.maxTwoBadge}>
            <Text style={styles.maxTwoBadgeText}>👥 Max 2 in back</Text>
          </View>
        )}
      </View>

      {/* Main Time & Route Details */}
      <View style={styles.mainInfoRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{depTime}</Text>
          <Text style={styles.durationText}>{duration}</Text>
          <Text style={styles.timeText}>{arrTime}</Text>
        </View>

        <View style={styles.timelineGraphic}>
          <View style={styles.blueDot} />
          <View style={styles.verticalLine} />
          <View style={styles.greenDot} />
        </View>

        <View style={styles.locationColumn}>
          <Text style={styles.locationText}>{from}</Text>
          <View style={{ height: 16 }} />
          <Text style={styles.locationText}>{to}</Text>
        </View>

        {/* Price Tag */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{price}</Text>
          <Text style={styles.priceSeatLabel}>per seat</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Driver & Vehicle Row */}
      <View style={styles.driverRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>

        <View style={styles.driverDetails}>
          <View style={styles.driverNameRow}>
            <Text style={styles.driverName}>{driver}</Text>
            <Text style={styles.ratingText}>⭐ {rating}</Text>
          </View>
          <Text style={styles.carModelText}>{carModel} • {tripsCount}</Text>
        </View>

        <View style={styles.seatsContainer}>
          <Text style={styles.seatsText}>{seats}</Text>
        </View>
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
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  resultText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86868B',
  },

  filterBtn: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },

  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0071E3',
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

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },

  instantBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  instantBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0071E3',
  },

  maxTwoBadge: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  maxTwoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D1D1F',
  },

  mainInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  timeColumn: {
    width: 65,
  },

  timeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  durationText: {
    fontSize: 10,
    color: '#86868B',
    marginVertical: 10,
  },

  timelineGraphic: {
    width: 18,
    alignItems: 'center',
    marginHorizontal: 8,
    paddingTop: 3,
  },

  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0071E3',
  },

  verticalLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E5E5EA',
    marginVertical: 3,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },

  locationColumn: {
    flex: 1,
    paddingTop: 0,
  },

  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  priceContainer: {
    alignItems: 'flex-end',
  },

  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D1D1F',
  },

  priceSeatLabel: {
    fontSize: 10,
    color: '#86868B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  avatarEmoji: {
    fontSize: 18,
  },

  driverDetails: {
    flex: 1,
    marginLeft: 10,
  },

  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  driverName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#86868B',
  },

  carModelText: {
    marginTop: 1,
    fontSize: 11,
    color: '#86868B',
  },

  seatsContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  seatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
});