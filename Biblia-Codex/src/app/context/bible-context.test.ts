import { describe, expect, it } from 'vitest';
import { bibleReducer, initialBibleState } from './bible-context';
import { Verse } from '../../types';

describe('Bible Reducer', () => {
  it('should set book and reset chapter', () => {
    const book = { id: 'GEN', name: 'Gênesis', chapters: 50, testament: 'OT' as const, numericId: 1 };
    const action = { type: 'SET_BOOK' as const, payload: book };
    const state = bibleReducer(initialBibleState, action);
    
    expect(state.currentBook).toEqual(book);
    expect(state.currentChapter).toBe(1);
  });

  it('should set chapter', () => {
    const action = { type: 'SET_CHAPTER' as const, payload: 5 };
    const state = bibleReducer(initialBibleState, action);
    
    expect(state.currentChapter).toBe(5);
  });

  it('should select verse', () => {
    const verse: Verse = { bookId: 'GEN', chapter: 1, verse: 1, text: 'No princípio' };
    const action = { type: 'SELECT_VERSE' as const, payload: verse };
    const state = bibleReducer(initialBibleState, action);
    
    expect(state.selectedVerses).toHaveLength(1);
    expect(state.selectedVerses[0]).toEqual(verse);
  });

  it('should not add duplicate verse', () => {
    const verse: Verse = { bookId: 'GEN', chapter: 1, verse: 1, text: 'No princípio' };
    const stateWithVerse = bibleReducer(initialBibleState, { type: 'SELECT_VERSE' as const, payload: verse });
    const state = bibleReducer(stateWithVerse, { type: 'SELECT_VERSE' as const, payload: verse });
    
    expect(state.selectedVerses).toHaveLength(1);
  });

  it('should deselect verse', () => {
    const verse: Verse = { bookId: 'GEN', chapter: 1, verse: 1, text: 'No princípio' };
    const stateWithVerse = bibleReducer(initialBibleState, { type: 'SELECT_VERSE' as const, payload: verse });
    const state = bibleReducer(stateWithVerse, { type: 'DESELECT_VERSE' as const, payload: verse });
    
    expect(state.selectedVerses).toHaveLength(0);
  });

  it('should set reading mode', () => {
    const state = bibleReducer(initialBibleState, { type: 'SET_READING_MODE' as const, payload: 'audio' });
    
    expect(state.readingMode).toBe('audio');
  });
});
