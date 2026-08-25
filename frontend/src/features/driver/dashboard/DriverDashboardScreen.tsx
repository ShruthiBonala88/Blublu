import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

export default function DriverDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.name}>BLUBLU Driver</Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            THIS MONTH{"'"}S EARNINGS
          </Text>

          <Text style={styles.balance}>
            ₹12,450
          </Text>

          <Text style={styles.balanceSubtext}>
            +18% compared with last month
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionGrid}>
          <ActionCard
            icon="🚗"
            title="Offer a Ride"
            subtitle="Create a new trip"
            onPress={() => router.push('/create-trip')}
          />

          <ActionCard
            icon="🧳"
            title="My Trips"
            subtitle="Manage your rides"
            onPress={() => router.push('/driver-trips')}
          />

          <ActionCard
            icon="💰"
            title="Earnings"
            subtitle="View your income"
            onPress={() => router.push('/earnings')}
          />

          <ActionCard
            icon="🚙"
            title="Vehicles"
            subtitle="Manage vehicles"
            onPress={() => router.push('/vehicles')}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Today{"'"}s Trip
        </Text>

        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View>
              <Text style={styles.tripRoute}>
                Hyderabad → Bengaluru
              </Text>

              <Text style={styles.tripDate}>
                Today • 6:30 PM
              </Text>
            </View>

            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>
                ACTIVE
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.tripStats}>
            <View>
              <Text style={styles.statLabel}>
                PASSENGERS
              </Text>

              <Text style={styles.statValue}>
                2 / 3
              </Text>
            </View>

            <View>
              <Text style={styles.statLabel}>
                EARNINGS
              </Text>

              <Text style={styles.statValue}>
                ₹1,300
              </Text>
            </View>

            <View>
              <Text style={styles.statLabel}>
                STATUS
              </Text>

              <Text style={styles.available}>
                Seats Available
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.viewButton}
            onPress={() => router.push('/driver-trips')}
          >
            <Text style={styles.viewButtonText}>
              Manage Trip
            </Text>
          </Pressable>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Driver Tip
            </Text>

            <Text style={styles.tipText}>
              Keep your vehicle clean and arrive early to
              provide passengers with a great experience.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
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
    <Pressable
      style={styles.actionCard}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.actionEmoji}>{icon}</Text>
      </View>

      <Text style={styles.actionTitle}>
        {title}
      </Text>

      <Text style={styles.actionSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  greeting: {
    fontSize: 13,
    color: '#94A3B8',
  },

  name: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  profileIcon: {
    fontSize: 21,
  },

  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 22,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },

  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94A3B8',
  },

  balance: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  balanceSubtext: {
    marginTop: 5,
    fontSize: 11,
    color: '#94A3B8',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 13,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1F2937',
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },

  actionEmoji: {
    fontSize: 20,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  actionSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#94A3B8',
  },

  tripCard: {
    backgroundColor: '#111827',
    borderRadius: 19,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1F2937',
  },

  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  tripRoute: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  tripDate: {
    marginTop: 4,
    fontSize: 11,
    color: '#94A3B8',
  },

  confirmedBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#334155',
  },

  confirmedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginVertical: 17,
  },

  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
  },

  statValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  available: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },

  viewButton: {
    marginTop: 17,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  viewButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  tipCard: {
    backgroundColor: '#111827',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  tipIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  tipText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: '#94A3B8',
  },
});