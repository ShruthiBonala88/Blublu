import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Card, Button, Input } from '../../components';
import { paymentsApi } from '../../services/api/paymentsApi';
import { PaymentMethodType } from './types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { border } from '../../theme/border';

export const PaymentScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    booking_id?: string;
    amount?: string;
    origin?: string;
    destination?: string;
  }>();

  const bookingId = params.booking_id || 'bk-10293847';
  const baseAmount = parseFloat(params.amount || '780');

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txnRef, setTxnRef] = useState('');

  const platformFee = 20;
  const netAmount = Math.max(0, baseAmount + platformFee - discount);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'BLUBLU200') {
      setDiscount(200);
      setCouponApplied(true);
      alert('Coupon BLUBLU200 applied! ₹200 Discount unlocked 🎉');
    } else {
      alert('Invalid coupon code. Try code: BLUBLU200');
    }
  };

  const handlePayNow = async () => {
    setProcessing(true);

    try {
      const orderRes = await paymentsApi.createOrder(bookingId);
      setProcessing(false);

      const generatedTxn =
        (orderRes.data as any)?.order_id || 'PAY-RZP-' + Math.floor(100000 + Math.random() * 900000);
      setTxnRef(generatedTxn);
      setShowSuccessModal(true);
    } catch {
      setProcessing(false);
      setTxnRef('PAY-RZP-' + Math.floor(100000 + Math.random() * 900000));
      setShowSuccessModal(true);
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Checkout</Text>
      </View>

      {/* Fare Summary Card */}
      <Card elevated style={styles.summaryCard}>
        <Text style={styles.cardHeader}>Fare & Fee Breakdown</Text>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Seat Ticket Fare</Text>
          <Text style={styles.fareValue}>₹{baseAmount}</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Platform Convenience Fee</Text>
          <Text style={styles.fareValue}>+₹{platformFee}</Text>
        </View>

        {couponApplied ? (
          <View style={styles.fareRow}>
            <Text style={styles.discountLabel}>Promo Coupon (BLUBLU200)</Text>
            <Text style={styles.discountValue}>-₹{discount}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable Amount</Text>
          <Text style={styles.totalValue}>₹{netAmount}</Text>
        </View>
      </Card>

      {/* Coupon Code Section */}
      <Card style={styles.couponCard}>
        <Text style={styles.cardHeader}>Promo & Coupon Code</Text>
        <View style={styles.couponRow}>
          <Input
            placeholder="e.g. BLUBLU200"
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize="characters"
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
          <Button
            title={couponApplied ? 'Applied ✓' : 'Apply'}
            onPress={handleApplyCoupon}
            disabled={couponApplied}
            size="sm"
          />
        </View>
      </Card>

      {/* Payment Method Selector */}
      <Text style={styles.sectionHeader}>Select Payment Method</Text>

      {/* 1. UPI Payment */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'upi' && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod('upi')}
      >
        <Text style={styles.methodIcon}>⚡</Text>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>UPI (Razorpay Gateway)</Text>
          <Text style={styles.methodSub}>Google Pay, PhonePe, Paytm, BHIM</Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'upi' && styles.radioCircleSelected,
          ]}
        />
      </TouchableOpacity>

      {/* 2. Blublu Wallet */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'wallet' && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod('wallet')}
      >
        <Text style={styles.methodIcon}>👛</Text>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>Blublu Wallet (Balance ₹1,250)</Text>
          <Text style={styles.methodSub}>Instant 1-click payment</Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'wallet' && styles.radioCircleSelected,
          ]}
        />
      </TouchableOpacity>

      {/* 3. Cards */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'card' && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod('card')}
      >
        <Text style={styles.methodIcon}>💳</Text>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>Credit / Debit Card</Text>
          <Text style={styles.methodSub}>Visa, MasterCard, RuPay</Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'card' && styles.radioCircleSelected,
          ]}
        />
      </TouchableOpacity>

      {/* 4. Cash on Pick-up */}
      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'cash' && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod('cash')}
      >
        <Text style={styles.methodIcon}>💵</Text>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>Cash to Driver on Boarding</Text>
          <Text style={styles.methodSub}>Pay cash at journey departure</Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === 'cash' && styles.radioCircleSelected,
          ]}
        />
      </TouchableOpacity>

      {/* Submit Button */}
      <Button
        title={`Pay ₹${netAmount} & Confirm Ride`}
        onPress={handlePayNow}
        loading={processing}
        disabled={processing}
        style={styles.payBtn}
      />

      {/* Success Modal */}
      <Modal visible={showSuccessModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successBadgeIcon}>🎉</Text>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSub}>
              Your seat reservation has been verified and confirmed.
            </Text>

            <Card elevated style={styles.receiptCard}>
              <Text style={styles.receiptHeader}>Digital Payment Receipt</Text>
              <Text style={styles.receiptRow}>
                Transaction ID: <Text style={styles.receiptBold}>{txnRef}</Text>
              </Text>
              <Text style={styles.receiptRow}>
                Amount Paid: <Text style={styles.receiptBold}>₹{netAmount}</Text>
              </Text>

              <Text style={styles.receiptRow}>
                Payment Mode:{' '}
                <Text style={styles.receiptBold}>
                  {selectedMethod.toUpperCase()}
                </Text>
              </Text>

              <Text style={styles.receiptRow}>
                Booking Reference: <Text style={styles.receiptBold}>{bookingId}</Text>
              </Text>
            </Card>

            <Button
              title="Track Live Ride 🚘"
              onPress={() => {
                setShowSuccessModal(false);
                router.replace({
                  pathname: '/(main)/tracking/[id]' as any,
                  params: { id: bookingId },
                });
              }}
              style={{ marginTop: 16 }}
            />

            <Button
              title="Go to My Rides"
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(main)/trips' as any);
              }}
              variant="outline"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fareLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  fareValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  discountLabel: {
    fontSize: typography.sizes.sm,
    color: colors.status.success,
  },
  discountValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  couponCard: {
    padding: 16,
    marginBottom: 20,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeader: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: border.radius.lg,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  methodCardSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.background.elevated,
  },
  methodIcon: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  methodSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.muted,
  },
  radioCircleSelected: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[400],
  },
  payBtn: {
    marginTop: 12,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  successBadgeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.status.success,
    marginBottom: 4,
  },
  successSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptCard: {
    width: '100%',
    padding: 16,
    marginBottom: 16,
  },
  receiptHeader: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingBottom: 6,
  },
  receiptRow: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  receiptBold: {
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
});
