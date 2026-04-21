import { create } from 'zustand';
import { storage } from '../StorageService';
import { Bookmark, Note } from '../types';

interface NotesState {
  bookmarks: Bookmark[];
  notes: Note[];
  selectedBookmark: Bookmark | null;
  selectedNote: Note | null;
  isLoading: boolean;
  loadBookmarks: () => Promise<void>;
  loadNotes: () => Promise<void>;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  updateBookmark: (bookmark: Bookmark) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectBookmark: (bookmark: Bookmark | null) => void;
  selectNote: (note: Note | null) => void;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  bookmarks: [],
  notes: [],
  selectedBookmark: null,
  selectedNote: null,
  isLoading: false,

  loadBookmarks: async () => {
    set({ isLoading: true });
    try {
      const bookmarks = await storage.getBookmarks();
      set({ bookmarks, isLoading: false });
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      set({ isLoading: false });
    }
  },

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await storage.getNotes();
      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  addBookmark: async (bookmarkData) => {
    const now = Date.now();
    const bookmark: Bookmark = {
      ...bookmarkData,
      id: `bm_${now}`,
      createdAt: now,
    };
    await storage.saveBookmark(bookmark);
    await get().loadBookmarks();
  },

  deleteBookmark: async (id) => {
    await storage.deleteBookmark(id);
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
      selectedBookmark: state.selectedBookmark?.id === id ? null : state.selectedBookmark,
    }));
  },

  updateBookmark: async (bookmark) => {
    await storage.saveBookmark(bookmark);
    await get().loadBookmarks();
  },

  addNote: async (noteData) => {
    const now = Date.now();
    const note: Note = {
      ...noteData,
      id: `note_${now}`,
      createdAt: now,
    };
    await storage.saveNote(note);
    await get().loadNotes();
  },

  deleteNote: async (id) => {
    await storage.deleteNote(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
    }));
  },

  selectBookmark: (selectedBookmark) => set({ selectedBookmark }),
  selectNote: (selectedNote) => set({ selectedNote }),
}));

// Selective selectors
export const useBookmarkCount = () => useNotesStore((s) => s.bookmarks.length);
export const useNoteCount = () => useNotesStore((s) => s.notes.length);