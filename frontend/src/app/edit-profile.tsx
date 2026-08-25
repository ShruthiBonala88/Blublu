import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function EditProfileScreen() {
  const {
    role,
    passengerName,
    passengerPhone,
    passengerEmail,
    driverName,
    driverPhone,
    driverEmail,
    setPassengerProfile,
    setDriverProfile,
  } = useUserStore();

  const isDriver = role === 'driver';

  const [name, setName] = useState(isDriver ? driverName : passengerName);
  const [phone, setPhone] = useState(isDriver ? driverPhone : passengerPhone);
  const [email, setEmail] = useState(isDriver ? driverEmail : passengerEmail);

  const handleSave = () => {
    if (isDriver) {
      setDriverProfile({ name, phone, email });
    } else {
      setPassengerProfile({ name, phone, email });
    }

    Alert.alert(
      'Profile Updated',
      `${isDriver ? 'Driver' : 'Passenger'} profile details updated successfully.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Edit {isDriver ? 'Driver' : 'Passenger'} Profile
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isDriver ? '🚗' : '👤'}</Text>
          </View>

          <Pressable
            onPress={() =>
              Alert.alert('Profile Photo', 'Choose from photo library or camera.')
            }
          >
            <Text style={styles.changePhoto}>Change Photo</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor="#86868B"
          />

          <Text style={styles.label}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            placeholderTextColor="#86868B"
          />

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter email address"
            placeholderTextColor="#86868B"
          />
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Profile</Text>
        </Pressable>
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },

  avatarText: {
    fontSize: 36,
  },

  changePhoto: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#0071E3',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
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

  label: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#86868B',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1D1D1F',
    backgroundColor: '#F5F5F7',
    fontWeight: '600',
    marginBottom: 12,
  },

  saveButton: {
    marginTop: 20,
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

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});