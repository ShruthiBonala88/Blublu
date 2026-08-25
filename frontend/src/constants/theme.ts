/**
 * Apple India HIG Design System Tokens
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1D1D1F',
    textSecondary: '#86868B',
    background: '#F5F5F7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F2FF',
    primary: '#0071E3',
    primaryLight: '#E8F2FF',
    border: '#E5E5EA',
    card: '#FFFFFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  dark: {
    text: '#F5F5F7',
    textSecondary: '#86868B',
    background: '#000000',
    backgroundElement: '#1C1C1E',
    backgroundSelected: '#2C2C2E',
    primary: '#0A84FF',
    primaryLight: '#1C2C3E',
    border: '#38383A',
    card: '#1C1C1E',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 9999,
  full: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui',
    serif: 'ui-serif',
    rounded: 'SF Pro Rounded, ui-rounded',
    mono: 'SF Mono, ui-monospace',
  },
  default: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
    serif: 'serif',
    rounded: '"SF Pro Rounded", system-ui, sans-serif',
    mono: '"SF Mono", monospace',
  },
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  hover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  primaryPill: {
    shadowColor: '#0071E3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
