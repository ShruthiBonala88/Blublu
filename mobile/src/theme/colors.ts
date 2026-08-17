export const colors = {
  primary: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#E4E4E7', // Crisp light grey
    500: '#FFFFFF', // High-contrast White primary accent
    600: '#D4D4D8',
    700: '#A1A1AA',
    800: '#27272A',
    900: '#18181B',
  },
  accent: {
    emerald: '#E4E4E7',
    emeraldGlow: '#A1A1AA',
    indigo: '#D4D4D8',
    indigoGlow: '#A1A1AA',
    purple: '#A1A1AA',
    amber: '#E4E4E7',
    rose: '#F4F4F5',
    cyan: '#FFFFFF',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  background: {
    primary: '#09090B',   // Deep rich black
    secondary: '#141417', // Dark sleek container grey
    card: '#141417',      // Clean card surface
    input: '#141417',     // Input field surface
    elevated: '#1C1C20',  // High elevated surface
  },
  text: {
    primary: '#FFFFFF',   // Crisp white main text
    secondary: '#A1A1AA', // Medium soft grey
    muted: '#71717A',     // Muted subtext
    inverse: '#09090B',   // Deep black text on light buttons
    brand: '#FFFFFF',     // Clean white brand title
    neon: '#FFFFFF',
  },
  border: {
    subtle: '#1F1F23',
    default: '#27272A',   // Clean thin border line
    focus: '#FFFFFF',     // Crisp white active focus ring
    error: '#71717A',
    glow: '#3F3F46',
  },
  status: {
    success: '#FFFFFF',
    warning: '#D4D4D8',
    error: '#E4E4E7',
    info: '#A1A1AA',
  },
} as const;

export type Colors = typeof colors;

