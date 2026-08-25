import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';

export default function BookingScreen() {
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleBooking = () => {
    router.push('/payment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Confirm Booking
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Trip Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Trip Summary
          </Text>

          <View style={styles.routeRow}>
            <View style={styles.routeDots}>
              <View style={styles.blueDot} />
              <View style={styles.line} />
              <View style={styles.greenDot} />
            </View>

            <View style={styles.routeInfo}>
              <Text style={styles.location}>
                Hyderabad
              </Text>

              <Text style={styles.duration}>
                5h 30m
              </Text>

              <Text style={styles.location}>
                Bengaluru
              </Text>
            </View>

            <View style={styles.timeInfo}>
              <Text style={styles.time}>
                6:30 PM
              </Text>

              <Text style={styles.time}>
                12:00 AM
              </Text>
            </View>
          </View>
        </View>

        {/* Driver */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Driver
          </Text>

          <View style={styles.driverRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>

            <View>
              <Text style={styles.driverName}>
                Rahul
              </Text>

              <Text style={styles.rating}>
                ⭐ 4.9 • Verified driver
              </Text>
            </View>
          </View>
        </View>

        {/* Selected Seat */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Seat
          </Text>

          <View style={styles.seatRow}>
            <View style={styles.seatBadge}>
              <Text style={styles.seatText}>
                1A
              </Text>
            </View>

            <Text style={styles.seatDescription}>
              Window seat
            </Text>
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Contact Details
          </Text>

          <Text style={styles.inputLabel}>
            Phone Number
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>
            Special Instructions
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything the driver should know?"
            placeholderTextColor="#94A3B8"
            style={[
              styles.input,
              styles.textArea,
            ]}
            multiline
          />
        </View>

        {/* Price */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>
              Total amount
            </Text>

            <Text style={styles.price}>
              ₹650
            </Text>
          </View>

          <Text style={styles.priceNote}>
            1 seat
          </Text>
        </View>

        {/* Continue */}
        <Pressable
          style={[
            styles.continueButton,
            !phone && styles.disabledButton,
          ]}
          disabled={!phone}
          onPress={handleBooking}
        >
          <Text style={styles.continueText}>
            Continue to Payment
          </Text>
        </Pressable>

        <Text style={styles.secureText}>
          🔒 Your booking information is secure
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  back: {
    fontSize: 34,
    color: '#FFFFFF',
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSpacer: {
    width: 42,
  },

  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 18,
  },

  routeRow: {
    flexDirection: 'row',
  },

  routeDots: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },

  blueDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },

  greenDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#64748B',
  },

  line: {
    width: 2,
    height: 35,
    backgroundColor: '#334155',
  },

  routeInfo: {
    flex: 1,
  },

  location: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  duration: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 7,
  },

  timeInfo: {
    justifyContent: 'space-between',
  },

  time: {
    fontSize: 12,
    color: '#94A3B8',
  },

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },

  avatarText: {
    fontSize: 24,
  },

  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  rating: {
    marginTop: 5,
    fontSize: 12,
    color: '#94A3B8',
  },

  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seatBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },

  seatText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  seatDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 7,
    marginTop: 5,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 14,
    backgroundColor: '#1E293B',
  },

  textArea: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: 'top',
  },

  priceCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },

  priceLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },

  price: {
    marginTop: 4,
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  priceNote: {
    fontSize: 12,
    color: '#94A3B8',
  },

  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  disabledButton: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },

  continueText: {
    color: '#090D16',
    fontSize: 15,
    fontWeight: '800',
  },

  secureText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
    color: '#64748B',
  },
});