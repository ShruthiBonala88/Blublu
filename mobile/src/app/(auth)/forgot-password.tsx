import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Input, ErrorState } from '../../components';
import { authApi } from '../../services/api/authApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function ForgotPassword() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authApi.requestOtp(phone);
      setLoading(false);

      if (res.error) {
        setError(res.error);
      } else {
        setMessage('Password reset OTP sent to your registered phone number.');
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || 'Unable to request password reset OTP');
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Account Recovery</Text>
        <Text style={styles.subtitle}>
          Enter your registered mobile phone number to receive verification code instructions.
        </Text>
      </View>

      {error ? <ErrorState message={error} onRetry={() => setError('')} style={styles.errorBox} /> : null}

      <Input
        label="Mobile Phone Number"
        placeholder="+91 98765 43210"
        value={phone}
        onChangeText={(t) => {
          setPhone(t);
          if (error) setError('');
        }}
        keyboardType="phone-pad"
        hint={message}
      />

      <Button
        title="Send Verification OTP"
        onPress={handleReset}
        loading={loading}
        disabled={loading}
        style={styles.submitBtn}
      />

      <Button
        title="Back to Log In"
        onPress={() => router.back()}
        variant="text"
        style={styles.backBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  errorBox: {
    marginBottom: 16,
    padding: 12,
  },
  submitBtn: {
    marginTop: 16,
  },
  backBtn: {
    marginTop: 16,
  },
});
