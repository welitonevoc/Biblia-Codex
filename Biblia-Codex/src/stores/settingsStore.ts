import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Contrast = 'normal' | 'high';

interface Gestures {
  swipeToNavigate: boolean;
  doubleTapToCopy: boolean;
  longPressToBookmark: boolean;
}

interface SettingsState {
  theme: Theme;
  contrast: Contrast;
  showRedLetters: boolean;
  showHeadings: boolean;
  showVerseNumbers: boolean;
  paragraphMode: boolean;
  nightModeSchedule: { start: string; end: string } | null;
  gestures: Gestures;
  language: string;
  setTheme: (theme: Theme) => void;
  setContrast: (contrast: Contrast) => void;
  toggleRedLetters: () => void;
  toggleHeadings: () => void;
  toggleVerseNumbers: () => void;
  toggleParagraphMode: () => void;
  setNightModeSchedule: (schedule: { start: string; end: string } | null) => void;
  updateGestures: (gestures: Partial<Gestures>) => void;
  setLanguage: (lang: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      contrast: 'normal',
      showRedLetters: true,
      showHeadings: true,
      showVerseNumbers: true,
      paragraphMode: true,
      nightModeSchedule: null,
      gestures: {
        swipeToNavigate: true,
        doubleTapToCopy: false,
        longPressToBookmark: true,
      },
      language: 'pt-BR',

      setTheme: (theme) => set({ theme }),
      setContrast: (contrast) => set({ contrast }),
      toggleRedLetters: () => set((s) => ({ showRedLetters: !s.showRedLetters })),
      toggleHeadings: () => set((s) => ({ showHeadings: !s.showHeadings })),
      toggleVerseNumbers: () => set((s) => ({ showVerseNumbers: !s.showVerseNumbers })),
      toggleParagraphMode: () => set((s) => ({ paragraphMode: !s.paragraphMode })),
      setNightModeSchedule: (nightModeSchedule) => set({ nightModeSchedule }),
      updateGestures: (gestures) =>
        set((s) => ({ gestures: { ...s.gestures, ...gestures } })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'biblia-settings-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Theme selector for efficient re-renders
export const useTheme = () => useSettingsStore((s) => s.theme);

// Display settings selector
export const useDisplaySettings = () => useSettingsStore((s) => ({
  showRedLetters: s.showRedLetters,
  showHeadings: s.showHeadings,
  showVerseNumbers: s.showVerseNumbers,
  paragraphMode: s.paragraphMode,
}));