import { useState, useEffect, useCallback } from 'react';
import { Footnote, FootnoteType } from '../types';
import { footnoteService } from '../services/FootnoteService';
import { storage } from '../StorageService';
import { BIBLE_BOOKS } from '../data/bibleMetadata';

interface UseFootnotesOptions {
  bookId?: string;
  chapter?: number;
  autoLoad?: boolean;
}

interface UseFootnotesReturn {
  footnotes: Footnote[];
  loading: boolean;
  error: Error | null;
  loadFootnotes: (bookId: string, chapter: number) => Promise<void>;
  getFootnotesForVerse: (verse: number) => Footnote[];
  searchFootnotes: (query: string) => Promise<Footnote[]>;
  filterByType: (type: FootnoteType) => Footnote[];
  addFootnote: (footnote: Omit<Footnote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteFootnote: (id: string) => Promise<void>;
}

export function useFootnotes(options: UseFootnotesOptions = {}): UseFootnotesReturn {
  const { bookId, chapter, autoLoad = false } = options;
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (autoLoad && bookId && chapter) {
      loadFootnotes(bookId, chapter);
    }
  }, [autoLoad, bookId, chapter]);

  const getVerseCount = (bId: string, ch: number): number => {
    const book = BIBLE_BOOKS.find(b => b.id === bId);
    return book ? book.chapters : 150;
  };

  const loadFootnotes = useCallback(async (bId: string, ch: number) => {
    if (!bId || !ch) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const verses = getVerseCount(bId, ch);
      const allFootnotes: Footnote[] = [];
      
      for (let v = 1; v <= verses; v++) {
        const verseFootnotes = await footnoteService.getFootnotesForVerse(bId, ch, v);
        allFootnotes.push(...verseFootnotes);
      }
      
      setFootnotes(allFootnotes);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load footnotes'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getFootnotesForVerse = useCallback((verse: number): Footnote[] => {
    return footnotes.filter(f => f.verse === verse);
  }, [footnotes]);

  const searchFootnotes = useCallback(async (query: string): Promise<Footnote[]> => {
    if (!query.trim()) return [];
    return footnoteService.searchFootnotes(query);
  }, []);

  const filterByType = useCallback((type: FootnoteType): Footnote[] => {
    return footnotes.filter(f => f.type === type);
  }, [footnotes]);

  const addFootnote = useCallback(async (footnote: Omit<Footnote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFootnote: Footnote = {
      ...footnote,
      id: `footnote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await footnoteService.saveFootnotes([...footnotes, newFootnote]);
    setFootnotes(prev => [...prev, newFootnote]);
  }, [footnotes]);

  const deleteFootnote = useCallback(async (id: string) => {
    await storage.deleteFootnote(id);
    setFootnotes(prev => prev.filter(f => f.id !== id));
  }, []);

  return {
    footnotes,
    loading,
    error,
    loadFootnotes,
    getFootnotesForVerse,
    searchFootnotes,
    filterByType,
    addFootnote,
    deleteFootnote,
  };
}