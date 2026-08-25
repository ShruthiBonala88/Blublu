import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const price = (params.price as string) || '650';
  const [method, setMethod] = useState('UPI');

  const handlePayment = () => {
    router.push({
      pathname: '/booking-confirmed',
      params: {
        price,
      },
    });
  };

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

          <Text style={styles.headerTitle}>Payment</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amount}>₹{price}</Text>
          <Text style={styles.amountNote}>1 passenger • 1 reserved seat</Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        <Pressable
          style={[
            styles.methodCard,
            method === 'UPI' && styles.selectedCard,
          ]}
          onPress={() => setMethod('UPI')}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.iconEmoji}>📱</Text>
          </View>

          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>UPI (Instant Pay)</Text>
            <Text style={styles.methodDescription}>
              Google Pay, PhonePe, Paytm, BHIM
            </Text>
          </View>

          <View style={[styles.radio, method === 'UPI' && styles.radioActive]}>
            {method === 'UPI' && <View style={styles.radioInner} />}
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.methodCard,
            method === 'CARD' && styles.selectedCard,
          ]}
          onPress={() => setMethod('CARD')}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.iconEmoji}>💳</Text>
          </View>

          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Credit / Debit Card</Text>
            <Text style={styles.methodDescription}>
              Visa, Mastercard, RuPay, Amex
            </Text>
          </View>

          <View style={[styles.radio, method === 'CARD' && styles.radioActive]}>
            {method === 'CARD' && <View style={styles.radioInner} />}
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.methodCard,
            method === 'CASH' && styles.selectedCard,
          ]}
          onPress={() => setMethod('CASH')}
        >
          <View style={styles.methodIcon}>
            <Text style={styles.iconEmoji}>💵</Text>
          </View>

          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Pay Cash to Driver</Text>
            <Text style={styles.methodDescription}>
              Pay direct cash or UPI on trip arrival
            </Text>
          </View>

          <View style={[styles.radio, method === 'CASH' && styles.radioActive]}>
            {method === 'CASH' && <View style={styles.radioInner} />}
          </View>
        </Pressable>

        {/* Security Badge */}
        <View style={styles.securityCard}>
          <Text style={styles.securityIcon}>🔒</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Bank-Grade 256-bit Security</Text>
            <Text style={styles.securityText}>
              Your payments are processed through RBI compliant encrypted gateways.
            </Text>
          </View>
        </View>

        {/* Pay Button */}
        <Pressable
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payText}>
            Pay ₹{price} • Complete Booking
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          By continuing, you agree to BLUBLU{"'"}s passenger terms and conditions.
        </Text>
      </ScrollView>
    </SafeAreaView>
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

  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },

  amountLabel: {
    color: '#86868B',
    fontSize: 13,
    fontWeight: '600',
  },

  amount: {
    color: '#1D1D1F',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -1,
  },

  amountNote: {
    color: '#86868B',
    fontSize: 12,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
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

  selectedCard: {
    borderColor: '#0071E3',
    backgroundColor: 'rgba(0, 113, 227, 0.03)',
  },

  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconEmoji: {
    fontSize: 20,
  },

  methodInfo: {
    flex: 1,
  },

  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  methodDescription: {
    marginTop: 2,
    fontSize: 12,
    color: '#86868B',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D2D2D7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioActive: {
    borderColor: '#0071E3',
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0071E3',
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  securityIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  securityText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: '#86868B',
  },

  payButton: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  payText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  footerText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
    color: '#86868B',
    lineHeight: 16,
  },
});