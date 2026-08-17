import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../../../components';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { border } from '../../../../theme/border';

export const SafetySection: React.FC = () => {
  const handleSosPress = () => {
    Alert.alert(
      'Emergency SOS Alert',
      'Are you sure you want to trigger emergency SOS? Local authorities and emergency contacts will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'TRIGGER SOS',
          style: 'destructive',
          onPress: () => alert('SOS Alert sent to emergency contacts.'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Safety & Emergency</Text>

      <View style={styles.row}>
        {/* Large Emergency SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSosPress}
          activeOpacity={0.8}
        >
          <Text style={styles.sosIcon}>🚨</Text>
          <Text style={styles.sosTitle}>EMERGENCY SOS</Text>
          <Text style={styles.sosDesc}>Tap for instant 24/7 help</Text>
        </TouchableOpacity>

        {/* Safety Center Entry Card */}
        <Card style={styles.safetyCard}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.safetyTitle}>Safety Center</Text>
          <Text style={styles.safetyDesc}>
            View safety guidelines, ride recording & support
          </Text>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  sosButton: {
    width: '48%',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1.5,
    borderRadius: border.radius.lg,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  sosTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.status.error,
    marginBottom: 2,
  },
  sosDesc: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  safetyCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  safetyTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  safetyDesc: {
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
