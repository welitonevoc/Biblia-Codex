// Bible-specific state
import { Book, Verse } from '../../types';

export type BibleState = {
  currentBook: Book | null;
  currentChapter: number;
  selectedVerses: Verse[];
  readingMode: 'audio' | 'text';
};

export type BibleAction =
  | { type: 'SET_BOOK'; payload: Book }
  | { type: 'SET_CHAPTER'; payload: number }
  | { type: 'SELECT_VERSE'; payload: Verse }
  | { type: 'DESELECT_VERSE'; payload: Verse }
  | { type: 'SET_READING_MODE'; payload: 'audio' | 'text' };

export const initialBibleState: BibleState = {
  currentBook: null,
  currentChapter: 1,
  selectedVerses: [],
  readingMode: 'text',
};

function verseKey(v: Verse): string {
  return `${v.bookId}-${v.chapter}-${v.verse}`;
}

export function bibleReducer(state: BibleState, action: BibleAction): BibleState {
  switch (action.type) {
    case 'SET_BOOK':
      return { ...state, currentBook: action.payload, currentChapter: 1 };
    case 'SET_CHAPTER':
      return { ...state, currentChapter: action.payload };
    case 'SELECT_VERSE':
      if (state.selectedVerses.find(v => verseKey(v) === verseKey(action.payload))) {
        return state;
      }
      return {
        ...state,
        selectedVerses: [...state.selectedVerses, action.payload].slice(-5),
      };
    case 'DESELECT_VERSE':
      return {
        ...state,
        selectedVerses: state.selectedVerses.filter(v => verseKey(v) !== verseKey(action.payload)),
      };
    case 'SET_READING_MODE':
      return { ...state, readingMode: action.payload };
    default:
      return state;
  }
}
