import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, BookMarked, ChevronDown, ChevronLeft, ChevronRight, Check, Book as BookIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BIBLE_BOOKS } from '../../data/bibleMetadata';
import { useAppContext } from '../../app/AppContext';
import type { Book } from '../../types';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface BiblicalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: Book;
  currentChapter: number;
  onNavigate: (bookId: string, chapter: number) => void;
  onGoToBible: () => void;
}

export const BiblicalMenu: React.FC<BiblicalMenuProps> = ({
  isOpen,
  onClose,
  currentBook,
  currentChapter,
  onNavigate,
  onGoToBible,
}) => {
  const { availableVersions, currentVersion, selectVersion } = useAppContext();
  const [showVersions, setShowVersions] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT'>(currentBook.testament as 'OT' | 'NT');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    setSelectedTestament(currentBook.testament as 'OT' | 'NT');
  }, [currentBook]);

  const books = BIBLE_BOOKS.filter((book) => book.testament === selectedTestament);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleChapterSelect = (chapter: number) => {
    if (selectedBook) {
      onNavigate(selectedBook.id, chapter);
      onGoToBible();
      setSelectedBook(null);
      setShowBooks(false);
      onClose();
    }
  };

  const handleChapterSelectFromMain = (chapter: number) => {
    onNavigate(currentBook.id, chapter);
    onGoToBible();
    onClose();
  };

  const handleShowChapters = () => {
    setSelectedBook(currentBook);
    setShowChapters(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          style={{ paddingBottom: 'max(var(--sab), 24px)' }}
        >
          <div className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-0)]/95 backdrop-blur-md shadow-lg shadow-black/10 overflow-hidden">
            <AnimatePresence mode="wait">
              {showVersions ? (
                <motion.div
                  key="versions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-2"
                >
                  <button
                    onClick={() => setShowVersions(false)}
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-bible)]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Versões
                  </button>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {availableVersions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => {
                          selectVersion(version);
                          setShowVersions(false);
                          onClose();
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm',
                          'text-[var(--text-bible)] hover:bg-[var(--surface-hover)]',
                          'transition-colors duration-150'
                        )}
                      >
                        <span className="truncate">{version.name}</span>
                        {currentVersion?.id === version.id && (
                          <Check className="h-4 w-4 shrink-0 text-[var(--accent-bible)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : showBooks ? (
                <motion.div
                  key="books"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-2"
                >
                  <button
                    onClick={() => setShowBooks(false)}
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-bible)]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Livros
                  </button>
                  <div className="mb-2 flex gap-1">
                    <button
                      onClick={() => setSelectedTestament('OT')}
                      className={cn(
                        'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        selectedTestament === 'OT'
                          ? 'bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]'
                          : 'text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)]'
                      )}
                    >
                      VT
                    </button>
                    <button
                      onClick={() => setSelectedTestament('NT')}
                      className={cn(
                        'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        selectedTestament === 'NT'
                          ? 'bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]'
                          : 'text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)]'
                      )}
                    >
                      NT
                    </button>
                  </div>
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {books.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => handleBookSelect(book)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm',
                          'text-[var(--text-bible)] hover:bg-[var(--surface-hover)]',
                          'transition-colors duration-150'
                        )}
                      >
                        <span className="truncate">{book.name}</span>
                        <span className="text-xs text-[var(--text-bible-muted)]">{book.chapters}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-2"
                >
                  <button
                    onClick={() => setShowVersions(true)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm',
                      'text-[var(--text-bible)] hover:bg-[var(--surface-hover)]',
                      'transition-colors duration-150'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[var(--accent-bible)]" />
                      Versão
                    </span>
                    <span className="text-xs text-[var(--text-bible-muted)] truncate max-w-[120px]">
                      {currentVersion?.name || 'Selecionar'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowBooks(true)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm',
                      'text-[var(--text-bible)] hover:bg-[var(--surface-hover)]',
                      'transition-colors duration-150'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4 text-[var(--accent-bible)]" />
                      Livro
                    </span>
                    <span className="flex items-center gap-1 text-[var(--text-bible-muted)]">
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </button>

                  <div className="mt-1 flex items-center justify-between rounded-lg bg-[var(--surface-1)] px-3 py-2">
                    <button
                      onClick={() => setShowBooks(true)}
                      className="flex items-center gap-2 text-sm text-[var(--text-bible)]"
                    >
                      <BookIcon className="h-4 w-4 text-[var(--accent-bible)]" />
                      {currentBook.name}
                    </button>
                    <button
                      onClick={handleShowChapters}
                      className="flex items-center gap-1 text-sm font-medium text-[var(--accent-bible)] hover:underline"
                    >
                      {currentChapter}
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chapter Selector Popup */}
          {(selectedBook || showChapters) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-full top-0 ml-2 rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-0)]/95 backdrop-blur-md shadow-lg shadow-black/10 overflow-hidden"
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowChapters(false);
                    setSelectedBook(null);
                  }}
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-bible)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {(selectedBook || currentBook).name}
                </button>
                <div className="max-h-48 grid grid-cols-5 gap-1 overflow-y-auto">
                  {Array.from({ length: (selectedBook || currentBook).chapters }, (_, i) => i + 1).map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => {
                        onNavigate((selectedBook || currentBook).id, chapter);
                        onGoToBible();
                        setShowChapters(false);
                        setSelectedBook(null);
                        onClose();
                      }}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium',
                        'text-[var(--text-bible)] hover:bg-[var(--surface-hover)]',
                        'transition-colors duration-150'
                      )}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiblicalMenu;