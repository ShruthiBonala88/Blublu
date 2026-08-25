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

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Driver Earnings</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>LIFETIME REVENUE</Text>
          <Text style={styles.totalAmount}>₹12,450</Text>
          <Text style={styles.totalSubtext}>From 18 completed shared journeys</Text>
        </View>

        {/* Metrics Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>₹</Text>
            <Text style={styles.statValue}>₹692</Text>
            <Text style={styles.statLabel}>Avg / Ride</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Trip Payouts</Text>

        <View style={styles.card}>
          <EarningRow
            route="Hyderabad → Bengaluru"
            date="Today, 6:30 PM"
            amount="₹1,300"
          />

          <View style={styles.divider} />

          <EarningRow
            route="Bengaluru → Hyderabad"
            date="Yesterday, 7:00 AM"
            amount="₹1,950"
          />

          <View style={styles.divider} />

          <EarningRow
            route="Hyderabad → Vijayawada"
            date="10 Aug"
            amount="₹900"
          />

          <View style={styles.divider} />

          <EarningRow
            route="Vijayawada → Hyderabad"
            date="9 Aug"
            amount="₹850"
          />
        </View>

        <Pressable
          style={styles.historyButton}
          onPress={() => router.push('/driver-trips')}
        >
          <Text style={styles.historyText}>
            View Driver Trip History →
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function EarningRow({
  route,
  date,
  amount,
}: {
  route: string;
  date: string;
  amount: string;
}) {
  return (
    <View style={styles.earningRow}>
      <View style={styles.earningIcon}>
        <Text style={styles.earningIconSymbol}>₹</Text>
      </View>

      <View style={styles.earningInfo}>
        <Text style={styles.route}>{route}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <Text style={styles.amount}>+{amount}</Text>
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

  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },

  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
  },

  totalAmount: {
    marginTop: 4,
    fontSize: 38,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -1,
  },

  totalSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#86868B',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  statIcon: {
    fontSize: 18,
  },

  statValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 11,
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
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  earningIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  earningIconSymbol: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34C759',
  },

  earningInfo: {
    flex: 1,
    marginLeft: 12,
  },

  route: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  date: {
    marginTop: 2,
    fontSize: 11,
    color: '#86868B',
  },

  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34C759',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },

  historyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  historyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0071E3',
  },
});
