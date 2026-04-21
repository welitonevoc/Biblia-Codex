import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface UseA11yOptions {
  defaultTheme?: ThemeMode;
  highContrast?: boolean;
}

export function useA11y({ defaultTheme = 'system', highContrast = false }: UseA11yOptions = {}) {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme((prev) => (prev === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : prev));

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme((prev) => (prev === 'system' ? (e.matches ? 'dark' : 'light') : prev));
    };

    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply high contrast when needed
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    prefersReducedMotion,
  };
}

// Live region for screen reader announcements
export function useLiveRegion() {
  const [message, setMessage] = useState<string | null>(null);

  const announce = useCallback((msg: string, priority = 'polite') => {
    setMessage(null);
    // Delay to ensure screen reader picks up the change
    setTimeout(() => setMessage(msg), 100);
  }, []);

  const clear = useCallback(() => setMessage(null), []);

  return { message, announce, clear };
}

// Focus indicator styles
export const focusStyles = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  highContrast: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
  subtle: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1',
};

// Skip link hook
export function useSkipLink(targetId: string) {
  const handleSkip = useCallback(() => {
    const target = document.getElementById(targetId);
    target?.focus();
    target?.scrollIntoView({ behavior: 'smooth' });
  }, [targetId]);

  return { handleSkip };
}