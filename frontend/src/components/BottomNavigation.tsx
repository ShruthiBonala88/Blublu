import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';

export default function BottomNavigation() {
  const pathname = usePathname();

  const isSearchActive =
    pathname === '/passenger-home' || pathname === '/search' || pathname === '/';
  const isPublishActive = pathname === '/create-trip' || pathname === '/driver-trips';
  const isRidesActive = pathname === '/trips';
  const isInboxActive = pathname === '/notifications';
  const isProfileActive =
    pathname === '/profile' || pathname === '/edit-profile' || pathname === '/vehicles' || pathname === '/settings';

  return (
    <View style={styles.container}>
      {/* Search */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.push('/passenger-home')}
      >
        <View style={[styles.iconContainer, isSearchActive && styles.activeIconContainer]}>
          <Text style={[styles.navIcon, isSearchActive && styles.activeIcon]}>
            🔍
          </Text>
        </View>
        <Text style={[styles.navLabel, isSearchActive && styles.activeLabel]}>
          Explore
        </Text>
      </Pressable>

      {/* Publish */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.push('/create-trip')}
      >
        <View style={[styles.iconContainer, isPublishActive && styles.activeIconContainer]}>
          <Text style={[styles.navIcon, isPublishActive && styles.activeIcon]}>
            ⊕
          </Text>
        </View>
        <Text style={[styles.navLabel, isPublishActive && styles.activeLabel]}>
          Publish
        </Text>
      </Pressable>

      {/* Your rides */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.push('/trips')}
      >
        <View style={[styles.iconContainer, isRidesActive && styles.activeIconContainer]}>
          <Text style={[styles.navIcon, isRidesActive && styles.activeIcon]}>
            🧳
          </Text>
        </View>
        <Text style={[styles.navLabel, isRidesActive && styles.activeLabel]}>
          My Rides
        </Text>
      </Pressable>

      {/* Inbox */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.push('/notifications')}
      >
        <View style={[styles.iconContainer, isInboxActive && styles.activeIconContainer]}>
          <Text style={[styles.navIcon, isInboxActive && styles.activeIcon]}>
            💬
          </Text>
        </View>
        <Text style={[styles.navLabel, isInboxActive && styles.activeLabel]}>
          Inbox
        </Text>
      </Pressable>

      {/* Profile */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.push('/profile')}
      >
        <View style={[styles.iconContainer, isProfileActive && styles.activeIconContainer]}>
          <Text style={[styles.navIcon, isProfileActive && styles.activeIcon]}>
            👤
          </Text>
        </View>
        <Text style={[styles.navLabel, isProfileActive && styles.activeLabel]}>
          Profile
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
    ...Platform.select({
      web: {
        backdropFilter: 'saturate(180%) blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        boxShadow: '0 -2px 14px rgba(0, 0, 0, 0.04)',
      } as any,
      default: {
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
      default: {},
    }),
  },
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
  },
  navIcon: {
    fontSize: 18,
    color: '#86868B',
  },
  activeIcon: {
    color: '#0071E3',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#86868B',
    letterSpacing: -0.2,
  },
  activeLabel: {
    color: '#0071E3',
    fontWeight: '600',
  },
});
