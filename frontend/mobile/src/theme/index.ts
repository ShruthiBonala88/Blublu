import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { border } from './border';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  border,
  shadows,
};

export type Theme = typeof theme;
export { colors, typography, spacing, border, shadows };
