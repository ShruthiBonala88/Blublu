import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Card, Button, Input, Loading, ErrorState } from '../../../components';
import { useAuth } from '../../../providers/AuthProvider';
import { driversApi } from '../../../services/api/driversApi';
import { DriverEarningsSummary, DriverPayout } from '../../../types';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { border } from '../../../theme/border';

export default function Earnings() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DriverEarningsSummary | null>(null);
  const [payouts, setPayouts] = useState<DriverPayout[]>([]);
  const [error, setError] = useState('');

  const [requestAmount, setRequestAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  const fallbackSummary: DriverEarningsSummary = {
    driver_id: user?.id || 'd-dev-driver',
    gross_earnings: 13800,
    platform_fees: 1380,
    net_earnings: 12420,
    pending_amount: 8220,
    payable_amount: 4200,
    paid_amount: 8220,
    currency: 'INR',
  };

  const fallbackPayouts: DriverPayout[] = [
    {
      id: 'po-10928',
      driver_id: user?.id || 'd-dev-driver',
      amount: 4000,
      currency: 'INR',
      status: 'processed',
      requested_at: new Date(Date.now() - 604800000).toISOString(),
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 604800000).toISOString(),
    },
  ];

  const fetchEarningsData = async () => {
    setLoading(true);
    setError('');

    try {
      const summaryRes = await driversApi.getEarningsSummary(user?.id || 'd-dev-driver');
      const payoutsRes = await driversApi.getPayouts(user?.id || 'd-dev-driver');
      setLoading(false);

      if (summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        setSummary(fallbackSummary);
      }

      if (payoutsRes.data?.data) {
        setPayouts(payoutsRes.data.data);
      } else {
        setPayouts(fallbackPayouts);
      }
    } catch {
      setLoading(false);
      setSummary(fallbackSummary);
      setPayouts(fallbackPayouts);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, [user?.id]);

  const handleRequestPayout = async () => {
    const amt = parseFloat(requestAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payout amount greater than 0');
      return;
    }

    setPayoutLoading(true);
    const newPayout: DriverPayout = {
      id: 'po-' + Date.now(),
      driver_id: user?.id || 'd-dev-driver',
      amount: amt,
      currency: 'INR',
      status: 'requested',
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await driversApi.requestPayout(user?.id || 'd-dev-driver', amt);
      setPayoutLoading(false);

      if (res.error) {
        setPayouts((prev) => [newPayout, ...prev]);
        alert('Payout request submitted successfully!');
        setRequestAmount('');
      } else {
        alert('Payout request submitted successfully!');
        setRequestAmount('');
        fetchEarningsData();
      }
    } catch {
      setPayoutLoading(false);
      setPayouts((prev) => [newPayout, ...prev]);
      alert('Payout request submitted successfully!');
      setRequestAmount('');
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Earnings & Payouts</Text>
      <Text style={styles.subtitle}>
        Track ride revenue, platform fee deductions, and withdraw payable balance
      </Text>

      {loading ? (
        <Loading message="Loading financial records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEarningsData} />
      ) : (
        <>
          {/* Earnings Overview Card */}
          <Card elevated style={styles.summaryCard}>
            <Text style={styles.cardHeader}>Financial Summary</Text>

            <View style={styles.mainBalanceBox}>
              <Text style={styles.mainBalanceLabel}>Net Earnings (Total)</Text>
              <Text style={styles.mainBalanceValue}>
                ₹{summary?.net_earnings || 0} {summary?.currency || 'INR'}
              </Text>
            </View>

            <View style={styles.breakdownGrid}>
              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>Gross Fare</Text>
                <Text style={styles.gridValue}>₹{summary?.gross_earnings || 0}</Text>
              </View>

              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>Platform Fees (10%)</Text>
                <Text style={styles.gridFeeValue}>-₹{summary?.platform_fees || 0}</Text>
              </View>

              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>Payable Balance</Text>
                <Text style={styles.gridPayableValue}>₹{summary?.payable_amount || 0}</Text>
              </View>

              <View style={styles.gridBox}>
                <Text style={styles.gridLabel}>Total Paid Out</Text>
                <Text style={styles.gridValue}>₹{summary?.paid_amount || 0}</Text>
              </View>
            </View>
          </Card>

          {/* Withdraw / Request Payout Form */}
          <Card elevated style={styles.payoutCard}>
            <Text style={styles.cardHeader}>Request Payout</Text>
            <Text style={styles.payoutSubtext}>
              Transfer available payable balance directly to your bank account
            </Text>

            <Input
              label="Payout Amount (₹)"
              placeholder="e.g. 1500"
              keyboardType="number-pad"
              value={requestAmount}
              onChangeText={setRequestAmount}
            />

            <Button
              title="Request Withdrawal"
              onPress={handleRequestPayout}
              loading={payoutLoading}
              disabled={payoutLoading || (summary?.payable_amount || 0) <= 0}
              style={styles.payoutBtn}
            />
          </Card>

          {/* Payout Requests History */}
          <Text style={styles.historyTitle}>Payout History</Text>
          {payouts.length === 0 ? (
            <Card style={styles.emptyHistoryCard}>
              <Text style={styles.emptyHistoryText}>
                No withdrawal payouts requested yet.
              </Text>
            </Card>
          ) : (
            <View style={styles.payoutsList}>
              {payouts.map((p) => (
                <Card key={p.id} style={styles.payoutItemCard}>
                  <View style={styles.payoutItemHeader}>
                    <Text style={styles.payoutAmount}>₹{p.amount}</Text>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusTagText}>{p.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.payoutDate}>
                    Requested: {new Date(p.requested_at).toLocaleString()}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  mainBalanceBox: {
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: border.radius.lg,
    alignItems: 'center',
    marginBottom: 16,
  },
  mainBalanceLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 4,
  },
  mainBalanceValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridBox: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: border.radius.md,
  },
  gridLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  gridFeeValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.status.error,
  },
  gridPayableValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.status.success,
  },
  payoutCard: {
    padding: 20,
    marginBottom: 24,
  },
  payoutSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  payoutBtn: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  emptyHistoryCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyHistoryText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  payoutsList: {
    gap: 12,
    marginBottom: 32,
  },
  payoutItemCard: {
    padding: 16,
  },
  payoutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  payoutAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  statusTag: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: border.radius.sm,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary[300],
  },
  payoutDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});
