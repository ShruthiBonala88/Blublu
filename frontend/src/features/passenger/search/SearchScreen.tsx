import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';

export default function SearchScreen() {
  const [from, setFrom] = useState('Hyderabad');
  const [to, setTo] = useState('Bengaluru');
  const [passengers, setPassengers] = useState(1);
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'date'>('today');

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      return;
    }
    router.push('/search-results');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Apple Navigation Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backCircle}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Find a Ride</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Title */}
        <View style={styles.heroBlock}>
          <Text style={styles.badge}>APPLE HIG MOBILITY</Text>
          <Text style={styles.title}>Where to next?</Text>
          <Text style={styles.subtitle}>
            Verified co-travelers and zero commission rides across India.
          </Text>
        </View>

        {/* Location Bento Card with Swap Button */}
        <View style={styles.locationCard}>
          {/* From */}
          <View style={styles.locationRow}>
            <View style={styles.fromDot} />
            <View style={styles.inputContainer}>
              <Text style={styles.label}>LEAVING FROM</Text>
              <TextInput
                value={from}
                onChangeText={setFrom}
                placeholder="Enter city or landmark"
                placeholderTextColor="#86868B"
                style={styles.input}
              />
            </View>
          </View>

          {/* Swap divider */}
          <View style={styles.swapDividerRow}>
            <View style={styles.line} />
            <Pressable style={styles.swapButton} onPress={handleSwap}>
              <Text style={styles.swapIcon}>⇅</Text>
            </Pressable>
          </View>

          {/* To */}
          <View style={styles.locationRow}>
            <View style={styles.toDot} />
            <View style={styles.inputContainer}>
              <Text style={styles.label}>GOING TO</Text>
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder="Enter destination city"
                placeholderTextColor="#86868B"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* Date Selector Segment */}
        <Text style={styles.sectionTitle}>TRAVEL DATE</Text>
        <View style={styles.datePillsRow}>
          <Pressable
            style={[
              styles.datePill,
              selectedDate === 'today' && styles.datePillActive,
            ]}
            onPress={() => setSelectedDate('today')}
          >
            <Text
              style={[
                styles.datePillText,
                selectedDate === 'today' && styles.datePillTextActive,
              ]}
            >
              Today
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.datePill,
              selectedDate === 'tomorrow' && styles.datePillActive,
            ]}
            onPress={() => setSelectedDate('tomorrow')}
          >
            <Text
              style={[
                styles.datePillText,
                selectedDate === 'tomorrow' && styles.datePillTextActive,
              ]}
            >
              Tomorrow
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.datePill,
              selectedDate === 'date' && styles.datePillActive,
            ]}
            onPress={() => setSelectedDate('date')}
          >
            <Text
              style={[
                styles.datePillText,
                selectedDate === 'date' && styles.datePillTextActive,
              ]}
            >
              Pick Date 📅
            </Text>
          </Pressable>
        </View>

        {/* Passengers Stepper Bento */}
        <Text style={styles.sectionTitle}>SEATS REQUIRED</Text>
        <View style={styles.passengerCard}>
          <View style={styles.passengerLeft}>
            <Text style={styles.passengerIcon}>👥</Text>
            <View>
              <Text style={styles.passengerLabel}>Total Passengers</Text>
              <Text style={styles.passengerSub}>
                {passengers} {passengers === 1 ? 'seat' : 'seats'} requested
              </Text>
            </View>
          </View>

          <View style={styles.stepper}>
            <Pressable
              style={[
                styles.stepButton,
                passengers <= 1 && styles.stepButtonDisabled,
              ]}
              onPress={() => setPassengers(Math.max(1, passengers - 1))}
              disabled={passengers <= 1}
            >
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>

            <Text style={styles.stepperCount}>{passengers}</Text>

            <Pressable
              style={[
                styles.stepButton,
                passengers >= 6 && styles.stepButtonDisabled,
              ]}
              onPress={() => setPassengers(Math.min(6, passengers + 1))}
              disabled={passengers >= 6}
            >
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Apple Primary Search Pill */}
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Available Rides</Text>
          <Text style={styles.searchButtonArrow}>→</Text>
        </Pressable>

        {/* Apple Guarantee Note */}
        <View style={styles.guaranteeRow}>
          <Text style={styles.guaranteeShield}>🛡️</Text>
          <Text style={styles.guaranteeText}>
            Zero booking cancellation charges. 100% money-back safety guarantee.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
      default: {},
    }),
  },
  backIcon: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },
  heroBlock: {
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    color: '#0071E3',
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 4,
    lineHeight: 19,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
      } as any,
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fromDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0071E3',
    marginRight: 14,
  },
  toDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
    marginRight: 14,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86868B',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    paddingVertical: 6,
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
      default: {},
    }),
  },
  swapIcon: {
    fontSize: 14,
    color: '#0071E3',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#86868B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  datePillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  datePill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
      default: {},
    }),
  },
  datePillActive: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F',
  },
  datePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  datePillTextActive: {
    color: '#FFFFFF',
  },
  passengerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 24,
  },
  passengerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passengerIcon: {
    fontSize: 22,
  },
  passengerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  passengerSub: {
    fontSize: 12,
    color: '#86868B',
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
      default: {},
    }),
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 20,
  },
  stepperCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    minWidth: 16,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: '#0071E3',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(0, 113, 227, 0.35)',
      } as any,
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  searchButtonArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    justifyContent: 'center',
  },
  guaranteeShield: {
    fontSize: 14,
  },
  guaranteeText: {
    fontSize: 12,
    color: '#86868B',
    fontWeight: '500',
  },
});