import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, BookMarked, ChevronLeft, ChevronRight, Search, X, Check, Type, Minus, Plus as PlusIcon, AlignLeft, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BIBLE_BOOKS } from '../../data/bibleMetadata';
import { useAppContext } from '../../app/AppContext';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import { BibleService } from '../../BibleService';
import type { Book } from '../../types';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface BiblicalMenuProps {
  currentBook: Book;
  currentChapter: number;
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
  onGoToBible: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type ViewKey = 'main' | 'versions' | 'books' | 'chapters' | 'verses' | 'typography';

export const BiblicalMenu: React.FC<BiblicalMenuProps> = ({
  isOpen,
  onClose,
  currentBook,
  currentChapter,
  onNavigate,
  onGoToBible,
}) => {
  const { 
    availableVersions, currentVersion, selectVersion,
    config, settings, 
    setFontSize, setLineHeight, setLetterSpacing, setFontPreference,
    toggleSetting 
  } = useAppContext();
  const [view, setView] = useState<ViewKey>('main');
  const [selectedBook, setSelectedBook] = useState<Book>(currentBook);
  const [selectedChapter, setSelectedChapter] = useState<number>(currentChapter);
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT'>(currentBook.testament as 'OT' | 'NT');
  const [searchQuery, setSearchQuery] = useState('');
  const [verseCount, setVerseCount] = useState(30);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  
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

  // Reset view when opening
  useEffect(() => {
    if (isOpen) {
      setView('main');
      setSelectedBook(currentBook);
      setSelectedChapter(currentChapter);
      setSelectedTestament(currentBook.testament as 'OT' | 'NT');
      setSearchQuery('');
    }
  }, [isOpen, currentBook, currentChapter]);

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter(book => {
      const matchesTestament = book.testament === selectedTestament;
      const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTestament && matchesSearch;
    });
  }, [selectedTestament, searchQuery]);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setView('chapters');
  };

  const handleChapterSelect = async (chapter: number) => {
    setSelectedChapter(chapter);
    setIsLoadingVerses(true);
    setView('verses');
    
    try {
      // Fetch exact verse count
      const verses = await BibleService.getVerses(selectedBook.id, chapter, currentVersion || undefined);
      setVerseCount(verses.length > 0 ? verses[verses.length - 1].verse : 30);
    } catch (error) {
      setVerseCount(30);
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const handleVerseSelect = (verse: number) => {
    onNavigate(selectedBook.id, selectedChapter, verse);
    onGoToBible();
    onClose();
  };

  const gridCols = isMobile ? 'grid-cols-5' : isTablet ? 'grid-cols-6' : 'grid-cols-8';
  const menuWidth = isMobile ? 'w-[calc(100vw-0.5rem)] max-w-[320px] sm:max-w-[400px]' : 'w-[450px]';

  const renderHeader = (title: string, onBack: () => void) => (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06] bg-white/[0.03]">
      <button 
        onClick={onBack}
        className="-ml-1 sm:-ml-2 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg hover:bg-white/10 active:scale-90 transition-all"
        aria-label="Voltar"
      >
        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] text-white/60" />
      </button>
      <h3 className="text-sm sm:text-base font-bold tracking-tight text-white/90 truncate max-w-[160px] sm:max-w-none">{title}</h3>
      <button 
        onClick={onClose}
        className="-mr-1 sm:-mr-2 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg hover:bg-white/10 active:scale-90 transition-all"
        aria-label="Fechar menu bíblico"
      >
        <X size={16} className="sm:w-[18px] sm:h-[18px] text-white/40 hover:text-red-400 transition-colors" />
      </button>
    </div>
  );

  const containerVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  };

  const viewVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
<AnimatePresence>
        {isOpen && (
        <motion.div
          ref={menuRef}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn('fixed bottom-20 sm:bottom-24 left-1/2 z-50 -translate-x-1/2', menuWidth)}
          style={{ paddingBottom: 'max(var(--sab), 16px)' }}
        >
          <div className="relative rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl bg-gradient-to-b from-zinc-900/92 via-zinc-900/92 to-zinc-950/95 border border-white/15 dark:from-zinc-900/95 dark:via-zinc-900/95 dark:to-zinc-950/98">
            <div className="relative overflow-hidden min-h-[200px] sm:min-h-[300px] max-h-[60vh] sm:max-h-[450px]">
              <AnimatePresence mode="wait" initial={false}>
                {view === 'main' && (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-2 sm:p-4 space-y-2 sm:space-y-3"
                  >
<div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bible)]" />
                         <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-bible)]">Navegação</span>
                       </div>
                       <button onClick={onClose} className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg hover:bg-white/10 active:scale-90 transition-all" aria-label="Fechar menu bíblico"><X size={13} className="sm:w-3.5 sm:h-3.5 text-white/40"/></button>
                    </div>

                    <button
                      onClick={() => setView('typography')}
                      className="group w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500/25 to-pink-500/15 text-purple-400/90">
                          <Type size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] sm:text-xs font-medium text-white/40">Aparência do Texto</p>
                          <p className="text-sm sm:text-base font-bold text-white/95">Aa</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-300" />
                    </button>

                    <button
                      onClick={() => setView('versions')}
                      className="group w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-blue-500/30 transition-all duration-300"
                    >
                     <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-500/15 text-blue-400/90">
                          <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-white/40">Versão da Bíblia</p>
                          <p className="text-sm sm:text-base font-bold text-white/95 truncate max-w-[130px] sm:max-w-[200px]">{currentVersion?.name || 'Selecionar'}</p>
                        </div>
                     </div>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300" />
                    </button>

                    <button
                      onClick={() => setView('books')}
                      className="group w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/15 text-emerald-400/90">
                          <BookMarked size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-white/40">Livro & Capítulo</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-white/95 truncate max-w-[110px] sm:max-w-[200px]">{currentBook.name}</span>
                            <span className="text-sm sm:text-base font-black text-emerald-400 shrink-0">{currentChapter}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">Trocar</span>
                        <ChevronRight size={16} className="text-white/20 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-300" />
                      </div>
                    </button>

                    <div className="pt-3 sm:pt-4 grid grid-cols-2 gap-2 sm:gap-3">
                       <button 
                        onClick={() => { setSelectedBook(currentBook); setView('chapters'); }}
                        className="min-h-11 sm:min-h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible)]/80 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[var(--accent-bible)]/25 hover:shadow-xl hover:shadow-[var(--accent-bible)]/40 hover:brightness-110 active:scale-[0.97] transition-all duration-200"
                       >
                         Capítulos
                       </button>
                       <button 
                        onClick={() => { setSelectedBook(currentBook); setSelectedChapter(currentChapter); handleChapterSelect(currentChapter); }}
                        className="min-h-11 sm:min-h-12 rounded-xl sm:rounded-2xl bg-white/[0.06] border border-white/[0.08] px-3 sm:px-4 text-xs sm:text-sm font-bold text-white/70 hover:bg-white/[0.12] hover:text-white/90 hover:border-white/20 active:scale-[0.97] transition-all duration-200"
                       >
                         Versículos
                       </button>
                    </div>
                  </motion.div>
                )}

                {view === 'versions' && (
                  <motion.div
                    key="versions"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    {renderHeader('Selecionar Versão', () => setView('main'))}
                    <div className="p-1 sm:p-2 max-h-[40vh] sm:max-h-[350px] overflow-y-auto space-y-0.5 custom-scrollbar">
                      {availableVersions.map((version) => {
                        const isActive = currentVersion?.id === version.id;
                        return (
                          <button
                            key={version.id}
                            onClick={() => {
                              selectVersion(version);
                              onClose();
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 group',
                              isActive 
                                ? 'bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible)]/80 text-white shadow-lg shadow-[var(--accent-bible)]/25' 
                                : 'hover:bg-white/[0.06] border border-transparent'
                            )}
                          >
                            <span className={cn('text-xs sm:text-sm font-medium', isActive ? 'font-bold' : 'text-white/80')}>{version.name}</span>
                            {isActive ? (
                              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                <Check size={13} className="text-white" />
                              </div>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-white/[0.08] group-hover:bg-white/20 transition-colors" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {view === 'books' && (
                  <motion.div
                    key="books"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    {renderHeader('Selecionar Livro', () => setView('main'))}
                    
                    <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                        <input 
                          type="text" 
                          placeholder="Buscar livro..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="min-h-10 sm:min-h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2 sm:py-2.5 pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)]/40 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="flex p-0.5 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                        {['OT', 'NT'].map((testament) => (
                          <button
                            key={testament}
                            onClick={() => setSelectedTestament(testament as 'OT' | 'NT')}
                            className={cn(
                              'min-h-9 sm:min-h-10 flex-1 rounded-lg py-1 text-[10px] sm:text-xs font-bold transition-all',
                              selectedTestament === testament 
                                ? 'bg-[var(--accent-bible)] text-white shadow-sm' 
                                : 'text-white/40 hover:text-white/70'
                            )}
                          >
                            {testament === 'OT' ? 'Velho Testamento' : 'Novo Testamento'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="px-1 sm:px-2 pb-1 sm:pb-2 max-h-[35vh] sm:max-h-[300px] overflow-y-auto grid grid-cols-1 gap-0.5 custom-scrollbar">
                      {filteredBooks.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => handleBookSelect(book)}
                          className="flex min-h-10 sm:min-h-11 items-center justify-between rounded-xl p-2 sm:p-3 hover:bg-white/[0.06] group transition-all"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white/[0.05] text-[8px] sm:text-[10px] font-black text-white/40 group-hover:bg-[var(--accent-bible)]/20 group-hover:text-[var(--accent-bible)] transition-colors shrink-0">
                              {book.abbreviation}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-white/80 truncate">{book.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <span className="text-[9px] sm:text-[10px] text-white/25">{book.chapters} cap.</span>
                            <ChevronRight size={13} className="text-white/15" />
                          </div>
                        </button>
                      ))}
                      {filteredBooks.length === 0 && (
                        <div className="py-8 sm:py-10 text-center text-white/30 text-xs sm:text-sm">Nenhum livro encontrado</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {view === 'typography' && (
                  <motion.div
                    key="typography"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full p-2 sm:p-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <button 
                        onClick={() => setView('books')}
                        className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-lg sm:rounded-xl hover:bg-bible-surface transition-colors"
                        aria-label="Voltar"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-bible-text" />
                      </button>
                      <h2 className="text-base sm:text-xl font-black text-bible-text tracking-tight">Aparência</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-6 pr-1 sm:pr-2 custom-scrollbar max-h-[50vh] sm:max-h-none">
                      <section className="space-y-1.5 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Tamanho da Fonte</span>
                          <span className="text-xs sm:text-sm font-bold text-bible-accent">{config.fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 bg-bible-surface p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-bible-border/30">
                          <button 
                            onClick={() => setFontSize(Math.max(12, config.fontSize - 1))}
                            className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-lg hover:bg-bible-accent/10 text-bible-text-muted hover:text-bible-accent transition-colors"
                            aria-label="Diminuir fonte"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <input 
                            type="range"
                            min="12"
                            max="32"
                            value={config.fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="flex-1 accent-bible-accent h-1.5 rounded-full"
                          />
                          <button 
                            onClick={() => setFontSize(Math.min(32, config.fontSize + 1))}
                            className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-lg hover:bg-bible-accent/10 text-bible-text-muted hover:text-bible-accent transition-colors"
                            aria-label="Aumentar fonte"
                          >
                            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </section>

                      <section className="space-y-1.5 sm:space-y-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Números de Strong</span>
                        <button
                          onClick={() => toggleSetting('textDisplay', 'showStrongs')}
                          className="w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-bible-surface/50 border border-bible-border/30 hover:bg-bible-surface transition-all group"
                        >
                          <div className="text-left">
                            <div className="text-xs sm:text-sm font-bold text-bible-text">Mostrar números Strong</div>
                            <div className="text-[8px] sm:text-[9px] text-bible-text-muted opacity-60">Exibe referências Strong no texto</div>
                          </div>
                          <div className={cn(
                            "w-9 h-5 sm:w-10 sm:h-6 rounded-full transition-all relative",
                            settings.textDisplay.showStrongs ? "bg-bible-accent" : "bg-bible-text-muted/20"
                          )}>
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                              settings.textDisplay.showStrongs ? "left-4 sm:left-5" : "left-0.5 sm:left-1"
                            )} />
                          </div>
                        </button>
                      </section>

                      <section className="space-y-1.5 sm:space-y-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Estilo da Fonte</span>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {[
                            { id: 'serif', label: 'Serifada', icon: BookMarked },
                            { id: 'sans', label: 'Moderna', icon: Type },
                            { id: 'mono', label: 'Foco', icon: AlignLeft },
                          ].map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setFontPreference(style.id as any)}
                              className={cn(
                                "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all",
                                config.fontPreference === style.id
                                  ? "bg-bible-accent border-bible-accent text-white shadow-lg shadow-bible-accent/20"
                                  : "bg-bible-surface border-bible-border/50 text-bible-text-muted hover:border-bible-accent/30"
                              )}
                            >
                              <style.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter">{style.label}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="space-y-2 sm:space-y-3">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Entrelinha</span>
                          <div className="flex items-center gap-1 sm:gap-2 bg-bible-surface p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-bible-border/30">
                            <input 
                              type="range"
                              min="1"
                              max="2.5"
                              step="0.1"
                              value={config.lineHeight}
                              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                              className="w-full accent-bible-accent"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Espaçamento</span>
                          <div className="flex items-center gap-1 sm:gap-2 bg-bible-surface p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-bible-border/30">
                            <input 
                              type="range"
                              min="-0.05"
                              max="0.2"
                              step="0.01"
                              value={config.letterSpacing}
                              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                              className="w-full accent-bible-accent"
                            />
                          </div>
                        </div>
                      </section>

                      <section className="space-y-2 sm:space-y-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Layout da Leitura</span>
                        <div className="space-y-1.5 sm:space-y-2">
                          {[
                            { id: 'paragraphMode', label: 'Modo Parágrafo', desc: 'Agrupa versículos em blocos' },
                            { id: 'verseNumbers', label: 'Números de Versículo', desc: 'Exibe a numeração lateral' },
                            { id: 'wordsOfJesusRed', label: 'Palavras de Jesus em Vermelho', desc: 'Destaque especial para falas de Cristo' },
                          ].map((toggle) => (
                            <button
                              key={toggle.id}
                              onClick={() => toggleSetting('textDisplay', toggle.id as any)}
                              className="w-full flex items-center justify-between p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-bible-surface/50 border border-bible-border/30 hover:bg-bible-surface transition-all group"
                            >
                              <div className="text-left">
                                <div className="text-xs sm:text-sm font-bold text-bible-text">{toggle.label}</div>
                                <div className="text-[9px] sm:text-[10px] text-bible-text-muted opacity-60">{toggle.desc}</div>
                              </div>
                              <div className={cn(
                                "w-8 h-5 sm:w-10 sm:h-6 rounded-full transition-all relative",
                                (settings.textDisplay as any)[toggle.id] ? "bg-bible-accent" : "bg-bible-text-muted/20"
                              )}>
                                <div className={cn(
                                  "absolute top-0.5 w-3.5 h-3.5 sm:top-1 sm:w-4 sm:h-4 rounded-full bg-white transition-all",
                                  (settings.textDisplay as any)[toggle.id] ? "left-4 sm:left-5" : "left-0.5 sm:left-1"
                                )} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  </motion.div>
                )}

                {view === 'chapters' && (
                  <motion.div
                    key="chapters"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    {renderHeader(selectedBook.name, () => setView('books'))}
                    <div className={cn('p-2 sm:p-4 max-h-[35vh] sm:max-h-[350px] overflow-y-auto grid gap-1.5 sm:gap-2 custom-scrollbar', gridCols)}>
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                        <button
                          key={chapter}
                          onClick={() => handleChapterSelect(chapter)}
                          className={cn(
                            'h-10 sm:h-12 w-full flex items-center justify-center rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200',
                            chapter === currentChapter && selectedBook.id === currentBook.id
                              ? 'bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible)]/80 text-white shadow-lg shadow-[var(--accent-bible)]/25 active:scale-[0.95]'
                              : 'bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white/90 border border-white/[0.04] active:scale-[0.95]'
                          )}
                        >
                          {chapter}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {view === 'verses' && (
                  <motion.div
                    key="verses"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    {renderHeader(`${selectedBook.name} ${selectedChapter}`, () => setView('chapters'))}
                    <div className={cn('px-2 sm:px-4 pb-4 sm:pb-8 pt-1 sm:pt-2 max-h-[35vh] sm:max-h-[350px] overflow-y-auto grid gap-1.5 sm:gap-2 custom-scrollbar', gridCols)}>
                      {isLoadingVerses ? (
                        <div className="col-span-full py-8 sm:py-10 flex flex-col items-center gap-3">
                           <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[var(--accent-bible)] border-t-transparent rounded-full animate-spin" />
                           <span className="text-[10px] sm:text-xs text-white/30 animate-pulse">Carregando versículos...</span>
                        </div>
                      ) : (
                        Array.from({ length: verseCount }, (_, i) => i + 1).map((verse) => (
                          <button
                            key={verse}
                            onClick={() => handleVerseSelect(verse)}
                            className="h-10 sm:h-12 w-full flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white/90 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-[0.95] border border-white/[0.04]"
                          >
                            {verse}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer Quick Jump */}
            {view !== 'main' && (
              <div className="p-2 sm:p-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-center">
                 <button 
                  onClick={() => setView('main')}
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-[var(--accent-bible)] transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-white/[0.04]"
                 >
                   ← Voltar ao Menu
                 </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BiblicalMenu;
