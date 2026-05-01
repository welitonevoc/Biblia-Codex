import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2, Edit3, Pin } from 'lucide-react';
import { Note } from '../types';
import { storage } from '../StorageService';
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
      <header className="p-4 border-b border-[var(--border-bible)] flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-bible)]">Minhas Notas</h1>
        <button
          onClick={handleCreateNote}
          className="p-2 bg-[var(--accent-bible)] text-white rounded-full hover:bg-[var(--accent-bible-strong)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-bible-muted)]" />
          <input
            type="text"
            placeholder="Pesquisar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-1)] border border-[var(--border-bible)] rounded-lg text-[var(--text-bible)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <motion.div
            key={note.id}
            layout
            className="p-4 bg-[var(--surface-1)] border border-[var(--border-bible)] rounded-xl hover:shadow-lg transition-shadow cursor-pointer relative group"
            onClick={() => handleEditNote(note)}
          >
            {note.pinned && <Pin className="absolute top-2 right-2 w-4 h-4 text-[var(--accent-bible)]" />}
            <h3 className="font-bold text-[var(--text-bible)] mb-2 truncate">{note.title || 'Sem título'}</h3>
            <p className="text-sm text-[var(--text-bible-muted)] line-clamp-3 mb-4">{note.content.replace(/<[^>]*>/g, '')}</p>
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-1 text-[var(--text-bible-muted)] hover:bg-[var(--surface-2)] rounded">
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
