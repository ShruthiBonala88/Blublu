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

      {/* Vehicle Info & Seats Row */}
      <View style={styles.metaRow}>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleText} numberOfLines={1}>
            🚘 {trip.vehicleType} • {trip.vehicleModel}
          </Text>
        </View>

        <Text
          style={[
            styles.seatsText,
            !hasEnoughSeats && styles.seatsTextUnavailable,
          ]}
        >
          💺 {trip.availableSeats} seat{trip.availableSeats === 1 ? '' : 's'} left
        </Text>
      </View>

      {/* Action Button Row */}
      <View style={styles.actionRow}>
        <Button
          title="View Ride Details"
          onPress={() =>
            router.push({
              pathname: '/(main)/trip-details/[id]' as any,
              params: { id: trip.id, passengers: passengerCount.toString() },
            })
          }
          size="sm"
          disabled={!hasEnoughSeats}
          style={styles.viewBtn}
        />
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
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
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
    flexWrap: 'wrap',
  },
  driverName: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  verifiedBadge: {
    fontSize: 10,
    color: '#A1A1AA',
  },
  ratingText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  priceGroup: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  priceAmount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
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
    backgroundColor: '#52525B',
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  vehicleBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: border.radius.sm,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  vehicleText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  seatsText: {
    fontSize: typography.sizes.xs,
    color: '#E4E4E7',
    fontWeight: typography.weights.medium,
  },
  seatsTextUnavailable: {
    color: '#71717A',
  },
  actionRow: {
    marginTop: 2,
  },
  viewBtn: {
    width: '100%',
  },
});
