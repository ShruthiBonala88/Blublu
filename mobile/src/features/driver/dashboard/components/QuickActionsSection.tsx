import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

export const QuickActionsSection: React.FC = () => {
  const router = useRouter();

  const actions = [
    {
      title: 'Create Trip',
      desc: 'Post a new route',
      icon: '➕',
      path: '/(main)/create-trip',
    },
    {
      title: 'My Trips',
      desc: 'View & manage schedule',
      icon: '📅',
      path: '/(main)/driver-trips',
    },
    {
      title: 'Vehicles',
      desc: 'Manage registered cars',
      icon: '🚘',
      path: '/(main)/vehicles',
    },
    {
      title: 'Earnings',
      desc: 'Payouts & history',
      icon: '💰',
      path: '/(main)/earnings',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        {actions.map((act, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.actionTile}
            activeOpacity={0.7}
            onPress={() => router.push(act.path as any)}
          >
            <Text style={styles.icon}>{act.icon}</Text>
            <Text style={styles.tileTitle}>{act.title}</Text>
            <Text style={styles.tileDesc}>{act.desc}</Text>
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
  actionTile: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: border.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  icon: {
    fontSize: 26,
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  tileDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});
