import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
      <View style={styles.outerContainer}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F5F5F7' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="passenger-home" />
          <Stack.Screen name="search-results" />
          <Stack.Screen name="trip-details" />
          <Stack.Screen name="search" />
          <Stack.Screen name="trips" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="profile" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    width: '100%',
    minHeight: '100%',
  },
});