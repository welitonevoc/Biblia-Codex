import { ThemeConfig, ThemeMode } from '../types';

type ThemeColors = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentStrong: string;
  accentContrast: string;
  border: string;
  borderStrong: string;
  heroStart: string;
  heroMid: string;
  heroEnd: string;
  glow: string;
  success: string;
  warning: string;
  danger: string;
  meshGradient?: string;
};

export type ThemePreset = {
  id: ThemeMode;
  name: string;
  shortName: string;
  emoji: string;
  family: 'light' | 'dark';
  colors: ThemeColors;
};

export const DEFAULT_THEME_MODE: ThemeMode = 'pure_light';

export const THEME_PRESETS: Record<ThemeMode, ThemePreset> = {
  pure_light: {
    id: 'pure_light',
    name: 'Branco Puro',
    shortName: 'Claro',
    emoji: '⚪',
    family: 'light',
    colors: {
      background: '#ffffff',
      backgroundAlt: '#f8fafc',
      surface: '#ffffff',
      surfaceStrong: '#f1f5f9',
      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: '#94a3b8',
      accent: '#2563eb',
      accentStrong: '#1d4ed8',
      accentContrast: '#ffffff',
      border: '#e2e8f0',
      borderStrong: '#cbd5e1',
      heroStart: '#3b82f6',
      heroMid: '#eff6ff',
      heroEnd: '#ffffff',
      glow: '#60a5fa',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  pure_dark: {
    id: 'pure_dark',
    name: 'Petro Puro',
    shortName: 'OLED',
    emoji: '⚫',
    family: 'dark',
    colors: {
      background: '#000000',
      backgroundAlt: '#0a0a0a',
      surface: '#121212',
      surfaceStrong: '#1e1e1e',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',
      accent: '#3b82f6',
      accentStrong: '#60a5fa',
      accentContrast: '#ffffff',
      border: '#1e293b',
      borderStrong: '#334155',
      heroStart: '#1d4ed8',
      heroMid: '#0a0a0a',
      heroEnd: '#000000',
      glow: '#3b82f6',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
    },
  },
  paper_sepia: {
    id: 'paper_sepia',
    name: 'Santuário Papiro',
    shortName: 'Leitura',
    emoji: '📜',
    family: 'light',
    colors: {
      background: '#f4f1ea',
      backgroundAlt: '#e8e4d8',
      surface: '#ffffff',
      surfaceStrong: '#e2e2d2',
      text: '#1b3022',
      textMuted: '#3e5c47',
      textSubtle: '#6b8e76',
      accent: '#4a7c59',
      accentStrong: '#3a6347',
      accentContrast: '#ffffff',
      border: '#d1d5db',
      borderStrong: '#9ca3af',
      heroStart: '#4a7c59',
      heroMid: '#e8e4d8',
      heroEnd: '#f4f1ea',
      glow: '#86efac',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  royal_majesty: {
    id: 'royal_majesty',
    name: 'Majestade Imperial',
    shortName: 'Premium',
    emoji: '👑',
    family: 'dark',
    colors: {
      background: '#1a0b2e',
      backgroundAlt: '#120822',
      surface: '#2d144d',
      surfaceStrong: '#3b1b63',
      text: '#f3e8ff',
      textMuted: '#d8b4fe',
      textSubtle: '#a78bfa',
      accent: '#d4af37',
      accentStrong: '#f1c40f',
      accentContrast: '#1a0b2e',
      border: '#4c2380',
      borderStrong: '#6d28d9',
      heroStart: '#7c3aed',
      heroMid: '#120822',
      heroEnd: '#1a0b2e',
      glow: '#d4af37',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  midnight_navy: {
    id: 'midnight_navy',
    name: 'Noite Profunda',
    shortName: 'Noite',
    emoji: '🌑',
    family: 'dark',
    colors: {
      background: '#0a0e1a',
      backgroundAlt: '#05070d',
      surface: '#111827',
      surfaceStrong: '#1f2937',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',
      accent: '#3b82f6',
      accentStrong: '#60a5fa',
      accentContrast: '#ffffff',
      border: '#1e293b',
      borderStrong: '#334155',
      heroStart: '#1e3a8a',
      heroMid: '#05070d',
      heroEnd: '#0a0e1a',
      glow: '#3b82f6',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
    },
  },
  ethereal_light: {
    id: 'ethereal_light',
    name: 'Luz Etérea',
    shortName: 'Etéreo',
    emoji: '✨',
    family: 'light',
    colors: {
      background: '#f0f9ff',
      backgroundAlt: '#e0f2fe',
      surface: '#ffffff',
      surfaceStrong: '#f0f9ff',
      text: '#0c4a6e',
      textMuted: '#075985',
      textSubtle: '#0369a1',
      accent: '#0ea5e9',
      accentStrong: '#0284c7',
      accentContrast: '#ffffff',
      border: '#bae6fd',
      borderStrong: '#7dd3fc',
      heroStart: '#38bdf8',
      heroMid: '#e0f2fe',
      heroEnd: '#f0f9ff',
      glow: '#7dd3fc',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  obsidian_gold: {
    id: 'obsidian_gold',
    name: 'Obsidiana Áurea',
    shortName: 'Ouro',
    emoji: '⚜️',
    family: 'dark',
    colors: {
      background: '#050505',
      backgroundAlt: '#0a0a0a',
      surface: '#121212',
      surfaceStrong: '#1a1a1a',
      text: '#fafafa',
      textMuted: '#d4d4d4',
      textSubtle: '#a3a3a3',
      accent: '#d4af37',
      accentStrong: '#f1c40f',
      accentContrast: '#000000',
      border: '#262626',
      borderStrong: '#404040',
      heroStart: '#854d0e',
      heroMid: '#050505',
      heroEnd: '#000000',
      glow: '#eab308',
      success: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
    },
  },
  emerald_sanctum: {
    id: 'emerald_sanctum',
    name: 'Templo Esmeralda',
    shortName: 'Verde',
    emoji: '🎋',
    family: 'dark',
    colors: {
      background: '#064e3b',
      backgroundAlt: '#064e3b',
      surface: '#065f46',
      surfaceStrong: '#047857',
      text: '#ecfdf5',
      textMuted: '#a7f3d0',
      textSubtle: '#6ee7b7',
      accent: '#10b981',
      accentStrong: '#34d399',
      accentContrast: '#ffffff',
      border: '#065f46',
      borderStrong: '#047857',
      heroStart: '#059669',
      heroMid: '#064e3b',
      heroEnd: '#022c22',
      glow: '#34d399',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  crimson_vignette: {
    id: 'crimson_vignette',
    name: 'Vinheta Carmesim',
    shortName: 'Rubi',
    emoji: '🍷',
    family: 'dark',
    colors: {
      background: '#2d0a0a',
      backgroundAlt: '#1a0505',
      surface: '#451010',
      surfaceStrong: '#601a1a',
      text: '#fee2e2',
      textMuted: '#fecaca',
      textSubtle: '#fca5a5',
      accent: '#ef4444',
      accentStrong: '#dc2626',
      accentContrast: '#ffffff',
      border: '#7f1d1d',
      borderStrong: '#991b1b',
      heroStart: '#991b1b',
      heroMid: '#1a0505',
      heroEnd: '#2d0a0a',
      glow: '#f87171',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
};

export const THEME_OPTIONS = Object.values(THEME_PRESETS);
export const THEME_CLASSNAMES = THEME_OPTIONS.map((theme) => theme.id);

export const getThemePreset = (mode: ThemeMode) => THEME_PRESETS[mode] ?? THEME_PRESETS[DEFAULT_THEME_MODE];

export const normalizeThemeMode = (mode: string | undefined): ThemeMode => {
  if (!mode) return DEFAULT_THEME_MODE;
  const validModes = THEME_CLASSNAMES;
  if (validModes.includes(mode as ThemeMode)) {
    return mode as ThemeMode;
  }
  const map: Record<string, ThemeMode> = {
    light: 'pure_light',
    day: 'pure_light',
    dark: 'pure_dark',
    night: 'pure_dark',
    sepia: 'paper_sepia',
    sanctuary: 'paper_sepia',
    majesty: 'royal_majesty',
    midnight: 'midnight_navy',
    gold: 'obsidian_gold',
    emerald: 'emerald_sanctum',
    crimson: 'crimson_vignette',
  };
  return map[mode] || DEFAULT_THEME_MODE;
};

export const getThemeVariables = (config: ThemeConfig) => {
  const preset = getThemePreset(config.mode);
  const accent = config.accentColor || preset.colors.accent;
  
  const hexToRgbChannels = (hex: string) => {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  const fontMap: Record<string, string> = {
    'Untitled Serif': '"Libre Baskerville", serif',
    'Serif': '"EB Garamond", serif',
    'Sans Serif': '"Inter", sans-serif',
    'Monospace': '"JetBrains Mono", monospace',
  };

  return {
    '--bg-bible': preset.colors.background,
    '--bg-bible-alt': preset.colors.backgroundAlt,
    '--surface-0': preset.colors.surface,
    '--surface-1': preset.colors.surface,
    '--surface-2': preset.colors.surfaceStrong,
    '--surface-hover': preset.colors.surfaceStrong,
    '--text-bible': preset.colors.text,
    '--text-muted-bible': preset.colors.textMuted,
    '--text-subtle-bible': preset.colors.textSubtle,
    '--accent-bible': accent,
    '--accent-strong-bible': preset.colors.accentStrong,
    '--accent-contrast-bible': preset.colors.accentContrast,
    '--border-bible': preset.colors.border,
    '--border-strong-bible': preset.colors.borderStrong,
    '--accent-bible-rgb': hexToRgbChannels(accent),
    '--surface-rgb': hexToRgbChannels(preset.colors.surface),
    '--hero-start-bible': preset.colors.heroStart,
    '--hero-mid-bible': preset.colors.heroMid,
    '--hero-end-bible': preset.colors.heroEnd,
    '--glow-bible': preset.colors.glow,
    '--glow-rgb': hexToRgbChannels(preset.colors.glow),
    '--success-bible': preset.colors.success,
    '--warning-bible': preset.colors.warning,
    '--danger-bible': preset.colors.danger,
    '--font-bible-family': fontMap[config.fontFamily] || fontMap['Untitled Serif'],
    '--font-bible-size': `${config.fontSize}px`,
    '--font-bible-line-height': config.lineHeight.toString(),
    '--font-bible-letter-spacing': `${config.letterSpacing}em`,
    '--horizontal-margin': `${config.horizontalMargin}px`,
    '--theme-family': preset.family,
  };
};
