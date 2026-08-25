import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [tripUpdates, setTripUpdates] = useState(true);
  const [location, setLocation] = useState(true);

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

          <Text style={styles.title}>Settings</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>App Preferences</Text>

        <View style={styles.card}>
          <SettingRow
            icon="🔔"
            title="Push Notifications"
            subtitle="Ride status alerts and booking confirmations"
            value={notifications}
            onValueChange={setNotifications}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="🧳"
            title="Real-time Trip Updates"
            subtitle="Driver arrival and estimated travel time"
            value={tripUpdates}
            onValueChange={setTripUpdates}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="📍"
            title="Location Services"
            subtitle="Match nearby carpools and precise pickup"
            value={location}
            onValueChange={setLocation}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account & Security</Text>

        <Pressable
          style={styles.menuCard}
          onPress={() => router.push('/edit-profile')}
        >
          <View style={styles.menuIconBadge}>
            <Text style={styles.menuIcon}>👤</Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Edit Profile Information</Text>
            <Text style={styles.menuSubtitle}>Name, phone number, and email</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() =>
            Alert.alert(
              'Privacy',
              'BLUBLU does not sell your personal data or trip history.'
            )
          }
        >
          <View style={styles.menuIconBadge}>
            <Text style={styles.menuIcon}>🔒</Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Privacy & Data Protection</Text>
            <Text style={styles.menuSubtitle}>Manage data sharing and account security</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* Legal & About */}
        <Text style={styles.sectionTitle}>About</Text>

        <Pressable
          style={styles.menuCard}
          onPress={() =>
            Alert.alert(
              'About BLUBLU',
              'BLUBLU India: Intelligent, verified intercity carpooling platform.'
            )
          }
        >
          <View style={styles.menuIconBadge}>
            <Text style={styles.menuIcon}>ℹ️</Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>About BLUBLU</Text>
            <Text style={styles.menuSubtitle}>Version 2.0 (Apple HIG Edition)</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuCard}
          onPress={() =>
            Alert.alert(
              'Terms & Conditions',
              'Terms of service and passenger safety charter.'
            )
          }
        >
          <View style={styles.menuIconBadge}>
            <Text style={styles.menuIcon}>📄</Text>
          </View>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>Terms & Policies</Text>
            <Text style={styles.menuSubtitle}>Read BLUBLU community policies</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* Help Button */}
        <Pressable
          style={styles.helpButton}
          onPress={() => router.push('/help')}
        >
          <Text style={styles.helpIcon}>❓</Text>
          <Text style={styles.helpText}>Contact Support</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconBadge}>
        <Text style={styles.settingIcon}>{icon}</Text>
      </View>

      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: '#34C759' }}
        thumbColor="#FFFFFF"
      />
    </View>
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

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 10,
    marginTop: 10,
    letterSpacing: -0.2,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  settingIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  settingIcon: {
    fontSize: 18,
  },

  settingInfo: {
    flex: 1,
    marginRight: 10,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  settingSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },

  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  menuIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuIcon: {
    fontSize: 18,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  menuSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
  },

  arrow: {
    fontSize: 20,
    color: '#86868B',
  },

  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 15,
    marginTop: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  helpIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  helpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0071E3',
  },
});
