import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button, Input } from '../../components';
import { useAuth } from '../providers/AuthProvider';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { border } from '../../theme/border';

export default function Profile() {
  const { user, role, setRole, logout } = useAuth();
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<
    'locations' | 'payments' | 'safety' | 'support' | null
  >(null);

  // Locations state
  const [homeAddress, setHomeAddress] = useState('Hitech City, Hyderabad');
  const [workAddress, setWorkAddress] = useState('Electronic City, Bengaluru');
  const [acPreference, setAcPreference] = useState(true);
  const [nonSmoking, setNonSmoking] = useState(true);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(1250);
  const [addAmount, setAddAmount] = useState('');

  // Safety state
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 43210');
  const [liveLocationSharing, setLiveLocationSharing] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/splash' as any);
  };

  const handleAddWalletMoney = () => {
    const amt = parseFloat(addAmount);
    if (!isNaN(amt) && amt > 0) {
      setWalletBalance((prev) => prev + amt);
      setAddAmount('');
      alert(`₹${amt} added to your Blublu Wallet!`);
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <Text style={styles.title}>Account Profile</Text>

      <Card elevated style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Shruthi'}</Text>
        <Text style={styles.userPhone}>{user?.phone || '9032905048'}</Text>
        <Text style={styles.userRole}>
          Current Mode: {role.toUpperCase()}
        </Text>

        <Button
          title={`Switch to ${role === 'passenger' ? 'Driver' : 'Passenger'} Mode`}
          onPress={() => setRole(role === 'passenger' ? 'driver' : 'passenger')}
          variant="outline"
          size="sm"
          style={styles.switchBtn}
        />
      </Card>

      {/* Account Settings List */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Account Settings</Text>

        {/* 1. Saved Locations */}
        <TouchableOpacity onPress={() => setActiveModal('locations')} activeOpacity={0.7}>
          <Card elevated style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Saved Locations & Preferences</Text>
                <Text style={styles.settingSubtitle}>Home, Work, Travel preferences</Text>
              </View>
              <Text style={styles.chevron}>➔</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 2. Payment Methods */}
        <TouchableOpacity onPress={() => setActiveModal('payments')} activeOpacity={0.7}>
          <Card elevated style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>💳</Text>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Payment Methods & Wallet</Text>
                <Text style={styles.settingSubtitle}>Balance: ₹{walletBalance} • UPI & Cards</Text>
              </View>
              <Text style={styles.chevron}>➔</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 3. Safety */}
        <TouchableOpacity onPress={() => setActiveModal('safety')} activeOpacity={0.7}>
          <Card elevated style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>🛡️</Text>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Safety & Emergency Contacts</Text>
                <Text style={styles.settingSubtitle}>SOS 112, Live trip sharing</Text>
              </View>
              <Text style={styles.chevron}>➔</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 4. Help & Support */}
        <TouchableOpacity onPress={() => setActiveModal('support')} activeOpacity={0.7}>
          <Card elevated style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>🎧</Text>
              <View style={styles.settingTextContent}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingSubtitle}>FAQ, 24/7 Helpline, Chat</Text>
              </View>
              <Text style={styles.chevron}>➔</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      <Button
        title="Log Out"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutBtn}
      />

      {/* MODAL 1: Saved Locations & Preferences */}
      <Modal visible={activeModal === 'locations'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>📍 Locations & Preferences</Text>
              <Text style={styles.modalSubtitle}>Manage your frequent addresses & ride rules</Text>

              <Input label="Home Address" value={homeAddress} onChangeText={setHomeAddress} />
              <Input label="Work Address" value={workAddress} onChangeText={setWorkAddress} />

              <Text style={styles.modalSectionTitle}>Travel Preferences</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Air Conditioned (AC) Vehicle</Text>
                <Switch value={acPreference} onValueChange={setAcPreference} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Strictly Non-Smoking Rides</Text>
                <Switch value={nonSmoking} onValueChange={setNonSmoking} />
              </View>

              <Button
                title="Save Changes"
                onPress={() => {
                  alert('Preferences saved successfully!');
                  setActiveModal(null);
                }}
                style={{ marginTop: 16 }}
              />
              <Button
                title="Close"
                onPress={() => setActiveModal(null)}
                variant="outline"
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Payment Methods & Wallet */}
      <Modal visible={activeModal === 'payments'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>💳 Wallet & Payment Methods</Text>
              <Text style={styles.modalSubtitle}>Manage your Blublu wallet & saved cards</Text>

              <Card elevated style={styles.walletCard}>
                <Text style={styles.walletLabel}>Blublu Wallet Balance</Text>
                <Text style={styles.walletValue}>₹{walletBalance}.00</Text>
              </Card>

              <Text style={styles.modalSectionTitle}>Add Money to Wallet</Text>
              <View style={styles.addMoneyRow}>
                <Input
                  label="Amount (₹)"
                  placeholder="500"
                  keyboardType="number-pad"
                  value={addAmount}
                  onChangeText={setAddAmount}
                  containerStyle={{ flex: 1 }}
                />
                <Button title="Add" onPress={handleAddWalletMoney} size="sm" style={{ marginTop: 24 }} />
              </View>

              <Text style={styles.modalSectionTitle}>Saved Payment Options</Text>
              <Card style={styles.paymentMethodItem}>
                <Text style={styles.pmTitle}>⚡ UPI: shruthi@okaxis (Default)</Text>
              </Card>
              <Card style={styles.paymentMethodItem}>
                <Text style={styles.pmTitle}>💳 HDFC Visa Credit Card •••• 4092</Text>
              </Card>

              <Button
                title="Close"
                onPress={() => setActiveModal(null)}
                variant="outline"
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Safety & Emergency Contacts */}
      <Modal visible={activeModal === 'safety'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>🛡️ Safety & Emergency Center</Text>
              <Text style={styles.modalSubtitle}>Your safety is our top priority during intercity rides</Text>

              <Button
                title="🚨 TRIGGER SOS EMERGENCY (112)"
                onPress={() => alert('SOS Alert Triggered! Emergency contacts & police (112) notified.')}
                variant="danger"
                style={{ marginBottom: 16 }}
              />

              <Input
                label="Primary Emergency Contact Number"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Share Live Trip Location with Contacts</Text>
                <Switch value={liveLocationSharing} onValueChange={setLiveLocationSharing} />
              </View>

              <Card style={styles.safetyInfoCard}>
                <Text style={styles.safetyInfoTitle}>24/7 Ride Monitoring Active</Text>
                <Text style={styles.safetyInfoBody}>
                  All Blublu trips include GPS tracking, driver identity verification, and route anomaly detection.
                </Text>
              </Card>

              <Button
                title="Close"
                onPress={() => setActiveModal(null)}
                variant="outline"
                style={{ marginTop: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Help & Support */}
      <Modal visible={activeModal === 'support'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>🎧 Help & Support Center</Text>
              <Text style={styles.modalSubtitle}>Need assistance with a booking or ride?</Text>

              <Card elevated style={styles.supportCard}>
                <Text style={styles.supportHelplineTitle}>📞 24/7 Support Hotline</Text>
                <Text style={styles.supportHelplineNum}>1800-BLUBLU-HELP (1800-258-2582)</Text>
              </Card>

              <Text style={styles.modalSectionTitle}>Frequently Asked Questions</Text>
              <Card style={styles.faqCard}>
                <Text style={styles.faqQ}>Q: How do I cancel a booked ride?</Text>
                <Text style={styles.faqA}>A: Go to My Rides ➔ Upcoming ➔ Tap Cancel Booking.</Text>
              </Card>
              <Card style={styles.faqCard}>
                <Text style={styles.faqQ}>Q: How are driver payouts calculated?</Text>
                <Text style={styles.faqA}>A: Drivers receive 90% of gross fares after a 10% platform fee.</Text>
              </Card>

              <Button
                title="💬 Start Live Support Chat"
                onPress={() => alert('Support Agent connected. How can we help you today?')}
                style={{ marginTop: 12 }}
              />
              <Button
                title="Close"
                onPress={() => setActiveModal(null)}
                variant="outline"
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  userRole: {
    fontSize: typography.sizes.xs,
    color: colors.primary[400],
    fontWeight: typography.weights.semibold,
    marginBottom: 16,
  },
  switchBtn: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionHeader: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingCard: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingTextContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  chevron: {
    color: colors.primary[400],
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  logoutBtn: {
    marginBottom: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  switchLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  walletCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 4,
  },
  walletValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  addMoneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodItem: {
    padding: 12,
    marginBottom: 8,
  },
  pmTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  safetyInfoCard: {
    padding: 14,
    marginTop: 12,
  },
  safetyInfoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.status.success,
    marginBottom: 4,
  },
  safetyInfoBody: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  supportCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  supportHelplineTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  supportHelplineNum: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  faqCard: {
    padding: 12,
    marginBottom: 8,
  },
  faqQ: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  faqA: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
