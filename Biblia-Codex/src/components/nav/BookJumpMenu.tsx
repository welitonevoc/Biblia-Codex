import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Book as BookIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Book } from '../../types';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface BookJumpMenuProps {
  currentBook: Book;
  currentChapter: number;
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BookJumpMenu: React.FC<BookJumpMenuProps> = ({
  currentBook,
  currentChapter,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      onNavigate(currentBook.id, currentChapter - 1, 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.chapters) {
      onNavigate(currentBook.id, currentChapter + 1, 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          style={{ paddingBottom: 'max(var(--sab), 24px)' }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-0)]/95 backdrop-blur-md shadow-lg shadow-black/10">
            <button
              onClick={() => {
                onClose();
                onNavigate(currentBook.id, Math.max(1, currentChapter - 1), 1);
              }}
              disabled={currentChapter <= 1}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
                'text-[var(--text-bible)] hover:bg-[var(--surface-1)] hover:scale-105',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={onClose}
              className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-[var(--surface-1)] hover:scale-105"
            >
              <BookIcon className="h-4 w-4 shrink-0 text-[var(--accent-bible)]" />
              <span className="truncate text-sm font-medium text-[var(--text-bible)]">
                {currentBook.name}
              </span>
              <span className="text-sm font-bold text-[var(--accent-bible)]">
                {currentChapter}
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigate(currentBook.id, Math.min(currentBook.chapters, currentChapter + 1), 1);
              }}
              disabled={currentChapter >= currentBook.chapters}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
                'text-[var(--text-bible)] hover:bg-[var(--surface-1)] hover:scale-105',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookJumpMenu;