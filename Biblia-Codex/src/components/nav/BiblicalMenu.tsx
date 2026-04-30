import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, BookMarked, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BIBLE_BOOKS } from '../../data/bibleMetadata';
import { useAppContext } from '../../app/AppContext';
import { useBreakpoint } from '../../hooks/useMediaQuery';
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
  const { isMobile, isTablet } = useBreakpoint();

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
    setShowChapters(true);
  };

  useEffect(() => {
    if (isOpen && selectedBook) {
      setShowChapters(true);
    }
  }, [selectedBook]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentBook, currentChapter]);

  const handleChapterSelect = (chapter: number) => {
    onNavigate((selectedBook || currentBook).id, chapter);
    onGoToBible();
    setSelectedBook(null);
    setShowChapters(false);
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

  const chapterCols = isMobile ? 'grid-cols-4' : isTablet ? 'grid-cols-5' : 'grid-cols-6';
  const chapterBtnSize = isMobile ? 'h-9 w-9 text-sm' : 'h-10 w-10 text-base';
  const menuMaxWidth = isMobile ? 'max-w-[90vw] w-[280px]' : 'w-[320px]';
  const chapterPanelMaxWidth = isMobile ? 'max-w-[90vw] w-[280px]' : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn('fixed bottom-24 left-1/2 z-50 -translate-x-1/2', menuMaxWidth)}
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
                  className="p-3"
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
                          'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200',
                          'text-[var(--text-bible)] hover:bg-[var(--surface-1)] hover:scale-[1.02]'
                        )}
                      >
                        <span className="truncate">{version.name}</span>
                        {currentVersion?.id === version.id && (
                          <span className="h-2 w-2 rounded-full bg-[var(--accent-bible)]" />
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
                  className="p-3"
                >
                  <button
                    onClick={() => setShowBooks(false)}
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-bible)]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Livros
                  </button>
                  <div className="mb-2 flex gap-2">
                    <button
                      onClick={() => setSelectedTestament('OT')}
                      className={cn(
                        'flex-1 rounded-xl py-2 text-xs font-medium transition-all duration-200',
                        selectedTestament === 'OT'
                          ? 'bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]'
                          : 'text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
                      )}
                    >
                      VT
                    </button>
                    <button
                      onClick={() => setSelectedTestament('NT')}
                      className={cn(
                        'flex-1 rounded-xl py-2 text-xs font-medium transition-all duration-200',
                        selectedTestament === 'NT'
                          ? 'bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]'
                          : 'text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
                      )}
                    >
                      NT
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {books.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => handleBookSelect(book)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200',
                          'text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
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
                  className="p-3"
                >
                  <button
                    onClick={() => setShowVersions(true)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200',
                      'text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-[var(--accent-bible)]" />
                      Versão
                    </span>
                    <span className="text-xs text-[var(--text-bible-muted)] truncate max-w-[100px]">
                      {currentVersion?.name || 'Selecionar'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowBooks(true)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200',
                      'text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <BookMarked className="h-4 w-4 text-[var(--accent-bible)]" />
                      Livro
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-bible-muted)]" />
                  </button>

                  <div className="mt-1 flex items-center justify-between rounded-xl bg-[var(--surface-1)] px-4 py-3">
                    <span className="flex items-center gap-3 text-sm text-[var(--text-bible)]">
                      {currentBook.name}
                    </span>
                    <button
                      onClick={handleShowChapters}
                      className="flex items-center gap-2 text-sm font-bold text-[var(--accent-bible)]"
                    >
                      {currentChapter}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {(selectedBook || showChapters) && (
              <motion.div
                key="chapter-panel"
                initial={{ opacity: 0, x: isMobile ? 0 : -10, y: isMobile ? 4 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: isMobile ? 0 : -10, y: isMobile ? 4 : 0 }}
                className={cn(
                  'rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-0)]/95 backdrop-blur-md shadow-lg shadow-black/10',
                  isMobile
                    ? 'relative top-0 left-0 mt-2 mx-auto'
                    : 'absolute left-full top-0 ml-2'
                )}
                style={{ maxWidth: isMobile ? '280px' : 'none' }}
              >
                <div className="p-3">
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
                  <div className={cn('max-h-48 overflow-y-auto grid gap-2', chapterCols)}>
                    {Array.from({ length: (selectedBook || currentBook).chapters }, (_, i) => i + 1).map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => handleChapterSelect(chapter)}
                        className={cn(
                          'flex items-center justify-center rounded-xl font-medium text-[var(--text-bible)]',
                          'hover:bg-[var(--surface-1)] transition-all duration-150 hover:scale-110',
                          chapterBtnSize
                        )}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiblicalMenu;