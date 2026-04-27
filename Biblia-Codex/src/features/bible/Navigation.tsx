import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Search, BookOpen, BookMarked } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden",
              "rounded-2xl border border-[var(--border-bible)]",
              "bg-[var(--surface-0)] shadow-xl",
              "backdrop-blur-xl"
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between p-5",
              "border-b border-[var(--border-bible)]"
            )}>
              <div className="flex items-center gap-3">
                {step === 'chapter' && (
                  <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep('book')}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      "bg-[var(--surface-1)] text-[var(--text-bible-muted)]",
                      "hover:bg-[var(--surface-2)] hover:text-[var(--text-bible)]",
                      "transition-all duration-200"
                    )}
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </motion.button>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookMarked className="w-4 h-4 text-[var(--accent-bible)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-bible-muted)]">
                      {step === 'book' ? 'Selecionar Livro' : 'Selecionar Capítulo'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-bible)]">
                    {step === 'book' ? 'Escolha um livro' : selectedBook.name}
                  </h2>
                  <p className="text-xs text-[var(--text-bible-muted)] mt-0.5">
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
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  "bg-[var(--surface-1)] text-[var(--text-bible-muted)]",
                  "hover:bg-[var(--surface-2)] hover:text-[var(--text-bible)]",
                  "transition-all duration-200"
                )}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Search & Filters */}
            {step === 'book' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 border-b border-[var(--border-bible)] space-y-3"
                )}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-bible-muted)]" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar livro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full h-11 pl-9 pr-4 rounded-xl",
                      "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                      "text-[var(--text-bible)] text-sm",
                      "placeholder:text-[var(--text-bible-subtle)]",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)] focus:ring-offset-2",
                      "transition-all duration-200"
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTestament('OT')}
                    className={cn(
                      'flex-1 px-4 py-2 text-xs font-bold rounded-full transition-all',
                      selectedTestament === 'OT'
                        ? 'bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] text-[var(--accent-bible-contrast)] shadow-md'
                        : 'bg-[var(--surface-1)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] hover:bg-[var(--surface-2)]'
                    )}
                  >
                    Antigo Testamento
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTestament('NT')}
                    className={cn(
                      'flex-1 px-4 py-2 text-xs font-bold rounded-full transition-all',
                      selectedTestament === 'NT'
                        ? 'bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] text-[var(--accent-bible-contrast)] shadow-md'
                        : 'bg-[var(--surface-1)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] hover:bg-[var(--surface-2)]'
                    )}
                  >
                    Novo Testamento
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {step === 'book' ? (
                <div className="space-y-6">
                  {/* Old Testament */}
                  {selectedTestament === 'OT' && otBooks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-bible-muted)] uppercase tracking-wider mb-3">
                        Antigo Testamento
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {otBooks.map((book, index) => (
                          <motion.button
                            key={book.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBookSelect(book)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl",
                              "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                              "text-left transition-all duration-200",
                              "hover:border-[var(--accent-bible)]/30 hover:bg-[var(--surface-2)]",
                              currentBook.id === book.id && "border-[var(--accent-bible)] bg-[var(--accent-bible)]/5"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-[var(--text-bible)] truncate">
                                {book.name}
                              </div>
                              <div className="text-xs text-[var(--text-bible-muted)]">
                                {book.chapters} caps
                              </div>
                            </div>
                            <ChevronRight className={cn(
                              "w-4 h-4 text-[var(--text-bible-subtle)]",
                              currentBook.id === book.id && "text-[var(--accent-bible)]"
                            )} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Testament */}
                  {selectedTestament === 'NT' && ntBooks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-bible-muted)] uppercase tracking-wider mb-3">
                        Novo Testamento
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ntBooks.map((book, index) => (
                          <motion.button
                            key={book.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBookSelect(book)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl",
                              "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                              "text-left transition-all duration-200",
                              "hover:border-[var(--accent-bible)]/30 hover:bg-[var(--surface-2)]",
                              currentBook.id === book.id && "border-[var(--accent-bible)] bg-[var(--accent-bible)]/5"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-[var(--text-bible)] truncate">
                                {book.name}
                              </div>
                              <div className="text-xs text-[var(--text-bible-muted)]">
                                {book.chapters} caps
                              </div>
                            </div>
                            <ChevronRight className={cn(
                              "w-4 h-4 text-[var(--text-bible-subtle)]",
                              currentBook.id === book.id && "text-[var(--accent-bible)]"
                            )} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Chapter Selection */
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter, index) => (
                    <motion.button
                      key={chapter}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChapterSelect(chapter)}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-xl",
                        "text-sm font-bold transition-all duration-200",
                        currentBook.id === selectedBook.id && currentChapter === chapter
                          ? "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-lg shadow-[var(--accent-bible)]/30"
                          : "bg-[var(--surface-1)] border border-[var(--border-bible)] text-[var(--text-bible-muted)] hover:border-[var(--accent-bible)]/30 hover:text-[var(--text-bible)]"
                      )}
                    >
                      {chapter}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};