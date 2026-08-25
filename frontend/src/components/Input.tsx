import { spacing } from '@/theme';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Platform,
} from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        {...props}
        placeholderTextColor="#86868B"
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          style,
        ]}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: '#1D1D1F',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    color: '#1D1D1F',
    fontSize: 16,
    ...Platform.select({
      web: {
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      } as any,
      default: {},
    }),
  },
  focusedInput: {
    borderColor: '#0071E3',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(0, 113, 227, 0.15)',
      },
      default: {},
    }),
  },
  errorInput: {
    borderColor: '#FF3B30',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});