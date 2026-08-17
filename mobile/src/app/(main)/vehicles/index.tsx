import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button } from '../../../components';
import { useAuth } from '../../../providers/AuthProvider';
import { Vehicle } from '../../../types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export default function VehiclesList() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Default initial demo vehicle if driver has not registered one
  const sampleVehicle: Vehicle = {
    id: 'v-demo-1',
    driver_id: user?.id || 'dev-driver',
    vehicle_type: 'Sedan',
    make: 'Toyota',
    model: 'Camry Hybrid',
    manufacture_year: 2024,
    registration_number: 'TS07-EX-2024',
    total_seats: 4,
  };

  useEffect(() => {
    // In production, fetch driver registered vehicles
    setVehicles([sampleVehicle]);
  }, [user?.id]);

  return (
    <Screen style={styles.container} scrollable>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>My Registered Vehicles</Text>
          <Text style={styles.subtitle}>
            Select or register vehicles used for posting intercity trips
          </Text>
        </View>
      </View>

      <Button
        title="+ Register New Vehicle"
        onPress={() => router.push('/(main)/vehicles/add' as any)}
        style={styles.addBtn}
      />

      <View style={styles.vehiclesList}>
        {vehicles.map((v) => (
          <Card key={v.id} elevated style={styles.vehicleCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.vehicleIcon}>🚘</Text>
              <View style={styles.vehicleMeta}>
                <Text style={styles.vehicleTitle}>
                  {v.make} {v.model}
                </Text>
                <Text style={styles.registrationText}>
                  Reg #: {v.registration_number}
                </Text>
              </View>

              <View style={styles.seatsTag}>
                <Text style={styles.seatsTagText}>💺 {v.total_seats} Seats</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.typeText}>
                Type: {v.vehicle_type} • {v.manufacture_year || 2024}
              </Text>
              <Text style={styles.statusVerified}>Verified Vehicle ✅</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  addBtn: {
    marginBottom: 20,
  },
  vehiclesList: {
    gap: 16,
    marginBottom: 32,
  },
  vehicleCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  vehicleIcon: {
    fontSize: 32,
  },
  vehicleMeta: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  registrationText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  seatsTag: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: border.radius.sm,
  },
  seatsTagText: {
    color: colors.primary[300],
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 10,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  statusVerified: {
    fontSize: typography.sizes.xs,
    color: colors.status.success,
    fontWeight: typography.weights.semibold,
  },
});
