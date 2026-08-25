import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_BASE_HEIGHT = 56;

interface NavItem {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
  routes: string[];
  onPress: () => void;
}

export default function BottomNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Safe bottom inset — min 8 on Android, account for home indicator on iOS
  const safeBottom = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 16)
    : Math.max(insets.bottom, 8);

  const navItems: NavItem[] = [
    {
      key: 'explore',
      label: 'Explore',
      icon: '🔍',
      activeIcon: '🔍',
      routes: ['/passenger-home', '/search', '/'],
      onPress: () => router.push('/passenger-home'),
    },
    {
      key: 'publish',
      label: 'Publish',
      icon: '⊕',
      activeIcon: '⊕',
      routes: ['/create-trip', '/driver-trips'],
      onPress: () => router.push('/create-trip'),
    },
    {
      key: 'rides',
      label: 'My Rides',
      icon: '🧳',
      activeIcon: '🧳',
      routes: ['/trips'],
      onPress: () => router.push('/trips'),
    },
    {
      key: 'inbox',
      label: 'Inbox',
      icon: '💬',
      activeIcon: '💬',
      routes: ['/notifications'],
      onPress: () => router.push('/notifications'),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: '👤',
      activeIcon: '👤',
      routes: ['/profile', '/edit-profile', '/vehicles', '/settings'],
      onPress: () => router.push('/profile'),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: safeBottom,
          height: TAB_BAR_BASE_HEIGHT + safeBottom,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive = item.routes.includes(pathname);
        return (
          <Pressable
            key={item.key}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.navItemPressed,
            ]}
            onPress={item.onPress}
            android_ripple={{ color: 'rgba(0, 113, 227, 0.08)', borderless: false, radius: 32 }}
          >
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {isActive ? item.activeIcon : item.icon}
              </Text>
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D1D6',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      web: {
        backdropFilter: 'saturate(180%) blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.08), 0 -4px 20px rgba(0,0,0,0.04)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      } as any,
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
        shadowColor: '#000000',
      },
    }),
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    minHeight: 48,
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  navItemPressed: {
    opacity: Platform.OS === 'ios' ? 0.7 : 1,
  },

  iconPill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  iconPillActive: {
    backgroundColor: 'rgba(0, 113, 227, 0.1)',
  },

  navIcon: {
    fontSize: 20,
  },

  navIconActive: {
    // emoji stays same, pill provides color context
  },

  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: -0.1,
    textAlign: 'center',
  },

  navLabelActive: {
    color: '#0071E3',
    fontWeight: '700',
  },
});
