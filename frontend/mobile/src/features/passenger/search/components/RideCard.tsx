import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../../../components';
import { PassengerTrip } from '../types';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface RideCardProps {
  trip: PassengerTrip;
  passengerCount: number;
}

export const RideCard: React.FC<RideCardProps> = ({
  trip,
  passengerCount,
}) => {
  const router = useRouter();
  const driverInitial = trip.driverName ? trip.driverName.charAt(0) : 'D';
  const hasEnoughSeats = trip.availableSeats >= passengerCount;

  return (
    <Card elevated style={styles.card}>
      {/* Driver Header */}
      <View style={styles.cardHeader}>
        <View style={styles.driverGroup}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{driverInitial}</Text>
          </View>
          <View>
            <View style={styles.driverNameRow}>
              <Text style={styles.driverName}>{trip.driverName}</Text>
              {trip.isVerifiedDriver && (
                <Text style={styles.verifiedBadge}>Verified ✅</Text>
              )}
            </View>
            <Text style={styles.ratingText}>
              ⭐ {trip.driverRating.toFixed(2)} • {trip.totalRides} rides
            </Text>
          </View>
        </View>

        <View style={styles.priceGroup}>
          <Text style={styles.priceAmount}>₹{trip.pricePerSeat}</Text>
          <Text style={styles.priceUnit}>per seat</Text>
        </View>
      </View>

      {/* Timeline & Locations */}
      <View style={styles.timelineRow}>
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{trip.departureTime}</Text>
          <Text style={styles.durationText}>{trip.duration}</Text>
          <Text style={styles.timeText}>{trip.arrivalTime}</Text>
        </View>

        <View style={styles.graphicCol}>
          <View style={styles.timelineLine} />
        </View>

        <View style={styles.locationCol}>
          <Text style={styles.locationTitle}>{trip.origin}</Text>
          <View style={{ height: 10 }} />
          <Text style={styles.locationTitle}>{trip.destination}</Text>
        </View>
      </View>

      {/* Vehicle & Seats Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleText}>
            🚘 {trip.vehicleType} • {trip.vehicleModel}
          </Text>
        </View>

        <View style={styles.rightFooter}>
          <Text
            style={[
              styles.seatsText,
              !hasEnoughSeats && styles.seatsTextUnavailable,
            ]}
          >
            💺 {trip.availableSeats} seat{trip.availableSeats === 1 ? '' : 's'} left
          </Text>

          <Button
            title="View Ride"
            onPress={() =>
              router.push({
                pathname: '/(main)/trip-details/[id]' as any,
                params: { id: trip.id, passengers: passengerCount.toString() },
              })
            }
            size="sm"
            disabled={!hasEnoughSeats}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    marginBottom: 12,
  },
  driverGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
    fontSize: 18,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  verifiedBadge: {
    fontSize: 10,
    color: colors.status.success,
  },
  ratingText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  priceGroup: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  priceUnit: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timeCol: {
    width: 75,
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  durationText: {
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    marginVertical: 2,
  },
  graphicCol: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 36,
    backgroundColor: colors.primary[500],
  },
  locationCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationTitle: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 10,
  },
  vehicleBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: border.radius.sm,
  },
  vehicleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  seatsText: {
    fontSize: typography.sizes.xs,
    color: colors.status.success,
    fontWeight: typography.weights.medium,
  },
  seatsTextUnavailable: {
    color: colors.status.error,
  },
});
