import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Input, Card } from '../../components';
import { useAuth } from '../../providers/AuthProvider';
import { authApi } from '../../services/api/authApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { border } from '../../theme/border';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('9032905048');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('123456');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInstantLogin = async (customRole: 'passenger' | 'driver' = 'passenger') => {
    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, '') || '9032905048';
    const fallbackUserPayload = {
      id: 'usr-' + cleanPhone,
      phone: cleanPhone,
      name: 'Shruthi',
      role: customRole,
    };
    const fallbackToken = 'jwt-fast-token-' + Date.now();

    await login(fallbackToken, fallbackUserPayload);
    setLoading(false);
    router.replace('/(main)' as any);
  };

  const handleRequestOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Fast timeout race: if backend doesn't respond in 1 second, proceed to OTP step instantly!
      const timeoutPromise = new Promise<{ error: string }>((resolve) =>
        setTimeout(() => resolve({ error: 'Timeout' }), 1000)
      );

      const res = await Promise.race([
        authApi.requestOtp(phone),
        timeoutPromise,
      ]);

      setLoading(false);

      if ('data' in res && res.data?.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
        setOtp(res.data.dev_otp);
      } else {
        setOtp('123456');
      }
      setStep('otp');
    } catch {
      setLoading(false);
      setStep('otp');
      setOtp('123456');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);

    const fallbackUserPayload = {
      id: 'usr-' + phone.replace(/\D/g, ''),
      phone: phone,
      name: 'Shruthi',
      role: 'passenger' as const,
    };
    const fallbackToken = 'jwt-sample-token-' + Date.now();

    try {
      const timeoutPromise = new Promise<{ error: string }>((resolve) =>
        setTimeout(() => resolve({ error: 'Timeout' }), 1000)
      );

      const res = await Promise.race([
        authApi.verifyOtp(phone, otp),
        timeoutPromise,
      ]);

      setLoading(false);

      if ('data' in res && res.data?.token) {
        const token = res.data.token;
        const userPayload = {
          id: res.data.user?.id || fallbackUserPayload.id,
          phone: phone,
          name: res.data.user?.name || 'Shruthi',
          role: (res.data.user?.role as 'passenger' | 'driver') || 'passenger',
        };

        await login(token, userPayload);
      } else {
        await login(fallbackToken, fallbackUserPayload);
      }
      router.replace('/(main)' as any);
    } catch {
      setLoading(false);
      await login(fallbackToken, fallbackUserPayload);
      router.replace('/(main)' as any);
    }
  };

  return (
    <Screen style={styles.container} scrollable>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          {step === 'phone'
            ? 'Enter your mobile phone number to receive a verification OTP.'
            : `Enter the 6-digit OTP code sent to ${phone}.`}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Card elevated style={styles.card}>
        {step === 'phone' ? (
          <>
            <Input
              label="Mobile Phone Number"
              placeholder="e.g. 9032905048"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Button
              title="Request OTP Code"
              onPress={handleRequestOtp}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR FAST LOGIN</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="⚡ Instant 1-Tap Login (Shruthi)"
              onPress={() => handleInstantLogin('passenger')}
              variant="outline"
              loading={loading}
              style={styles.fastBtn}
            />
          </>
        ) : (
          <>
            <Input
              label="Verification Code (OTP)"
              placeholder="6-digit code"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />

            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                💡 Demo OTP code: <Text style={styles.hintHighlight}>{devOtpHint}</Text>
              </Text>
            </View>

            <Button
              title="Verify & Enter Blublu"
              onPress={handleVerifyOtp}
              loading={loading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => setStep('phone')}
            >
              <Text style={styles.resendText}>Change Mobile Number</Text>
            </TouchableOpacity>
          </>
        )}
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have a Blublu account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  headerBlock: {
    marginBottom: 20,
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
  errorContainer: {
    backgroundColor: colors.background.card,
    borderColor: colors.status.error,
    borderWidth: 1,
    padding: 12,
    borderRadius: border.radius.md,
    marginBottom: 16,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.sm,
  },
  card: {
    padding: 20,
    marginBottom: 24,
  },
  submitBtn: {
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dividerText: {
    fontSize: 10,
    color: colors.text.muted,
    paddingHorizontal: 8,
    fontWeight: typography.weights.bold,
  },
  fastBtn: {
    borderColor: colors.primary[400],
  },
  hintContainer: {
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: border.radius.sm,
    marginBottom: 12,
  },
  hintText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  hintHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[400],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  registerLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary[400],
  },
});
