import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';

export default function NotificationsScreen() {
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

          <Text style={styles.headerTitle}>Notifications</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Notifications list */}
        <NotificationCard
          icon="✓"
          title="Booking Confirmed"
          message="Your Hyderabad → Bengaluru seat (1A) has been confirmed."
          time="Just now"
          type="success"
        />

        <NotificationCard
          icon="🚗"
          title="Driver Assigned"
          message="Rahul Sharma (⭐ 4.9) will be your driver for today's ride."
          time="10 min ago"
          type="info"
        />

        <NotificationCard
          icon="⏰"
          title="Upcoming Departure"
          message="Your carpool departs today at 6:30 PM from Gachibowli."
          time="1 hour ago"
          type="warning"
        />

        <NotificationCard
          icon="🎉"
          title="Welcome to BLUBLU India"
          message="Discover verified routes and save up to 70% on travel."
          time="Yesterday"
          type="info"
        />

        {/* Empty-style footer */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🔔</Text>
          <Text style={styles.footerTitle}>You{"'"}re all caught up</Text>
          <Text style={styles.footerText}>
            New trip alerts and payment notifications will appear here.
          </Text>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

function NotificationCard({
  icon,
  title,
  message,
  time,
  type,
}: {
  icon: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}) {
  return (
    <View style={styles.notificationCard}>
      <View
        style={[
          styles.iconContainer,
          type === 'success' && styles.successIcon,
          type === 'info' && styles.infoIcon,
          type === 'warning' && styles.warningIcon,
        ]}
      >
        <Text
          style={[
            styles.icon,
            type === 'success' && styles.successIconText,
            type === 'info' && styles.infoIconText,
            type === 'warning' && styles.warningIconText,
          ]}
        >
          {icon}
        </Text>
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>
      </View>
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

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  successIcon: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },

  infoIcon: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
  },

  warningIcon: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
  },

  icon: {
    fontSize: 18,
    fontWeight: '900',
  },

  successIconText: {
    color: '#34C759',
  },

  infoIconText: {
    color: '#0071E3',
  },

  warningIconText: {
    color: '#FF9500',
  },

  notificationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  time: {
    marginLeft: 8,
    fontSize: 10,
    color: '#86868B',
  },

  message: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#86868B',
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  footerIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  footerText: {
    marginTop: 4,
    fontSize: 12,
    color: '#86868B',
  },
});