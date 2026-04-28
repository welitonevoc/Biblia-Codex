import { useState, useMemo, useCallback } from 'react';
import { Verse, Book, Bookmark as BookmarkType, Tag as TagType } from '../types';
import { storage } from '../StorageService';
import { TagService } from '../services/TagService';

export interface UseReaderSelectionProps {
  book: Book;
  chapter: number;
  verses: Verse[];
  bookmarks: BookmarkType[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkType[]>>;
  onStudyOpen: (selectedVerses: { verse: number, text: string }[]) => void;
  setAllTags: React.Dispatch<React.SetStateAction<TagType[]>>;
}

export const useReaderSelection = ({
  book,
  chapter,
  verses,
  bookmarks,
  setBookmarks,
  onStudyOpen,
  setAllTags
}: UseReaderSelectionProps) => {
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [currentTags, setCurrentTags] = useState<string>('');

  const bookmarkMap = useMemo(() => {
    const map: Record<number, BookmarkType> = {};
    bookmarks.forEach(b => {
      if (b.bookId === book.id && b.chapter === chapter) {
        map[b.verse] = b;
      }
    });
    return map;
  }, [bookmarks, book.id, chapter]);

  const toggleVerseSelection = useCallback((verseNum: number) => {
    setSelectedVerses(prev => {
      const newSelected = prev.includes(verseNum)
        ? prev.filter(v => v !== verseNum)
        : [...prev, verseNum];
      console.log('toggleVerseSelection result:', prev, '->', newSelected);
      return newSelected;
    });
  }, []);

  const handleStudy = useCallback(() => {
    console.log('handleStudy called, selectedVerses:', selectedVerses);
    const selected = verses
      .filter(v => selectedVerses.includes(v.verse))
      .map(v => ({ verse: v.verse, text: v.text }));
    console.log('handleStudy selected:', selected);
    onStudyOpen(selected);
  }, [verses, selectedVerses, onStudyOpen]);

  const handleBookmark = useCallback(async (color: string | null) => {
    if (selectedVerses.length === 0) return;

    const updatedBookmarks: BookmarkType[] = [];
    const newBookmarks: BookmarkType[] = [];

    for (const vNum of selectedVerses) {
      const existing = bookmarkMap[vNum];
      const verse = verses.find(v => v.verse === vNum);

      if (existing) {
        const updated = { ...existing, color: color || undefined };
        await storage.saveBookmark(updated);
        updatedBookmarks.push(updated);
      } else if (color) {
        const newItem: BookmarkType = {
          id: `${book.id}-${chapter}-${vNum}-${Date.now()}`,
          bookId: book.id,
          chapter,
          verse: vNum,
          text: verse?.text || '',
          color,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await storage.saveBookmark(newItem);
        newBookmarks.push(newItem);
      }
    }

    setBookmarks(prev => {
      const filtered = prev.filter(b => !updatedBookmarks.some(ub => ub.id === b.id));
      return [...filtered, ...updatedBookmarks, ...newBookmarks];
    });

    setSelectedVerses([]);
    setShowColorPicker(false);
  }, [selectedVerses, bookmarkMap, verses, book.id, chapter, setBookmarks]);

  const handleDeleteBookmarks = useCallback(async () => {
    if (selectedVerses.length === 0) return;
    for (const vNum of selectedVerses) {
      const existing = bookmarkMap[vNum];
      if (existing) {
        await storage.deleteBookmark(existing.id);
      }
    }
    setBookmarks(prev => prev.filter(b => {
      if (b.bookId !== book.id || b.chapter !== chapter) return true;
      return !selectedVerses.includes(b.verse);
    }));
    setSelectedVerses([]);
  }, [selectedVerses, bookmarkMap, book.id, chapter, setBookmarks]);

  const handleRemoveTag = useCallback(async (bookmarkId: string, tagId: string) => {
    const bm = bookmarks.find(b => b.id === bookmarkId);
    if (!bm) return;
    const updated = { ...bm, tags: bm.tags.filter(t => t !== tagId) };
    await storage.saveBookmark(updated);
    setBookmarks(prev => prev.map(b => b.id === bookmarkId ? updated : b));
  }, [bookmarks, setBookmarks]);

  const handleSaveTags = useCallback(async () => {
    if (selectedVerses.length === 0) return;
    const tagNames = currentTags.split(',').map(t => t.trim()).filter(Boolean);
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const tag = await TagService.createTag(name);
      tagIds.push(tag.id);
    }

    const updatedBookmarks: BookmarkType[] = [];
    const newBookmarks: BookmarkType[] = [];

    for (const vNum of selectedVerses) {
      const verse = verses.find(v => v.verse === vNum);
      const existing = bookmarkMap[vNum];

      if (existing) {
        const updated = { ...existing, tags: Array.from(new Set([...existing.tags, ...tagIds])) };
        await storage.saveBookmark(updated);
        updatedBookmarks.push(updated);
      } else {
        const newItem: BookmarkType = {
          id: `${book.id}-${chapter}-${vNum}-${Date.now()}`,
          bookId: book.id,
          chapter,
          verse: vNum,
          text: verse?.text || '',
          tags: tagIds,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await storage.saveBookmark(newItem);
        newBookmarks.push(newItem);
      }
    }

    setBookmarks(prev => {
      const filtered = prev.filter(b => !updatedBookmarks.some(ub => ub.id === b.id));
      return [...filtered, ...updatedBookmarks, ...newBookmarks];
    });

    const freshTags = await storage.getTags();
    setAllTags(freshTags);
    setCurrentTags('');
    setShowTagEditor(false);
    setSelectedVerses([]);
  }, [selectedVerses, currentTags, verses, bookmarkMap, book.id, chapter, setBookmarks, setAllTags]);

  return {
    selectedVerses,
    setSelectedVerses,
    showColorPicker,
    setShowColorPicker,
    showTagEditor,
    setShowTagEditor,
    currentTags,
    setCurrentTags,
    bookmarkMap,
    toggleVerseSelection,
    handleStudy,
    handleBookmark,
    handleDeleteBookmarks,
    handleRemoveTag,
    handleSaveTags
  };
};
