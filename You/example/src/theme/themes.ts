/**
 * Sacred UI Theme Catalog
 * Phase 1: Foundation
 *
 * 16 contemplative themes based on premium Bible apps
 */

import type { ColorTokens } from './tokens';

export interface ThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  isDark: boolean;
  colors: ColorTokens;
}

// ─────────────────────────────────────────────
// CLASSIC LIGHT - Default warm white
// Inspired by: Tecartura warm aesthetic
// ─────────────────────────────────────────────

export const classicLight: ThemeConfig = {
  id: 'classic-light',
  name: 'Classic Light',
  subtitle: 'Warm and inviting',
  isDark: false,
  colors: {
    bgPrimary: '#FFFDF8',
    bgSecondary: '#F9F6F0',
    bgTertiary: '#F3EFE5',
    textPrimary: '#1A1A1A',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    border: '#E8E4DF',
    borderFocus: '#D4AF37',
    accent: '#D4AF37',
    accentSecondary: '#8B732A',
    accentBg: '#FFF8E1',
    overlay: 'rgba(0,0,0,0.4)',
    shimmerBase: '#F3EFE5',
    shimmerHighlight: '#F9F6F0',
  },
};

// ─────────────────────────────────────────────
// CLASSIC DARK - Warm dark mode
// Inspired by: YouVersion dark mode
// ─────────────────────────────────────────────

export const classicDark: ThemeConfig = {
  id: 'classic_dark',
  name: 'Classic Dark',
  subtitle: 'Gentle on the eyes',
  isDark: true,
  colors: {
    bgPrimary: '#121212',
    bgSecondary: '#1E1E1E',
    bgTertiary: '#2A2A2A',
    textPrimary: '#E8E4DF',
    textSecondary: '#A8A4A0',
    textTertiary: '#6B6B6B',
    border: '#2A2A2A',
    borderFocus: '#E8C547',
    accent: '#E8C547',
    accentSecondary: '#BFA040',
    accentBg: '#2A2410',
    overlay: 'rgba(0,0,0,0.6)',
    shimmerBase: '#2A2A2A',
    shimmerHighlight: '#3A3A3A',
  },
};

// ─────────────────────────────────────────────
// SEPIA - Kindle paper texture
// Inspired by: Kindle reading experience
// ─────────────────────────────────────────────

export const sepia: ThemeConfig = {
  id: 'sepia',
  name: 'Sepia',
  subtitle: 'Paper-like warmth',
  isDark: false,
  colors: {
    bgPrimary: '#F4EFE6',
    bgSecondary: '#EDE6D6',
    bgTertiary: '#E6DCC8',
    textPrimary: '#5C4B37',
    textSecondary: '#7A6B57',
    textTertiary: '#A89880',
    border: '#DDD2BC',
    borderFocus: '#8B6914',
    accent: '#8B6914',
    accentSecondary: '#6B5210',
    accentBg: '#F4EFE6',
    overlay: 'rgba(92,75,55,0.4)',
    shimmerBase: '#EDE6D6',
    shimmerHighlight: '#F4EFE6',
  },
};

// ─────────────────────────────────────────────
// PARCHMENT - Olive Tree warmth
// Inspired by: Olive Tree Bible App
// ─────────────────────────────────────────────

export const parchment: ThemeConfig = {
  id: 'parchment',
  name: 'Parchment',
  subtitle: 'Ancient manuscript feel',
  isDark: false,
  colors: {
    bgPrimary: '#FFF8F0',
    bgSecondary: '#F5EDE0',
    bgTertiary: '#EDE2D0',
    textPrimary: '#3E2723',
    textSecondary: '#5D4037',
    textTertiary: '#8D6E63',
    border: '#DDD0BE',
    borderFocus: '#C9A227',
    accent: '#C9A227',
    accentSecondary: '#A08220',
    accentBg: '#FFF8E1',
    overlay: 'rgba(62,39,35,0.4)',
    shimmerBase: '#F5EDE0',
    shimmerHighlight: '#FFF8F0',
  },
};

// ─────────────────────────────────────────────
// AMOLED - Pure black for OLED
// Inspired by: Battery-saving dark mode
// ─────────────────────────────────────────────

export const amoled: ThemeConfig = {
  id: 'amoled',
  name: 'AMOLED',
  subtitle: 'Pure black, gold accent',
  isDark: true,
  colors: {
    bgPrimary: '#000000',
    bgSecondary: '#0A0A0A',
    bgTertiary: '#141414',
    textPrimary: '#E0E0E0',
    textSecondary: '#B0B0B0',
    textTertiary: '#666666',
    border: '#1A1A1A',
    borderFocus: '#D4AF37',
    accent: '#D4AF37',
    accentSecondary: '#BFA040',
    accentBg: '#1A1410',
    overlay: 'rgba(0,0,0,0.8)',
    shimmerBase: '#141414',
    shimmerHighlight: '#1A1A1A',
  },
};

// ─────────────────────────────────────────────
// NEBULA - Purple identity
// Inspired by: Hermeneuta distinctive brand
// ─────────────────────────────────────────────

export const nebula: ThemeConfig = {
  id: 'nebula',
  name: 'Nebula Dark',
  subtitle: 'Deep purple contemplation',
  isDark: true,
  colors: {
    bgPrimary: '#1A1A2E',
    bgSecondary: '#222240',
    bgTertiary: '#2A2A4A',
    textPrimary: '#E0D8FF',
    textSecondary: '#B0A8D0',
    textTertiary: '#6B6390',
    border: '#2E2E4E',
    borderFocus: '#9B59B6',
    accent: '#9B59B6',
    accentSecondary: '#7D3C98',
    accentBg: '#2A1A3E',
    overlay: 'rgba(0,0,0,0.6)',
    shimmerBase: '#222240',
    shimmerHighlight: '#2A2A4A',
  },
};

// ─────────────────────────────────────────────
// OCEAN - Calm meditation
// Inspired by: Blue tranquility
// ─────────────────────────────────────────────

export const ocean: ThemeConfig = {
  id: 'ocean',
  name: 'Ocean Blue',
  subtitle: 'Calm and meditative',
  isDark: false,
  colors: {
    bgPrimary: '#F0F8FF',
    bgSecondary: '#E0EFF8',
    bgTertiary: '#D0E6F0',
    textPrimary: '#1A237E',
    textSecondary: '#3949AB',
    textTertiary: '#7986CB',
    border: '#C8D8E8',
    borderFocus: '#3B82F6',
    accent: '#3B82F6',
    accentSecondary: '#2563EB',
    accentBg: '#DBEAFE',
    overlay: 'rgba(26,35,126,0.4)',
    shimmerBase: '#E0EFF8',
    shimmerHighlight: '#F0F8FF',
  },
};

// ─────────────────────────────────────────────
// FOREST - Natural contemplation
// Inspired by: Green serenity
// ─────────────────────────────────────────────

export const forest: ThemeConfig = {
  id: 'forest',
  name: 'Forest',
  subtitle: 'Natural serenity',
  isDark: false,
  colors: {
    bgPrimary: '#F0FFF0',
    bgSecondary: '#E0F5E0',
    bgTertiary: '#D0EAD0',
    textPrimary: '#1B4332',
    textSecondary: '#2D6A4F',
    textTertiary: '#74C69D',
    border: '#C0E0C0',
    borderFocus: '#10B981',
    accent: '#10B981',
    accentSecondary: '#059669',
    accentBg: '#D1FAE5',
    overlay: 'rgba(27,67,50,0.4)',
    shimmerBase: '#E0F5E0',
    shimmerHighlight: '#F0FFF0',
  },
};

// ─────────────────────────────────────────────
// MIDNIGHT - NIV official dark
// Inspired by: NIV Bible App dark mode
// ─────────────────────────────────────────────

export const midnight: ThemeConfig = {
  id: 'midnight',
  name: 'Midnight',
  subtitle: 'Deep navy with gold',
  isDark: true,
  colors: {
    bgPrimary: '#0A1128',
    bgSecondary: '#111D3A',
    bgTertiary: '#1A2848',
    textPrimary: '#C8D6E5',
    textSecondary: '#8899AA',
    textTertiary: '#556677',
    border: '#1A2848',
    borderFocus: '#FFD700',
    accent: '#FFD700',
    accentSecondary: '#D4AF37',
    accentBg: '#1A1410',
    overlay: 'rgba(0,0,0,0.6)',
    shimmerBase: '#111D3A',
    shimmerHighlight: '#1A2848',
  },
};

// ─────────────────────────────────────────────
// ROSE - Devotional warmth
// Inspired by: Feminine devotional aesthetic
// ─────────────────────────────────────────────

export const rose: ThemeConfig = {
  id: 'rose',
  name: 'Rose',
  subtitle: 'Devotional warmth',
  isDark: false,
  colors: {
    bgPrimary: '#FFF5F5',
    bgSecondary: '#FFE8E8',
    bgTertiary: '#FFD8D8',
    textPrimary: '#4A0E0E',
    textSecondary: '#7C2D2D',
    textTertiary: '#B07070',
    border: '#FFD0D0',
    borderFocus: '#E84393',
    accent: '#E84393',
    accentSecondary: '#D63384',
    accentBg: '#FCE7F3',
    overlay: 'rgba(74,14,14,0.4)',
    shimmerBase: '#FFE8E8',
    shimmerHighlight: '#FFF5F5',
  },
};

// ─────────────────────────────────────────────
// ROYAL - Logos authority
// Inspired by: Logos Bible institutional feel
// ─────────────────────────────────────────────

export const royal: ThemeConfig = {
  id: 'royal',
  name: 'Royal',
  subtitle: 'Institutional authority',
  isDark: true,
  colors: {
    bgPrimary: '#1B2A4A',
    bgSecondary: '#243558',
    bgTertiary: '#2E4068',
    textPrimary: '#E8E4DF',
    textSecondary: '#B0A898',
    textTertiary: '#6B6358',
    border: '#2E4068',
    borderFocus: '#D4AF37',
    accent: '#D4AF37',
    accentSecondary: '#BFA040',
    accentBg: '#2A2410',
    overlay: 'rgba(0,0,0,0.5)',
    shimmerBase: '#243558',
    shimmerHighlight: '#2E4068',
  },
};

// ─────────────────────────────────────────────
// MINIMAL - Apple Books purity
// Inspired by: Apple Books reading experience
// ─────────────────────────────────────────────

export const minimal: ThemeConfig = {
  id: 'minimal',
  name: 'Minimal',
  subtitle: 'Pure reading focus',
  isDark: false,
  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8F8F8',
    bgTertiary: '#F0F0F0',
    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#888888',
    border: '#E0E0E0',
    borderFocus: '#000000',
    accent: '#000000',
    accentSecondary: '#333333',
    accentBg: '#F0F0F0',
    overlay: 'rgba(0,0,0,0.4)',
    shimmerBase: '#F0F0F0',
    shimmerHighlight: '#F8F8F8',
  },
};

// ─────────────────────────────────────────────
// SCHOLAR - Accordance academic
// Inspired by: Accordance Bible academic feel
// ─────────────────────────────────────────────

export const scholar: ThemeConfig = {
  id: 'scholar',
  name: 'Scholar',
  subtitle: 'Academic rigor',
  isDark: false,
  colors: {
    bgPrimary: '#FAFAFA',
    bgSecondary: '#F0F4F8',
    bgTertiary: '#E5EBF0',
    textPrimary: '#2D5F5F',
    textSecondary: '#4A7A7A',
    textTertiary: '#8CAAAA',
    border: '#D8E0E8',
    borderFocus: '#2D5F5F',
    accent: '#2D5F5F',
    accentSecondary: '#1E4040',
    accentBg: '#E5EBF0',
    overlay: 'rgba(45,95,95,0.4)',
    shimmerBase: '#F0F4F8',
    shimmerHighlight: '#FAFAFA',
  },
};

// ─────────────────────────────────────────────
// LAMPLIGHT - Tecartura book-feel
// Inspired by: Tecartura warm dark mode (best in class)
// ─────────────────────────────────────────────

export const lamplight: ThemeConfig = {
  id: 'lamplight',
  name: 'Lamplight',
  subtitle: 'Reading by candlelight',
  isDark: true,
  colors: {
    bgPrimary: '#1A1410',
    bgSecondary: '#241E18',
    bgTertiary: '#2E2820',
    textPrimary: '#E8D5B7',
    textSecondary: '#C8B898',
    textTertiary: '#8A7A60',
    border: '#2E2820',
    borderFocus: '#D4A574',
    accent: '#D4A574',
    accentSecondary: '#B8884E',
    accentBg: '#2A2010',
    overlay: 'rgba(0,0,0,0.6)',
    shimmerBase: '#241E18',
    shimmerHighlight: '#2E2820',
  },
};

// ─────────────────────────────────────────────
// SUNRISE - Morning reading
// Inspired by: Warm golden morning light
// ─────────────────────────────────────────────

export const sunrise: ThemeConfig = {
  id: 'sunrise',
  name: 'Sunrise',
  subtitle: 'Golden morning light',
  isDark: false,
  colors: {
    bgPrimary: '#FFF8E1',
    bgSecondary: '#FFF0CC',
    bgTertiary: '#FFE8B8',
    textPrimary: '#3E2723',
    textSecondary: '#5D4037',
    textTertiary: '#8D6E63',
    border: '#FFE0A0',
    borderFocus: '#FF8C00',
    accent: '#FF8C00',
    accentSecondary: '#E07800',
    accentBg: '#FFF8E1',
    overlay: 'rgba(62,39,35,0.4)',
    shimmerBase: '#FFF0CC',
    shimmerHighlight: '#FFF8E1',
  },
};

// ─────────────────────────────────────────────
// MONASTERY - Ancient manuscript
// Inspired by: Medieval manuscript aesthetic
// ─────────────────────────────────────────────

export const monastery: ThemeConfig = {
  id: 'monastery',
  name: 'Monastery',
  subtitle: 'Ancient manuscript',
  isDark: false,
  colors: {
    bgPrimary: '#F5F0E8',
    bgSecondary: '#EDE5D8',
    bgTertiary: '#E5D8C8',
    textPrimary: '#2C1810',
    textSecondary: '#4A2C20',
    textTertiary: '#8A6050',
    border: '#D8CCB8',
    borderFocus: '#6B4226',
    accent: '#6B4226',
    accentSecondary: '#5A3520',
    accentBg: '#F5F0E8',
    overlay: 'rgba(44,24,16,0.4)',
    shimmerBase: '#EDE5D8',
    shimmerHighlight: '#F5F0E8',
  },
};

// ─────────────────────────────────────────────
// THEME REGISTRY
// ─────────────────────────────────────────────

/** All available themes */
export const allThemes: ThemeConfig[] = [
  classicLight,
  classicDark,
  sepia,
  parchment,
  amoled,
  nebula,
  ocean,
  forest,
  midnight,
  rose,
  royal,
  minimal,
  scholar,
  lamplight,
  sunrise,
  monastery,
];

/** Default themes (light + dark pair) */
export const defaultThemes = {
  light: classicLight,
  dark: classicDark,
};

/** Quick lookup by id */
export const themesById: Record<string, ThemeConfig> = {};
allThemes.forEach((t) => {
  themesById[t.id] = t;
});

/** Light themes only */
export const lightThemes = allThemes.filter((t) => !t.isDark);

/** Dark themes only */
export const darkThemes = allThemes.filter((t) => t.isDark);

/** Premium themes (gold accent focus) */
export const premiumThemes = [classicLight, classicDark, lamplight, midnight, royal];

/** Export type for theme selection */
export type ThemeId = (typeof allThemes)[number]['id'];
