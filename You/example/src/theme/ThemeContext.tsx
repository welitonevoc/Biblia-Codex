/**
 * Theme Context Provider
 * Phase 1: Foundation
 *
 * Provides theme tokens to the entire app via React Context.
 * Supports system theme detection and manual theme switching.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';

import type { ColorTokens, ThemeConfig } from './tokens';
import { darkColors, fonts, lightColors, typography } from './tokens';
import { defaultThemes } from './themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  colors: ColorTokens;
  isDark: boolean;
  setTheme: (theme: ThemeConfig) => void;
  toggleTheme: () => void;
  typography: typeof typography;
  fonts: typeof fonts;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeConfig;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(
    () =>
      initialTheme ??
      (systemColorScheme === 'dark'
        ? defaultThemes.dark
        : defaultThemes.light),
  );

  // Sync with system theme changes (if no explicit theme selected)
  useEffect(() => {
    if (!initialTheme) {
      const listener = Appearance.addChangeListener(({ colorScheme }) => {
        setActiveTheme(
          colorScheme === 'dark' ? defaultThemes.dark : defaultThemes.light,
        );
      });
      return () => listener.remove();
    }
  }, [initialTheme]);

  const setTheme = useCallback((theme: ThemeConfig) => {
    setActiveTheme(theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setActiveTheme((current) =>
      current.isDark ? defaultThemes.light : defaultThemes.dark,
    );
  }, []);

  const colors = activeTheme.isDark ? darkColors : lightColors;
  const resolvedColors: ColorTokens = activeTheme.colors ?? colors;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: activeTheme,
      colors: resolvedColors,
      isDark: activeTheme.isDark,
      setTheme,
      toggleTheme,
      typography,
      fonts,
    }),
    [activeTheme, resolvedColors, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
