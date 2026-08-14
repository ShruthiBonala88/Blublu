export const colors = {
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8', // Vivid Sky Blue
    500: '#06B6D4', // Vibrant Electric Cyan
    600: '#0284C7', // Deep Brand Primary
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  accent: {
    emerald: '#10B981', // Vivid Emerald Mint
    emeraldGlow: '#059669',
    indigo: '#6366F1', // Electric Indigo
    indigoGlow: '#818CF8',
    purple: '#A855F7', // Cyber Purple
    amber: '#F59E0B',  // Vivid Amber Gold
    rose: '#F43F5E',   // Neon Crimson Rose
    cyan: '#00F2FE',   // Bright Neon Cyan
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#0B0F19',
  },
  background: {
    primary: '#0B0F19',
    secondary: '#161E2E',
    card: '#161E2E',
    input: '#0B0F19',
    elevated: '#1F293D',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0B0F19',
    brand: '#38BDF8',
    neon: '#00F2FE',
  },
  border: {
    subtle: '#1E293B',
    default: '#2D3748',
    focus: '#06B6D4',
    error: '#F43F5E',
    glow: '#38BDF8',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
    info: '#38BDF8',
  },
} as const;

export type Colors = typeof colors;
