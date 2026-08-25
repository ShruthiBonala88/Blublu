import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOtp, verifyOtp } from '../../services/api/auth';
import { useUserStore } from '../../store/userStore';

export default function OTPScreen() {
  const params = useLocalSearchParams<{ phone?: string; email?: string; devOtp?: string }>();
  const phone = params.phone || '';
  const email = params.email || '';
  const devOtp = params.devOtp || '';

  const destination = email ? email : phone ? phone : '+91 98765 43210';
  const isEmail = !!email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { setPhone, setPassengerProfile } = useUserStore();

  const handleChange = (value: string, index: number) => {
    setErrorMsg('');
    const cleaned = value.replace(/[^0-9]/g, '');

    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    if (cleaned.length > 1) {
      const digits = cleaned.split('');
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = cleaned;
      setOtp(newOtp);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6 || loading) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const target = isEmail ? { email } : { phone: destination };
      const res = await verifyOtp(target, code);
      console.log('OTP Verification Result:', res);

      if (!isEmail) {
        setPhone(destination);
        setPassengerProfile({ phone: destination });
      } else {
        setPassengerProfile({ email });
      }

      router.push('/role-selection');
    } catch (err: any) {
      console.error('Verify OTP failed:', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid verification code. Please check and try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const target = isEmail ? { email } : { phone: destination };
      await sendOtp(target);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to resend code';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.join('').length === 6;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.centerWrapper}>
          <View style={styles.content}>

            {/* Top Bar with Back Button */}
            <View style={styles.topBar}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backText}>‹</Text>
              </Pressable>

              <View style={styles.brandBadge}>
                <Text style={styles.brandText}>BLUBLU</Text>
              </View>

              <View style={{ width: 44 }} />
            </View>

            {/* Card Container */}
            <View style={styles.otpCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.lockEmoji}>{isEmail ? '✉️' : '🔐'}</Text>
              </View>

              <Text style={styles.title}>
                Verify your {isEmail ? 'Email' : 'Number'}
              </Text>

              <Text style={styles.subtitle}>
                We sent a 6-digit verification code to
              </Text>

              <View style={styles.phoneBadge}>
                <Text style={styles.phone}>{destination}</Text>
              </View>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Enter 6-digit code</Text>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputActive : null,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    autoFocus={index === 0}
                    editable={!loading}
                  />
                ))}
              </View>

              <Pressable
                style={[
                  styles.verifyButton,
                  (!isComplete || loading) && styles.disabledButton,
                ]}
                disabled={!isComplete || loading}
                onPress={handleVerify}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.verifyText,
                      !isComplete && styles.disabledText,
                    ]}
                  >
                    Verify & Continue
                  </Text>
                )}
              </Pressable>

              <View style={styles.resendContainer}>
                <Text style={styles.resendLabel}>Didn{"'"}t receive the code?</Text>
                <Pressable onPress={handleResend} disabled={loading}>
                  <Text style={styles.resendButton}>Resend Code</Text>
                </Pressable>
              </View>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  centerWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },

  backText: {
    fontSize: 28,
    lineHeight: 30,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  brandBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },

  brandText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#0071E3',
  },

  otpCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  lockEmoji: {
    fontSize: 28,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#86868B',
    textAlign: 'center',
  },

  phoneBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  phone: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0071E3',
  },

  label: {
    width: '100%',
    marginTop: 22,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
    textAlign: 'center',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },

  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: '#F5F5F7',
    fontSize: 22,
    fontWeight: '800',
    color: '#1D1D1F',
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        transition: 'all 0.15s ease',
      } as any,
      default: {},
    }),
  },

  otpInputActive: {
    borderColor: '#0071E3',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(0, 113, 227, 0.15)',
      },
      default: {},
    }),
  },

  verifyButton: {
    width: '100%',
    height: 52,
    marginTop: 24,
    borderRadius: 9999,
    backgroundColor: '#0071E3',
    justifyContent: 'center',
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

  disabledButton: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
    elevation: 0,
  },

  verifyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledText: {
    color: '#86868B',
  },

  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  resendLabel: {
    fontSize: 13,
    color: '#86868B',
  },

  resendButton: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0071E3',
  },

  devBanner: {
    width: '100%',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },

  devBannerContent: {
    flex: 1,
  },

  devBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },

  devBannerCode: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#1D1D1F',
    marginTop: 2,
  },

  autoFillButton: {
    backgroundColor: '#34C759',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  autoFillButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  errorBanner: {
    width: '100%',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});