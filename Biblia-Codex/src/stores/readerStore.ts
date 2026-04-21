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
  scrollPosition: number;
  setCurrentModule: (module: string | null) => void;
  setCurrentLocation: (book: number, chapter: number, verse?: number) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setLineHeight: (height: number) => void;
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
      scrollPosition: 0,

      setCurrentModule: (module) => set({ currentModule: module }),

      setCurrentLocation: (book, chapter, verse = null) =>
        set({
          currentBook: book,
          currentChapter: chapter,
          currentVerse: verse,
          scrollPosition: 0,
        }),

      setFontSize: (fontSize) => set({ fontSize }),

      setFontFamily: (fontFamily) => set({ fontFamily }),

      setLineHeight: (lineHeight) => set({ lineHeight }),

      setScrollPosition: (scrollPosition) => set({ scrollPosition }),
    }),
    {
      name: 'biblia-reader-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);