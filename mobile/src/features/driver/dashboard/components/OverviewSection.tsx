import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../components';
import { TodayOverviewData } from '../types';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface OverviewSectionProps {
  overview: TodayOverviewData;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  overview,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Today's Overview</Text>

      <View style={styles.grid}>
        <Card elevated style={styles.gridCard}>
          <Text style={styles.icon}>💰</Text>
          <Text style={styles.value}>₹{overview.todayEarnings}</Text>
          <Text style={styles.label}>Today's Earnings</Text>
        </Card>

        <Card elevated style={styles.gridCard}>
          <Text style={styles.icon}>🚗</Text>
          <Text style={styles.value}>{overview.completedTrips}</Text>
          <Text style={styles.label}>Completed Trips</Text>
        </Card>

        <Card elevated style={styles.gridCard}>
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.value}>{overview.totalPassengers}</Text>
          <Text style={styles.label}>Passengers</Text>
        </Card>

        <Card elevated style={styles.gridCard}>
          <Text style={styles.icon}>⭐</Text>
          <Text style={styles.value}>{overview.rating.toFixed(1)}</Text>
          <Text style={styles.label}>Rating</Text>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    borderRadius: border.radius.lg,
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
    marginBottom: 2,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
