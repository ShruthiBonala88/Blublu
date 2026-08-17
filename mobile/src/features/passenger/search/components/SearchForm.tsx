import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Input, Button, LocationSelector } from '../../../../components';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface SearchFormProps {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onPassengersChange: (val: number) => void;
  onSearch: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  origin,
  destination,
  date,
  passengers,
  onOriginChange,
  onDestinationChange,
  onDateChange,
  onPassengersChange,
  onSearch,
}) => {
  const handleNextDayDate = () => {
    try {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      onDateChange(d.toISOString().split('T')[0]);
    } catch {
      onDateChange(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <Card elevated style={styles.card}>
      <Text style={styles.cardHeaderTitle}>Search Available Trips</Text>

      <LocationSelector
        origin={origin}
        destination={destination}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
      />

      <View style={styles.detailsRow}>
        {/* Date Selector */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>Travel Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={handleNextDayDate}
            activeOpacity={0.7}
          >
            <Text style={styles.dateBtnText}>📅 {date}</Text>
          </TouchableOpacity>
        </View>

        {/* Passenger Counter */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>Passengers</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => onPassengersChange(Math.max(1, passengers - 1))}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.counterValueText}>{passengers}</Text>

            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => onPassengersChange(Math.min(6, passengers + 1))}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Button
        title="Search Rides ➔"
        onPress={onSearch}
        style={styles.searchBtn}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  fieldCol: {
    flex: 1,
  },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginBottom: 6,
  },
  dateBtn: {
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  dateBtnText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.lg,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  counterValueText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  searchBtn: {
    marginTop: 4,
  },
});
