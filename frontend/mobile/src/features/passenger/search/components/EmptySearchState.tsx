import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from '../../../../components';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';

interface EmptySearchStateProps {
  origin: string;
  destination: string;
  onResetFilters: () => void;
}

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({
  origin,
  destination,
  onResetFilters,
}) => {
  return (
    <Card elevated style={styles.card}>
      <Text style={styles.icon}>🚗💨</Text>
      <Text style={styles.title}>No rides found</Text>
      <Text style={styles.description}>
        We couldn't find any active trips from {origin} to {destination} matching your filters. Try picking another date or route.
      </Text>
      <Button
        title="Reset Search Filters"
        onPress={onResetFilters}
        variant="outline"
        style={styles.button}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    minWidth: 180,
  },
});
