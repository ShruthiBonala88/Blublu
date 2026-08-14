import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PassengerSearchFilters } from '../types';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface FilterBarProps {
  filters: PassengerSearchFilters;
  onFilterChange: (updated: Partial<PassengerSearchFilters>) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sort Controls */}
        <TouchableOpacity
          style={[
            styles.chip,
            filters.sortBy === 'departure_asc' && styles.chipActive,
          ]}
          onPress={() => onFilterChange({ sortBy: 'departure_asc' })}
        >
          <Text
            style={[
              styles.chipText,
              filters.sortBy === 'departure_asc' && styles.chipTextActive,
            ]}
          >
            ⏰ Earliest Departure
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            filters.sortBy === 'price_asc' && styles.chipActive,
          ]}
          onPress={() => onFilterChange({ sortBy: 'price_asc' })}
        >
          <Text
            style={[
              styles.chipText,
              filters.sortBy === 'price_asc' && styles.chipTextActive,
            ]}
          >
            💰 Lowest Price
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chip,
            filters.sortBy === 'rating_desc' && styles.chipActive,
          ]}
          onPress={() => onFilterChange({ sortBy: 'rating_desc' })}
        >
          <Text
            style={[
              styles.chipText,
              filters.sortBy === 'rating_desc' && styles.chipTextActive,
            ]}
          >
            ⭐ Top Rated Drivers
          </Text>
        </TouchableOpacity>

        {/* Vehicle Type Filter */}
        {(['all', 'Sedan', 'SUV', 'EV'] as const).map((vt) => (
          <TouchableOpacity
            key={vt}
            style={[
              styles.chip,
              filters.vehicleType === vt && styles.chipActive,
            ]}
            onPress={() => onFilterChange({ vehicleType: vt })}
          >
            <Text
              style={[
                styles.chipText,
                filters.vehicleType === vt && styles.chipTextActive,
              ]}
            >
              🚘 {vt === 'all' ? 'All Vehicles' : vt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    gap: 8,
  },
  chip: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: border.radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipActive: {
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  chipTextActive: {
    color: colors.primary[300],
    fontWeight: typography.weights.bold,
  },
});
