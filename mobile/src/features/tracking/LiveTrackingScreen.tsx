import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Card, Button } from '../../components';
import { LiveMapView } from './components/LiveMapView';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { border } from '../../theme/border';

export const LiveTrackingScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const tripId = params.id || 'trip-102';

  const [distanceRemaining, setDistanceRemaining] = useState(482);
  const [speed, setSpeed] = useState(82);

  // Live location update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDistanceRemaining((prev) => Math.max(1, prev - 1));
      setSpeed(Math.floor(75 + Math.random() * 15));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Screen style={styles.container} scrollable>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Ride Tracking</Text>
      </View>

      {/* Live Vector Map View Component */}
      <LiveMapView
        origin="Hyderabad"
        destination="Bengaluru"
        speedKmh={speed}
        distanceRemainingKm={distanceRemaining}
        eta="04:15 PM (In 5h 45m)"
      />

      {/* Driver & Trip Status Card */}
      <Card elevated style={styles.driverCard}>
        <View style={styles.driverRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>V</Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Vikram Singh</Text>
            <Text style={styles.vehicleDetails}>Toyota Innova Crysta • TS07-EX-2024</Text>
            <Text style={styles.ratingText}>⭐ 4.9 (142 rides) • Verified Driver ✅</Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => alert('Dialing Driver: +91 90329 05048...')}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Call Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => alert('Live tracking link copied to clipboard!')}
          >
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>Share Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItemDanger}
            onPress={() => alert('🚨 SOS Alert Sent! Emergency Services (112) notified.')}
          >
            <Text style={styles.actionIcon}>🚨</Text>
            <Text style={styles.actionTextDanger}>SOS (112)</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Route Timeline Schedule */}
      <Card elevated style={styles.scheduleCard}>
        <Text style={styles.sectionHeader}>Trip Timeline</Text>

        <View style={styles.timelineItem}>
          <View style={styles.timelineBadgeConfirmed}>
            <Text style={styles.timelineIcon}>📍</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Departed Hyderabad</Text>
            <Text style={styles.timelineTime}>06:30 AM • Gachibowli Junction</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineBadgeActive}>
            <Text style={styles.timelineIcon}>🚘</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitleActive}>Cruising on NH-44 Expressway</Text>
            <Text style={styles.timelineTime}>Current Location • Kurnool Bypass</Text>
          </View>
        </View>

        <View style={styles.timelineItem}>
          <View style={styles.timelineBadgeNext}>
            <Text style={styles.timelineIcon}>🏁</Text>
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitleNext}>Destination Bengaluru</Text>
            <Text style={styles.timelineTime}>Est. 04:15 PM • Hebbal Flyover</Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: border.radius.md,
  },
  backText: {
    color: colors.primary[400],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  driverCard: {
    padding: 16,
    marginVertical: 16,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: typography.weights.bold,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    color: colors.status.success,
    fontWeight: typography.weights.medium,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 12,
  },
  actionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: 10,
    borderRadius: border.radius.md,
    gap: 6,
  },
  actionItemDanger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: border.radius.md,
    gap: 6,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  actionTextDanger: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.status.error,
  },
  scheduleCard: {
    padding: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timelineBadgeConfirmed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBadgeActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[400],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBadgeNext: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIcon: {
    fontSize: 14,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  timelineTitleActive: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  timelineTitleNext: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  timelineTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});
