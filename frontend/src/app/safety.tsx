import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

export default function SafetyScreen() {
  const [shareLocation, setShareLocation] = useState(true);
  const [tripAlerts, setTripAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Safety & Trust</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Safety Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconEmoji}>🛡️</Text>
          </View>

          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Your Safety is Priority #1</Text>
            <Text style={styles.bannerText}>
              Every ride is backed by mandatory ID verification, live route tracking, and 24/7 SOS assistance.
            </Text>
          </View>
        </View>

        {/* Safety Features */}
        <Text style={styles.sectionTitle}>Built-In Protections</Text>

        <View style={styles.card}>
          <View style={styles.featureRow}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>✓</Text>
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>100% Verified Profiles</Text>
              <Text style={styles.featureText}>
                Government ID, phone, and driver background checks are verified.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureRow}>
            <View style={[styles.featureIconContainer, styles.featureIconBlue]}>
              <Text style={styles.featureIcon}>📍</Text>
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Live GPS Trip Tracking</Text>
              <Text style={styles.featureText}>
                Share your real-time vehicle location with family with 1-Tap.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureRow}>
            <View style={[styles.featureIconContainer, styles.featureIconRed]}>
              <Text style={styles.featureIcon}>🚨</Text>
            </View>

            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>24/7 Emergency SOS</Text>
              <Text style={styles.featureText}>
                Instant connectivity to police and BLUBLU emergency support team.
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Controls */}
        <Text style={styles.sectionTitle}>Privacy & Location Settings</Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Share Live Location</Text>
              <Text style={styles.settingText}>
                Allow trusted emergency contacts to view your route progress.
              </Text>
            </View>

            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Ride Alerts & Check-ins</Text>
              <Text style={styles.settingText}>
                Receive automated notifications if route deviations occur.
              </Text>
            </View>

            <Switch
              value={tripAlerts}
              onValueChange={setTripAlerts}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Emergency Card */}
        <Pressable style={styles.emergencyButton}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View>
            <Text style={styles.emergencyTitle}>Emergency Assistance (SOS)</Text>
            <Text style={styles.emergencyText}>
              Direct connect to safety dispatcher
            </Text>
          </View>
        </Pressable>

        <Text style={styles.footer}>
          BLUBLU strictly enforces road safety rules, seat-belt mandates, and passenger background integrity.
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
    padding: 20,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  banner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },

  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  bannerIconEmoji: {
    fontSize: 22,
  },

  bannerContent: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  bannerText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#86868B',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  featureIconBlue: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
  },

  featureIconRed: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },

  featureIcon: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '900',
  },

  featureContent: {
    flex: 1,
    marginLeft: 12,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  featureText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#86868B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 14,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingContent: {
    flex: 1,
    marginRight: 15,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  settingText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#86868B',
  },

  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  emergencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  emergencyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF3B30',
  },

  emergencyText: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#86868B',
  },
});