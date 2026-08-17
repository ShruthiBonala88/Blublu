import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Card } from '../../../../components';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';

interface AvailabilityToggleProps {
  isOnline: boolean;
  onToggle: (newVal: boolean) => void;
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isOnline,
  onToggle,
}) => {
  return (
    <Card
      elevated
      style={StyleSheet.flatten([
        styles.card,
        isOnline ? styles.cardOnline : styles.cardOffline,
      ])}
    >
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.statusTitle}>
            {isOnline ? "You're Online" : "You're Offline"}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isOnline
              ? "You're online and ready for trips"
              : 'Go online to start receiving passenger bookings'}
          </Text>
        </View>

        <Switch
          value={isOnline}
          onValueChange={onToggle}
          trackColor={{
            false: colors.border.default,
            true: colors.primary[500],
          }}
          thumbColor={isOnline ? colors.primary[300] : colors.text.muted}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  cardOnline: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  cardOffline: {
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  statusTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
