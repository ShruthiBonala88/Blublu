import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Button, Card, Input, Loading } from '../../../components';
import { vehiclesApi } from '../../../services/api/vehiclesApi';
import { VehicleSeat } from '../../../types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export interface PassengerDetail {
  seatId: string;
  name: string;
  gender: 'Female' | 'Male' | 'Other';
  age: string;
}

export interface ExistingCoPassenger {
  seatId: string;
  seatPosition: string;
  name: string;
  gender: 'Female' | 'Male';
  age: number;
  isVerified: boolean;
}

export default function SeatSelection() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    vehicle_id?: string;
    price?: string;
    passengers?: string;
  }>();

  const tripId = params.id;
  const vehicleId = params.vehicle_id || '';
  const pricePerSeat = parseFloat(params.price || '0');
  const maxPassengers = parseInt(params.passengers || '1', 10);

  const [loading, setLoading] = useState(false);
  const [seats, setSeats] = useState<VehicleSeat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Already booked co-passengers on this trip
  const existingCoPassengers: ExistingCoPassenger[] = [
    {
      seatId: 'seat-rear-right',
      seatPosition: 'Rear Right (S4)',
      name: 'Ananya Sharma',
      gender: 'Female',
      age: 24,
      isVerified: true,
    },
    {
      seatId: 'seat-rear-left',
      seatPosition: 'Rear Left (S2)',
      name: 'Pooja Rao',
      gender: 'Female',
      age: 27,
      isVerified: true,
    },
  ];

  // Passenger Demographics State for user's selected seats
  const [passengerDetails, setPassengerDetails] = useState<Record<string, PassengerDetail>>({
    'seat-front-pass': {
      seatId: 'seat-front-pass',
      name: 'Shruthi',
      gender: 'Female',
      age: '25',
    },
  });

  // Default 4-seat car layout with occupied seats
  const defaultLayoutSeats: VehicleSeat[] = [
    {
      id: 'seat-front-pass',
      vehicle_id: vehicleId,
      seat_number: 1,
      seat_position: 'front_passenger',
      is_window_seat: true,
      is_available: true,
    },
    {
      id: 'seat-rear-left',
      vehicle_id: vehicleId,
      seat_number: 2,
      seat_position: 'rear_left',
      is_window_seat: true,
      is_available: false, // Booked by Pooja
    },
    {
      id: 'seat-rear-center',
      vehicle_id: vehicleId,
      seat_number: 3,
      seat_position: 'rear_center',
      is_window_seat: false,
      is_available: true,
    },
    {
      id: 'seat-rear-right',
      vehicle_id: vehicleId,
      seat_number: 4,
      seat_position: 'rear_right',
      is_window_seat: true,
      is_available: false, // Booked by Ananya
    },
  ];

  useEffect(() => {
    const fetchVehicleSeats = async () => {
      if (!vehicleId) {
        setSeats(defaultLayoutSeats);
        setSelectedSeatIds(['seat-front-pass']);
        return;
      }
      setLoading(true);

      try {
        const res = await vehiclesApi.getSeats(vehicleId);
        setLoading(false);
        if (res.data && res.data.length > 0) {
          setSeats(res.data);
          setSelectedSeatIds([res.data[0].id]);
        } else {
          setSeats(defaultLayoutSeats);
          setSelectedSeatIds(['seat-front-pass']);
        }
      } catch {
        setLoading(false);
        setSeats(defaultLayoutSeats);
        setSelectedSeatIds(['seat-front-pass']);
      }
    };

    fetchVehicleSeats();
  }, [vehicleId]);

  const toggleSeat = (seat: VehicleSeat) => {
    if (!seat.is_available) return;

    setErrorMsg('');
    if (selectedSeatIds.includes(seat.id)) {
      if (selectedSeatIds.length === 1) {
        setErrorMsg('At least 1 seat must be selected.');
        return;
      }
      setSelectedSeatIds(selectedSeatIds.filter((sid) => sid !== seat.id));
    } else {
      if (selectedSeatIds.length >= maxPassengers) {
        setErrorMsg(`You can select a maximum of ${maxPassengers} seat${maxPassengers > 1 ? 's' : ''}`);
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);

      if (!passengerDetails[seat.id]) {
        setPassengerDetails((prev) => ({
          ...prev,
          [seat.id]: {
            seatId: seat.id,
            name: `Passenger ${selectedSeatIds.length + 1}`,
            gender: 'Female',
            age: '24',
          },
        }));
      }
    }
  };

  const updatePassengerDetail = (
    seatId: string,
    field: keyof PassengerDetail,
    value: string
  ) => {
    setPassengerDetails((prev) => ({
      ...prev,
      [seatId]: {
        ...prev[seatId],
        [field]: value,
      },
    }));
  };

  const formatPosition = (pos: string, num: number): string => {
    switch (pos) {
      case 'front_passenger':
        return `Front Pass. (S${num})`;
      case 'rear_left':
        return `Rear Left (S${num})`;
      case 'rear_center':
        return `Rear Center (S${num})`;
      case 'rear_right':
        return `Rear Right (S${num})`;
      default:
        return `Seat ${num}`;
    }
  };

  const totalPrice = selectedSeatIds.length * pricePerSeat;

  const handleContinueToBooking = () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Please select at least 1 seat to continue');
      return;
    }

    const passengerSummary = selectedSeatIds
      .map((sid) => {
        const pd = passengerDetails[sid] || { name: 'Passenger', gender: 'Female', age: '25' };
        return `${pd.name} (${pd.gender}, Age ${pd.age})`;
      })
      .join('; ');

    router.push({
      pathname: '/(main)/booking/confirm' as any,
      params: {
        trip_id: tripId,
        seat_ids: selectedSeatIds.join(','),
        price_per_seat: pricePerSeat.toString(),
        total_amount: totalPrice.toString(),
        passengers_info: passengerSummary,
      },
    });
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Select Vehicle Seats</Text>
      <Text style={styles.subtitle}>
        View co-passenger details, select available seats, and configure your info
      </Text>

      {/* Legend Header */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatBookedLegend]} />
          <Text style={styles.legendText}>Booked Co-Passenger</Text>
        </View>
      </View>

      {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

      {/* Car Seat Map Grid */}
      <Card elevated style={styles.carLayoutCard}>
        <Text style={styles.dashboardLabel}>DRIVER 🚘</Text>
        <View style={styles.dashboardDivider} />

        {loading ? (
          <Loading message="Loading vehicle seats..." />
        ) : (
          <View style={styles.seatGrid}>
            {seats.map((seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);
              const isBooked = !seat.is_available;
              const bookedInfo = existingCoPassengers.find((cp) => cp.seatId === seat.id);

              return (
                <TouchableOpacity
                  key={seat.id}
                  disabled={isBooked}
                  activeOpacity={0.7}
                  style={[
                    styles.seatCard,
                    isBooked && styles.seatBooked,
                    isSelected && styles.seatSelected,
                  ]}
                  onPress={() => toggleSeat(seat)}
                >
                  <Text style={styles.seatIcon}>
                    {isBooked
                      ? bookedInfo?.gender === 'Female'
                        ? '👩'
                        : '👨'
                      : isSelected
                      ? '✅'
                      : '💺'}
                  </Text>
                  <Text
                    style={[
                      styles.seatLabel,
                      isSelected && styles.seatLabelSelected,
                      isBooked && styles.seatLabelBooked,
                    ]}
                  >
                    {formatPosition(seat.seat_position, seat.seat_number)}
                  </Text>

                  {isBooked && bookedInfo ? (
                    <Text style={styles.bookedPassengerBadge}>
                      {bookedInfo.name.split(' ')[0]} ({bookedInfo.gender.charAt(0)}, {bookedInfo.age}y)
                    </Text>
                  ) : seat.is_window_seat ? (
                    <Text style={styles.windowTag}>🪟 Window</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card>

      {/* Existing Co-Passengers List (Who else is on this trip) */}
      <Card elevated style={styles.coPassengersCard}>
        <Text style={styles.cardHeader}>👥 Co-Passengers Already on This Ride</Text>
        <Text style={styles.coPassengersSub}>
          Verified passengers sharing this intercity ride with you
        </Text>

        {existingCoPassengers.map((cp) => (
          <View key={cp.seatId} style={styles.coPassengerRow}>
            <View style={styles.coPassengerAvatar}>
              <Text style={styles.coPassengerAvatarText}>
                {cp.gender === 'Female' ? '👩' : '👨'}
              </Text>
            </View>

            <View style={styles.coPassengerInfo}>
              <Text style={styles.coPassengerName}>
                {cp.name} <Text style={styles.verifiedTag}>Verified ✅</Text>
              </Text>
              <Text style={styles.coPassengerMeta}>
                {cp.gender} • Age {cp.age} yrs • Reserved {cp.seatPosition}
              </Text>
            </View>

            <View style={styles.coPassengerBadge}>
              <Text style={styles.coPassengerBadgeText}>{cp.gender.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Passenger Demographics Details Form (Gender & Age Input for User's Selected Seats) */}
      <Card elevated style={styles.demographicsCard}>
        <Text style={styles.cardHeader}>Your Passenger Details (Name, Gender & Age)</Text>
        <Text style={styles.demographicsSub}>
          Enter your details so co-passengers and driver can identify your reservation
        </Text>

        {selectedSeatIds.map((seatId, idx) => {
          const detail = passengerDetails[seatId] || {
            seatId,
            name: `Passenger ${idx + 1}`,
            gender: 'Female',
            age: '25',
          };

          return (
            <View key={seatId} style={styles.passengerBox}>
              <Text style={styles.passengerBoxTitle}>
                Your Seat #{idx + 1} ({seatId})
              </Text>

              <Input
                label="Full Name"
                placeholder="e.g. Shruthi"
                value={detail.name}
                onChangeText={(txt) => updatePassengerDetail(seatId, 'name', txt)}
              />

              {/* Gender Selector */}
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['Female', 'Male', 'Other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderOption,
                      detail.gender === g && styles.genderOptionSelected,
                    ]}
                    onPress={() => updatePassengerDetail(seatId, 'gender', g)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        detail.gender === g && styles.genderTextSelected,
                      ]}
                    >
                      {g === 'Female' ? '👩 Female' : g === 'Male' ? '👨 Male' : '🧑 Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Age Input */}
              <Input
                label="Age (Years)"
                placeholder="e.g. 25"
                keyboardType="number-pad"
                maxLength={3}
                value={detail.age}
                onChangeText={(txt) => updatePassengerDetail(seatId, 'age', txt)}
              />
            </View>
          );
        })}
      </Card>

      {/* Booking Summary Footer */}
      <Card elevated style={styles.footerCard}>
        <View style={styles.footerSummaryRow}>
          <View>
            <Text style={styles.footerSelectedText}>
              {selectedSeatIds.length} Seat{selectedSeatIds.length > 1 ? 's' : ''} Selected
            </Text>
            <Text style={styles.footerPriceSubtext}>₹{pricePerSeat} / seat</Text>
          </View>

          <Text style={styles.footerTotalPrice}>₹{totalPrice}</Text>
        </View>

        <Button
          title="Continue to Confirmation"
          onPress={handleContinueToBooking}
          disabled={selectedSeatIds.length === 0}
          style={styles.actionBtn}
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
    marginBottom: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: border.radius.lg,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
  errorBanner: {
    color: colors.status.error,
    fontSize: typography.sizes.xs,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },
  carLayoutCard: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  dashboardLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    marginBottom: 8,
  },
  dashboardDivider: {
    width: '100%',
    height: 2,
    backgroundColor: colors.border.subtle,
    marginBottom: 20,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  seatCard: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  seatAvailable: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.default,
  },
  seatSelected: {
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[500],
  },
  seatBooked: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  seatBookedLegend: {
    backgroundColor: 'rgba(244, 63, 94, 0.3)',
  },
  seatIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  seatLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  seatLabelSelected: {
    color: colors.primary[300],
    fontWeight: typography.weights.bold,
  },
  seatLabelBooked: {
    color: colors.status.error,
  },
  bookedPassengerBadge: {
    fontSize: 10,
    color: colors.status.error,
    fontWeight: typography.weights.bold,
    marginTop: 4,
  },
  windowTag: {
    fontSize: 10,
    color: colors.accent.emerald,
    marginTop: 4,
  },
  coPassengersCard: {
    padding: 20,
    marginBottom: 20,
  },
  coPassengersSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  coPassengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: border.radius.lg,
    marginBottom: 10,
    gap: 12,
  },
  coPassengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  coPassengerAvatarText: {
    fontSize: 20,
  },
  coPassengerInfo: {
    flex: 1,
  },
  coPassengerName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  verifiedTag: {
    fontSize: 10,
    color: colors.status.success,
    fontWeight: typography.weights.regular,
  },
  coPassengerMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  coPassengerBadge: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: border.radius.sm,
  },
  coPassengerBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary[300],
  },
  demographicsCard: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  demographicsSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  passengerBox: {
    backgroundColor: colors.background.secondary,
    padding: 14,
    borderRadius: border.radius.lg,
    marginBottom: 12,
  },
  passengerBoxTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
    marginBottom: 10,
  },
  genderLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: border.radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[400],
  },
  genderText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
  footerCard: {
    padding: 20,
    marginBottom: 32,
  },
  footerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  footerSelectedText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  footerPriceSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  footerTotalPrice: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  actionBtn: {
    marginTop: 4,
  },
});
