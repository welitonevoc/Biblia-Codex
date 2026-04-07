import React, { useState } from 'react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Search, Sparkles, BookOpen } from 'lucide-react';
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
    setTimeout(() => {
      setStep('book');
      setSearchQuery('');
    }, 300);
  };

  const otBooks = filteredBooks.filter((book) => book.testament === 'OT');
  const ntBooks = filteredBooks.filter((book) => book.testament === 'NT');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={settings.navigation.navAnimation ? { scale: 0.96, opacity: 0, y: 18 } : {}}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={settings.navigation.navAnimation ? { scale: 0.96, opacity: 0, y: 18 } : {}}
            className="premium-card flex h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-[40px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-bible-accent/10 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {step === 'chapter' && (
                    <button onClick={() => setStep('book')} className="premium-icon-button rounded-2xl">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                  )}
                  <div>
                    <span className="premium-kicker mb-3">
                      <Sparkles className="h-4 w-4" />
                      Navegação Bíblica
                    </span>
                    <h2 className="font-display text-4xl font-semibold tracking-tight text-bible-text">
                      {step === 'book' ? 'Escolha um livro' : selectedBook.name}
                    </h2>
                    <p className="ui-text mt-2 text-sm text-bible-text/55">
                      {step === 'book'
                        ? `Você está em ${currentBook.name} ${currentChapter}.`
                        : `Selecione o capítulo de ${selectedBook.name}.`}
                    </p>
                  </div>
                </div>

                <button onClick={onClose} className="premium-icon-button rounded-2xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {step === 'book' && (
              <div className="border-b border-bible-accent/10 p-5 md:px-6 md:pb-5 md:pt-4">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-bible-text/40" />
                  <input
                    type="text"
                    placeholder="Buscar livro..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="premium-input pl-12"
                    autoFocus
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedTestament('OT')}
                    className={cn("premium-chip px-5", selectedTestament === 'OT' && "premium-chip-active")}
                  >
                    Antigo Testamento
                  </button>
                  <button
                    onClick={() => setSelectedTestament('NT')}
                    className={cn("premium-chip px-5", selectedTestament === 'NT' && "premium-chip-active")}
                  >
                    Novo Testamento
                  </button>
                </div>
              </div>
            )}

            <div className="premium-scroll flex-1 overflow-y-auto p-5 md:p-6">
              {step === 'book' ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                  {(selectedTestament === 'OT' ? otBooks : ntBooks).map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleBookSelect(book)}
                      className={cn(
                        "premium-card-soft flex min-h-[92px] flex-col items-start justify-between rounded-[28px] p-4 text-left transition-all hover:border-bible-accent/20",
                        currentBook.id === book.id && "premium-card-strong border-gold/40"
                      )}
                    >
                      <BookOpen className="h-4 w-4 text-gold" />
                      <div>
                        <div className="ui-text text-sm font-extrabold text-bible-text">{book.name}</div>
                        <div className="ui-text mt-1 text-[11px] uppercase tracking-[0.18em] text-bible-text/40">
                          {book.chapters} capítulos
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
                  {Array.from({ length: selectedBook.chapters }, (_, index) => index + 1).map((chapter) => (
                    <button
                      key={chapter}
                      onClick={() => handleChapterSelect(chapter)}
                      className={cn(
                        "premium-card-soft aspect-square rounded-[24px] text-lg font-semibold transition-all hover:border-bible-accent/20",
                        currentBook.id === selectedBook.id && currentChapter === chapter && "premium-card-strong border-gold/40"
                      )}
                    >
                      {chapter}
                    </button>
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
