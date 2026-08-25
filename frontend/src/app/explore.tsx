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
import BottomNavigation from '@/components/BottomNavigation';

export default function ExploreScreen() {
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

          <Text style={styles.headerTitle}>Explore India</Text>

          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.heading}>Popular Travel Corridors</Text>
        <Text style={styles.subtitle}>
          Discover verified carpooling routes across South & Central India.
        </Text>

        {/* Featured Route 1 */}
        <Pressable
          style={styles.featuredCard}
          onPress={() => router.push('/search')}
        >
          <View style={styles.routeHeaderRow}>
            <Text style={styles.routeTitle}>Hyderabad ⇄ Bengaluru</Text>
            <View style={styles.frequencyTag}>
              <Text style={styles.frequencyTagText}>⚡ 20+ daily rides</Text>
            </View>
          </View>
          <Text style={styles.routeDesc}>
            Non-stop NH 44 highway journey • Average ₹550–₹700 / seat
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.avgTime}>⏱ 5h 30m avg duration</Text>
            <Text style={styles.viewRouteLink}>View Rides →</Text>
          </View>
        </Pressable>

        {/* Featured Route 2 */}
        <Pressable
          style={styles.featuredCard}
          onPress={() => router.push('/search')}
        >
          <View style={styles.routeHeaderRow}>
            <Text style={styles.routeTitle}>Hyderabad ⇄ Vijayawada</Text>
            <View style={styles.frequencyTag}>
              <Text style={styles.frequencyTagText}>⚡ 15+ daily rides</Text>
            </View>
          </View>
          <Text style={styles.routeDesc}>
            NH 65 expressway corridor • Average ₹400–₹500 / seat
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.avgTime}>⏱ 4h 15m avg duration</Text>
            <Text style={styles.viewRouteLink}>View Rides →</Text>
          </View>
        </Pressable>

        {/* Featured Route 3 */}
        <Pressable
          style={styles.featuredCard}
          onPress={() => router.push('/search')}
        >
          <View style={styles.routeHeaderRow}>
            <Text style={styles.routeTitle}>Bengaluru ⇄ Chennai</Text>
            <View style={styles.frequencyTag}>
              <Text style={styles.frequencyTagText}>⚡ 30+ daily rides</Text>
            </View>
          </View>
          <Text style={styles.routeDesc}>
            Bangalore-Chennai Expressway • Average ₹450–₹600 / seat
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.avgTime}>⏱ 5h 00m avg duration</Text>
            <Text style={styles.viewRouteLink}>View Rides →</Text>
          </View>
        </Pressable>

        {/* Why BLUBLU Section */}
        <Text style={styles.sectionHeading}>Why Carpool with BLUBLU</Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Government ID Verified</Text>
            <Text style={styles.featureText}>
              Every driver and passenger is verified with Aadhaar and driving license.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌱</Text>
            <Text style={styles.featureTitle}>Save Up to 70%</Text>
            <Text style={styles.featureText}>
              Shared costs reduce individual travel expenses while cutting carbon emissions.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Comfort First</Text>
            <Text style={styles.featureText}>
              Max 2 passengers in back policy ensures plenty of legroom and luggage space.
            </Text>
          </View>
        </View>

        {/* Publish Trip CTA */}
        <Pressable
          style={styles.publishCTA}
          onPress={() => router.push('/create-trip')}
        >
          <Text style={styles.publishCTAText}>Share Your Car Journey</Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation />
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
    paddingBottom: 100,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    fontSize: 14,
    color: '#86868B',
  },

  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  routeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  routeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  frequencyTag: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  frequencyTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0071E3',
  },

  routeDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#86868B',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },

  avgTime: {
    fontSize: 12,
    color: '#86868B',
    fontWeight: '500',
  },

  viewRouteLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0071E3',
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  featureGrid: {
    gap: 10,
    marginBottom: 20,
  },

  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  featureIcon: {
    fontSize: 24,
    marginBottom: 6,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  featureText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#86868B',
  },

  publishCTA: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
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

  publishCTAText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
