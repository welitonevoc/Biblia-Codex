import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initialBibleState, bibleReducer, BibleState, BibleAction } from './bible-context';
import { initialSettingsState, settingsReducer, SettingsState, SettingsAction } from './settings-context';

// Combined App State
export type AppState = {
  bible: BibleState;
  settings: SettingsState;
};

export type AppAction = 
  | { type: 'BIBLE_ACTION'; payload: BibleAction }
  | { type: 'SETTINGS_ACTION'; payload: SettingsAction };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'BIBLE_ACTION':
      return {
        ...state,
        bible: bibleReducer(state.bible, action.payload),
      };
    case 'SETTINGS_ACTION':
      return {
        ...state,
        settings: settingsReducer(state.settings, action.payload),
      };
    default:
      return state;
  }
}

// Contexts
export const AppStateContext = createContext<AppState | undefined>(undefined);
export const AppDispatchContext = createContext<React.Dispatch<AppAction> | undefined>(undefined);

// Provider Component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    bible: initialBibleState,
    settings: initialSettingsState,
  });

  useEffect(() => {
    // Persist state to localStorage
    const saved = localStorage.getItem('biblia-codex-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'BIBLE_ACTION', payload: { type: 'SET_BOOK', payload: parsed.bible.currentBook } as any });
      } catch (err) {
        console.error('Failed to load saved state:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Save state changes to localStorage
    localStorage.setItem('biblia-codex-state', JSON.stringify(state));
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom Hooks for easy access
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

// Feature-specific hooks for convenience
export function useBibleState() {
  const { bible } = useAppState();
  return bible;
}

export function useBibleDispatch() {
  const dispatch = useAppDispatch();
  return (action: BibleAction) => dispatch({ type: 'BIBLE_ACTION', payload: action });
}

export function useSettingsState() {
  const { settings } = useAppState();
  return settings;
}

export function useSettingsDispatch() {
  const dispatch = useAppDispatch();
  return (action: SettingsAction) => dispatch({ type: 'SETTINGS_ACTION', payload: action });
}