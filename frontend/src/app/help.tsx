import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

export default function HelpScreen() {
  const showMessage = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Help & Support</Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.supportCard}>
          <Text style={styles.supportIcon}>💬</Text>
          <Text style={styles.supportTitle}>How can we assist you today?</Text>
          <Text style={styles.supportText}>
            Find instant answers to common questions or connect directly with our 24/7 support specialists.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Topics</Text>

        <SupportButton
          icon="🚗"
          title="Finding & Booking a Ride"
          subtitle="How to search routes, select seats, and reserve"
          onPress={() =>
            showMessage(
              'Booking a ride',
              'Search for a route, choose a ride, select your seat and confirm your booking.',
            )
          }
        />

        <SupportButton
          icon="🧳"
          title="Manage My Bookings"
          subtitle="View upcoming tickets, passenger details, and routes"
          onPress={() => router.push('/trips')}
        />

        <SupportButton
          icon="💳"
          title="Pricing & 1-Tap Payments"
          subtitle="Information on UPI, refunds, and transparent cost sharing"
          onPress={() =>
            showMessage(
              'Payments',
              'BLUBLU carpooling connects passengers to share genuine fuel costs with zero hidden charges.',
            )
          }
        />

        <SupportButton
          icon="❌"
          title="Cancellation & Refunds"
          subtitle="Flexible cancellation up to 2 hours before trip"
          onPress={() =>
            showMessage(
              'Cancellation Policy',
              'Free cancellation up to 2 hours prior to scheduled departure time with instant refund.',
            )
          }
        />

        <Text style={styles.sectionTitle}>Direct Assistance</Text>

        <Pressable
          style={styles.contactCard}
          onPress={() =>
            showMessage(
              'Customer Care',
              'Toll free support: 1800-BLU-BLU (Open 24/7)',
            )
          }
        >
          <View style={styles.contactIconBadge}>
            <Text style={styles.contactIcon}>📞</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Call 24/7 Helpline</Text>
            <Text style={styles.contactText}>1800-BLU-BLU (Toll Free)</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.contactCard}
          onPress={() =>
            showMessage(
              'Email Support',
              'Send your query to support@blublu.in. Response within 2 hours.',
            )
          }
        >
          <View style={styles.contactIconBadge}>
            <Text style={styles.contactIcon}>✉️</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email Customer Support</Text>
            <Text style={styles.contactText}>support@blublu.in</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Text style={styles.version}>
          BLUBLU India • Version 2.0 (Apple HIG Design)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SupportButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuCard} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconEmoji}>{icon}</Text>
      </View>

      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
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

  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },

  supportIcon: {
    fontSize: 32,
    marginBottom: 6,
  },

  supportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  supportText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: '#86868B',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuIconEmoji: {
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

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  contactIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  contactIcon: {
    fontSize: 18,
  },

  contactInfo: {
    flex: 1,
  },

  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  contactText: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
  },

  arrow: {
    fontSize: 20,
    color: '#86868B',
  },

  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 11,
    color: '#86868B',
  },
});