import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { tripsApi } from '@/services/api';

export default function TripDetailsScreen() {
  const params = useLocalSearchParams();
  const tripId = (params.tripId as string) || 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const from = (params.from as string) || 'Hyderabad';
  const to = (params.to as string) || 'Bengaluru';
  const departure = (params.departure as string) || '6:30 PM';
  const arrival = (params.arrival as string) || '12:00 AM';
  const duration = (params.duration as string) || '5h 30m';
  const price = (params.price as string) || '650';
  const driver = (params.driver as string) || 'Rahul Sharma';

  const [routeData, setRouteData] = useState<any>(null);

  useEffect(() => {
    if (tripId) {
      tripsApi.getRoute(tripId).then((data) => {
        if (data) setRouteData(data);
      }).catch(() => {});
    }
  }, [tripId]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backCircle} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Ride Overview</Text>

          <Pressable style={styles.shareCircle} onPress={() => {}}>
            <Text style={styles.shareIcon}>↗</Text>
          </Pressable>
        </View>

        {/* Date & Price Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>● VERIFIED TRIP</Text>
            </View>
            <Text style={styles.bannerDate}>Today, {departure}</Text>
            <Text style={styles.bannerSubtitle}>Direct EV Express • 2 seats available</Text>
          </View>
          <View style={styles.bannerPriceBox}>
            <Text style={styles.bannerPrice}>₹{price}</Text>
            <Text style={styles.bannerSeatLabel}>per seat</Text>
          </View>
        </View>

        {/* Journey Timeline Bento Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>JOURNEY TIMELINE</Text>

          <View style={styles.routeContainer}>
            <View style={styles.routeLineContainer}>
              <View style={styles.blueDot} />
              <View style={styles.verticalLine} />
              <View style={styles.greenDot} />
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.locationBlock}>
                <Text style={styles.time}>{departure}</Text>
                <Text style={styles.location}>{from}</Text>
                <Text style={styles.pickupDetail}>Central Expressway Pickup Point</Text>
              </View>

              <View style={styles.durationPill}>
                <Text style={styles.durationText}>⚡ {duration} non-stop express</Text>
              </View>

              <View style={styles.locationBlock}>
                <Text style={styles.time}>{arrival}</Text>
                <Text style={styles.location}>{to}</Text>
                <Text style={styles.pickupDetail}>City Hub / Tech Park Drop</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Profile Bento Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>HOST DRIVER</Text>

          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{driver.charAt(0)}</Text>
            </View>

            <View style={styles.driverInfo}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>{driver}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ 4.9</Text>
                </View>
              </View>
              <Text style={styles.driverStats}>142 completed trips • 100% response rate</Text>
              <Text style={styles.verifiedText}>✓ Aadhaar & Driving License Verified</Text>
            </View>
          </View>

          <View style={styles.driverBioBox}>
            <Text style={styles.driverBio}>
              {'"Tech professional commuting between cities. Clean EV, smooth driving, very punctual. Verified co-passengers only!"'}
            </Text>
          </View>
        </View>

        {/* Vehicle & Comfort Bento Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>VEHICLE & AMENITIES</Text>

          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleIcon}>🌱</Text>
            <View>
              <Text style={styles.vehicleName}>Tata Nexon EV Max</Text>
              <Text style={styles.vehiclePlate}>TS 09 •• 4920 • Electric SUV</Text>
            </View>
          </View>

          <View style={styles.amenitiesGrid}>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>❄️</Text>
              <Text style={styles.amenityLabel}>Air Conditioned</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🧳</Text>
              <Text style={styles.amenityLabel}>Max 1 Bag/Seat</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>⚡</Text>
              <Text style={styles.amenityLabel}>Fast Charging</Text>
            </View>
            <View style={styles.amenityItem}>
              <Text style={styles.amenityIcon}>🚭</Text>
              <Text style={styles.amenityLabel}>No Smoking</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Apple Action Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerPrice}>₹{price}</Text>
          <Text style={styles.footerPriceSub}>Includes taxes & tolls</Text>
        </View>

        <Pressable
          style={styles.bookButton}
          onPress={() =>
            router.push({
              pathname: '/seat-selection',
              params: {
                tripId,
                from,
                to,
                price,
                departure,
                arrival,
                driver,
              },
            })
          }
        >
          <Text style={styles.bookButtonText}>Select Seat</Text>
          <Text style={styles.bookButtonArrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  shareCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: '#0071E3',
    fontWeight: '700',
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
      } as any,
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  bannerLeft: {
    flex: 1,
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    marginBottom: 6,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.4,
  },
  bannerDate: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2,
  },
  bannerPriceBox: {
    alignItems: 'flex-end',
  },
  bannerPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -0.6,
  },
  bannerSeatLabel: {
    fontSize: 11,
    color: '#86868B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#86868B',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  routeContainer: {
    flexDirection: 'row',
    gap: 14,
  },
  routeLineContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  blueDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0071E3',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
  },
  routeInfo: {
    flex: 1,
  },
  locationBlock: {
    marginBottom: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  location: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 2,
  },
  pickupDetail: {
    fontSize: 12,
    color: '#86868B',
    marginTop: 2,
  },
  durationPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0071E3',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 113, 227, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0071E3',
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  ratingBadge: {
    backgroundColor: 'rgba(245, 99, 0, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F56300',
  },
  driverStats: {
    fontSize: 12,
    color: '#86868B',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 2,
  },
  driverBioBox: {
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  driverBio: {
    fontSize: 12,
    color: '#6E6E73',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  vehicleIcon: {
    fontSize: 24,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#86868B',
    marginTop: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  amenityIcon: {
    fontSize: 13,
  },
  amenityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      } as any,
      default: {},
    }),
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1D1D1F',
  },
  footerPriceSub: {
    fontSize: 11,
    color: '#86868B',
  },
  bookButton: {
    backgroundColor: '#0071E3',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 113, 227, 0.35)',
      } as any,
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookButtonArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});