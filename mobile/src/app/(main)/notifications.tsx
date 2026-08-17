import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen, Card } from '../../components';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function Notifications() {
  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Notifications</Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Welcome to Blublu! 🎉</Text>
        <Text style={styles.cardBody}>
          Your account is set up. You can now search for intercity rides or create your own trip schedule as a driver.
        </Text>
        <Text style={styles.cardTime}>Just now</Text>
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
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});
