// Settings-specific state
export type SettingsState = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: number;
  ttsEnabled: boolean;
  audioEnabled: boolean;
  showAnnotations: boolean;
};

export type SettingsAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'TOGGLE_TTS' }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'TOGGLE_ANNOTATIONS' };

export const initialSettingsState: SettingsState = {
  theme: 'system',
  language: 'pt-br',
  fontSize: 16,
  ttsEnabled: true,
  audioEnabled: true,
  showAnnotations: true,
};

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'TOGGLE_TTS':
      return { ...state, ttsEnabled: !state.ttsEnabled };
    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled };
    case 'TOGGLE_ANNOTATIONS':
      return { ...state, showAnnotations: !state.showAnnotations };
    default:
      return state;
  }
}