import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';
import { useUserStore } from '@/store/userStore';

export default function PassengerHomeScreen() {
  const { isLoggedIn, token } = useUserStore();

  React.useEffect(() => {
    if (!isLoggedIn || !token) {
      router.replace('/login');
    }
  }, [isLoggedIn, token]);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 640 && width < 1024;
  const isSmallMobile = width < 380;

  const [fromLocation, setFromLocation] = useState('Hyderabad');
  const [toLocation, setToLocation] = useState('Bengaluru');
  const [activeTab, setActiveTab] = useState<'all' | 'intercity' | 'ev' | 'daily' | 'airport'>('all');

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearchRides = () => {
    router.push({
      pathname: '/search',
      params: {
        from: fromLocation,
        to: toLocation,
      },
    });
  };

  return (
    <SafeAreaView style={styles.pageContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />

      {/* ================= 1. GLOBAL NAVIGATION BAR ================= */}
      <View style={styles.appleGlobalNav}>
        <View style={styles.appleNavContent}>
          {/* Brand */}
          <Pressable
            style={styles.appleNavBrand}
            onPress={() => router.push('/passenger-home')}
            hitSlop={8}
          >
            <View style={styles.appleLogoBadge}>
              <Text style={styles.appleLogoIcon}>🚘</Text>
            </View>
            <Text style={styles.appleBrandText}>BLUBLU</Text>
          </Pressable>

          {/* Desktop Nav Links */}
          {isDesktop && (
            <View style={styles.appleNavLinksRow}>
              <Pressable onPress={() => router.push('/passenger-home')}>
                <Text style={[styles.appleNavLink, styles.appleNavLinkActive]}>Explore</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/search')}>
                <Text style={styles.appleNavLink}>Find Rides</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/create-trip')}>
                <Text style={styles.appleNavLink}>Publish</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/trips')}>
                <Text style={styles.appleNavLink}>My Bookings</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/safety')}>
                <Text style={styles.appleNavLink}>Trust & Safety</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/help')}>
                <Text style={styles.appleNavLink}>Support</Text>
              </Pressable>
            </View>
          )}

          {/* Right Action Icons */}
          <View style={styles.appleNavRight}>
            <Pressable
              style={styles.navIconBtn}
              onPress={() => router.push('/notifications')}
              hitSlop={8}
            >
              <Text style={styles.navIconText}>🔔</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ================= MAIN CONTENT SCROLLVIEW ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isDesktop ? 40 : 120 },
        ]}
      >
        {/* ================= HERO 1: BLUBLU PRO ================= */}
        <View style={[styles.heroDarkContainer, { paddingVertical: isDesktop ? 56 : 32 }]}>
          <View style={styles.heroDarkContent}>
            <View style={styles.proPillBadge}>
              <Text style={styles.proPillBadgeText}>BLUBLU PRO</Text>
            </View>

            <Text
              style={[
                styles.heroDarkTitle,
                {
                  fontSize: isDesktop ? 44 : isTablet ? 34 : isSmallMobile ? 24 : 28,
                  lineHeight: isDesktop ? 50 : isTablet ? 40 : isSmallMobile ? 30 : 34,
                },
              ]}
            >
              Titanium standard.{'\n'}Zero surge pricing.
            </Text>
            <Text
              style={[
                styles.heroDarkSubtitle,
                {
                  fontSize: isDesktop ? 16 : isSmallMobile ? 13 : 14,
                  lineHeight: isDesktop ? 24 : 20,
                  maxWidth: isDesktop ? 680 : 500,
                },
              ]}
            >
              India{"'"}s premier intercity carpooling network with 100% verified EV fleets and transparent cost splitting.
            </Text>

            {/* CTA Buttons */}
            <View style={[styles.heroDarkCtaRow, { flexDirection: isSmallMobile ? 'column' : 'row' }]}>
              <Pressable
                style={[styles.appleBluePill, isSmallMobile && { width: '100%', justifyContent: 'center' }]}
                onPress={handleSearchRides}
              >
                <Text style={styles.appleBluePillText}>Search Verified Rides</Text>
                <Text style={styles.pillArrow}>→</Text>
              </Pressable>

              <Pressable
                style={[styles.appleGlassPill, isSmallMobile && { width: '100%', justifyContent: 'center' }]}
                onPress={() => router.push('/safety')}
              >
                <Text style={styles.appleGlassPillText}>Learn about Safety ›</Text>
              </Pressable>
            </View>

            {/* ================= SEARCH DOCK ================= */}
            <View style={styles.searchGlassDock}>
              <View style={styles.searchGlassHeader}>
                <Text style={styles.searchGlassHeaderTitle}>Plan your journey across India</Text>
                <View style={styles.liveIndicatorPill}>
                  <Text style={styles.liveIndicatorDot}>●</Text>
                  <Text style={styles.liveIndicatorText}>Live Express Fleets</Text>
                </View>
              </View>

              <View style={[styles.searchFieldsRow, isDesktop ? styles.searchFieldsRowDesktop : null]}>
                {/* Leaving From */}
                <View style={styles.searchFieldBox}>
                  <View style={styles.blueDot} />
                  <View style={styles.searchFieldInputCol}>
                    <Text style={styles.searchMicroLabel}>LEAVING FROM</Text>
                    <TextInput
                      style={styles.searchTextInput}
                      value={fromLocation}
                      onChangeText={setFromLocation}
                      placeholder="Starting city"
                      placeholderTextColor="#86868B"
                    />
                  </View>
                </View>

                {/* Swap button */}
                <Pressable style={styles.swapCircleBtn} onPress={handleSwap} hitSlop={6}>
                  <Text style={styles.swapCircleIcon}>⇅</Text>
                </Pressable>

                {/* Going To */}
                <View style={styles.searchFieldBox}>
                  <View style={styles.greenDot} />
                  <View style={styles.searchFieldInputCol}>
                    <Text style={styles.searchMicroLabel}>GOING TO</Text>
                    <TextInput
                      style={styles.searchTextInput}
                      value={toLocation}
                      onChangeText={setToLocation}
                      placeholder="Destination city"
                      placeholderTextColor="#86868B"
                    />
                  </View>
                </View>

                {/* Search CTA */}
                <Pressable
                  style={[styles.dockSearchBtn, !isDesktop && { width: '100%', marginTop: 4 }]}
                  onPress={handleSearchRides}
                >
                  <Text style={styles.dockSearchBtnText}>Find Rides</Text>
                  <Text style={styles.dockSearchBtnArrow}>→</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ================= HERO 2: BLUBLU GREEN ================= */}
        <View style={[styles.heroLightContainer, { paddingVertical: isDesktop ? 48 : 32 }]}>
          <View style={styles.heroLightContent}>
            <View style={styles.greenPillBadge}>
              <Text style={styles.greenPillBadgeText}>🌱 100% ELECTRIC CORRIDOR</Text>
            </View>
            <Text
              style={[
                styles.heroLightTitle,
                {
                  fontSize: isDesktop ? 38 : isTablet ? 30 : isSmallMobile ? 22 : 26,
                  lineHeight: isDesktop ? 44 : isTablet ? 36 : isSmallMobile ? 28 : 32,
                },
              ]}
            >
              Hello, Blublu Green.
            </Text>
            <Text
              style={[
                styles.heroLightSubtitle,
                {
                  fontSize: isDesktop ? 16 : isSmallMobile ? 13 : 14,
                  lineHeight: isDesktop ? 24 : 20,
                },
              ]}
            >
              Cut your carbon footprint by up to 80% with verified EV shared rides on high-speed expressways.
            </Text>

            <View style={[styles.heroLightCtaRow, { flexDirection: isSmallMobile ? 'column' : 'row' }]}>
              <Pressable
                style={[styles.appleDarkPill, isSmallMobile && { width: '100%', alignItems: 'center' }]}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.appleDarkPillText}>Book EV Express</Text>
              </Pressable>

              <Pressable
                style={[styles.appleOutlinePill, isSmallMobile && { width: '100%', alignItems: 'center' }]}
                onPress={() => router.push('/safety')}
              >
                <Text style={styles.appleOutlinePillText}>View Carbon Savings ›</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ================= 2x2 BENTO SHOWCASE GRID ================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionSuperHeader}>WHY CHOOSE BLUBLU</Text>
            <Text
              style={[
                styles.sectionMainTitle,
                { fontSize: isDesktop ? 26 : isSmallMobile ? 20 : 22 },
              ]}
            >
              Engineered for effortless travel.
            </Text>
          </View>

          <View style={[styles.bentoGrid, isDesktop ? styles.bentoGridDesktop : isTablet ? styles.bentoGridTablet : null]}>
            {/* Bento Card 1 */}
            <View style={[styles.bentoCard, isDesktop && styles.bentoCardDesktop, isTablet && styles.bentoCardTablet]}>
              <View style={styles.bentoIconBadge}>
                <Text style={styles.bentoIcon}>💎</Text>
              </View>
              <Text style={styles.bentoCardTitle}>Zero Hidden Fees</Text>
              <Text style={styles.bentoCardDesc}>
                100% transparent cost splitting. No dynamic surge pricing, no unexpected booking surcharges.
              </Text>
              <Text style={styles.bentoCardLink}>Calculate route fare ›</Text>
            </View>

            {/* Bento Card 2 */}
            <View style={[styles.bentoCard, isDesktop && styles.bentoCardDesktop, isTablet && styles.bentoCardTablet]}>
              <View style={[styles.bentoIconBadge, { backgroundColor: 'rgba(52, 199, 89, 0.12)' }]}>
                <Text style={styles.bentoIcon}>🛡️</Text>
              </View>
              <Text style={styles.bentoCardTitle}>100% Verified Profiles</Text>
              <Text style={styles.bentoCardDesc}>
                Mandatory Government ID and Driving License verification for every driver and co-passenger.
              </Text>
              <Text style={[styles.bentoCardLink, { color: '#34C759' }]}>Trust standards ›</Text>
            </View>

            {/* Bento Card 3 */}
            <View style={[styles.bentoCard, isDesktop && styles.bentoCardDesktop, isTablet && styles.bentoCardTablet]}>
              <View style={[styles.bentoIconBadge, { backgroundColor: 'rgba(245, 99, 0, 0.12)' }]}>
                <Text style={styles.bentoIcon}>⚡</Text>
              </View>
              <Text style={styles.bentoCardTitle}>Instant UPI Refunds</Text>
              <Text style={styles.bentoCardDesc}>
                Powered by IndiaStack. Cancel anytime with immediate automated UPI settlement back to your bank.
              </Text>
              <Text style={[styles.bentoCardLink, { color: '#F56300' }]}>Refund policy ›</Text>
            </View>

            {/* Bento Card 4 */}
            <View style={[styles.bentoCard, isDesktop && styles.bentoCardDesktop, isTablet && styles.bentoCardTablet]}>
              <View style={[styles.bentoIconBadge, { backgroundColor: 'rgba(175, 82, 222, 0.12)' }]}>
                <Text style={styles.bentoIcon}>👥</Text>
              </View>
              <Text style={styles.bentoCardTitle}>Women-Only Pools</Text>
              <Text style={styles.bentoCardDesc}>
                Option to choose verified female drivers and co-travelers for complete peace of mind on night trips.
              </Text>
              <Text style={[styles.bentoCardLink, { color: '#AF52DE' }]}>Explore women pools ›</Text>
            </View>
          </View>
        </View>

        {/* ================= POPULAR ROUTES ================= */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderFlex}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionSuperHeader}>POPULAR ROUTES</Text>
              <Text
                style={[
                  styles.sectionMainTitle,
                  { fontSize: isDesktop ? 26 : isSmallMobile ? 20 : 22 },
                ]}
              >
                Top daily departures
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/search')}
              style={styles.seeAllBtn}
              hitSlop={8}
            >
              <Text style={styles.seeAllLink}>Explore all 50+ ›</Text>
            </Pressable>
          </View>

          {/* Smooth Horizontal Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsScroll}
            style={styles.categoryTabsContainer}
          >
            <Pressable
              style={[styles.categoryTab, activeTab === 'all' && styles.categoryTabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.categoryTabText, activeTab === 'all' && styles.categoryTabTextActive]}>
                All Routes
              </Text>
            </Pressable>
            <Pressable
              style={[styles.categoryTab, activeTab === 'intercity' && styles.categoryTabActive]}
              onPress={() => setActiveTab('intercity')}
            >
              <Text style={[styles.categoryTabText, activeTab === 'intercity' && styles.categoryTabTextActive]}>
                ⚡ Intercity Express
              </Text>
            </Pressable>
            <Pressable
              style={[styles.categoryTab, activeTab === 'ev' && styles.categoryTabActive]}
              onPress={() => setActiveTab('ev')}
            >
              <Text style={[styles.categoryTabText, activeTab === 'ev' && styles.categoryTabTextActive]}>
                🌱 Green EV
              </Text>
            </Pressable>
            <Pressable
              style={[styles.categoryTab, activeTab === 'daily' && styles.categoryTabActive]}
              onPress={() => setActiveTab('daily')}
            >
              <Text style={[styles.categoryTabText, activeTab === 'daily' && styles.categoryTabTextActive]}>
                🏢 Tech Corridor
              </Text>
            </Pressable>
            <Pressable
              style={[styles.categoryTab, activeTab === 'airport' && styles.categoryTabActive]}
              onPress={() => setActiveTab('airport')}
            >
              <Text style={[styles.categoryTabText, activeTab === 'airport' && styles.categoryTabTextActive]}>
                ✈️ Airport Connect
              </Text>
            </Pressable>
          </ScrollView>

          <View style={[styles.routesGrid, isDesktop ? styles.routesGridDesktop : isTablet ? styles.routesGridTablet : null]}>
            <AppleRouteProductCard
              from="Hyderabad"
              to="Bengaluru"
              time="Today, 6:30 PM"
              price="₹650"
              driver="Rahul Sharma"
              rating="4.9"
              vehicle="Tata Nexon EV"
              seats="2 seats left"
              isEV={true}
              isDesktop={isDesktop}
              isTablet={isTablet}
            />

            <AppleRouteProductCard
              from="Mumbai"
              to="Pune"
              time="Today, 7:15 PM"
              price="₹350"
              driver="Pooja Deshmukh"
              rating="4.95"
              vehicle="Hyundai Creta"
              seats="3 seats left"
              isEV={false}
              isDesktop={isDesktop}
              isTablet={isTablet}
            />

            <AppleRouteProductCard
              from="Delhi NCR"
              to="Chandigarh"
              time="Tomorrow, 7:00 AM"
              price="₹450"
              driver="Vikram Mehta"
              rating="4.85"
              vehicle="MG ZS EV"
              seats="2 seats left"
              isEV={true}
              isDesktop={isDesktop}
              isTablet={isTablet}
            />

            <AppleRouteProductCard
              from="Chennai"
              to="Bengaluru"
              time="Tomorrow, 8:30 AM"
              price="₹550"
              driver="Ananya Verma"
              rating="4.92"
              vehicle="Kia EV6"
              seats="1 seat left"
              isEV={true}
              isDesktop={isDesktop}
              isTablet={isTablet}
            />
          </View>
        </View>

        {/* ================= DIRECTORY FOOTER ================= */}
        <View style={styles.appleFooter}>
          <View style={styles.footerNoteRow}>
            <Text style={styles.footerNoteText}>
              1. Instant cashback subject to terms and partner bank eligibility. 2. Carbon emission metrics calculated against single-occupancy petrol vehicle standards on national highways.
            </Text>
          </View>

          <View style={styles.footerDivider} />

          <View style={[styles.footerDirectoryGrid, isDesktop ? styles.footerDirectoryGridDesktop : isTablet ? styles.footerDirectoryGridTablet : null]}>
            <View style={styles.footerCol}>
              <Text style={styles.footerColHeader}>Explore & Book</Text>
              <Text style={styles.footerLinkText}>Find Shared Rides</Text>
              <Text style={styles.footerLinkText}>Publish Empty Seats</Text>
              <Text style={styles.footerLinkText}>Intercity Express</Text>
              <Text style={styles.footerLinkText}>Electric Fleet</Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerColHeader}>Account & Services</Text>
              <Text style={styles.footerLinkText}>Manage Bookings</Text>
              <Text style={styles.footerLinkText}>Blublu Pro Membership</Text>
              <Text style={styles.footerLinkText}>UPI Wallet & Refunds</Text>
              <Text style={styles.footerLinkText}>Refer & Earn</Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerColHeader}>Safety & Values</Text>
              <Text style={styles.footerLinkText}>Government ID Verification</Text>
              <Text style={styles.footerLinkText}>24/7 SOS Emergency Support</Text>
              <Text style={styles.footerLinkText}>Carbon Zero Mobility</Text>
              <Text style={styles.footerLinkText}>Community Guidelines</Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerColHeader}>About Blublu</Text>
              <Text style={styles.footerLinkText}>Company Info</Text>
              <Text style={styles.footerLinkText}>Newsroom & Events</Text>
              <Text style={styles.footerLinkText}>Careers</Text>
              <Text style={styles.footerLinkText}>Contact Support</Text>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <View style={styles.footerBottomRow}>
            <Text style={styles.footerCopyText}>
              Copyright © 2026 BLUBLU Mobility Inc. All rights reserved.
            </Text>
            <View style={styles.footerBottomLinks}>
              <Text style={styles.footerSubLink}>Privacy Policy</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerSubLink}>Terms of Use</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerSubLink}>Sales Policy</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerSubLink}>India (English)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar for mobile / tablet */}
      {!isDesktop && <BottomNavigation />}
    </SafeAreaView>
  );
}

function AppleRouteProductCard({
  from,
  to,
  time,
  price,
  driver,
  rating,
  vehicle,
  seats,
  isEV,
  isDesktop,
  isTablet,
}: {
  from: string;
  to: string;
  time: string;
  price: string;
  driver: string;
  rating: string;
  vehicle: string;
  seats: string;
  isEV: boolean;
  isDesktop: boolean;
  isTablet: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.routeCard,
        isDesktop && styles.routeCardDesktop,
        isTablet && styles.routeCardTablet,
      ]}
      onPress={() =>
        router.push({
          pathname: '/trip-details',
          params: {
            from,
            to,
            departure: time,
            price: price.replace('₹', ''),
            driver,
          },
        })
      }
    >
      <View style={styles.routeCardHeader}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.routeCardCities} numberOfLines={1}>
            {from} <Text style={styles.routeCardArrow}>→</Text> {to}
          </Text>
          <Text style={styles.routeCardTime}>{time}</Text>
        </View>

        <View style={styles.routeCardPriceBox}>
          <Text style={styles.routeCardPrice}>{price}</Text>
          <Text style={styles.routeCardSeatLabel}>/ seat</Text>
        </View>
      </View>

      <View style={styles.routeCardDivider} />

      <View style={styles.routeCardFooter}>
        <View style={styles.driverInfoBlock}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>{driver.charAt(0)}</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <View style={styles.driverNameRow}>
              <Text style={styles.driverNameText} numberOfLines={1}>{driver}</Text>
              <Text style={styles.driverRatingText}>★ {rating}</Text>
            </View>
            <View style={styles.vehicleRow}>
              {isEV && <Text style={styles.evBadge}>🌱 EV</Text>}
              <Text style={styles.vehicleText} numberOfLines={1}>{vehicle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionCol}>
          <Text style={styles.seatsLeftText}>{seats}</Text>
          <View style={styles.bookPill}>
            <Text style={styles.bookPillText}>Select ›</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },

  /* ================= 1. GLOBAL NAV ================= */
  appleGlobalNav: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    zIndex: 100,
    ...Platform.select({
      web: {
        backdropFilter: 'saturate(180%) blur(20px)',
        position: 'sticky',
        top: 0,
      } as any,
      default: {},
    }),
  },

  appleNavContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appleNavBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  appleLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appleLogoIcon: {
    fontSize: 16,
  },

  appleBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },

  appleNavLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },

  appleNavLink: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
    opacity: 0.8,
    letterSpacing: -0.1,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'opacity 0.15s ease' },
      default: {},
    }),
  },

  appleNavLinkActive: {
    fontWeight: '700',
    color: '#0071E3',
    opacity: 1,
  },

  appleNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  navIconText: {
    fontSize: 15,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* ================= HERO 1: BLUBLU PRO ================= */
  heroDarkContainer: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroDarkContent: {
    maxWidth: 1100,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },

  proPillBadge: {
    backgroundColor: '#2997FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginBottom: 12,
  },

  proPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  heroDarkTitle: {
    fontWeight: '900',
    color: '#F5F5F7',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 10,
  },

  heroDarkSubtitle: {
    color: '#A1A1A6',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 22,
  },

  heroDarkCtaRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 28,
  },

  appleBluePill: {
    backgroundColor: '#0071E3',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0, 113, 227, 0.45)',
      },
      default: {},
    }),
  },

  appleBluePillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  pillArrow: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  appleGlassPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  appleGlassPillText: {
    color: '#2997FF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ================= SEARCH GLASS DOCK ================= */
  searchGlassDock: {
    backgroundColor: 'rgba(29, 29, 31, 0.92)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 960,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(30px)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
      },
      default: {},
    }),
  },

  searchGlassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },

  searchGlassHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F5F7',
    letterSpacing: -0.2,
  },

  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },

  liveIndicatorDot: {
    fontSize: 7,
    color: '#34C759',
  },

  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34C759',
  },

  searchFieldsRow: {
    flexDirection: 'column',
    gap: 8,
  },

  searchFieldsRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchFieldBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0071E3',
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },

  searchFieldInputCol: {
    flex: 1,
  },

  searchMicroLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#86868B',
    letterSpacing: 0.5,
  },

  searchTextInput: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
    padding: 0,
  },

  swapCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  swapCircleIcon: {
    color: '#2997FF',
    fontSize: 12,
    fontWeight: '800',
  },

  dockSearchBtn: {
    backgroundColor: '#0071E3',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  dockSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  dockSearchBtnArrow: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ================= HERO 2: GREEN ================= */
  heroLightContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },

  heroLightContent: {
    maxWidth: 900,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },

  greenPillBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginBottom: 10,
  },

  greenPillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.5,
  },

  heroLightTitle: {
    fontWeight: '900',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },

  heroLightSubtitle: {
    color: '#6E6E73',
    textAlign: 'center',
    maxWidth: 620,
    letterSpacing: -0.2,
    marginBottom: 18,
  },

  heroLightCtaRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },

  appleDarkPill: {
    backgroundColor: '#1D1D1F',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  appleDarkPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  appleOutlinePill: {
    backgroundColor: 'transparent',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D2D2D7',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  appleOutlinePillText: {
    color: '#0071E3',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ================= 2x2 BENTO GRID ================= */
  sectionContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },

  sectionTitleBlock: {
    marginBottom: 14,
    flexShrink: 1,
  },

  sectionSuperHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0071E3',
    letterSpacing: 0.6,
    marginBottom: 2,
  },

  sectionMainTitle: {
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },

  bentoGrid: {
    flexDirection: 'column',
    gap: 12,
  },

  bentoGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  bentoGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  bentoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },

  bentoCardTablet: {
    width: '48.5%',
  },

  bentoCardDesktop: {
    width: '48.8%',
  },

  bentoIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  bentoIcon: {
    fontSize: 19,
  },

  bentoCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  bentoCardDesc: {
    fontSize: 12,
    color: '#6E6E73',
    lineHeight: 18,
    marginBottom: 12,
  },

  bentoCardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0071E3',
  },

  /* ================= POPULAR ROUTES ================= */
  sectionHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },

  seeAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0071E3',
  },

  categoryTabsContainer: {
    marginBottom: 16,
  },

  categoryTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },

  categoryTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  categoryTabActive: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F',
  },

  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6E73',
  },

  categoryTabTextActive: {
    color: '#FFFFFF',
  },

  routesGrid: {
    flexDirection: 'column',
    gap: 12,
  },

  routesGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  routesGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  routeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },

  routeCardTablet: {
    width: '48.5%',
  },

  routeCardDesktop: {
    width: '48.8%',
  },

  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  routeCardCities: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  routeCardArrow: {
    color: '#0071E3',
  },

  routeCardTime: {
    marginTop: 3,
    fontSize: 11,
    color: '#86868B',
    fontWeight: '500',
  },

  routeCardPriceBox: {
    alignItems: 'flex-end',
  },

  routeCardPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },

  routeCardSeatLabel: {
    fontSize: 10,
    color: '#86868B',
  },

  routeCardDivider: {
    height: 1,
    backgroundColor: '#F5F5F7',
    marginVertical: 12,
  },

  routeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  driverInfoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  driverAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  driverNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  driverRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F56300',
  },

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },

  evBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34C759',
  },

  vehicleText: {
    fontSize: 10,
    color: '#86868B',
  },

  actionCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },

  seatsLeftText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 3,
  },

  bookPill: {
    backgroundColor: '#0071E3',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  bookPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* ================= DIRECTORY FOOTER ================= */
  appleFooter: {
    backgroundColor: '#F5F5F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 28,
    paddingHorizontal: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },

  footerNoteRow: {
    marginBottom: 12,
  },

  footerNoteText: {
    fontSize: 10,
    color: '#86868B',
    lineHeight: 15,
  },

  footerDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 14,
  },

  footerDirectoryGrid: {
    flexDirection: 'column',
    gap: 18,
  },

  footerDirectoryGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },

  footerDirectoryGridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerCol: {
    minWidth: 140,
  },

  footerColHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },

  footerLinkText: {
    fontSize: 11,
    color: '#6E6E73',
    marginBottom: 6,
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  footerCopyText: {
    fontSize: 10,
    color: '#86868B',
  },

  footerBottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  footerSubLink: {
    fontSize: 10,
    color: '#6E6E73',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  footerDot: {
    fontSize: 9,
    color: '#86868B',
  },
});
