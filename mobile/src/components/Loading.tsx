import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface LoadingProps {
  message?: string;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message, overlay = false }) => {
  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    zIndex: 999,
  },
  message: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
});
