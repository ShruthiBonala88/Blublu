import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PopularRoute } from '../types';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface PopularSearchesProps {
  routes: PopularRoute[];
  onSelectRoute: (origin: string, destination: string) => void;
}

export const PopularSearches: React.FC<PopularSearchesProps> = ({
  routes,
  onSelectRoute,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Popular Routes</Text>

      <View style={styles.chipsGrid}>
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => onSelectRoute(route.origin, route.destination)}
          >
            <Text style={styles.routeText}>
              {route.origin} ➔ {route.destination}
            </Text>
            <Text style={styles.priceEstimateText}>
              from ₹{route.priceEstimate}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  priceEstimateText: {
    fontSize: 10,
    color: colors.primary[400],
    fontWeight: typography.weights.medium,
  },
});
