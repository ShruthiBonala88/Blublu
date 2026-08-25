import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import BottomNavigation from '@/components/BottomNavigation';

export default function ProfileScreen() {
  const {
    role,
    setRole,
    driverName,
    driverPhone,
    passengerName,
    passengerPhone,
    vehicle,
    setVehicle,
    logout,
  } = useUserStore();

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [vehicleName, setVehicleName] = useState(vehicle.name);
  const [vehicleType, setVehicleType] = useState(vehicle.type);
  const [vehicleSeats, setVehicleSeats] = useState(vehicle.seats);
  const [vehicleNumber, setVehicleNumber] = useState(vehicle.number);
  const [vehicleColor, setVehicleColor] = useState(vehicle.color);

  const isDriver = role === 'driver';
  const isAdmin = role === 'admin';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of BLUBLU?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const openVehicleEditor = () => {
    setVehicleName(vehicle.name);
    setVehicleType(vehicle.type);
    setVehicleSeats(vehicle.seats);
    setVehicleNumber(vehicle.number);
    setVehicleColor(vehicle.color);
    setIsEditingVehicle(true);
  };

  const handleSaveVehicle = () => {
    setVehicle({
      name: vehicleName,
      type: vehicleType,
      seats: vehicleSeats,
      number: vehicleNumber,
      color: vehicleColor,
    });
    setIsEditingVehicle(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Account Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Role Toggle Switcher (RBAC 3-Way Switcher) */}
        <View style={styles.roleToggleContainer}>
          <Pressable
            style={[
              styles.roleTab,
              role === 'passenger' && styles.activeRoleTab,
            ]}
            onPress={() => setRole('passenger')}
          >
            <Text style={styles.roleTabEmoji}>👤</Text>
            <Text
              style={[
                styles.roleTabText,
                role === 'passenger' && styles.activeRoleTabText,
              ]}
            >
              Passenger
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleTab,
              role === 'driver' && styles.activeRoleTab,
            ]}
            onPress={() => setRole('driver')}
          >
            <Text style={styles.roleTabEmoji}>🚗</Text>
            <Text
              style={[
                styles.roleTabText,
                role === 'driver' && styles.activeRoleTabText,
              ]}
            >
              Driver
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleTab,
              role === 'admin' && styles.activeRoleTab,
            ]}
            onPress={() => setRole('admin')}
          >
            <Text style={styles.roleTabEmoji}>🛡️</Text>
            <Text
              style={[
                styles.roleTabText,
                role === 'admin' && styles.activeRoleTabText,
              ]}
            >
              Admin
            </Text>
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isAdmin ? '🛡️' : isDriver ? '🚗' : '👤'}</Text>
          </View>

          <Text style={styles.name}>
            {isAdmin ? 'System Administrator' : isDriver ? driverName : passengerName}
          </Text>

          <Text style={styles.phone}>
            {isAdmin ? 'admin@blublu.com' : isDriver ? driverPhone : passengerPhone}
          </Text>

          <View style={[styles.verifiedBadge, isAdmin && styles.adminVerifiedBadge]}>
            <Text style={[styles.verifiedText, isAdmin && styles.adminVerifiedText]}>
              {isAdmin ? '🛡️ Super Admin' : isDriver ? '✓ Verified Driver' : '✓ Verified Passenger'}
            </Text>
          </View>
        </View>

        {/* DRIVER PROFILE CONTENT */}
        {isDriver ? (
          <>
            {/* VEHICLE INFORMATION */}
            <Text style={styles.sectionTitle}>VEHICLE INFORMATION</Text>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleHeaderRow}>
                <View style={styles.vehicleTitleRow}>
                  <Text style={styles.carEmoji}>🚗</Text>
                  <Text style={styles.vehicleTitleName}>{vehicle.name}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{vehicle.type}</Text>
                </View>
              </View>

              <View style={styles.vehicleGrid}>
                <View style={styles.vehicleGridRow}>
                  <Text style={styles.vehicleGridLabel}>Vehicle Type</Text>
                  <Text style={styles.vehicleGridValue}>{vehicle.type}</Text>
                </View>

                <View style={styles.vehicleGridRow}>
                  <Text style={styles.vehicleGridLabel}>Seats Available</Text>
                  <Text style={styles.vehicleGridValue}>{vehicle.seats}</Text>
                </View>

                <View style={styles.vehicleGridRow}>
                  <Text style={styles.vehicleGridLabel}>Registration Number</Text>
                  <Text style={styles.vehicleGridValue}>{vehicle.number}</Text>
                </View>

                <View style={styles.vehicleGridRow}>
                  <Text style={styles.vehicleGridLabel}>Color</Text>
                  <Text style={styles.vehicleGridValue}>{vehicle.color}</Text>
                </View>
              </View>

              <Pressable
                style={styles.editVehicleBtn}
                onPress={openVehicleEditor}
              >
                <Text style={styles.editVehicleBtnText}>Edit Vehicle</Text>
              </Pressable>
            </View>

            {/* DRIVER SECTION */}
            <Text style={styles.sectionTitle}>DRIVER SERVICES</Text>

            <ProfileButton
              icon="📊"
              title="Driver Dashboard"
              subtitle="View earnings, rides, and analytics"
              onPress={() => router.push('/driver-trips')}
            />

            <ProfileButton
              icon="🚗"
              title="Driver Rides"
              subtitle="Manage trips you are offering"
              onPress={() => router.push('/driver-trips')}
            />

            <ProfileButton
              icon="🚙"
              title="My Vehicles"
              subtitle="Manage your registered vehicles"
              onPress={() => router.push('/vehicles')}
            />

            {/* ACCOUNT SECTION */}
            <Text style={styles.sectionTitle}>ACCOUNT & PREFERENCES</Text>

            <ProfileButton
              icon="✏️"
              title="Edit Profile"
              subtitle="Update driver personal information"
              onPress={() => router.push('/edit-profile')}
            />

            <ProfileButton
              icon="🔔"
              title="Notifications"
              subtitle="Manage ride and payment alerts"
              onPress={() => router.push('/notifications')}
            />

            <ProfileButton
              icon="⚙️"
              title="Settings"
              subtitle="Security, language, and preferences"
              onPress={() => router.push('/settings')}
            />

            {/* SUPPORT SECTION */}
            <Text style={styles.sectionTitle}>SAFETY & SUPPORT</Text>

            <ProfileButton
              icon="🛡️"
              title="Safety & Verification"
              subtitle="ID verification and safety features"
              onPress={() => router.push('/safety')}
            />

            <ProfileButton
              icon="❓"
              title="Help & Support"
              subtitle="24/7 priority driver assistance"
              onPress={() => router.push('/help')}
            />
          </>
        ) : (
          /* PASSENGER PROFILE CONTENT */
          <>
            {/* ACCOUNT SECTION */}
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <ProfileButton
              icon="✏️"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push('/edit-profile')}
            />

            <ProfileButton
              icon="🧳"
              title="My Trips"
              subtitle="View upcoming and past bookings"
              onPress={() => router.push('/trips')}
            />

            <ProfileButton
              icon="🔔"
              title="Notifications"
              subtitle="Ride alerts and promotion updates"
              onPress={() => router.push('/notifications')}
            />

            <ProfileButton
              icon="⚙️"
              title="Settings"
              subtitle="App preferences and dark mode"
              onPress={() => router.push('/settings')}
            />

            {/* SUPPORT SECTION */}
            <Text style={styles.sectionTitle}>SUPPORT</Text>

            <ProfileButton
              icon="🛡️"
              title="Safety Center"
              subtitle="Emergency contact and SOS guidelines"
              onPress={() => router.push('/safety')}
            />

            <ProfileButton
              icon="❓"
              title="Help Center"
              subtitle="FAQ and 24/7 passenger support"
              onPress={() => router.push('/help')}
            />
          </>
        )}

        {/* LOGOUT BUTTON */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* EDIT VEHICLE MODAL */}
      <Modal
        visible={isEditingVehicle}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditingVehicle(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Vehicle Details</Text>

            <Text style={styles.inputLabel}>VEHICLE MODEL</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleName}
              onChangeText={setVehicleName}
              placeholder="e.g. Toyota Innova"
              placeholderTextColor="#86868B"
            />

            <Text style={styles.inputLabel}>VEHICLE TYPE</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="e.g. SUV, Sedan, Hatchback"
              placeholderTextColor="#86868B"
            />

            <Text style={styles.inputLabel}>SEATS</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleSeats}
              onChangeText={setVehicleSeats}
              placeholder="e.g. 6 Seats"
              placeholderTextColor="#86868B"
            />

            <Text style={styles.inputLabel}>REGISTRATION NUMBER</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              placeholder="e.g. TS 09 EA 1234"
              placeholderTextColor="#86868B"
            />

            <Text style={styles.inputLabel}>COLOR</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleColor}
              onChangeText={setVehicleColor}
              placeholder="e.g. White"
              placeholderTextColor="#86868B"
            />

            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setIsEditingVehicle(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalSaveBtn}
                onPress={handleSaveVehicle}
              >
                <Text style={styles.modalSaveBtnText}>Save Vehicle</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <BottomNavigation />
    </SafeAreaView>
  );
}

function ProfileButton({
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
    <Pressable style={styles.menuCard} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconEmoji}>{icon}</Text>
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
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
    maxWidth: 600,
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

  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
  },

  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },

  activeRoleTab: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
      default: {},
    }),
  },

  roleTabEmoji: {
    fontSize: 14,
  },

  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86868B',
  },

  activeRoleTabText: {
    color: '#1D1D1F',
    fontWeight: '800',
  },

  profileCard: {
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  avatarText: {
    fontSize: 36,
  },

  name: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  phone: {
    marginTop: 2,
    fontSize: 13,
    color: '#86868B',
  },

  verifiedBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },

  adminVerifiedBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.12)',
  },

  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34C759',
  },

  adminVerifiedText: {
    color: '#9333EA',
  },

  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  vehicleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },

  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  carEmoji: {
    fontSize: 20,
  },

  vehicleTitleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  typeBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0071E3',
  },

  vehicleGrid: {
    gap: 8,
    marginBottom: 14,
  },

  vehicleGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  vehicleGridLabel: {
    fontSize: 13,
    color: '#86868B',
  },

  vehicleGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  editVehicleBtn: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },

  editVehicleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0071E3',
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
  },

  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
      default: {},
    }),
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuIconEmoji: {
    fontSize: 18,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  menuSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: '#86868B',
  },

  arrow: {
    fontSize: 20,
    color: '#86868B',
  },

  logoutButton: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },

  logoutText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
  },

  inputLabel: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
  },

  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1D1D1F',
    backgroundColor: '#F5F5F7',
  },

  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 9999,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCancelBtnText: {
    color: '#86868B',
    fontSize: 14,
    fontWeight: '700',
  },

  modalSaveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 9999,
    backgroundColor: '#0071E3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
