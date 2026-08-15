import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button } from '../../components';
import { useAuth } from '../../providers/AuthProvider';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function Splash() {
  const router = useRouter();
  const { login } = useAuth();

  const handleGuestExplore = async () => {
    await login('guest-token', {
      id: 'guest-user-id',
      name: 'Guest Explorer',
      phone: '+91 00000 00000',
      role: 'passenger',
    });
    router.replace('/(main)' as any);
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.appName}>Blublu</Text>
        <Text style={styles.tagline}>
          Seamless intercity ride sharing and carpooling
        </Text>
      </View>

      <View style={styles.actionsSection}>
        <Button
          title="Get Started / Log In"
          onPress={() => router.push('/(auth)/login' as any)}
          style={styles.primaryButton}
        />
        <Button
          title="Create New Account"
          onPress={() => router.push('/(auth)/register' as any)}
          variant="outline"
          style={styles.secondaryButton}
        />
        <Button
          title="Explore as Guest"
          onPress={handleGuestExplore}
          variant="text"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 44,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  actionsSection: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
