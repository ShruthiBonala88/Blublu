import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import BottomNavigation from '@/components/BottomNavigation';

export default function CreateTripScreen() {
  const { vehicle } = useUserStore();

  const [from, setFrom] = useState('Hyderabad');
  const [to, setTo] = useState('Bengaluru');
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('06:30 AM');
  const [price, setPrice] = useState('650');
  const [seats, setSeats] = useState('3');
  const [isInstant, setIsInstant] = useState(true);
  const [maxTwoBack, setMaxTwoBack] = useState(true);

  const handleCreateTrip = () => {
    if (!from || !to || !date || !time || !price) {
      Alert.alert('Incomplete details', 'Please fill in all route and price details.');
      return;
    }

    Alert.alert(
      'Ride Published! 🚗',
      `Your BLUBLU carpool from ${from} to ${to} for ₹${price}/seat is live. Passengers can now book seats.`,
      [
        {
          text: 'View My Trips',
          onPress: () =>
            router.push({
              pathname: '/trips',
              params: { from, to, date, time, price, seats },
            }),
        },
      ]
    );
  };

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

          <Text style={styles.headerTitle}>Publish a Ride</Text>

          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.heading}>Offer a Carpool</Text>
        <Text style={styles.subtitle}>
          Share empty seats, reduce travel costs, and travel sustainably.
        </Text>

        {/* Selected Vehicle Banner */}
        <View style={styles.vehicleBanner}>
          <View style={styles.vehicleIconBadge}>
            <Text style={styles.vehicleIcon}>🚗</Text>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicle.name} ({vehicle.type})</Text>
            <Text style={styles.vehicleNumber}>{vehicle.number} • {vehicle.color}</Text>
          </View>
          <Pressable onPress={() => router.push('/vehicles')}>
            <Text style={styles.changeVehicleText}>Change</Text>
          </Pressable>
        </View>

        {/* Route & Details Card */}
        <View style={styles.card}>
          <Text style={styles.label}>LEAVING FROM</Text>
          <TextInput
            style={styles.input}
            placeholder="Starting city or pickup point"
            placeholderTextColor="#86868B"
            value={from}
            onChangeText={setFrom}
          />

          <Text style={styles.label}>GOING TO</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination city or drop-off point"
            placeholderTextColor="#86868B"
            value={to}
            onChangeText={setTo}
          />

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DATE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Today"
                placeholderTextColor="#86868B"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DEPARTURE TIME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 06:30 AM"
                placeholderTextColor="#86868B"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          <Text style={styles.label}>PRICE PER PASSENGER (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 650"
            placeholderTextColor="#86868B"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>AVAILABLE SEATS</Text>
          <View style={styles.seatRow}>
            {['1', '2', '3', '4', '5', '6'].map((seat) => (
              <Pressable
                key={seat}
                style={[
                  styles.seatButton,
                  seats === seat && styles.seatButtonActive,
                ]}
                onPress={() => setSeats(seat)}
              >
                <Text
                  style={[
                    styles.seatButtonText,
                    seats === seat && styles.seatButtonTextActive,
                  ]}
                >
                  {seat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Preferences Toggle Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Ride Options & Preferences</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>⚡ Instant Booking</Text>
              <Text style={styles.toggleDescription}>
                Passengers can book seats instantly without manual approval.
              </Text>
            </View>
            <Switch
              value={isInstant}
              onValueChange={setIsInstant}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>👥 Max 2 in back</Text>
              <Text style={styles.toggleDescription}>
                Guarantee extra passenger comfort and middle seat space.
              </Text>
            </View>
            <Switch
              value={maxTwoBack}
              onValueChange={setMaxTwoBack}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Publish Button (Apple Blue Pill) */}
        <Pressable
          style={styles.publishButton}
          onPress={handleCreateTrip}
        >
          <Text style={styles.publishButtonText}>
            Publish Ride • ₹{price}/seat
          </Text>
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
    marginBottom: 18,
    fontSize: 14,
    color: '#86868B',
  },

  vehicleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  vehicleIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  vehicleIcon: {
    fontSize: 20,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  vehicleNumber: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
  },

  changeVehicleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0071E3',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
    marginTop: 8,
    marginBottom: 6,
  },

  input: {
    height: 48,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1D1D1F',
    fontWeight: '600',
    marginBottom: 8,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },

  seatRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },

  seatButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  seatButtonActive: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderColor: '#0071E3',
  },

  seatButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  seatButtonTextActive: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },

  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  toggleDescription: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#86868B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },

  publishButton: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
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

  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});