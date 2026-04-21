import { create } from 'zustand';
import { notesRepo } from '../data/local/repository';
import { NoteEntity } from '../data/local/schema';

interface NotesState {
  notes: NoteEntity[];
  selectedNote: NoteEntity | null;
  isLoading: boolean;
  loadNotes: () => Promise<void>;
  createNote: (note: Omit<NoteEntity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (note: NoteEntity | null) => void;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  selectedNote: null,
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await notesRepo.getAll();
      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  createNote: async (noteData) => {
    const now = Date.now();
    const note: NoteEntity = {
      ...noteData,
      createdAt: now,
      updatedAt: now,
    };
    await notesRepo.add(note);
    await get().loadNotes();
  },

  updateNote: async (id, content) => {
    await notesRepo.update(id, { content, updatedAt: Date.now() });
    await get().loadNotes();
  },

  deleteNote: async (id) => {
    await notesRepo.delete(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
    }));
  },

  selectNote: (note) => set({ selectedNote: note }),
}));