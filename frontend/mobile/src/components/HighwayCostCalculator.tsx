import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { border } from '../theme/border';

interface HighwayCostCalculatorProps {
  origin?: string;
  destination?: string;
  distanceKm?: number;
  initialSeats?: number;
}

export const HighwayCostCalculator: React.FC<HighwayCostCalculatorProps> = ({
  origin = 'Hyderabad',
  destination = 'Bengaluru',
  distanceKm = 580,
  initialSeats = 4,
}) => {
  const [mileageKml, setMileageKml] = useState(16);
  const [fuelPricePerLitre] = useState(102.5);
  const [passengerSeats, setPassengerSeats] = useState(initialSeats);
  const [showTollList, setShowTollList] = useState(false);

  // Toll plaza data along NH-44 Expressway
  const tollPlazas = [
    { id: 't1', name: 'Shadnagar Toll Plaza', cost: 120 },
    { id: 't2', name: 'Kurnool Highway Toll', cost: 145 },
    { id: 't3', name: 'Anantapur Bypass Toll', cost: 180 },
    { id: 't4', name: 'Bagepalli Expressway Toll', cost: 135 },
    { id: 't5', name: 'Devanahalli Airport Toll', cost: 100 },
  ];

  const totalTollCost = tollPlazas.reduce((acc, t) => acc + t.cost, 0); // ₹680
  const fuelLitresNeeded = distanceKm / mileageKml;
  const totalFuelCost = Math.round(fuelLitresNeeded * fuelPricePerLitre); // ~₹3,715
  const totalTripCost = totalFuelCost + totalTollCost; // ~₹4,395
  const fairCostPerSeat = Math.round(totalTripCost / passengerSeats); // ~₹1,099 / seat

  return (
    <Card elevated style={styles.container}>
      {/* Header Badge Row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.badgeTag}>
            <Text style={styles.badgeText}>🛣️ NH-44 EXPRESSWAY</Text>
          </View>
          <View style={styles.badgeTagGreen}>
            <Text style={styles.badgeTextGreen}>⚡ FAIR SHARE</Text>
          </View>
        </View>
        <Text style={styles.routeHeader}>
          {origin} ➔ {destination} ({distanceKm} km)
        </Text>
      </View>

      {/* Main Calculated Per-Seat Hero Card */}
      <View style={styles.highlightHeroCard}>
        <View style={styles.highlightLeft}>
          <Text style={styles.highlightLabel}>Calculated Fair Cost / Seat</Text>
          <Text style={styles.highlightPrice}>₹{fairCostPerSeat}</Text>
          <Text style={styles.highlightSub}>
            Split equally across {passengerSeats} seats
          </Text>
        </View>
        <View style={styles.splitIconCircle}>
          <Text style={styles.splitIcon}>⚖️</Text>
        </View>
      </View>

      {/* Interactive Controls (Mileage & Passengers Steppers) */}
      <View style={styles.controlsRow}>
        {/* Mileage Control */}
        <View style={styles.controlBox}>
          <Text style={styles.controlLabel}>⛽ Mileage (km/L)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setMileageKml((prev) => Math.max(8, prev - 1))}
            >
              <Text style={styles.stepText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepValue}>{mileageKml} km/L</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setMileageKml((prev) => Math.min(25, prev + 1))}
            >
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Passenger Seats Control */}
        <View style={styles.controlBox}>
          <Text style={styles.controlLabel}>👥 Passengers</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setPassengerSeats((prev) => Math.max(1, prev - 1))}
            >
              <Text style={styles.stepText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepValue}>{passengerSeats} Seats</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setPassengerSeats((prev) => Math.min(6, prev + 1))}
            >
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Vibrant Cost Breakdown Tile Grid */}
      <View style={styles.breakdownGrid}>
        <View style={[styles.gridItem, styles.gridItemEmerald]}>
          <Text style={styles.gridLabelEmerald}>⛽ Fuel Cost</Text>
          <Text style={styles.gridValue}>₹{totalFuelCost}</Text>
          <Text style={styles.gridSub}>{fuelLitresNeeded.toFixed(1)} Litres</Text>
        </View>

        <View style={[styles.gridItem, styles.gridItemPurple]}>
          <Text style={styles.gridLabelPurple}>🏷️ FASTag Tolls</Text>
          <Text style={styles.gridValue}>₹{totalTollCost}</Text>
          <Text style={styles.gridSub}>5 Highway Plazas</Text>
        </View>

        <View style={[styles.gridItem, styles.gridItemIndigo]}>
          <Text style={styles.gridLabelIndigo}>💰 Total Expense</Text>
          <Text style={styles.gridValue}>₹{totalTripCost}</Text>
          <Text style={styles.gridSub}>Fuel + Tolls</Text>
        </View>
      </View>

      {/* Expandable FASTag Toll Plazas List */}
      <TouchableOpacity
        style={styles.toggleTollBtn}
        onPress={() => setShowTollList(!showTollList)}
      >
        <Text style={styles.toggleTollText}>
          {showTollList
            ? '▼ Hide FASTag Toll Breakdown'
            : '▶ View 5 Highway Toll Plazas (₹680)'}
        </Text>
      </TouchableOpacity>

      {showTollList ? (
        <View style={styles.tollListContainer}>
          {tollPlazas.map((t, idx) => (
            <View key={t.id} style={styles.tollRow}>
              <Text style={styles.tollName}>
                {idx + 1}. {t.name}
              </Text>
              <View style={styles.tollBadge}>
                <Text style={styles.tollPrice}>₹{t.cost}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#161E2E',
    borderColor: '#06B6D4',
    borderWidth: 1.5,
    borderRadius: border.radius.xl,
  },
  headerRow: {
    marginBottom: 16,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badgeTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: colors.primary[400],
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.primary[400],
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  badgeTagGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.accent.emerald,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextGreen: {
    color: colors.accent.emerald,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  routeHeader: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  highlightHeroCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderRadius: border.radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderColor: colors.primary[500],
    borderWidth: 1.5,
  },
  highlightLeft: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  highlightPrice: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: '#00F2FE',
    letterSpacing: -1,
  },
  highlightSub: {
    fontSize: typography.sizes.xs,
    color: colors.accent.emerald,
    fontWeight: typography.weights.bold,
  },
  splitIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary[400],
    borderWidth: 1,
  },
  splitIcon: {
    fontSize: 26,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlBox: {
    flex: 1,
    backgroundColor: '#0B0F19',
    padding: 12,
    borderRadius: border.radius.lg,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  controlLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  stepValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  gridItem: {
    flex: 1,
    padding: 12,
    borderRadius: border.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  gridItemEmerald: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: colors.accent.emerald,
  },
  gridItemPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: colors.accent.purple,
  },
  gridItemIndigo: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: colors.accent.indigo,
  },
  gridLabelEmerald: {
    fontSize: 10,
    color: colors.accent.emerald,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  gridLabelPurple: {
    fontSize: 10,
    color: colors.accent.purple,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  gridLabelIndigo: {
    fontSize: 10,
    color: colors.accent.indigoGlow,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  gridSub: {
    fontSize: 9,
    color: colors.text.secondary,
  },
  toggleTollBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    borderRadius: border.radius.lg,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  toggleTollText: {
    color: colors.primary[400],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  tollListContainer: {
    marginTop: 10,
    backgroundColor: '#0B0F19',
    borderRadius: border.radius.lg,
    padding: 14,
    gap: 8,
  },
  tollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  tollName: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  tollBadge: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: border.radius.sm,
  },
  tollPrice: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary[300],
  },
});
