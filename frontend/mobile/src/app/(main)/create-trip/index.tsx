import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Input, Button, Card, LocationSelector } from '../../../components';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export default function CreateTripForm() {
  const router = useRouter();

  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState('Bengaluru');
  const [date, setDate] = useState('2026-08-20');
  const [time, setTime] = useState('08:00');
  const [price, setPrice] = useState('850');
  const [notes, setNotes] = useState('Comfortable AC SUV, non-smoking, max 2 rear passengers.');
  const [vehicleId, setVehicleId] = useState('v-demo-1');
  const [error, setError] = useState('');

  const handlePreview = () => {
    if (!origin.trim() || !destination.trim()) {
      setError('Origin and Destination are required');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price per seat must be greater than 0');
      return;
    }

    const departureIso = `${date}T${time}:00Z`;

    router.push({
      pathname: '/(main)/create-trip/preview' as any,
      params: {
        origin: origin.trim(),
        destination: destination.trim(),
        departure_time: departureIso,
        price_per_seat: price,
        notes: notes.trim(),
        vehicle_id: vehicleId,
      },
    });
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Post an Intercity Ride</Text>
      <Text style={styles.subtitle}>
        Fill in route details, departure schedule, and fare per seat
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Card elevated style={styles.card}>
        <LocationSelector
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
        />

        <View style={styles.row}>
          <Input
            label="Departure Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            containerStyle={{ flex: 1 }}
          />

          <Input
            label="Time (HH:mm)"
            placeholder="08:00"
            value={time}
            onChangeText={setTime}
            containerStyle={{ flex: 1 }}
          />
        </View>

        <Input
          label="Price per Seat (₹)"
          placeholder="850"
          keyboardType="number-pad"
          value={price}
          onChangeText={setPrice}
        />

        <Input
          label="Trip Notes & Amenities"
          placeholder="e.g. Clean AC car, 1 luggage allowed per seat"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Review Trip Preview ➔"
          onPress={handlePreview}
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
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.xs,
    marginBottom: 12,
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
