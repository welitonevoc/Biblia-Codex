/**
 * Sacred UI Design Tokens
 * Phase 1: Foundation
 *
 * Based on premium Bible apps: YouVersion, Olive Tree, Logos, Tecartura, Hermeneuta
 */

// ─────────────────────────────────────────────
// COLOR PALETTES
// ─────────────────────────────────────────────

/** Primary brand colors (Gold accent system) */
export const gold = {
  50: '#FFF8E1',
  100: '#FEF0C3',
  200: '#FDE097',
  300: '#FBD06B',
  400: '#E8C547',
  500: '#D4AF37', // Primary gold
  600: '#BFA040',
  700: '#8B732A',
  800: '#6B5A20',
  900: '#4A3E16',
};

/** Semantic colors - Light mode */
export const semanticLight = {
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#DBEAFE',
};

/** Semantic colors - Dark mode */
export const semanticDark = {
  success: '#34D399',
  successBg: '#1A4D3A',
  warning: '#FBBF24',
  warningBg: '#785B20',
  error: '#F87171',
  errorBg: '#5C1A1A',
  info: '#60A5FA',
  infoBg: '#1E3A5F',
};

/** Highlight colors for scripture */
export const highlightsLight = {
  yellow: '#FEF3C7',
  blue: '#DBEAFE',
  green: '#D1FAE5',
  red: '#FEE2E2',
  purple: '#EDE9FE',
  orange: '#FFEDD5',
};

export const highlightsDark = {
  yellow: '#785B20',
  blue: '#1E3A5F',
  green: '#1A4D3A',
  red: '#5C1A1A',
  purple: '#3B1F6E',
  orange: '#6B3A1A',
};

// ─────────────────────────────────────────────
// LIGHT THEME COLORS
// ─────────────────────────────────────────────

export const lightColors = {
  bgPrimary: '#FFFDF8',     // Warm white
  bgSecondary: '#F9F6F0',   // Warm gray
  bgTertiary: '#F3EFE5',    // Soft warm
  textPrimary: '#1A1A1A',   // Near black
  textSecondary: '#4B5563', // Gray 600
  textTertiary: '#9CA3AF',  // Gray 400
  border: '#E8E4DF',
  borderFocus: gold[500],
  accent: gold[500],
  accentSecondary: gold[700],
  accentBg: gold[50],
  overlay: 'rgba(0,0,0,0.4)',
  shimmerBase: '#F3EFE5',
  shimmerHighlight: '#F9F6F0',
};

// ─────────────────────────────────────────────
// DARK THEME COLORS
// ─────────────────────────────────────────────

export const darkColors = {
  bgPrimary: '#121212',     // Warm dark
  bgSecondary: '#1E1E1E',   // Elevated dark
  bgTertiary: '#2A2A2A',    // Deep gray
  textPrimary: '#E8E4DF',   // Warm off-white
  textSecondary: '#A8A4A0', // Muted warm
  textTertiary: '#6B6B6B',  // Dark muted
  border: '#2A2A2A',
  borderFocus: gold[400],
  accent: gold[400],
  accentSecondary: gold[600],
  accentBg: gold[900],
  overlay: 'rgba(0,0,0,0.6)',
  shimmerBase: '#2A2A2A',
  shimmerHighlight: '#3A3A3A',
};

// ─────────────────────────────────────────────
// SPACING SCALE (8px base grid)
// ─────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 96,
};

// ─────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

// ─────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────

export const typography = {
  display: {
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 26,
    fontWeight: '600' as const,
    lineHeight: 34,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 30,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 25,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 32, // 1.8x for scripture
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 27, // 1.7x
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22, // 1.6x
    letterSpacing: 0,
  },
  tiny: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 17,
    letterSpacing: 0.2,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 12,
    letterSpacing: 0,
  },
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
};

// Scripture text presets
export const scriptureText = {
  default: {
    fontSize: 18,
    lineHeight: 32,
    letterSpacing: 0,
  },
  small: {
    fontSize: 14,
    lineHeight: 25,
    letterSpacing: 0,
  },
  large: {
    fontSize: 22,
    lineHeight: 40,
    letterSpacing: 0,
  },
  xlarge: {
    fontSize: 28,
    lineHeight: 50,
    letterSpacing: 0,
  },
};

// Font families
export const fonts = {
  scripture: 'Lora',
  scriptureAlt: 'CrimsonText',
  scriptureScholar: 'EBGaramond',
  ui: 'Inter',
  heading: 'PlayfairDisplay',
  mono: 'JetBrainsMono',
  fallback: {
    scripture: 'Georgia, serif',
    ui: 'SF Pro, Roboto, sans-serif',
    heading: 'Georgia, serif',
    mono: 'monospace',
  },
};

// ─────────────────────────────────────────────
// SHADOW SYSTEM
// ─────────────────────────────────────────────

/** Shadows for light mode (React Native shadow syntax) */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 12,
  },
  gold: {
    shadowColor: gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 3,
  },
};

/** Shadows for dark mode (adjusted for dark surfaces) */
export const shadowsDark = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 12,
  },
  gold: {
    shadowColor: gold[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 3,
  },
};

// ─────────────────────────────────────────────
// ANIMATION TIMING
// ─────────────────────────────────────────────

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  gentle: 800,
  easing: {
    easeOut: [0.25, 0.1, 0.25, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    spring: [0.175, 0.885, 0.32, 1.275],
  },
};

// ─────────────────────────────────────────────
// TOUCH TARGETS
// ─────────────────────────────────────────────

export const touchTargets = {
  minimum: 44,  // iOS minimum
  comfortable: 48, // Android minimum
  large: 56,
};

// ─────────────────────────────────────────────
// LAYOUT CONSTANTS
// ─────────────────────────────────────────────

export const layout = {
  pageMargin: spacing.lg,
  pageMarginTablet: spacing['2xl'],
  readerMarginMin: spacing.lg,
  readerMarginMax: spacing['3xl'],
  readerMarginDefault: spacing.xl,
  bottomNavHeight: 64,
  headerHeight: 56,
  modalMaxWidth: 400,
  lineLengthMin: 45, // characters
  lineLengthMax: 75, // characters
};

// ─────────────────────────────────────────────
// GRADIENTS
// ─────────────────────────────────────────────

export const gradients = {
  goldPremium: ['#D4AF37', '#8B732A'],
  warmSunrise: ['#FFF8E1', '#FFFDF8'],
  deepContemplation: ['#1A1410', '#121212'],
  sacredPurple: ['#6B21A8', '#4C1D95'],
};

// ─────────────────────────────────────────────
// EXPORT: Complete token set
// ─────────────────────────────────────────────

export const tokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
    gold,
    semantic: {
      light: semanticLight,
      dark: semanticDark,
    },
    highlights: {
      light: highlightsLight,
      dark: highlightsDark,
    },
    gradients,
  },
  spacing,
  borderRadius,
  typography,
  scriptureText,
  fonts,
  shadows: {
    light: shadows,
    dark: shadowsDark,
  },
  animation,
  touchTargets,
  layout,
};

export type ColorTokens = typeof lightColors;
export type ThemeColors = typeof lightColors | typeof darkColors;
