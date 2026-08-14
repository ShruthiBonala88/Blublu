import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { border } from '../theme/border';
import { typography } from '../theme/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: colors.background.elevated },
          text: { color: colors.text.primary },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.primary[500],
          },
          text: { color: colors.primary[400] },
        };
      case 'text':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: colors.primary[400] },
        };
      case 'danger':
        return {
          button: { backgroundColor: colors.status.error },
          text: { color: '#FFFFFF' },
        };
      case 'primary':
      default:
        return {
          button: { backgroundColor: colors.primary[600] },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: { paddingVertical: 8, paddingHorizontal: 16 },
          text: { fontSize: typography.sizes.sm },
        };
      case 'lg':
        return {
          button: { paddingVertical: 16, paddingHorizontal: 28 },
          text: { fontSize: typography.sizes.lg },
        };
      case 'md':
      default:
        return {
          button: { paddingVertical: 12, paddingHorizontal: 20 },
          text: { fontSize: typography.sizes.md },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        vStyles.button,
        sStyles.button,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} size="small" />
      ) : (
        <Text style={[styles.textBase, vStyles.text, sStyles.text, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: border.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textBase: {
    fontWeight: typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
