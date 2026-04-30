import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Book as BookIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Book } from '../../types';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface ChapterNavProps {
  currentBook: Book;
  currentChapter: number;
  onNavigate: (bookId: string, chapter: number) => void;
}

export const ChapterNav: React.FC<ChapterNavProps> = ({
  currentBook,
  currentChapter,
  onNavigate,
}) => {
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      onNavigate(currentBook.id, currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.chapters) {
      onNavigate(currentBook.id, currentChapter + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 left-1/2 z-40 -translate-x-1/2"
      style={{ paddingTop: 'var(--sat)' }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-0)] px-4 py-2 shadow-lg">
        <button
          onClick={handlePrevChapter}
          disabled={currentChapter <= 1}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
            'text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)]',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <BookIcon className="h-4 w-4 shrink-0 text-[var(--accent-bible)]" />
          <span className="truncate text-sm font-medium text-[var(--text-bible)]">
            {currentBook.name}
          </span>
          <span className="text-sm font-bold text-[var(--accent-bible)]">
            {currentChapter}
          </span>
        </div>

        <button
          onClick={handleNextChapter}
          disabled={currentChapter >= currentBook.chapters}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
            'text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)]',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ChapterNav;