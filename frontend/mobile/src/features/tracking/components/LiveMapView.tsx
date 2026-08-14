import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

interface LiveMapViewProps {
  origin: string;
  destination: string;
  speedKmh?: number;
  distanceRemainingKm: number;
  eta: string;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  origin,
  destination,
  speedKmh = 78,
  distanceRemainingKm,
  eta,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.mapCanvas}>
      {/* Grid Pattern / Map Background Overlay */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical} />
      </View>

      {/* Top Floating Speed & Status Bar */}
      <View style={styles.mapFloatingHeader}>
        <View style={styles.livePulseTag}>
          <Animated.View
            style={[
              styles.pulseDot,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Text style={styles.liveText}>LIVE GPS</Text>
        </View>

        <View style={styles.speedBadge}>
          <Text style={styles.speedText}>⚡ {speedKmh} km/h</Text>
        </View>

        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>⏱️ ETA: {eta}</Text>
        </View>
      </View>

      {/* Intercity Route Polyline Visualization */}
      <View style={styles.routeContainer}>
        {/* Origin Pin */}
        <View style={styles.pinPoint}>
          <View style={styles.originMarker}>
            <Text style={styles.pinIcon}>📍</Text>
          </View>
          <Text style={styles.pinLabel}>{origin}</Text>
        </View>

        {/* Route Line & Vehicle Position */}
        <View style={styles.routeLineTrack}>
          <View style={styles.routeProgressLine} />

          {/* Animated Vehicle Icon on Route */}
          <Animated.View style={styles.vehicleMarkerContainer}>
            <View style={styles.vehicleHalo} />
            <Text style={styles.vehicleCarIcon}>🚘</Text>
          </Animated.View>
        </View>

        {/* Destination Pin */}
        <View style={styles.pinPoint}>
          <View style={styles.destinationMarker}>
            <Text style={styles.pinIcon}>🏁</Text>
          </View>
          <Text style={styles.pinLabel}>{destination}</Text>
        </View>
      </View>

      {/* Bottom Route Distance Indicator */}
      <View style={styles.distanceBar}>
        <Text style={styles.distanceText}>
          {distanceRemainingKm} km remaining on NH-44 Expressway
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapCanvas: {
    height: 320,
    backgroundColor: '#0F172A',
    borderRadius: border.radius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    justifyContent: 'space-between',
    padding: 16,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.primary[400],
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.primary[400],
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.primary[400],
  },
  mapFloatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  livePulseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.status.success,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,
  },
  liveText: {
    color: colors.status.success,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  speedBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speedText: {
    color: colors.primary[400],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  etaBadge: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etaText: {
    color: colors.primary[300],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 24,
  },
  pinPoint: {
    alignItems: 'center',
    width: 80,
  },
  originMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pinIcon: {
    fontSize: 20,
  },
  pinLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  routeLineTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.elevated,
    borderRadius: 3,
    position: 'relative',
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  routeProgressLine: {
    width: '60%',
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  vehicleMarkerContainer: {
    position: 'absolute',
    left: '55%',
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
  },
  vehicleCarIcon: {
    fontSize: 24,
  },
  distanceBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: border.radius.md,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
});
