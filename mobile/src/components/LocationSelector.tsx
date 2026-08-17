import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from './Input';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { border } from '../theme/border';

interface LocationSelectorProps {
  origin: string;
  destination: string;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSwap?: () => void;
}

const POPULAR_ROUTES = [
  { origin: 'Hyderabad', destination: 'Bengaluru' },
  { origin: 'Mumbai', destination: 'Pune' },
  { origin: 'Delhi', destination: 'Jaipur' },
  { origin: 'Chennai', destination: 'Bengaluru' },
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
}) => {
  const handleSelectRoute = (orig: string, dest: string) => {
    onOriginChange(orig);
    onDestinationChange(dest);
  };

  const handleSwap = () => {
    if (onSwap) {
      onSwap();
    } else {
      const temp = origin;
      onOriginChange(destination);
      onDestinationChange(temp);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsRow}>
        <View style={styles.inputsColumn}>
          <Input
            label="From (Origin)"
            placeholder="City or Pickup Location"
            value={origin}
            onChangeText={onOriginChange}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="To (Destination)"
            placeholder="City or Dropoff Location"
            value={destination}
            onChangeText={onDestinationChange}
            containerStyle={styles.inputContainer}
          />
        </View>

        <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
          <Text style={styles.swapText}>⇅</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.chipsTitle}>Popular Routes:</Text>
      <View style={styles.chipsRow}>
        {POPULAR_ROUTES.map((route, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => handleSelectRoute(route.origin, route.destination)}
          >
            <Text style={styles.chipText}>
              {route.origin} ➔ {route.destination}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputsColumn: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 10,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.elevated,
    borderColor: colors.border.default,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    alignSelf: 'center',
  },
  swapText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: typography.weights.bold,
  },
  chipsTitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    marginTop: 6,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: border.radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
  },
});
