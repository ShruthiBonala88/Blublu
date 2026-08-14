import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../../components';
import { DriverUpcomingTripData } from '../types';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface UpcomingTripCardProps {
  trip?: DriverUpcomingTripData;
}

export const UpcomingTripCard: React.FC<UpcomingTripCardProps> = ({ trip }) => {
  const router = useRouter();

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Upcoming Trip</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming trips scheduled.</Text>
          <Button
            title="+ Create New Trip"
            onPress={() => router.push('/(main)/create-trip' as any)}
            variant="outline"
            size="sm"
            style={{ marginTop: 10 }}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Trip</Text>

      <Card elevated style={styles.card}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>📅 {trip.date}</Text>
        </View>

        <Text style={styles.routeText}>
          {trip.origin} ➔ {trip.destination}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>🕒 Departure: {trip.departureTime}</Text>
          <Text style={styles.seatsText}>
            💺 {trip.availableSeats} of {trip.totalSeats} seats left
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.priceText}>₹{trip.pricePerSeat} / seat</Text>
          <Button
            title="View Trip"
            onPress={() => router.push('/(main)/driver-trips' as any)}
            size="sm"
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.sizes.sm,
  },
  card: {
    padding: 18,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: border.radius.sm,
    marginBottom: 8,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  routeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  seatsText: {
    fontSize: typography.sizes.xs,
    color: colors.status.success,
    fontWeight: typography.weights.medium,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 10,
  },
  priceText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
});
