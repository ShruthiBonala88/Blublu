import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Card, LocationSelector } from '../../components';
import { useAuth } from '../../providers/AuthProvider';
import { DriverDashboardScreen } from '../../features/driver/dashboard/DriverDashboardScreen';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function Home() {
  const { role, user } = useAuth();
  const router = useRouter();

  // Passenger State
  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState('Bengaluru');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);

  const handlePassengerSearch = () => {
    router.push({
      pathname: '/(main)/search' as any,
      params: {
        origin: origin.trim(),
        destination: destination.trim(),
        date: date.trim(),
        passengers: passengers.toString(),
      },
    });
  };

  // DRIVER DASHBOARD FEATURE VIEW
  if (role === 'driver') {
    return <DriverDashboardScreen />;
  }

  // PASSENGER HOME FEATURE VIEW
  return (
    <Screen style={styles.container} scrollable>
      <View style={styles.welcomeRow}>
        <Text style={styles.greetingText}>
          Hello, {user?.name ? user.name.split(' ')[0] : 'Passenger'} 👋
        </Text>
        <Text style={styles.subGreetingText}>
          Where do you want to travel today?
        </Text>
      </View>

      <Card elevated style={styles.searchCard}>
        <Text style={styles.cardHeaderTitle}>Search Intercity Rides</Text>

        <LocationSelector
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
        />

        <View style={styles.detailsRow}>
          <View style={styles.detailField}>
            <Text style={styles.fieldLabel}>Travel Date</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => {
                const d = new Date(date);
                d.setDate(d.getDate() + 1);
                setDate(d.toISOString().split('T')[0]);
              }}
            >
              <Text style={styles.datePickerText}>📅 {date}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailField}>
            <Text style={styles.fieldLabel}>Passengers</Text>
            <View style={styles.passengerCounter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
              >
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.passengerCountText}>{passengers}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setPassengers(Math.min(6, passengers + 1))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Button
          title="Search Available Rides"
          onPress={handlePassengerSearch}
          style={styles.searchButton}
        />
      </Card>

      <View style={styles.perksContainer}>
        <Card style={styles.perkCard}>
          <Text style={styles.perkIcon}>🛡️</Text>
          <View style={styles.perkContent}>
            <Text style={styles.perkTitle}>Verified Drivers</Text>
            <Text style={styles.perkDesc}>Government ID & license verified for your safety</Text>
          </View>
        </Card>

        <Card style={styles.perkCard}>
          <Text style={styles.perkIcon}>⚡</Text>
          <View style={styles.perkContent}>
            <Text style={styles.perkTitle}>Instant Booking</Text>
            <Text style={styles.perkDesc}>Select exact vehicle seat and confirm instantly</Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  welcomeRow: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subGreetingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  searchCard: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  detailField: {
    flex: 1,
  },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginBottom: 6,
  },
  datePickerBtn: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  datePickerText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  passengerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  passengerCountText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  searchButton: {
    marginTop: 4,
  },
  perksContainer: {
    gap: 12,
    marginBottom: 24,
  },
  perkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  perkIcon: {
    fontSize: 28,
  },
  perkContent: {
    flex: 1,
  },
  perkTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  perkDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
