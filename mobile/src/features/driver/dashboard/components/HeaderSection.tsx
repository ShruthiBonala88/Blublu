import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

interface HeaderSectionProps {
  driverName: string;
  isOnline: boolean;
  avatarUrl?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  driverName,
  isOnline,
}) => {
  const router = useRouter();
  const initial = driverName ? driverName.charAt(0).toUpperCase() : 'D';

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: isOnline ? colors.status.success : colors.text.muted },
            ]}
          />
        </View>

        <View>
          <Text style={styles.welcomeTitle}>Welcome back,</Text>
          <Text style={styles.driverName}>{driverName}</Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        <View
          style={[
            styles.statusPill,
            isOnline ? styles.statusPillOnline : styles.statusPillOffline,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              isOnline ? styles.statusTextOnline : styles.statusTextOffline,
            ]}
          >
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/(main)/notifications' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.notifIcon}>🔔</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: typography.weights.bold,
  },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#09090B',
  },
  welcomeTitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  driverName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: border.radius.lg,
    borderWidth: 1,
  },
  statusPillOnline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  statusPillOffline: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.subtle,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  statusTextOnline: {
    color: '#09090B',
  },
  statusTextOffline: {
    color: colors.text.muted,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  notifIcon: {
    fontSize: 18,
  },
});
