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
    backgroundColor: '#141417',
    borderRadius: border.radius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'space-between',
    padding: 16,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#1C1C20',
    borderColor: '#3F3F46',
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
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  speedBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  etaBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etaText: {
    color: '#09090B',
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
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
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
    backgroundColor: '#27272A',
    borderRadius: 3,
    position: 'relative',
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  routeProgressLine: {
    width: '60%',
    height: '100%',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  vehicleCarIcon: {
    fontSize: 24,
  },
  distanceBar: {
    backgroundColor: '#09090B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: border.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  distanceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
});
