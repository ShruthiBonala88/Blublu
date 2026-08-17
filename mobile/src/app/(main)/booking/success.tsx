import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Button, Card } from '../../../components';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export default function BookingSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    booking_id?: string;
    origin?: string;
    destination?: string;
    seats_count?: string;
    total_amount?: string;
  }>();

  const bookingId = params.booking_id || 'bk-confirmed';
  const origin = params.origin || 'Origin';
  const destination = params.destination || 'Destination';
  const seatsCount = params.seats_count || '1';
  const totalAmount = params.total_amount || '0';

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successBadge}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your seat(s) have been successfully reserved.
        </Text>

        <Card elevated style={styles.card}>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Booking Reference:</Text>
            <Text style={styles.refValue}>{bookingId.slice(0, 18)}...</Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.routeText}>
            {origin} ➔ {destination}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>
              💺 {seatsCount} Seat{parseInt(seatsCount, 10) > 1 ? 's' : ''} Reserved
            </Text>
            <Text style={styles.amountText}>₹{totalAmount}</Text>
          </View>
        </Card>
      </View>

      <View style={styles.actionsBlock}>
        <Button
          title="View My Rides"
          onPress={() => router.replace('/(main)/trips' as any)}
          style={styles.primaryBtn}
        />
        <Button
          title="Back to Home"
          onPress={() => router.replace('/(main)' as any)}
          variant="outline"
          style={styles.secondaryBtn}
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
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  amountText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  actionsBlock: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
});
