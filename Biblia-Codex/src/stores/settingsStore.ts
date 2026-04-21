import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Contrast = 'normal' | 'high';

interface SettingsState {
  theme: Theme;
  contrast: Contrast;
  showRedLetters: boolean;
  showHeadings: boolean;
  nightModeSchedule: { start: string; end: string } | null;
  gestures: {
    swipeToNavigate: boolean;
    doubleTapToCopy: boolean;
  };
  setTheme: (theme: Theme) => void;
  setContrast: (contrast: Contrast) => void;
  toggleRedLetters: () => void;
  toggleHeadings: () => void;
  setNightModeSchedule: (schedule: { start: string; end: string } | null) => void;
  updateGestures: (gestures: Partial<SettingsState['gestures']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      contrast: 'normal',
      showRedLetters: true,
      showHeadings: true,
      nightModeSchedule: null,
      gestures: {
        swipeToNavigate: true,
        doubleTapToCopy: false,
      },

      setTheme: (theme) => set({ theme }),
      setContrast: (contrast) => set({ contrast }),
      toggleRedLetters: () => set((state) => ({ showRedLetters: !state.showRedLetters })),
      toggleHeadings: () => set((state) => ({ showHeadings: !state.showHeadings })),
      setNightModeSchedule: (nightModeSchedule) => set({ nightModeSchedule }),
      updateGestures: (gestures) =>
        set((state) => ({ gestures: { ...state.gestures, ...gestures } })),
    }),
    {
      name: 'biblia-settings-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);