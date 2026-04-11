import React, { useState } from 'react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Search, BookOpen, Sparkles, BookMarked } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (book: Book, chapter: number) => void;
  currentBook: Book;
  currentChapter: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentBook,
  currentChapter
}) => {
  const { settings } = useAppContext();
  const [step, setStep] = useState<'book' | 'chapter'>('book');
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT'>('OT');
  const [selectedBook, setSelectedBook] = useState<Book>(currentBook);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = BIBLE_BOOKS.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setStep('chapter');
  };

  const handleChapterSelect = (chapter: number) => {
    onSelect(selectedBook, chapter);
    onClose();
    setTimeout(() => { setStep('book'); setSearchQuery(''); }, 300);
  };

  const otBooks = filteredBooks.filter((book) => book.testament === 'OT');
  const ntBooks = filteredBooks.filter((book) => book.testament === 'NT');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl glass-panel"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header Premium */}
            <div className="flex items-center justify-between p-5 border-b border-bible-border/50">
              <div className="flex items-center gap-3">
                {step === 'chapter' && (
                  <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep('book')}
                    className="premium-icon-button"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </motion.button>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookMarked className="w-4 h-4 text-bible-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted">
                      {step === 'book' ? 'Selecionar Livro' : 'Selecionar Capítulo'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-bible-text">
                    {step === 'book' ? 'Escolha um livro' : selectedBook.name}
                  </h2>
                  <p className="text-xs text-bible-text-muted mt-0.5">
                    {step === 'book'
                      ? `Lendo: ${currentBook.name} ${currentChapter}`
                      : `${selectedBook.chapters} capítulos disponíveis`}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="premium-icon-button"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Search & Filters */}
            {step === 'book' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-b border-bible-border/50 space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bible-text-muted" />
                  <input
                    type="text"
                    placeholder="Buscar livro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="premium-input pl-9"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTestament('OT')}
                    className={cn(
                      'flex-1 px-4 py-2 text-xs font-bold rounded-full transition-all',
                      selectedTestament === 'OT'
                        ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-md'
                        : 'bg-bible-surface text-bible-text-muted hover:text-bible-text hover:bg-bible-surface-strong'
                    )}
                  >
                    Antigo Testamento
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTestament('NT')}
                    className={cn(
                      'flex-1 px-4 py-2 text-xs font-bold rounded-full transition-all',
                      selectedTestament === 'NT'
                        ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-md'
                        : 'bg-bible-surface text-bible-text-muted hover:text-bible-text hover:bg-bible-surface-strong'
                    )}
                  >
                    Novo Testamento
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Books/Chapters Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {step === 'book' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5"
                >
                  {(selectedTestament === 'OT' ? otBooks : ntBooks).map((book, i) => {
                    const isActive = currentBook.id === book.id;
                    return (
                      <motion.button
                        key={book.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookSelect(book)}
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl transition-all',
                          isActive
                            ? 'bg-gradient-to-br from-bible-accent to-bible-accent-strong text-white shadow-lg'
                            : 'bg-bible-surface hover:bg-bible-surface-strong hover:shadow-md'
                        )}
                      >
                        <BookOpen className={cn("h-4 w-4 mb-1.5", isActive && "text-white")} />
                        <span className="text-[11px] font-semibold truncate w-full text-center">{book.name}</span>
                        <span className={cn("text-[9px] mt-0.5", isActive ? "text-white/80" : "text-bible-text-muted")}>{book.chapters} cap.</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2.5"
                >
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter, i) => {
                    const isActive = currentBook.id === selectedBook.id && currentChapter === chapter;
                    return (
                      <motion.button
                        key={chapter}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.01 }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChapterSelect(chapter)}
                        className={cn(
                          'aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all',
                          isActive
                            ? 'bg-gradient-to-br from-bible-accent to-bible-accent-strong text-white shadow-lg'
                            : 'bg-bible-surface hover:bg-bible-surface-strong hover:shadow-md'
                        )}
                      >
                        {chapter}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};