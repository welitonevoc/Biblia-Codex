import { useState, useCallback } from 'react';
import { Book } from '../../types';
import { BIBLE_BOOKS } from '../../data';

export function useReaderState() {
  const [currentBook, setCurrentBook] = useState<Book>(BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [targetVerse, setTargetVerse] = useState<number | undefined>(undefined);

  const handleSelect = useCallback((book: Book, chapter: number, verse?: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setTargetVerse(verse);
  }, []);

  const navigateTo = useCallback((bookId: string, chapter: number, verse?: number) => {
    const book = BIBLE_BOOKS.find((b) => b.id === bookId);
    if (book) {
      handleSelect(book, chapter, verse);
    }
  }, [handleSelect]);

  return {
    currentBook,
    currentChapter,
    targetVerse,
    setTargetVerse,
    handleSelect,
    navigateTo,
  };
}
