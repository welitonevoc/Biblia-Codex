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

  const gridCols = isMobile ? 'grid-cols-4' : isTablet ? 'grid-cols-6' : 'grid-cols-8';
  const menuWidth = isMobile ? 'w-[calc(100vw-1rem)] max-w-[400px]' : 'w-[450px]';

  const renderHeader = (title: string, onBack: () => void) => (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <button 
        onClick={onBack}
        className="-ml-2 grid h-11 w-11 place-items-center rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Voltar"
      >
        <ChevronLeft size={20} />
      </button>
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      <button 
        onClick={onClose}
        className="-mr-2 grid h-11 w-11 place-items-center rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Fechar menu bíblico"
      >
        <X size={20} />
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
          className={cn('fixed bottom-24 left-1/2 z-50 -translate-x-1/2', menuWidth)}
          style={{ paddingBottom: 'max(var(--sab), 24px)' }}
        >
          <div className="premium-dock rounded-[32px] overflow-hidden border border-white/20 shadow-2xl backdrop-blur-3xl bg-white/5 dark:bg-black/40">
            <div className="relative overflow-hidden min-h-[300px]">
              <AnimatePresence mode="wait" initial={false}>
                {view === 'main' && (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-2 px-1">
                       <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-bible)]/70">Navegação</span>
                       <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Fechar menu bíblico"><X size={16}/></button>
                     </div>

                     <button
                       onClick={() => setView('typography')}
                       className="group w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                     >
                       <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
                           <Type size={20} />
                         </div>
                         <div className="text-left">
                           <p className="text-xs font-medium text-white/50">Aparência do Texto</p>
                           <p className="text-sm font-bold">Aa</p>
                         </div>
                       </div>
                       <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                     </button>

                     <button
                       onClick={() => setView('versions')}
                       className="group w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                     >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400">
                          <Globe size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-white/50">Versão da Bíblia</p>
                          <p className="text-sm font-bold truncate max-w-[180px]">{currentVersion?.name || 'Selecionar'}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    </button>

                    <button
                      onClick={() => setView('books')}
                      className="group w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
                          <BookMarked size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-white/50">Livro & Capítulo</p>
                          <p className="text-sm font-bold">{currentBook.name} {currentChapter}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70">Trocar</span>
                        <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
                      </div>
                    </button>

                    <div className="pt-2 grid grid-cols-2 gap-3">
                       <button 
                        onClick={() => { setSelectedBook(currentBook); setView('chapters'); }}
                        className="min-h-11 rounded-2xl bg-[var(--accent-bible)] p-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent-bible)]/30 hover:brightness-110 active:scale-95 transition-all"
                       >
                         Capítulos
                       </button>
                       <button 
                        onClick={() => { setSelectedBook(currentBook); setSelectedChapter(currentChapter); handleChapterSelect(currentChapter); }}
                        className="min-h-11 rounded-2xl bg-white/10 p-3 text-sm font-bold text-white border border-white/10 hover:bg-white/20 transition-all"
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
                    <div className="p-2 max-h-[350px] overflow-y-auto space-y-1 custom-scrollbar">
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
                              'w-full flex items-center justify-between p-4 rounded-2xl transition-all group',
                              isActive ? 'bg-[var(--accent-bible)] text-white' : 'hover:bg-white/5'
                            )}
                          >
                            <span className={cn('text-sm font-medium', isActive ? 'font-bold' : '')}>{version.name}</span>
                            {isActive ? <Check size={18} /> : <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-white/30" />}
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
                    
                    <div className="p-3 space-y-3">
                      {/* Typography Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView('typography')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-bible-surface border border-bible-border/50 hover:bg-bible-surface-strong transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-bible-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Type className="w-5 h-5 text-bible-accent" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-bible-text">Aparência do Texto</div>
                            <div className="text-[10px] text-bible-text-muted font-bold uppercase tracking-widest opacity-60">Fontes, Tamanho e Estilo</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-bible-text-muted" />
                      </motion.button>

                      {/* Search & Tabs */}
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input 
                          type="text" 
                          placeholder="Buscar livro..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)]/50 transition-all"
                        />
                      </div>

                      <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                        {['OT', 'NT'].map((testament) => (
                          <button
                            key={testament}
                            onClick={() => setSelectedTestament(testament as 'OT' | 'NT')}
                            className={cn(
                              'min-h-10 flex-1 rounded-lg py-1.5 text-xs font-bold transition-all',
                              selectedTestament === testament 
                                ? 'bg-[var(--accent-bible)] text-white shadow-md' 
                                : 'text-white/50 hover:text-white'
                            )}
                          >
                            {testament === 'OT' ? 'Velho Testamento' : 'Novo Testamento'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="px-2 pb-2 max-h-[300px] overflow-y-auto grid grid-cols-1 gap-1 custom-scrollbar">
                      {filteredBooks.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => handleBookSelect(book)}
                          className="flex min-h-11 items-center justify-between rounded-xl p-3 hover:bg-white/5 group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-[10px] font-black group-hover:bg-[var(--accent-bible)]/20 group-hover:text-[var(--accent-bible)] transition-colors">
                              {book.abbreviation}
                            </span>
                            <span className="text-sm font-medium">{book.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/30">{book.chapters} cap</span>
                            <ChevronRight size={16} className="text-white/20" />
                          </div>
                        </button>
                      ))}
                      {filteredBooks.length === 0 && (
                        <div className="py-10 text-center text-white/30 text-sm">Nenhum livro encontrado</div>
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
                    className="flex flex-col h-full p-4"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <button 
                        onClick={() => setView('books')}
                        className="grid h-11 w-11 place-items-center rounded-xl hover:bg-bible-surface transition-colors"
                        aria-label="Voltar"
                      >
                        <ChevronLeft className="w-5 h-5 text-bible-text" />
                      </button>
                      <h2 className="text-xl font-black text-bible-text tracking-tight">Aparência</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Tamanho da Fonte</span>
                          <span className="text-sm font-bold text-bible-accent">{config.fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-4 bg-bible-surface p-3 rounded-2xl border border-bible-border/30">
                          <button 
                            onClick={() => setFontSize(Math.max(12, config.fontSize - 1))}
                            className="grid h-11 w-11 place-items-center rounded-lg hover:bg-bible-accent/10 text-bible-text-muted hover:text-bible-accent transition-colors"
                            aria-label="Diminuir fonte"
                          >
                            <Minus className="w-4 h-4" />
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
                            className="grid h-11 w-11 place-items-center rounded-lg hover:bg-bible-accent/10 text-bible-text-muted hover:text-bible-accent transition-colors"
                            aria-label="Aumentar fonte"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Estilo da Fonte</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'serif', label: 'Serifada', icon: BookMarked },
                            { id: 'sans', label: 'Moderna', icon: Type },
                            { id: 'mono', label: 'Foco', icon: AlignLeft },
                          ].map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setFontPreference(style.id as any)}
                              className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                config.fontPreference === style.id
                                  ? "bg-bible-accent border-bible-accent text-white shadow-lg shadow-bible-accent/20"
                                  : "bg-bible-surface border-bible-border/50 text-bible-text-muted hover:border-bible-accent/30"
                              )}
                            >
                              <style.icon className="w-5 h-5" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">{style.label}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Spacing Controls */}
                      <section className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Entrelinha</span>
                          <div className="flex items-center gap-2 bg-bible-surface p-2 rounded-xl border border-bible-border/30">
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
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Espaçamento</span>
                          <div className="flex items-center gap-2 bg-bible-surface p-2 rounded-xl border border-bible-border/30">
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

                      {/* Display Toggles */}
                      <section className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Layout da Leitura</span>
                        <div className="space-y-2">
                          {[
                            { id: 'paragraphMode', label: 'Modo Parágrafo', desc: 'Agrupa versículos em blocos' },
                            { id: 'verseNumbers', label: 'Números de Versículo', desc: 'Exibe a numeração lateral' },
                            { id: 'wordsOfJesusRed', label: 'Palavras de Jesus em Vermelho', desc: 'Destaque especial para falas de Cristo' },
                          ].map((toggle) => (
                            <button
                              key={toggle.id}
                              onClick={() => toggleSetting('textDisplay', toggle.id as any)}
                              className="w-full flex items-center justify-between p-4 rounded-2xl bg-bible-surface/50 border border-bible-border/30 hover:bg-bible-surface transition-all group"
                            >
                              <div className="text-left">
                                <div className="text-sm font-bold text-bible-text">{toggle.label}</div>
                                <div className="text-[10px] text-bible-text-muted opacity-60">{toggle.desc}</div>
                              </div>
                              <div className={cn(
                                "w-10 h-6 rounded-full transition-all relative",
                                (settings.textDisplay as any)[toggle.id] ? "bg-bible-accent" : "bg-bible-text-muted/20"
                              )}>
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                  (settings.textDisplay as any)[toggle.id] ? "left-5" : "left-1"
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
                    <div className={cn('p-4 max-h-[350px] overflow-y-auto grid gap-2 custom-scrollbar', gridCols)}>
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                        <button
                          key={chapter}
                          onClick={() => handleChapterSelect(chapter)}
                          className={cn(
                            'h-12 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all',
                            chapter === currentChapter && selectedBook.id === currentBook.id
                              ? 'bg-[var(--accent-bible)] text-white shadow-glow'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 active:scale-90'
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
                    <div className={cn('px-4 pb-8 pt-2 max-h-[350px] overflow-y-auto grid gap-2 custom-scrollbar', gridCols)}>
                      {isLoadingVerses ? (
                        <div className="col-span-full py-10 flex flex-col items-center gap-3">
                           <div className="w-8 h-8 border-2 border-[var(--accent-bible)] border-t-transparent rounded-full animate-spin" />
                           <span className="text-xs text-white/30 animate-pulse">Carregando versículos...</span>
                        </div>
                      ) : (
                        Array.from({ length: verseCount }, (_, i) => i + 1).map((verse) => (
                          <button
                            key={verse}
                            onClick={() => handleVerseSelect(verse)}
                            className="h-12 w-full flex items-center justify-center rounded-xl bg-white/5 hover:bg-[var(--accent-bible)]/20 hover:text-[var(--accent-bible)] text-white/80 font-bold text-sm transition-all active:scale-90 border border-white/5"
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
              <div className="p-3 bg-white/5 border-t border-white/10 flex items-center justify-center gap-4">
                 <button 
                  onClick={() => setView('main')}
                  className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-[var(--accent-bible)] transition-colors"
                 >
                   Voltar ao Menu
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
