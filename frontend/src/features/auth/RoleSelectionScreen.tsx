import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore, UserRole } from '@/store/userStore';

export default function RoleSelectionScreen() {
  const { role: currentRole, setRole } = useUserStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    currentRole || 'passenger'
  );

  const handleContinue = () => {
    if (!selectedRole) return;
    setRole(selectedRole);
    if (selectedRole === 'driver') {
      router.replace('/driver-trips');
    } else {
      router.replace('/passenger-home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>BLUBLU</Text>
          </View>

          <Text style={styles.title}>How will you use BLUBLU?</Text>
          <Text style={styles.subtitle}>
            Select how you would like to experience carpooling today.
          </Text>
        </View>

        {/* Passenger Option */}
        <Pressable
          style={[
            styles.roleCard,
            selectedRole === 'passenger' && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole('passenger')}
        >
          <View style={[styles.iconContainer, selectedRole === 'passenger' && styles.iconContainerSelected]}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <View style={styles.roleContent}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>Passenger</Text>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            </View>

            <Text style={styles.roleDescription}>
              Find affordable shared rides and travel comfortably across cities.
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedRole === 'passenger' && styles.radioSelected,
            ]}
          >
            {selectedRole === 'passenger' && (
              <View style={styles.radioDot} />
            )}
          </View>
        </Pressable>

        {/* Driver Option */}
        <Pressable
          style={[
            styles.roleCard,
            selectedRole === 'driver' && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole('driver')}
        >
          <View style={[styles.iconContainer, selectedRole === 'driver' && styles.iconContainerSelected]}>
            <Text style={styles.icon}>🚘</Text>
          </View>

          <View style={styles.roleContent}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>Driver</Text>
              <View style={styles.earnBadge}>
                <Text style={styles.earnText}>Earn Money</Text>
              </View>
            </View>

            <Text style={styles.roleDescription}>
              Publish empty seats, offset fuel costs, and meet verified co-travellers.
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedRole === 'driver' && styles.radioSelected,
            ]}
          >
            {selectedRole === 'driver' && (
              <View style={styles.radioDot} />
            )}
          </View>
        </Pressable>

        {/* Admin Option */}
        <Pressable
          style={[
            styles.roleCard,
            selectedRole === 'admin' && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole('admin')}
        >
          <View style={[styles.iconContainer, selectedRole === 'admin' && styles.iconContainerSelected]}>
            <Text style={styles.icon}>🛡️</Text>
          </View>

          <View style={styles.roleContent}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>Admin</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Full Access</Text>
              </View>
            </View>

            <Text style={styles.roleDescription}>
              Manage users, verify driver KYC submissions, process payouts & monitor analytics.
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedRole === 'admin' && styles.radioSelected,
            ]}
          >
            {selectedRole === 'admin' && (
              <View style={styles.radioDot} />
            )}
          </View>
        </Pressable>

        {/* Continue Button (Apple Pill) */}
        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </Text>
        </Pressable>

        <Text style={styles.note}>
          You can seamlessly switch roles anytime from your profile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Apple Canvas
  },

  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  brandBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginBottom: 16,
  },

  brandText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#0071E3',
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: '#86868B',
    textAlign: 'center',
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },

  selectedCard: {
    borderColor: '#0071E3',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 113, 227, 0.12)',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  iconContainerSelected: {
    backgroundColor: 'rgba(0, 113, 227, 0.1)',
  },

  icon: {
    fontSize: 26,
  },

  roleContent: {
    flex: 1,
  },

  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.2,
  },

  popularBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759', // Apple System Green
  },

  earnBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  earnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0071E3',
  },

  adminBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  adminText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9333EA',
  },

  roleDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#86868B',
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D2D2D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  radioSelected: {
    borderColor: '#0071E3',
    backgroundColor: '#0071E3',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  continueButton: {
    height: 52,
    marginTop: 18,
    borderRadius: 9999, // Apple Pill Shape
    backgroundColor: '#0071E3', // Apple Blue
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  note: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#86868B',
  },
});