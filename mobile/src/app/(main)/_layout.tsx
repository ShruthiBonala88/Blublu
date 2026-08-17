import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function MainLayout() {
  const { role, setRole, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const toggleRole = () => {
    const nextRole = role === 'passenger' ? 'driver' : 'passenger';
    setRole(nextRole);
  };

  const passengerNav = [
    { label: 'Home', path: '/(main)' },
    { label: 'Search', path: '/(main)/search' },
    { label: 'My Rides', path: '/(main)/trips' },
    { label: 'Notifs', path: '/(main)/notifications' },
    { label: 'Profile', path: '/(main)/profile' },
  ];

  const driverNav = [
    { label: 'Dashboard', path: '/(main)' },
    { label: '+ Post Trip', path: '/(main)/create-trip' },
    { label: 'My Trips', path: '/(main)/driver-trips' },
    { label: 'Vehicles', path: '/(main)/vehicles' },
    { label: 'Earnings', path: '/(main)/earnings' },
    { label: 'Profile', path: '/(main)/profile' },
  ];

  const navItems = role === 'driver' ? driverNav : passengerNav;

  return (
    <View style={styles.container}>
      {/* Global Top Header with Role Switch */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerLogo}>Blublu</Text>
          {user && <Text style={styles.headerUser}>Hi, {user.name}</Text>}
        </View>

        <TouchableOpacity style={styles.roleBadge} onPress={toggleRole}>
          <Text style={styles.roleBadgeText}>
            {role === 'driver' ? '🚘 DRIVER' : '🚗 PASSENGER'} 🔄
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Custom Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path === '/(main)' && pathname === '/(main)/index');
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => router.replace(item.path as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#09090B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerUser: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  roleBadge: {
    backgroundColor: '#141417',
    borderColor: '#3F3F46',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#09090B',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#27272A',
  },
  tabText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
  },
});
