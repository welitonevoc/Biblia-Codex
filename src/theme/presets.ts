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
};

export type ThemePreset = {
  id: ThemeMode;
  name: string;
  shortName: string;
  description: string;
  family: 'light' | 'dark';
  colors: ThemeColors;
};

export const DEFAULT_THEME_MODE: ThemeMode = 'linen';

export const THEME_PRESETS: Record<ThemeMode, ThemePreset> = {
  linen: {
    id: 'linen',
    name: 'Linho',
    shortName: 'Linho',
    description: 'Neutro editorial e clássico.',
    family: 'light',
    colors: {
      background: '#f6f1e7',
      backgroundAlt: '#efe6d9',
      surface: '#fffaf2',
      surfaceStrong: '#f3eadb',
      text: '#1f1a15',
      textMuted: '#5b5248',
      textSubtle: '#8a7d70',
      accent: '#8a6b43',
      accentStrong: '#6d5030',
      accentContrast: '#fff8ef',
      border: '#d9ccb9',
      borderStrong: '#c7b69c',
      heroStart: '#c89b6d',
      heroMid: '#efe3cc',
      heroEnd: '#f9f5ed',
      glow: '#d8bc92',
      success: '#1f8f63',
      warning: '#c4862f',
      danger: '#b3504e',
    },
  },
  dawn: {
    id: 'dawn',
    name: 'Alvorada',
    shortName: 'Alvorada',
    description: 'Creme rosado com luz suave.',
    family: 'light',
    colors: {
      background: '#fbf4ef',
      backgroundAlt: '#f7e8e0',
      surface: '#fff9f5',
      surfaceStrong: '#f6e5dd',
      text: '#241918',
      textMuted: '#6e5551',
      textSubtle: '#977772',
      accent: '#bc6c5f',
      accentStrong: '#934d43',
      accentContrast: '#fff6f4',
      border: '#e6ccc5',
      borderStrong: '#d9b2a9',
      heroStart: '#f4ad8d',
      heroMid: '#f5d4be',
      heroEnd: '#fff8f5',
      glow: '#f2b2a1',
      success: '#278c68',
      warning: '#cf8d43',
      danger: '#b45350',
    },
  },
  olive: {
    id: 'olive',
    name: 'Oliva',
    shortName: 'Oliva',
    description: 'Sage contemplativo e sereno.',
    family: 'light',
    colors: {
      background: '#f3f2ea',
      backgroundAlt: '#e8e7da',
      surface: '#fbfbf6',
      surfaceStrong: '#ecebdd',
      text: '#1c2018',
      textMuted: '#55604d',
      textSubtle: '#7a8470',
      accent: '#6a7b52',
      accentStrong: '#51603d',
      accentContrast: '#f6f8f1',
      border: '#cfd5c1',
      borderStrong: '#bcc4aa',
      heroStart: '#9ba87b',
      heroMid: '#dde2ca',
      heroEnd: '#f8f9f2',
      glow: '#b6c09c',
      success: '#2d8c5f',
      warning: '#b7852e',
      danger: '#aa4d45',
    },
  },
  sky: {
    id: 'sky',
    name: 'Céu',
    shortName: 'Céu',
    description: 'Claro, fresco e inspirador.',
    family: 'light',
    colors: {
      background: '#f2f7fb',
      backgroundAlt: '#e6eef6',
      surface: '#fbfdff',
      surfaceStrong: '#e9f0f7',
      text: '#172230',
      textMuted: '#526375',
      textSubtle: '#7b8ea4',
      accent: '#4d7ea8',
      accentStrong: '#335d82',
      accentContrast: '#f4f9ff',
      border: '#c9d7e4',
      borderStrong: '#b6c7d8',
      heroStart: '#8bb7db',
      heroMid: '#d8ebf6',
      heroEnd: '#f8fcff',
      glow: '#9dc6e6',
      success: '#27806a',
      warning: '#c78b37',
      danger: '#a94d4d',
    },
  },
  sand: {
    id: 'sand',
    name: 'Areia',
    shortName: 'Areia',
    description: 'Quente, tátil e acolhedor.',
    family: 'light',
    colors: {
      background: '#f8f1e6',
      backgroundAlt: '#f1e4d1',
      surface: '#fffaf1',
      surfaceStrong: '#f3e7d4',
      text: '#251b14',
      textMuted: '#645547',
      textSubtle: '#907b69',
      accent: '#b27d4f',
      accentStrong: '#8a5d37',
      accentContrast: '#fff8f0',
      border: '#e0ccb5',
      borderStrong: '#d2b69a',
      heroStart: '#d7a56f',
      heroMid: '#efd7b5',
      heroEnd: '#fffaf1',
      glow: '#e1bf91',
      success: '#2f8a65',
      warning: '#c78633',
      danger: '#af524c',
    },
  },
  rose: {
    id: 'rose',
    name: 'Rosé',
    shortName: 'Rosé',
    description: 'Elegante, delicado e premium.',
    family: 'light',
    colors: {
      background: '#faf1f1',
      backgroundAlt: '#f4e4e5',
      surface: '#fff9f9',
      surfaceStrong: '#f6e8e8',
      text: '#24181a',
      textMuted: '#6f5258',
      textSubtle: '#96757b',
      accent: '#b76b7b',
      accentStrong: '#8f4c5d',
      accentContrast: '#fff7f8',
      border: '#e5cbd0',
      borderStrong: '#d7b0b8',
      heroStart: '#e3a0ab',
      heroMid: '#f2d0d4',
      heroEnd: '#fff9fa',
      glow: '#e3b7bf',
      success: '#2b8f68',
      warning: '#c78933',
      danger: '#b74b57',
    },
  },
  forest: {
    id: 'forest',
    name: 'Bosque',
    shortName: 'Bosque',
    description: 'Verde profundo e meditativo.',
    family: 'dark',
    colors: {
      background: '#111917',
      backgroundAlt: '#16221f',
      surface: '#182522',
      surfaceStrong: '#20312c',
      text: '#edf2ed',
      textMuted: '#bac9bf',
      textSubtle: '#86a091',
      accent: '#6ca27a',
      accentStrong: '#8cc69b',
      accentContrast: '#0e1512',
      border: '#274036',
      borderStrong: '#355247',
      heroStart: '#2f5e4c',
      heroMid: '#193028',
      heroEnd: '#101715',
      glow: '#4f8e68',
      success: '#6dc491',
      warning: '#d9a14c',
      danger: '#d16f70',
    },
  },
  navy: {
    id: 'navy',
    name: 'Marinho',
    shortName: 'Marinho',
    description: 'Azul litúrgico e sofisticado.',
    family: 'dark',
    colors: {
      background: '#0d1521',
      backgroundAlt: '#132035',
      surface: '#162438',
      surfaceStrong: '#1e2f47',
      text: '#eef4fb',
      textMuted: '#bfd0e1',
      textSubtle: '#89a4c2',
      accent: '#6c91c2',
      accentStrong: '#8bb4ea',
      accentContrast: '#0d1624',
      border: '#233754',
      borderStrong: '#30496c',
      heroStart: '#35567b',
      heroMid: '#1a2a40',
      heroEnd: '#0c1320',
      glow: '#4d76a8',
      success: '#58b6a0',
      warning: '#daa052',
      danger: '#d96b6b',
    },
  },
  graphite: {
    id: 'graphite',
    name: 'Grafite',
    shortName: 'Grafite',
    description: 'Cinza mineral e moderno.',
    family: 'dark',
    colors: {
      background: '#141414',
      backgroundAlt: '#1b1d1f',
      surface: '#1d2022',
      surfaceStrong: '#262a2d',
      text: '#f2f1ee',
      textMuted: '#c4c2bd',
      textSubtle: '#8c918f',
      accent: '#a28566',
      accentStrong: '#d0b08f',
      accentContrast: '#161413',
      border: '#323638',
      borderStrong: '#454a4d',
      heroStart: '#5b5248',
      heroMid: '#232425',
      heroEnd: '#121212',
      glow: '#7f6a53',
      success: '#66b38f',
      warning: '#d89e4f',
      danger: '#d16d67',
    },
  },
  night: {
    id: 'night',
    name: 'Vigília',
    shortName: 'Vigília',
    description: 'Escuro profundo para leitura longa.',
    family: 'dark',
    colors: {
      background: '#0a0d14',
      backgroundAlt: '#101621',
      surface: '#121a28',
      surfaceStrong: '#182236',
      text: '#eef2fb',
      textMuted: '#bbc7dd',
      textSubtle: '#7f93b3',
      accent: '#7e90c8',
      accentStrong: '#aab6eb',
      accentContrast: '#0a1019',
      border: '#1f2b43',
      borderStrong: '#2d3c5d',
      heroStart: '#2b3d63',
      heroMid: '#121c2d',
      heroEnd: '#090d14',
      glow: '#5b71b5',
      success: '#60c1a0',
      warning: '#d9a353',
      danger: '#d96b78',
    },
  },
  eclipse: {
    id: 'eclipse',
    name: 'Eclipse',
    shortName: 'Eclipse',
    description: 'AMOLED premium com brilho controlado.',
    family: 'dark',
    colors: {
      background: '#000000',
      backgroundAlt: '#050505',
      surface: '#090909',
      surfaceStrong: '#121212',
      text: '#f5f5f4',
      textMuted: '#c9c9c4',
      textSubtle: '#8f908b',
      accent: '#c2a36f',
      accentStrong: '#e5c58c',
      accentContrast: '#090705',
      border: '#1d1d1c',
      borderStrong: '#2a2a28',
      heroStart: '#4b3720',
      heroMid: '#12100c',
      heroEnd: '#000000',
      glow: '#8a6841',
      success: '#65c395',
      warning: '#d8a04f',
      danger: '#d47069',
    },
  },
  sepia: {
    id: 'sepia',
    name: 'Pergaminho',
    shortName: 'Pergaminho',
    description: 'Clássico bíblico em tom envelhecido.',
    family: 'light',
    colors: {
      background: '#f1e5cf',
      backgroundAlt: '#e8d8bb',
      surface: '#f8f0df',
      surfaceStrong: '#ead8b7',
      text: '#433422',
      textMuted: '#6f5a45',
      textSubtle: '#9b846b',
      accent: '#8c6d46',
      accentStrong: '#6f5435',
      accentContrast: '#fdf7eb',
      border: '#d5c0a0',
      borderStrong: '#c2aa89',
      heroStart: '#c89b62',
      heroMid: '#ead8ba',
      heroEnd: '#f9f3e7',
      glow: '#d7b07a',
      success: '#2d8d66',
      warning: '#c5872f',
      danger: '#b25549',
    },
  },
};

export const THEME_OPTIONS = Object.values(THEME_PRESETS);
export const THEME_CLASSNAMES = THEME_OPTIONS.map((theme) => theme.id);

export const getThemePreset = (mode: ThemeMode) => THEME_PRESETS[mode] ?? THEME_PRESETS[DEFAULT_THEME_MODE];

export const normalizeThemeMode = (mode: string | undefined): ThemeMode => {
  if (!mode) return DEFAULT_THEME_MODE;

  const legacyMap: Record<string, ThemeMode> = {
    light: 'linen',
    dark: 'night',
    black: 'eclipse',
    sepia: 'sepia',
  };

  return THEME_PRESETS[mode as ThemeMode] ? (mode as ThemeMode) : (legacyMap[mode] ?? DEFAULT_THEME_MODE);
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const step = normalized.length === 3 ? 1 : 2;
  const values = normalized.length === 3
    ? normalized.split('').map((value) => parseInt(value + value, 16))
    : [normalized.slice(0, 2), normalized.slice(2, 4), normalized.slice(4, 6)].map((value) => parseInt(value, 16));

  if (values.some((value) => Number.isNaN(value))) {
    return '138, 107, 67';
  }

  return values.join(', ');
};

export const getThemeVariables = (config: ThemeConfig): Record<string, string> => {
  const preset = getThemePreset(config.mode);
  const accent = config.accentColor || preset.colors.accent;

  return {
    '--bg-bible': preset.colors.background,
    '--bg-bible-alt': preset.colors.backgroundAlt,
    '--surface-bible': preset.colors.surface,
    '--surface-bible-strong': preset.colors.surfaceStrong,
    '--text-bible': preset.colors.text,
    '--text-bible-muted': preset.colors.textMuted,
    '--text-bible-subtle': preset.colors.textSubtle,
    '--accent-bible': accent,
    '--accent-bible-strong': preset.colors.accentStrong,
    '--accent-bible-contrast': preset.colors.accentContrast,
    '--accent-bible-rgb': hexToRgb(accent),
    '--border-bible': preset.colors.border,
    '--border-bible-strong': preset.colors.borderStrong,
    '--hero-start': preset.colors.heroStart,
    '--hero-mid': preset.colors.heroMid,
    '--hero-end': preset.colors.heroEnd,
    '--glow-bible': preset.colors.glow,
    '--success-bible': preset.colors.success,
    '--warning-bible': preset.colors.warning,
    '--danger-bible': preset.colors.danger,
    '--font-bible-family': config.fontFamily === 'Untitled Serif' ? '"Libre Baskerville", serif' : config.fontFamily,
    '--font-bible-size': `${config.fontSize}px`,
    '--font-bible-line-height': config.lineHeight.toString(),
    '--font-bible-letter-spacing': `${config.letterSpacing}em`,
    '--horizontal-margin': `${config.horizontalMargin}px`,
  };
};
