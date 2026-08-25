import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function SplashScreen() {
  const { isLoggedIn, token } = useUserStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();

    // Automatically navigate to Sign In / Create Account if not logged in, or home if logged in
    const timer = setTimeout(() => {
      if (isLoggedIn && token) {
        router.replace('/passenger-home');
      } else {
        router.replace('/login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, isLoggedIn, token]);

  const handleLogin = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      <View style={styles.centerArea}>
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Apple Style Icon Badge */}
          <View style={styles.iconBadge}>
            <Text style={styles.badgeEmoji}>🚘</Text>
          </View>

          {/* Opening Typography */}
          <Text style={styles.logoText}>BLUBLU</Text>
          <Text style={styles.taglineText}>Travel together. Go further.</Text>

          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>INDIA'S SMARTEST CARPOOL NETWORK</Text>
          </View>
        </Animated.View>

        {/* Bottom Actions */}
        <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Get Started • Sign In / Register</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </Pressable>

          <Text style={styles.termsNote}>Verified Mobility Powered by BLUBLU</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      web: {
        boxShadow: '0 12px 32px rgba(0, 113, 227, 0.15)',
      } as any,
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },
  badgeEmoji: {
    fontSize: 38,
  },
  logoText: {
    fontSize: 46,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  taglineText: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '500',
    color: '#6E6E73',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subBadge: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  subBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0071E3',
    letterSpacing: 0.5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0071E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 9999,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 18px rgba(0, 113, 227, 0.35)',
        cursor: 'pointer',
      } as any,
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
      default: {},
    }),
  },
  secondaryButtonText: {
    color: '#1D1D1F',
    fontSize: 15,
    fontWeight: '700',
  },
  termsNote: {
    marginTop: 4,
    fontSize: 11,
    color: '#86868B',
    fontWeight: '500',
  },
});