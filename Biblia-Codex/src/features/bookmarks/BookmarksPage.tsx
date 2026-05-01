import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, ChevronRight, Search, Filter, Plus, Trash2, 
  Pencil, X, Check, Calendar, BookOpen, ChevronLeft,
  Clock, Star, Heart, Sparkles, Palette
} from 'lucide-react';
import { storage } from '../StorageService';
import { Bookmark as BookmarkType, Tag as TagType } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface BookmarksPageProps {
  onNavigate?: (bookId: string, chapter: number, verse?: number) => void;
  onBack?: () => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onNavigate, onBack }) => {
  const { settings } = useAppContext();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'book' | 'color'>('recent');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [bData, tData] = await Promise.all([
      storage.getBookmarks(),
      storage.getTags()
    ]);
    setBookmarks(bData);
    setTags(tData);
    setLoading(false);
  };

  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (searchQuery) {
      filtered = filtered.filter(b => b.text?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedTagFilter) {
      filtered = filtered.filter(b => b.tags?.includes(selectedTagFilter));
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'book':
        filtered.sort((a, b) => {
          const bookA = BIBLE_BOOKS.findIndex(bk => bk.id === a.bookId);
          const bookB = BIBLE_BOOKS.findIndex(bk => bk.id === b.bookId);
          return bookA - bookB || a.chapter - b.chapter || a.verse - b.verse;
        });
        break;
      case 'color':
        filtered.sort((a, b) => (a.color || '').localeCompare(b.color || ''));
        break;
    }

    return filtered;
  }, [bookmarks, searchQuery, selectedTagFilter, sortBy]);

  const handleDeleteBookmark = async (id: string) => {
    if (!window.confirm('Excluir este marcador?')) return;
    await storage.deleteBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const openEditModal = (bm: BookmarkType) => {
    setSelectedBookmark(bm);
    setEditTags(bm.tags || []);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!selectedBookmark) return;
    const updated = { ...selectedBookmark, tags: editTags };
    await storage.saveBookmark(updated);
    setBookmarks(prev => prev.map(b => b.id === selectedBookmark.id ? updated : b));
    setShowEditModal(false);
    setSelectedBookmark(null);
  };

  const getBookName = (bookId: string) => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    return book ? book.name : bookId;
  };

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  const groupedByBook = useMemo(() => {
    const groups: Record<string, BookmarkType[]> = {};
    filteredBookmarks.forEach(bm => {
      if (!groups[bm.bookId]) groups[bm.bookId] = [];
      groups[bm.bookId].push(bm);
    });
    return groups;
  }, [filteredBookmarks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-bible)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <AnimatePresence>
        {showEditModal && selectedBookmark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[var(--surface-1)] p-4 shadow-xl sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--text-bible)]">Editar Marcador</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="grid h-11 w-11 place-items-center rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                  aria-label="Fechar edição de marcador"
                >
                  <X className="w-5 h-5 text-[var(--text-bible-muted)]" />
                </button>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-[var(--surface-2)]">
                <div className="text-sm font-medium text-[var(--text-bible)]">
                  {getBookName(selectedBookmark.bookId)} {selectedBookmark.chapter}:{selectedBookmark.verse}
                </div>
                <div className="text-sm text-[var(--text-bible-muted)] mt-1 line-clamp-3">
                  {selectedBookmark.text}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-[var(--text-bible-muted)] mb-2 block">
                  Cor do marcador
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedBookmark({ ...selectedBookmark, color })}
                      className={cn(
                        "h-11 w-11 rounded-full transition-transform",
                        selectedBookmark.color === color && "scale-110 ring-2 ring-offset-2 ring-[var(--text-bible)]"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-[var(--text-bible-muted)] mb-2 block">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setEditTags(prev => 
                          prev.includes(tag.id) 
                            ? prev.filter(t => t !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                      className={cn(
                        "min-h-10 px-3 py-1 rounded-full text-sm transition-all",
                        editTags.includes(tag.id)
                          ? "bg-[var(--accent-bible)] text-white"
                          : "bg-[var(--surface-2)] text-[var(--text-bible-muted)]"
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveEdit}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold",
                  "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]",
                  "shadow-lg hover:opacity-90 transition-opacity"
                )}
              >
                Salvar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--text-bible)]" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-bible)]" style={{ fontFamily: 'var(--font-display)' }}>
              Marcadores
            </h1>
            <p className="text-sm text-[var(--text-bible-muted)]">
              {bookmarks.length} marcadores salvos
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-bible-muted)]" />
            <input
              type="text"
              placeholder="Buscar marcadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl",
                "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                "text-[var(--text-bible)] placeholder:text-[var(--text-bible-muted)]",
                "focus:outline-none focus:border-[var(--accent-bible)]"
              )}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedTagFilter(null)}
              className={cn(
                "min-h-11 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedTagFilter === null
                  ? "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]"
                  : "bg-[var(--surface-1)] text-[var(--text-bible-muted)]"
              )}
            >
              Todos
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagFilter(tag.id)}
                className={cn(
                  "min-h-11 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedTagFilter === tag.id
                    ? "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]"
                    : "bg-[var(--surface-1)] text-[var(--text-bible-muted)]"
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'recent', label: 'Recentes', icon: Clock },
              { id: 'book', label: 'Por Livro', icon: BookOpen },
              { id: 'color', label: 'Por Cor', icon: Palette },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={cn(
                  "min-h-11 shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  sortBy === s.id
                    ? "bg-[var(--accent-bible)]/20 text-[var(--accent-bible)]"
                    : "bg-[var(--surface-1)] text-[var(--text-bible-muted)]"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 mx-auto mb-3 text-[var(--text-bible-muted)] opacity-50" />
            <p className="text-[var(--text-bible-muted)]">Nenhum marcador encontrado</p>
            <p className="text-sm text-[var(--text-bible-subtle)] mt-1">
              Comece a marcar versículos enquanto lê a Bíblia
            </p>
          </div>
        ) : sortBy === 'book' ? (
          <div className="space-y-4">
            {Object.entries(groupedByBook).map(([bookId, bms]) => (
              <div key={bookId} className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider sticky top-0 bg-[var(--surface-0)] py-2">
                  {getBookName(bookId)}
                </h3>
                {bms.map(bm => (
                  <BookmarkCard
                    key={bm.id}
                    bookmark={bm}
                    onClick={() => onNavigate?.(bm.bookId, bm.chapter, bm.verse)}
                    onEdit={() => openEditModal(bm)}
                    onDelete={() => handleDeleteBookmark(bm.id)}
                    tags={tags.filter(t => bm.tags?.includes(t.id))}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBookmarks.map(bm => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                onClick={() => onNavigate?.(bm.bookId, bm.chapter, bm.verse)}
                onEdit={() => openEditModal(bm)}
                onDelete={() => handleDeleteBookmark(bm.id)}
                tags={tags.filter(t => bm.tags?.includes(t.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface BookmarkCardProps {
  bookmark: BookmarkType;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  tags: TagType[];
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onClick, onEdit, onDelete, tags }) => {
  const getBookName = (bookId: string) => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    return book ? book.name : bookId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-[var(--surface-1)] border border-[var(--border-bible)]",
        "hover:border-[var(--accent-bible)]/30 transition-all"
      )}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: bookmark.color || '#8b5cf6' }}
      />
      <div
        onClick={onClick}
        className={cn(
          "w-full text-left p-4 pl-5 cursor-pointer"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-[var(--accent-bible)]">
                {getBookName(bookmark.bookId)} {bookmark.chapter}:{bookmark.verse}
              </span>
              {bookmark.createdAt && (
                <span className="text-xs text-[var(--text-bible-subtle)]">
                  {new Date(bookmark.createdAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-bible)] line-clamp-2">
              {bookmark.text}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: tag.background, color: tag.textColor }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Bookmark className="w-5 h-5 flex-shrink-0" style={{ color: bookmark.color || '#8b5cf6' }} />
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-3 pt-0">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex min-h-10 items-center gap-1 rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-bible-muted)]"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex min-h-10 items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </button>
      </div>
    </motion.div>
  );
};

export default BookmarksPage;
