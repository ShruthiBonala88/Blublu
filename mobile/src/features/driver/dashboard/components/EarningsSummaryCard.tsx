import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../../components';
import { DriverEarningsSummaryData } from '../types';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface EarningsSummaryCardProps {
  earnings: DriverEarningsSummaryData;
}

export const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  earnings,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Earnings Summary</Text>
        <TouchableOpacity
          onPress={() => router.push('/(main)/earnings' as any)}
        >
          <Text style={styles.viewDetailsText}>View Details ➔</Text>
        </TouchableOpacity>
      </View>

      <Card elevated style={styles.card}>
        <View style={styles.periodRow}>
          <View style={styles.periodBox}>
            <Text style={styles.periodLabel}>Today</Text>
            <Text style={styles.periodAmount}>
              {earnings.currency}{earnings.today}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.periodBox}>
            <Text style={styles.periodLabel}>This Week</Text>
            <Text style={styles.periodAmount}>
              {earnings.currency}{earnings.thisWeek}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.periodBox}>
            <Text style={styles.periodLabel}>This Month</Text>
            <Text style={styles.periodAmountHighlighted}>
              {earnings.currency}{earnings.thisMonth}
            </Text>
          </View>
        </View>

        {/* Visual Progress Bar representation */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '70%' }]} />
          </View>
          <Text style={styles.progressLabel}>70% of monthly earnings goal reached</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  viewDetailsText: {
    fontSize: typography.sizes.xs,
    color: colors.primary[400],
    fontWeight: typography.weights.semibold,
  },
  card: {
    padding: 18,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  periodBox: {
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 4,
  },
  periodAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  periodAmountHighlighted: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.subtle,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: border.radius.full,
  },
  progressLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
  },
});
