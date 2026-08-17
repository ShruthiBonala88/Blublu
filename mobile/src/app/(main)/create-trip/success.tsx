import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Button, Card } from '../../../components';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

export default function TripSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    trip_id?: string;
    origin?: string;
    destination?: string;
    price_per_seat?: string;
  }>();

  const tripId = params.trip_id || 'trip-confirmed';
  const origin = params.origin || 'Origin';
  const destination = params.destination || 'Destination';
  const price = params.price_per_seat || '850';

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successBadge}>
          <Text style={styles.successIcon}>🚀</Text>
        </View>

        <Text style={styles.title}>Trip Published!</Text>
        <Text style={styles.subtitle}>
          Your intercity ride is live and available for passengers to book
        </Text>

        <Card elevated style={styles.card}>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Trip Reference:</Text>
            <Text style={styles.refValue}>#{tripId.slice(0, 16)}</Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.routeText}>
            {origin} ➔ {destination}
          </Text>

          <Text style={styles.priceText}>₹{price} / seat</Text>
        </Card>
      </View>

      <View style={styles.actionsBlock}>
        <Button
          title="View Driver Trips"
          onPress={() => router.replace('/(main)/driver-trips' as any)}
          style={styles.btn}
        />
        <Button
          title="Create Another Trip"
          onPress={() => router.replace('/(main)/create-trip' as any)}
          variant="secondary"
          style={styles.btn}
        />
        <Button
          title="Go to Dashboard"
          onPress={() => router.replace('/(main)' as any)}
          variant="outline"
          style={styles.btn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  successBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[500],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 42,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  card: {
    width: '100%',
    padding: 20,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  refValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 12,
  },
  routeText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  priceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  actionsBlock: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
  },
});
