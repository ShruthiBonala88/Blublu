import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Input, Button, Card, ErrorState } from '../../../components';
import { useAuth } from '../../providers/AuthProvider';
import { vehiclesApi } from '../../../services/api/vehiclesApi';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export default function AddVehicle() {
  const router = useRouter();
  const { user } = useAuth();

  const [vehicleType, setVehicleType] = useState('Sedan');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('Camry');
  const [year, setYear] = useState('2024');
  const [regNum, setRegNum] = useState('TS07-EX-2024');
  const [totalSeats, setTotalSeats] = useState('4');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!user?.id) {
      setError('Driver authentication required');
      return;
    }
    if (!make.trim() || !model.trim() || !regNum.trim()) {
      setError('Please fill in Make, Model, and Registration Number');
      return;
    }

    const seatsCount = parseInt(totalSeats, 10);
    if (isNaN(seatsCount) || seatsCount <= 0) {
      setError('Total seats must be a number greater than 0');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await vehiclesApi.create({
        driver_id: user.id,
        vehicle_type: vehicleType.trim(),
        make: make.trim(),
        model: model.trim(),
        manufacture_year: parseInt(year, 10) || 2024,
        registration_number: regNum.trim(),
        total_seats: seatsCount,
      });

      setLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        alert('Vehicle registered successfully!');
        router.replace('/(main)/vehicles' as any);
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || 'Failed to register vehicle');
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Register New Vehicle</Text>
      <Text style={styles.subtitle}>
        Add vehicle specifications and seating details to publish trips
      </Text>

      {error ? <ErrorState message={error} onRetry={() => setError('')} style={{ marginBottom: 16 }} /> : null}

      <Card elevated style={styles.card}>
        <Input
          label="Vehicle Type"
          placeholder="e.g. Sedan, SUV, Hatchback"
          value={vehicleType}
          onChangeText={setVehicleType}
        />

        <Input
          label="Make (Brand)"
          placeholder="e.g. Toyota, Honda, Hyundai"
          value={make}
          onChangeText={setMake}
        />

        <Input
          label="Model"
          placeholder="e.g. Camry, City, Creta"
          value={model}
          onChangeText={setModel}
        />

        <Input
          label="Registration Number"
          placeholder="e.g. TS07-EX-2024"
          value={regNum}
          onChangeText={setRegNum}
        />

        <View style={styles.row}>
          <Input
            label="Year"
            placeholder="2024"
            keyboardType="number-pad"
            value={year}
            onChangeText={setYear}
            containerStyle={{ flex: 1 }}
          />

          <Input
            label="Total Passenger Seats"
            placeholder="4"
            keyboardType="number-pad"
            value={totalSeats}
            onChangeText={setTotalSeats}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Button
          title="Save & Register Vehicle"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
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
    marginBottom: 20,
  },
  card: {
    padding: 20,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    marginTop: 12,
  },
});
