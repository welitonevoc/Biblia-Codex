import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ReaderState {
  currentModule: string | null;
  currentBook: number;
  currentChapter: number;
  currentVerse: number | null;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'justify';
  scrollPosition: number;
  setCurrentModule: (module: string | null) => void;
  setCurrentLocation: (book: number, chapter: number, verse?: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setLineHeight: (height: number) => void;
  setFontWeight: (weight: 'normal' | 'bold') => void;
  setTextAlign: (align: 'left' | 'justify') => void;
  setScrollPosition: (position: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      currentModule: null,
      currentBook: 1,
      currentChapter: 1,
      currentVerse: null,
      fontSize: 18,
      fontFamily: 'system-ui',
      lineHeight: 1.6,
      fontWeight: 'normal',
      textAlign: 'justify',
      scrollPosition: 0,

      setCurrentModule: (currentModule) => set({ currentModule }),
      setCurrentLocation: (currentBook, currentChapter, currentVerse = null) =>
        set({ currentBook, currentChapter, currentVerse, scrollPosition: 0 }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setFontWeight: (fontWeight) => set({ fontWeight }),
      setTextAlign: (textAlign) => set({ textAlign }),
      setScrollPosition: (scrollPosition) => set({ scrollPosition }),
    }),
    {
      name: 'biblia-reader-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selective selectors to prevent unnecessary re-renders
export const useCurrentLocation = () => useReaderStore(
  (s) => ({ book: s.currentBook, chapter: s.currentChapter, verse: s.currentVerse })
);

export const useReaderSettings = () => useReaderStore(
  (s) => ({ fontSize: s.fontSize, fontFamily: s.fontFamily, lineHeight: s.lineHeight })
);