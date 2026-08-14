import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface SearchHeaderProps {
  title?: string;
  userAvatar?: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  title = 'Find a Ride',
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Intercity Carpooling & Ride Sharing</Text>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/(main)/notifications' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/(main)/profile' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leftGroup: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: border.radius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  icon: {
    fontSize: 18,
  },
});
