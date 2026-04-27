import { describe, expect, it } from 'vitest';
import { settingsReducer, initialSettingsState } from '../../app/context/settings-context';

describe('Settings Reducer', () => {
  it('should set theme', () => {
    const state = settingsReducer(initialSettingsState, { type: 'SET_THEME' as const, payload: 'dark' });
    expect(state.theme).toBe('dark');
  });

  it('should set language', () => {
    const state = settingsReducer(initialSettingsState, { type: 'SET_LANGUAGE' as const, payload: 'en' });
    expect(state.language).toBe('en');
  });

  it('should set font size', () => {
    const state = settingsReducer(initialSettingsState, { type: 'SET_FONT_SIZE' as const, payload: 18 });
    expect(state.fontSize).toBe(18);
  });

  it('should toggle tts', () => {
    const state = settingsReducer(initialSettingsState, { type: 'TOGGLE_TTS' as const });
    expect(state.ttsEnabled).toBe(false);
    
    const state2 = settingsReducer(state, { type: 'TOGGLE_TTS' as const });
    expect(state2.ttsEnabled).toBe(true);
  });

  it('should toggle audio', () => {
    const state = settingsReducer(initialSettingsState, { type: 'TOGGLE_AUDIO' as const });
    expect(state.audioEnabled).toBe(false);
  });

  it('should toggle annotations', () => {
    const state = settingsReducer(initialSettingsState, { type: 'TOGGLE_ANNOTATIONS' as const });
    expect(state.showAnnotations).toBe(false);
  });
});