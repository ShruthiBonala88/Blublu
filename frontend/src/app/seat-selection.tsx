import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

type CarType = 'sedan' | 'suv' | 'hatchback';
type FilterType = 'all' | 'available' | 'selected' | 'booked';

interface SeatInfo {
  id: string;
  label: string;
  position: string;
  isBooked: boolean;
  row: 'front' | 'middle' | 'back';
}

const CAR_CONFIGS: Record<CarType, { name: string; icon: string; seats: SeatInfo[] }> = {
  sedan: {
    name: 'Sedan (4 Seats)',
    icon: '🚗',
    seats: [
      { id: 'F1', label: 'Front', position: 'Front Passenger', isBooked: false, row: 'front' },
      { id: 'R1', label: 'Back Left', position: 'Window', isBooked: false, row: 'back' },
      { id: 'R2', label: 'Back Middle', position: 'Middle', isBooked: true, row: 'back' },
      { id: 'R3', label: 'Back Right', position: 'Window', isBooked: false, row: 'back' },
    ],
  },
  suv: {
    name: 'SUV / 6-Seater',
    icon: '🚙',
    seats: [
      { id: 'F1', label: 'Front', position: 'Front Passenger', isBooked: false, row: 'front' },
      { id: 'M1', label: 'Mid Left', position: 'Captain Seat', isBooked: true, row: 'middle' },
      { id: 'M2', label: 'Mid Right', position: 'Captain Seat', isBooked: false, row: 'middle' },
      { id: 'R1', label: 'Row 3 L', position: 'Rear Window', isBooked: false, row: 'back' },
      { id: 'R2', label: 'Row 3 R', position: 'Rear Window', isBooked: true, row: 'back' },
    ],
  },
  hatchback: {
    name: 'Hatchback (3 Seats)',
    icon: '🚘',
    seats: [
      { id: 'F1', label: 'Front', position: 'Front Passenger', isBooked: false, row: 'front' },
      { id: 'R1', label: 'Back Left', position: 'Window', isBooked: false, row: 'back' },
      { id: 'R2', label: 'Back Right', position: 'Window', isBooked: false, row: 'back' },
    ],
  },
};

export default function SeatSelectionScreen() {
  const params = useLocalSearchParams();
  const tripId = (params.tripId as string) || 'b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const from = (params.from as string) || 'Hyderabad';
  const to = (params.to as string) || 'Bengaluru';
  const priceParam = (params.price as string) || '650';

  const [carType, setCarType] = useState<CarType>('sedan');
  const [selectedSeat, setSelectedSeat] = useState<string | null>('F1');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const currentCar = CAR_CONFIGS[carType];
  const pricePerSeat = Number(priceParam) || 650;

  const handleSeatClick = (seat: SeatInfo) => {
    if (seat.isBooked) {
      Alert.alert(
        'Seat Already Booked',
        `Seat "${seat.label}" (${seat.position}) has already been reserved by another passenger.`
      );
      return;
    }

    setSelectedSeat(selectedSeat === seat.id ? null : seat.id);
  };

  const handleToggleFilter = (filter: FilterType) => {
    setActiveFilter((prev) => (prev === filter ? 'all' : filter));
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      Alert.alert('No Seat Selected', 'Please select an available seat to proceed.');
      return;
    }

    const seatDetails = currentCar.seats.find((s) => s.id === selectedSeat);

    router.push({
      pathname: '/booking',
      params: {
        tripId,
        from,
        to,
        seat: selectedSeat,
        seatLabel: seatDetails?.label || selectedSeat,
        carType: currentCar.name,
        price: pricePerSeat.toString(),
      },
    });
  };

  const isSeatVisible = (seat: SeatInfo) => {
    const isSelected = selectedSeat === seat.id;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'available') return !seat.isBooked && !isSelected;
    if (activeFilter === 'selected') return isSelected;
    if (activeFilter === 'booked') return seat.isBooked;
    return true;
  };

  const availableCount = currentCar.seats.filter((s) => !s.isBooked).length;
  const bookedCount = currentCar.seats.filter((s) => s.isBooked).length;
  const selectedSeatObj = currentCar.seats.find((s) => s.id === selectedSeat);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Select Seat</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Trip Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.routeHeaderRow}>
            <Text style={styles.route}>Hyderabad → Bengaluru</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Verified Ride</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>
            Today • 6:30 PM • Rahul Sharma • {currentCar.name}
          </Text>
        </View>

        {/* Car Type Switcher */}
        <View style={styles.carTypeSection}>
          <Text style={styles.subSectionTitle}>Select Vehicle Layout</Text>
          <View style={styles.carTypeTabs}>
            {(['sedan', 'suv', 'hatchback'] as CarType[]).map((type) => {
              const isCurrent = carType === type;
              return (
                <Pressable
                  key={type}
                  style={[styles.carTab, isCurrent && styles.carTabActive]}
                  onPress={() => {
                    setCarType(type);
                    setSelectedSeat(null);
                  }}
                >
                  <Text style={styles.carTabIcon}>{CAR_CONFIGS[type].icon}</Text>
                  <Text style={[styles.carTabText, isCurrent && styles.carTabTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Interactive Legend / Filter Badges */}
        <Text style={styles.sectionTitle}>Vehicle Layout</Text>

        <View style={styles.legendWrapper}>
          {/* Available Checkbox */}
          <Pressable
            style={[
              styles.legendCheckboxItem,
              activeFilter === 'available' && styles.legendCheckboxItemActive,
            ]}
            onPress={() => handleToggleFilter('available')}
          >
            <View style={[styles.checkboxSquare, styles.availableBox]}>
              <View style={styles.availableDot} />
            </View>
            <Text style={[styles.legendText, activeFilter === 'available' && styles.legendTextHighlight]}>
              Available ({availableCount})
            </Text>
          </Pressable>

          {/* Selected Checkbox */}
          <Pressable
            style={[
              styles.legendCheckboxItem,
              activeFilter === 'selected' && styles.legendCheckboxItemActive,
            ]}
            onPress={() => handleToggleFilter('selected')}
          >
            <View style={[styles.checkboxSquare, styles.selectedBox]}>
              <Text style={styles.checkIconWhite}>✓</Text>
            </View>
            <Text style={[styles.legendText, activeFilter === 'selected' && styles.legendTextHighlight]}>
              Selected ({selectedSeat ? 1 : 0})
            </Text>
          </Pressable>

          {/* Booked Checkbox */}
          <Pressable
            style={[
              styles.legendCheckboxItem,
              activeFilter === 'booked' && styles.legendCheckboxItemActive,
            ]}
            onPress={() => handleToggleFilter('booked')}
          >
            <View style={[styles.checkboxSquare, styles.bookedBox]}>
              <Text style={styles.bookedMinus}>✕</Text>
            </View>
            <Text style={[styles.legendText, activeFilter === 'booked' && styles.legendTextHighlight]}>
              Booked ({bookedCount})
            </Text>
          </Pressable>
        </View>

        {/* Active Filter Notice */}
        {activeFilter !== 'all' && (
          <View style={styles.filterNoticeRow}>
            <Text style={styles.filterNoticeText}>
              Filtering: <Text style={styles.filterNoticeBold}>{activeFilter.toUpperCase()} SEATS</Text>
            </Text>
            <Pressable onPress={() => setActiveFilter('all')}>
              <Text style={styles.clearFilterText}>Show All ✕</Text>
            </Pressable>
          </View>
        )}

        {/* APPLE CAR INTERIOR VISUALIZER */}
        <View style={styles.carBodyContainer}>
          {/* Windshield Header */}
          <View style={styles.windshield}>
            <View style={styles.windshieldLine} />
            <Text style={styles.windshieldText}>FRONT WINDSHIELD</Text>
          </View>

          {/* FRONT ROW: Driver + Front Passenger */}
          <View style={styles.carRow}>
            {/* Driver Seat (Locked) */}
            <View style={styles.driverSeatContainer}>
              <View style={styles.driverSeat}>
                <Text style={styles.steeringWheelIcon}>🛞</Text>
                <Text style={styles.driverSeatLabel}>Driver</Text>
              </View>
            </View>

            {/* Console */}
            <View style={styles.centerConsole}>
              <View style={styles.gearStick} />
            </View>

            {/* Front Passenger Seat */}
            {(() => {
              const frontSeat = currentCar.seats.find((s) => s.row === 'front');
              if (!frontSeat) return <View style={styles.seatPlaceholder} />;
              const visible = isSeatVisible(frontSeat);
              const isSelected = selectedSeat === frontSeat.id;

              return (
                <Pressable
                  disabled={frontSeat.isBooked}
                  onPress={() => handleSeatClick(frontSeat)}
                  style={[
                    styles.seatCard,
                    frontSeat.isBooked && styles.seatCardBooked,
                    isSelected && styles.seatCardSelected,
                    !visible && styles.seatHiddenDimmed,
                  ]}
                >
                  <Text
                    style={[
                      styles.seatCardTitle,
                      frontSeat.isBooked && styles.seatCardTitleBooked,
                      isSelected && styles.seatCardTitleSelected,
                    ]}
                  >
                    {frontSeat.label}
                  </Text>
                  <Text
                    style={[
                      styles.seatCardSub,
                      frontSeat.isBooked && styles.seatCardSubBooked,
                      isSelected && styles.seatCardSubSelected,
                    ]}
                  >
                    {frontSeat.position}
                  </Text>
                  <View
                    style={[
                      styles.seatStatusPill,
                      frontSeat.isBooked
                        ? styles.pillBooked
                        : isSelected
                        ? styles.pillSelected
                        : styles.pillAvailable,
                    ]}
                  >
                    <Text
                      style={[
                        styles.seatStatusText,
                        frontSeat.isBooked && styles.seatStatusTextBooked,
                        isSelected && styles.seatStatusTextSelected,
                      ]}
                    >
                      {frontSeat.isBooked ? 'Booked' : isSelected ? 'Selected' : '₹650'}
                    </Text>
                  </View>
                </Pressable>
              );
            })()}
          </View>

          {/* MIDDLE ROW (SUV Only) */}
          {carType === 'suv' && (
            <View style={styles.carRow}>
              {currentCar.seats
                .filter((s) => s.row === 'middle')
                .map((seat, index) => {
                  const visible = isSeatVisible(seat);
                  const isSelected = selectedSeat === seat.id;

                  return (
                    <React.Fragment key={seat.id}>
                      {index === 1 && <View style={styles.centerAisle} />}
                      <Pressable
                        disabled={seat.isBooked}
                        onPress={() => handleSeatClick(seat)}
                        style={[
                          styles.seatCard,
                          seat.isBooked && styles.seatCardBooked,
                          isSelected && styles.seatCardSelected,
                          !visible && styles.seatHiddenDimmed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.seatCardTitle,
                            seat.isBooked && styles.seatCardTitleBooked,
                            isSelected && styles.seatCardTitleSelected,
                          ]}
                        >
                          {seat.label}
                        </Text>
                        <Text
                          style={[
                            styles.seatCardSub,
                            seat.isBooked && styles.seatCardSubBooked,
                            isSelected && styles.seatCardSubSelected,
                          ]}
                        >
                          {seat.position}
                        </Text>
                        <View
                          style={[
                            styles.seatStatusPill,
                            seat.isBooked
                              ? styles.pillBooked
                              : isSelected
                              ? styles.pillSelected
                              : styles.pillAvailable,
                          ]}
                        >
                          <Text
                            style={[
                              styles.seatStatusText,
                              seat.isBooked && styles.seatStatusTextBooked,
                              isSelected && styles.seatStatusTextSelected,
                            ]}
                          >
                            {seat.isBooked ? 'Booked' : isSelected ? 'Selected' : '₹650'}
                          </Text>
                        </View>
                      </Pressable>
                    </React.Fragment>
                  );
                })}
            </View>
          )}

          {/* BACK ROW */}
          <View style={styles.carRow}>
            {currentCar.seats
              .filter((s) => s.row === 'back')
              .map((seat) => {
                const visible = isSeatVisible(seat);
                const isSelected = selectedSeat === seat.id;
                const isMiddle = seat.position === 'Middle';

                return (
                  <Pressable
                    key={seat.id}
                    disabled={seat.isBooked}
                    onPress={() => handleSeatClick(seat)}
                    style={[
                      styles.seatCard,
                      isMiddle && styles.seatCardMiddle,
                      seat.isBooked && styles.seatCardBooked,
                      isSelected && styles.seatCardSelected,
                      !visible && styles.seatHiddenDimmed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.seatCardTitle,
                        seat.isBooked && styles.seatCardTitleBooked,
                        isSelected && styles.seatCardTitleSelected,
                      ]}
                    >
                      {seat.label}
                    </Text>
                    <Text
                      style={[
                        styles.seatCardSub,
                        seat.isBooked && styles.seatCardSubBooked,
                        isSelected && styles.seatCardSubSelected,
                      ]}
                    >
                      {seat.position}
                    </Text>
                    <View
                      style={[
                        styles.seatStatusPill,
                        seat.isBooked
                          ? styles.pillBooked
                          : isSelected
                          ? styles.pillSelected
                          : styles.pillAvailable,
                      ]}
                    >
                      <Text
                        style={[
                          styles.seatStatusText,
                          seat.isBooked && styles.seatStatusTextBooked,
                          isSelected && styles.seatStatusTextSelected,
                        ]}
                      >
                        {seat.isBooked ? 'Booked' : isSelected ? 'Selected' : '₹650'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
          </View>

          {/* Trunk */}
          <View style={styles.trunkArea}>
            <Text style={styles.trunkText}>LUGGAGE TRUNK SPACE 🧳</Text>
          </View>
        </View>

        {/* Selected Seat Info */}
        <View style={styles.selectedInfo}>
          <View>
            <Text style={styles.selectedLabel}>SELECTED SEAT</Text>
            <Text style={styles.selectedValue}>
              {selectedSeatObj
                ? `${selectedSeatObj.label} (${selectedSeatObj.position})`
                : 'Please select an available seat'}
            </Text>
          </View>
          {selectedSeatObj && (
            <View style={styles.seatConfirmedTag}>
              <Text style={styles.seatConfirmedTagText}>✓ Ready</Text>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Price per seat</Text>
            <Text style={styles.price}>₹{selectedSeat ? pricePerSeat : 0}</Text>
          </View>

          <View style={styles.passengerBadge}>
            <Text style={styles.passenger}>
              {selectedSeat ? '1 passenger' : '0 passenger'}
            </Text>
          </View>
        </View>

        {/* Continue Button (Apple Pill) */}
        <Pressable
          style={[styles.continueButton, !selectedSeat && styles.disabledButton]}
          disabled={!selectedSeat}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {selectedSeat ? `Continue to Booking • ₹${pricePerSeat}` : 'Select a seat to continue'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Apple Canvas
  },
  content: {
    padding: 18,
    paddingBottom: 36,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },
  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  routeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  route: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  liveBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  summaryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#86868B',
  },

  /* Car Switcher */
  carTypeSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#86868B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  carTypeTabs: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  carTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
    gap: 6,
  },
  carTabActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  carTabIcon: {
    fontSize: 14,
  },
  carTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86868B',
  },
  carTabTextActive: {
    color: '#1D1D1F',
    fontWeight: '800',
  },

  /* Section Title */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  /* Legend / Filters */
  legendWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6,
  },
  legendCheckboxItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },
  legendCheckboxItemActive: {
    borderColor: '#0071E3',
    backgroundColor: 'rgba(0, 113, 227, 0.04)',
  },
  checkboxSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#34C759',
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  selectedBox: {
    backgroundColor: '#0071E3',
  },
  bookedBox: {
    backgroundColor: '#E5E5EA',
  },
  checkIconWhite: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bookedMinus: {
    fontSize: 9,
    fontWeight: '800',
    color: '#86868B',
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#86868B',
  },
  legendTextHighlight: {
    color: '#1D1D1F',
    fontWeight: '800',
  },

  /* Active Filter Bar */
  filterNoticeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterNoticeText: {
    fontSize: 11,
    color: '#0071E3',
  },
  filterNoticeBold: {
    fontWeight: '800',
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0071E3',
  },

  /* Car Body Container */
  carBodyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  windshield: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    marginBottom: 16,
  },
  windshieldLine: {
    width: 32,
    height: 3,
    backgroundColor: '#D2D2D7',
    borderRadius: 2,
    marginBottom: 3,
  },
  windshieldText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#86868B',
  },

  carRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },

  /* Driver Seat */
  driverSeatContainer: {
    flex: 1,
    alignItems: 'center',
  },
  driverSeat: {
    width: '100%',
    minHeight: 70,
    borderRadius: 14,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  steeringWheelIcon: {
    fontSize: 20,
  },
  driverSeatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86868B',
    marginTop: 2,
  },

  centerConsole: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearStick: {
    width: 4,
    height: 28,
    backgroundColor: '#D2D2D7',
    borderRadius: 2,
  },
  centerAisle: {
    width: 14,
  },
  seatPlaceholder: {
    flex: 1,
  },

  /* Passenger Seat Cards */
  seatCard: {
    flex: 1,
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#34C759', // Apple Green for available
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      },
      default: {},
    }),
  },
  seatCardMiddle: {
    flex: 0.9,
  },
  seatCardSelected: {
    backgroundColor: '#0071E3', // Apple Blue Fill
    borderColor: '#0071E3',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  seatCardBooked: {
    backgroundColor: '#F5F5F7',
    borderColor: '#E5E5EA',
  },
  seatHiddenDimmed: {
    opacity: 0.2,
  },

  seatCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  seatCardTitleSelected: {
    color: '#FFFFFF',
  },
  seatCardTitleBooked: {
    color: '#86868B',
  },

  seatCardSub: {
    fontSize: 9,
    color: '#86868B',
    marginTop: 1,
    textAlign: 'center',
  },
  seatCardSubSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  seatCardSubBooked: {
    color: '#86868B',
  },

  seatStatusPill: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pillAvailable: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  pillSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillBooked: {
    backgroundColor: 'transparent',
  },

  seatStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
  },
  seatStatusTextSelected: {
    color: '#FFFFFF',
  },
  seatStatusTextBooked: {
    color: '#86868B',
  },

  /* Trunk */
  trunkArea: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  trunkText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
  },

  /* Selected Info Banner */
  selectedInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },
  selectedLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#86868B',
  },
  selectedValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  seatConfirmedTag: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatConfirmedTagText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Price Card */
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },
  priceLabel: {
    fontSize: 11,
    color: '#86868B',
  },
  price: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '900',
    color: '#1D1D1F',
  },
  passengerBadge: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passenger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
  },

  /* Continue Button */
  continueButton: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});