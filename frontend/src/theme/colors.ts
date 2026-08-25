/**
 * Apple India (apple.com/in) Design System Tokens
 * Recreated with Apple Human Interface Guidelines (HIG) aesthetics
 */
export const colors = {
  // Apple Signature Interactive Blues
  primary: '#0071E3',           // Apple Interactive Blue (Key CTA / Link)
  primaryDark: '#0058B0',       // Darker active blue
  primaryLight: '#E8F2FF',      // Apple light blue tint
  primaryAccent: '#2997FF',     // Dark mode & high-contrast vibrant blue
  appleBlue: '#0071E3',
  appleBlueHover: '#0077ED',
  appleBlueSoft: 'rgba(0, 113, 227, 0.08)',
  appleBlueBorder: 'rgba(0, 113, 227, 0.25)',

  // Apple Canvas & Backgrounds
  background: '#F5F5F7',        // Apple Signature Light Canvas
  backgroundSecondary: '#FAFAFC',
  surface: '#FFFFFF',           // Pristine White Card
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F5F5F7',
  surfaceSubtle: '#F0F0F2',
  surfaceGlass: 'rgba(255, 255, 255, 0.85)',
  surfaceGlassDark: 'rgba(29, 29, 31, 0.85)',

  // Apple Dark & Titanium Palette (for Pro cards / Keynotes)
  appleDark: '#1D1D1F',         // Apple Slate / SF Pro Text
  appleTitanium: '#161617',     // Deep Slate Titanium Card
  appleBlack: '#000000',        // Pure Black
  appleCardDark: '#1D1D1F',
  appleCardDarkSecondary: '#242426',

  // Typography & Text
  text: '#1D1D1F',              // Apple SF Pro Primary Text
  textSecondary: '#6E6E73',     // Apple SF Pro Secondary Text
  textMuted: '#86868B',         // Apple Tertiary / Label
  textLight: '#A1A1A6',
  textOnDark: '#F5F5F7',
  textOnDarkMuted: '#86868B',

  // Apple Precision Hairline Borders
  border: '#E5E5EA',            // Apple Hairline Border (Light)
  borderDark: '#D2D2D7',        // Apple Hairline Border (Medium)
  borderLight: 'rgba(229, 229, 234, 0.8)',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  borderDarkCard: 'rgba(255, 255, 255, 0.12)',

  // Apple System Accents
  success: '#34C759',           // Apple System Green (Verified / Active)
  appleGreen: '#34C759',
  appleGreenLight: 'rgba(52, 199, 89, 0.12)',
  warning: '#FF9500',           // Apple System Orange
  appleOrange: '#F56300',       // Apple Store Orange / Special Offer
  appleOrangeLight: 'rgba(245, 99, 0, 0.1)',
  error: '#FF3B30',             // Apple System Red
  appleRed: '#FF3B30',
  applePurple: '#AF52DE',       // Apple System Purple (Blublu Pro)
  applePurpleLight: 'rgba(175, 82, 222, 0.12)',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  appleGray: '#F5F5F7',
  greyDark: '#1D1D1F',
  greyMedium: '#86868B',
  greyLight: '#D2D2D7',
  greyExtraLight: '#E5E5EA',
} as const;