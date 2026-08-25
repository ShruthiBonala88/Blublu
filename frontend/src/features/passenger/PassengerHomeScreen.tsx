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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';
import { useUserStore } from '@/store/userStore';

// ─── Responsive breakpoints ───────────────────────────────────────────────────
const BP_TABLET = 640;
const BP_DESKTOP = 1024;
const BP_SMALL_MOBILE = 380;

// Bottom tab bar height constant
const TAB_BAR_HEIGHT = 70;

export default function PassengerHomeScreen() {
  const { isLoggedIn, token } = useUserStore();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (!isLoggedIn || !token) {
      router.replace('/login');
    }
  }, [isLoggedIn, token]);

  const { width } = useWindowDimensions();
  const isDesktop = width >= BP_DESKTOP;
  const isTablet = width >= BP_TABLET && width < BP_DESKTOP;
  const isMobile = !isTablet && !isDesktop;
  const isSmallMobile = width < BP_SMALL_MOBILE;

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
      params: { from: fromLocation, to: toLocation },
    });
  };

  // Dynamic horizontal padding based on screen size
  const hPad = isDesktop ? 40 : isTablet ? 24 : 16;

  // Bottom scroll padding: desktop has no tab bar; mobile/tablet needs tab bar + system inset
  const scrollPaddingBottom = isDesktop
    ? 40
    : TAB_BAR_HEIGHT + Math.max(insets.bottom, 0) + 16;

  return (
    <SafeAreaView
      style={styles.pageContainer}
      edges={Platform.OS === 'android' ? ['top'] : ['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F5F7"
        translucent={false}
      />

      {/* ================= 1. GLOBAL NAVIGATION BAR ================= */}
      <View style={[styles.appleGlobalNav, { height: isDesktop ? 60 : 52 }]}>
        <View style={[styles.appleNavContent, { paddingHorizontal: hPad }]}>
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
            {/* Hamburger for tablet */}
            {isTablet && (
              <Pressable style={styles.navIconBtn} hitSlop={8}>
                <Text style={styles.navIconText}>☰</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* ================= MAIN CONTENT SCROLLVIEW ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
      >

        {/* ================= HERO 1: CLEAN FROSTED HERO ================= */}
        <View style={[styles.heroGlassContainer, { paddingVertical: isDesktop ? 60 : isTablet ? 40 : 28, paddingHorizontal: hPad }]}>
          <View style={[styles.heroGlassContent, { maxWidth: isDesktop ? 1100 : isTablet ? 800 : '100%' }]}>
            <View style={styles.proPillBadge}>
              <Text style={styles.proPillBadgeText}>⚡ BLUBLU SMART CARPOOL</Text>
            </View>

            <Text
              style={[
                styles.heroGlassTitle,
                {
                  fontSize: isDesktop ? 44 : isTablet ? 34 : isSmallMobile ? 24 : 28,
                  lineHeight: isDesktop ? 52 : isTablet ? 42 : isSmallMobile ? 32 : 36,
                },
              ]}
            >
              Travel together.{'\n'}Clean, verified & transparent.
            </Text>
            <Text
              style={[
                styles.heroGlassSubtitle,
                {
                  fontSize: isDesktop ? 16 : isTablet ? 15 : isSmallMobile ? 13 : 14,
                  lineHeight: isDesktop ? 25 : 22,
                  maxWidth: isDesktop ? 680 : isTablet ? 520 : '100%',
                },
              ]}
            >
              India{"'"}s premier intercity carpooling network with 100% verified rides, EV fleets, and zero dynamic surge pricing.
            </Text>

            {/* CTA Buttons */}
            <View
              style={[
                styles.heroGlassCtaRow,
                { flexDirection: isSmallMobile ? 'column' : 'row', alignItems: isSmallMobile ? 'stretch' : 'center' },
              ]}
            >
              <Pressable
                style={[styles.appleBluePill, isSmallMobile && { flex: 1, justifyContent: 'center' }]}
                onPress={handleSearchRides}
              >
                <Text style={styles.appleBluePillText}>Search Verified Rides</Text>
                <Text style={styles.pillArrow}>→</Text>
              </Pressable>

              <Pressable
                style={[styles.appleGlassPill, isSmallMobile && { flex: 1, justifyContent: 'center' }]}
                onPress={() => router.push('/safety')}
              >
                <Text style={styles.appleGlassPillText}>Trust & Safety ›</Text>
              </Pressable>
            </View>

            {/* ================= SEARCH DOCK ================= */}
            <View style={[styles.searchGlassDock, { width: '100%', maxWidth: isDesktop ? 960 : '100%' }]}>
              <View style={styles.searchGlassHeader}>
                <Text style={styles.searchGlassHeaderTitle}>Plan your journey across India</Text>
                <View style={styles.liveIndicatorPill}>
                  <Text style={styles.liveIndicatorDot}>●</Text>
                  <Text style={styles.liveIndicatorText}>Live Express Fleets</Text>
                </View>
              </View>

              <View style={[styles.searchFieldsRow, (isDesktop || isTablet) ? styles.searchFieldsRowDesktop : null]}>
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
                <Pressable style={styles.swapCircleBtn} onPress={handleSwap} hitSlop={10}>
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
                  style={[
                    styles.dockSearchBtn,
                    (!isDesktop && !isTablet) && { width: '100%', marginTop: 4 },
                  ]}
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
        <View style={[styles.heroLightContainer, { paddingVertical: isDesktop ? 56 : isTablet ? 40 : 32, paddingHorizontal: hPad }]}>
          <View style={[styles.heroLightContent, { maxWidth: isDesktop ? 900 : isTablet ? 700 : '100%' }]}>
            <View style={styles.greenPillBadge}>
              <Text style={styles.greenPillBadgeText}>🌱 100% ELECTRIC CORRIDOR</Text>
            </View>
            <Text
              style={[
                styles.heroLightTitle,
                {
                  fontSize: isDesktop ? 40 : isTablet ? 32 : isSmallMobile ? 22 : 27,
                  lineHeight: isDesktop ? 48 : isTablet ? 38 : isSmallMobile ? 28 : 34,
                },
              ]}
            >
              Hello, Blublu Green.
            </Text>
            <Text
              style={[
                styles.heroLightSubtitle,
                {
                  fontSize: isDesktop ? 16 : isTablet ? 14 : isSmallMobile ? 13 : 14,
                  lineHeight: isDesktop ? 24 : 21,
                  maxWidth: isDesktop ? 640 : isTablet ? 500 : '100%',
                },
              ]}
            >
              Cut your carbon footprint by up to 80% with verified EV shared rides on high-speed expressways.
            </Text>

            <View style={[styles.heroLightCtaRow, { flexDirection: isSmallMobile ? 'column' : 'row', alignItems: isSmallMobile ? 'stretch' : 'center' }]}>
              <Pressable
                style={[styles.appleDarkPill, isSmallMobile && { flex: 1, alignItems: 'center' }]}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.appleDarkPillText}>Book EV Express</Text>
              </Pressable>

              <Pressable
                style={[styles.appleOutlinePill, isSmallMobile && { flex: 1, alignItems: 'center' }]}
                onPress={() => router.push('/safety')}
              >
                <Text style={styles.appleOutlinePillText}>View Carbon Savings ›</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ================= 2x2 BENTO SHOWCASE GRID ================= */}
        <View style={[styles.sectionContainer, { paddingHorizontal: hPad }]}>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionSuperHeader}>WHY CHOOSE BLUBLU</Text>
            <Text
              style={[
                styles.sectionMainTitle,
                { fontSize: isDesktop ? 28 : isTablet ? 24 : isSmallMobile ? 19 : 22 },
              ]}
            >
              Engineered for effortless travel.
            </Text>
          </View>

          <View style={[styles.bentoGrid, (isDesktop || isTablet) ? styles.bentoGridWide : null]}>
            {/* Bento Card 1 */}
            <View style={[styles.bentoCard, (isDesktop || isTablet) && styles.bentoCardHalf]}>
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
            <View style={[styles.bentoCard, (isDesktop || isTablet) && styles.bentoCardHalf]}>
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
            <View style={[styles.bentoCard, (isDesktop || isTablet) && styles.bentoCardHalf]}>
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
            <View style={[styles.bentoCard, (isDesktop || isTablet) && styles.bentoCardHalf]}>
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
        <View style={[styles.sectionContainer, { paddingHorizontal: hPad }]}>
          <View style={styles.sectionTitleBlock}>
            <Text style={styles.sectionSuperHeader}>POPULAR ROUTES</Text>
            <Text
              style={[
                styles.sectionMainTitle,
                { fontSize: isDesktop ? 28 : isTablet ? 24 : isSmallMobile ? 19 : 22 },
              ]}
            >
              Top daily departures
            </Text>
          </View>
          {/* Smooth Horizontal Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsScroll}
            style={styles.categoryTabsContainer}
          >
            {(['all', 'intercity', 'ev', 'daily', 'airport'] as const).map((tab) => {
              const labels: Record<string, string> = {
                all: 'All Routes',
                intercity: '⚡ Intercity Express',
                ev: '🌱 Green EV',
                daily: '🏢 Tech Corridor',
                airport: '✈️ Airport Connect',
              };
              return (
                <Pressable
                  key={tab}
                  style={[styles.categoryTab, activeTab === tab && styles.categoryTabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.categoryTabText, activeTab === tab && styles.categoryTabTextActive]}>
                    {labels[tab]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.routesGrid, (isDesktop || isTablet) ? styles.routesGridWide : null]}>
            <AppleRouteProductCard
              from="Hyderabad" to="Bengaluru" time="Today, 6:30 PM"
              price="₹650" driver="Rahul Sharma" rating="4.9"
              vehicle="Tata Nexon EV" seats="2 seats left" isEV={true}
              isWide={isDesktop || isTablet}
            />
            <AppleRouteProductCard
              from="Mumbai" to="Pune" time="Today, 7:15 PM"
              price="₹350" driver="Pooja Deshmukh" rating="4.95"
              vehicle="Hyundai Creta" seats="3 seats left" isEV={false}
              isWide={isDesktop || isTablet}
            />
            <AppleRouteProductCard
              from="Delhi NCR" to="Chandigarh" time="Tomorrow, 7:00 AM"
              price="₹450" driver="Vikram Mehta" rating="4.85"
              vehicle="MG ZS EV" seats="2 seats left" isEV={true}
              isWide={isDesktop || isTablet}
            />
            <AppleRouteProductCard
              from="Chennai" to="Bengaluru" time="Tomorrow, 8:30 AM"
              price="₹550" driver="Ananya Verma" rating="4.92"
              vehicle="Kia EV6" seats="1 seat left" isEV={true}
              isWide={isDesktop || isTablet}
            />
          </View>
        </View>

        {/* ================= DIRECTORY FOOTER ================= */}
        <View style={[styles.appleFooter, { paddingHorizontal: hPad }]}>
          <View style={styles.footerNoteRow}>
            <Text style={styles.footerNoteText}>
              1. Instant cashback subject to terms and partner bank eligibility. 2. Carbon emission metrics calculated against single-occupancy petrol vehicle standards on national highways.
            </Text>
          </View>

          <View style={styles.footerDivider} />

          <View style={[styles.footerDirectoryGrid, (isDesktop || isTablet) ? styles.footerDirectoryGridWide : null]}>
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

      {/* Floating Bottom Nav for mobile / tablet */}
      {!isDesktop && <BottomNavigation />}
    </SafeAreaView>
  );
}

// ─── Route Card Component ─────────────────────────────────────────────────────
function AppleRouteProductCard({
  from, to, time, price, driver, rating, vehicle, seats, isEV, isWide,
}: {
  from: string; to: string; time: string; price: string;
  driver: string; rating: string; vehicle: string; seats: string;
  isEV: boolean; isWide: boolean;
}) {
  return (
    <Pressable
      style={[styles.routeCard, isWide && styles.routeCardWide]}
      onPress={() =>
        router.push({
          pathname: '/trip-details',
          params: { from, to, departure: time, price: price.replace('₹', ''), driver },
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },

  /* ── NAV ── */
  appleGlobalNav: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D1D6',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },

  appleNavBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  appleLogoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appleLogoIcon: { fontSize: 17 },

  appleBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.4,
    flexShrink: 1,
  },

  appleNavLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },

  appleNavLink: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
    opacity: 0.75,
    letterSpacing: -0.1,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'opacity 0.15s ease' } as any,
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
    gap: 10,
  },

  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  navIconText: { fontSize: 16 },

  scrollContent: {
    flexGrow: 1,
  },

  /* ── HERO GLASS ── */
  heroGlassContainer: {
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },

  heroGlassContent: {
    alignItems: 'center',
  },

  proPillBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 113, 227, 0.15)',
  },

  proPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0071E3',
    letterSpacing: 0.6,
  },

  heroGlassTitle: {
    fontWeight: '900',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: -1.2,
    marginBottom: 12,
  },

  heroGlassSubtitle: {
    color: '#6E6E73',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 24,
  },

  heroGlassCtaRow: {
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
    paddingVertical: 13,
    paddingHorizontal: 22,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 18px rgba(0, 113, 227, 0.35)',
      } as any,
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },

  appleBluePillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  pillArrow: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  appleGlassPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D2D2D7',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      } as any,
      default: {},
    }),
  },

  appleGlassPillText: { color: '#1D1D1F', fontSize: 14, fontWeight: '700' },

  /* ── SEARCH DOCK (FROSTED GLASS) ── */
  searchGlassDock: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      web: {
        backdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.07)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
  },

  searchGlassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 6,
  },

  searchGlassHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.2,
    flexShrink: 1,
  },

  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 9999,
  },

  liveIndicatorDot: { fontSize: 7, color: '#34C759' },
  liveIndicatorText: { fontSize: 10, fontWeight: '800', color: '#34C759' },

  searchFieldsRow: {
    flexDirection: 'column',
    gap: 10,
  },

  searchFieldsRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchFieldBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 52,
  },

  blueDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0071E3', flexShrink: 0 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759', flexShrink: 0 },
  searchFieldInputCol: { flex: 1 },

  searchMicroLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#86868B',
    letterSpacing: 0.6,
  },

  searchTextInput: {
    color: '#1D1D1F',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
    padding: 0,
    minHeight: 22,
  },

  swapCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {},
    }),
  },

  swapCircleIcon: { color: '#0071E3', fontSize: 14, fontWeight: '800' },

  dockSearchBtn: {
    backgroundColor: '#0071E3',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 52,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
      } as any,
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },

  dockSearchBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  dockSearchBtnArrow: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  /* ── HERO LIGHT ── */
  heroLightContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D1D6',
  },

  heroLightContent: {
    alignItems: 'center',
  },

  greenPillBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 9999,
    marginBottom: 12,
  },

  greenPillBadgeText: { fontSize: 10, fontWeight: '800', color: '#34C759', letterSpacing: 0.5 },

  heroLightTitle: {
    fontWeight: '900',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 10,
  },

  heroLightSubtitle: {
    color: '#6E6E73',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 20,
  },

  heroLightCtaRow: {
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },

  appleDarkPill: {
    backgroundColor: '#1D1D1F',
    borderRadius: 9999,
    paddingVertical: 11,
    paddingHorizontal: 20,
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  appleDarkPillText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  appleOutlinePill: {
    backgroundColor: 'transparent',
    borderRadius: 9999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  appleOutlinePillText: { color: '#0071E3', fontSize: 13, fontWeight: '700' },

  /* ── SECTIONS ── */
  sectionContainer: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 36,
    paddingBottom: 20,
  },

  sectionTitleBlock: {
    marginBottom: 16,
  },

  sectionSuperHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0071E3',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  sectionMainTitle: {
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.5,
  },

  /* ── BENTO GRID ── */
  bentoGrid: {
    flexDirection: 'column',
    gap: 12,
  },

  bentoGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  bentoCard: {
    width: '100%',
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
    ...Platform.select({
      web: { boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)' } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },

  bentoCardHalf: {
    // Approx 50% minus half the gap
    flex: 1,
    minWidth: 260,
  },

  bentoIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  bentoIcon: { fontSize: 20 },

  bentoCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    marginBottom: 6,
  },

  bentoCardDesc: {
    fontSize: 13,
    color: '#6E6E73',
    lineHeight: 19,
    marginBottom: 12,
  },

  bentoCardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0071E3',
  },

  /* ── CATEGORY TABS ── */
  categoryTabsContainer: {
    marginBottom: 16,
  },

  categoryTabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  categoryTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
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

  /* ── ROUTES GRID ── */
  routesGrid: {
    flexDirection: 'column',
    gap: 12,
  },

  routesGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  routeCard: {
    width: '100%',
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },

  routeCardWide: {
    flex: 1,
    minWidth: 260,
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

  routeCardArrow: { color: '#0071E3' },

  routeCardTime: {
    marginTop: 3,
    fontSize: 11,
    color: '#86868B',
    fontWeight: '500',
  },

  routeCardPriceBox: { alignItems: 'flex-end' },

  routeCardPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -0.4,
  },

  routeCardSeatLabel: { fontSize: 10, color: '#86868B' },

  routeCardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
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
    gap: 10,
    flex: 1,
  },

  driverAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F5F7',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  driverAvatarText: { fontSize: 13, fontWeight: '700', color: '#1D1D1F' },

  driverNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  driverNameText: { fontSize: 12, fontWeight: '700', color: '#1D1D1F' },

  driverRatingText: { fontSize: 11, fontWeight: '700', color: '#F56300' },

  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },

  evBadge: { fontSize: 9, fontWeight: '700', color: '#34C759' },

  vehicleText: { fontSize: 10, color: '#86868B' },

  actionCol: { alignItems: 'flex-end', flexShrink: 0 },

  seatsLeftText: { fontSize: 10, fontWeight: '600', color: '#34C759', marginBottom: 5 },

  bookPill: {
    backgroundColor: '#0071E3',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },

  bookPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  /* ── FOOTER ── */
  appleFooter: {
    backgroundColor: '#F5F5F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D1D6',
    paddingVertical: 32,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },

  footerNoteRow: { marginBottom: 14 },

  footerNoteText: { fontSize: 10, color: '#86868B', lineHeight: 16 },

  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D1D6',
    marginVertical: 16,
  },

  footerDirectoryGrid: {
    flexDirection: 'column',
    gap: 20,
  },

  footerDirectoryGridWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },

  footerCol: { minWidth: 130 },

  footerColHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 10,
  },

  footerLinkText: {
    fontSize: 11,
    color: '#6E6E73',
    marginBottom: 7,
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  footerCopyText: { fontSize: 10, color: '#86868B' },

  footerBottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  footerSubLink: {
    fontSize: 10,
    color: '#6E6E73',
    ...Platform.select({ web: { cursor: 'pointer' } as any, default: {} }),
  },

  footerDot: { fontSize: 9, color: '#86868B' },
});
