import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2, Edit3, Pin } from 'lucide-react';
import { Note } from '../../types';
import { storage } from '../../StorageService';
import { RichTextEditor } from './RichTextEditor';
import { useAppContext } from '../AppContext';
import { getThemePreset } from '../theme/presets';
import { NoteEditorModal } from './NoteEditorModal';
import { cn } from '../../utils/cn';

interface NotesProps { isActive?: boolean; }

export const Notes: React.FC<NotesProps> = ({ isActive = true }) => {
  const { config } = useAppContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const allNotes = await storage.getNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: '',
      content: '',
      tags: [],
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setEditingNote(newNote);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      await storage.deleteNote(id);
      loadNotes();
    }
  };

  const handleSaveNote = async (note: Note) => {
    await storage.saveNote(note);
    loadNotes();
    setIsModalOpen(false);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("h-full flex flex-col bg-[var(--bg-bible)]", !isActive && "hidden")}>
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border-bible)] p-3 sm:p-4">
        <h1 className="text-xl font-bold text-[var(--text-bible)]">Minhas Notas</h1>
        <button
          onClick={handleCreateNote}
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible-strong)] transition-colors"
          aria-label="Criar nota"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-bible-muted)]" />
          <input
            type="text"
            placeholder="Pesquisar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-[var(--border-bible)] bg-[var(--surface-1)] py-2 pl-10 pr-4 text-base text-[var(--text-bible)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)]"
          />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 pb-28 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-3">
        {filteredNotes.map(note => (
          <motion.div
            key={note.id}
            layout
            className="group relative cursor-pointer rounded-xl border border-[var(--border-bible)] bg-[var(--surface-1)] p-4 transition-shadow hover:shadow-lg"
            onClick={() => handleEditNote(note)}
          >
            {note.pinned && <Pin className="absolute top-2 right-2 w-4 h-4 text-[var(--accent-bible)]" />}
            <h3 className="font-bold text-[var(--text-bible)] mb-2 truncate">{note.title || 'Sem título'}</h3>
            <p className="text-sm text-[var(--text-bible-muted)] line-clamp-3 mb-4">{note.content.replace(/<[^>]*>/g, '')}</p>
            <div className="flex justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                className="grid h-10 w-10 place-items-center rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                aria-label="Excluir nota"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded text-[var(--text-bible-muted)] hover:bg-[var(--surface-2)]" aria-label="Editar nota">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <NoteEditorModal
          note={editingNote}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
};

export default Notes;
