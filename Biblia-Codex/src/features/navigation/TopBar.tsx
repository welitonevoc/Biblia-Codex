import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { Menu, Search, Settings as SettingsIcon, ChevronDown, ChevronLeft, ChevronRight, BookOpen, Globe, Check, Play, Type } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

type ReadingMode = 'text' | 'audio' | 'both';

interface TopBarProps {
  currentBook: Book;
  currentChapter: number;
  onNavOpen: () => void;
  onSettingsOpen: () => void;
  onSearchOpen: () => void;
  onToggleSidebar: () => void;
  readingMode?: ReadingMode;
  onReadingModeChange?: (mode: ReadingMode) => void;
  hasAudio?: boolean;
  onNavigate?: (bookId: string, chapter: number) => void;
}

export const TopBar: React.FC<TopBarProps> = React.memo(({
  currentBook,
  currentChapter,
  onNavOpen,
  onSettingsOpen,
  onSearchOpen,
  onToggleSidebar,
  readingMode = 'text',
  onReadingModeChange,
  hasAudio = false,
  onNavigate,
}) => {
  const { availableVersions, currentVersion, selectVersion, config, settings, toggleStrongs, toggleSetting, setAccentColor } = useAppContext();
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const [showReadingMenu, setShowReadingMenu] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);
  const readingMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionMenuRef.current && !versionMenuRef.current.contains(event.target as Node)) {
        setShowVersionMenu(false);
      }
      if (readingMenuRef.current && !readingMenuRef.current.contains(event.target as Node)) {
        setShowReadingMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cycleReadingMode = () => {
    if (!onReadingModeChange || !hasAudio) return;
    const modes: ReadingMode[] = ['text', 'audio', 'both'];
    const currentIndex = modes.indexOf(readingMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onReadingModeChange(modes[nextIndex]);
  };

  const getReadingModeIcon = () => {
    if (!hasAudio) return <BookOpen className="h-4 w-4" />;
    switch (readingMode) {
      case 'text': return <BookOpen className="h-4 w-4" />;
      case 'audio': return <Play className="h-4 w-4" />;
      case 'both': return (
        <div className="flex items-center gap-0.5">
          <BookOpen className="h-3.5 w-3.5" />
          <Play className="h-3.5 w-3.5" />
        </div>
      );
    }
  };

  const getReadingModeLabel = () => {
    if (!hasAudio) return 'Texto';
    switch (readingMode) {
      case 'text': return 'Texto';
      case 'audio': return 'Áudio';
      case 'both': return 'Ambos';
    }
  };

  const readingQuickOptions = [
    {
      key: 'strongs' as const,
      label: 'Strong e Léxico',
      active: settings?.studyTools?.strongsTags,
      onClick: toggleStrongs,
    },
    {
      key: 'paragraphMode' as const,
      label: 'Versículo em parágrafo',
      active: settings?.textDisplay?.paragraphMode,
      onClick: () => toggleSetting('textDisplay', 'paragraphMode'),
    },
    {
      key: 'verseNumbers' as const,
      label: 'Números dos versículos',
      active: settings?.textDisplay?.verseNumbers,
      onClick: () => toggleSetting('textDisplay', 'verseNumbers'),
    },
    {
      key: 'wordsOfJesusRed' as const,
      label: 'Palavras de Jesus em vermelho',
      active: settings?.textDisplay?.wordsOfJesusRed,
      onClick: () => toggleSetting('textDisplay', 'wordsOfJesusRed'),
    },
    {
      key: 'chapterTitles' as const,
      label: 'Títulos de capítulo',
      active: settings?.textDisplay?.chapterTitles,
      onClick: () => toggleSetting('textDisplay', 'chapterTitles'),
    },
    {
      key: 'footnotes' as const,
      label: 'Notas de rodapé',
      active: settings?.textDisplay?.footnotes,
      onClick: () => toggleSetting('textDisplay', 'footnotes'),
    },
  ];

  const accentColors = ['#5a5a40', '#8c6d46', '#3f6b5b', '#7a3e3e', '#3b5f8a', '#5a6b8a'];

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        paddingTop: 'var(--sat)',
        background: 'linear-gradient(180deg, var(--bg-bible) 0%, var(--bg-bible) 60%, transparent 100%)'
      }}
    >
      <div className="mx-auto flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 md:h-16 md:flex-nowrap md:px-6 lg:px-8">

        {/* Left: Menu + Version Selector */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "bg-[var(--surface-1)] border border-[var(--border-bible)]",
              "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]",
              "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
              "transition-all duration-200 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] focus-visible:ring-offset-2"
            )}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          {/* Version Selector */}
          <div className="relative min-w-0 max-w-[min(52vw,14rem)] sm:max-w-[18rem]" ref={versionMenuRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowVersionMenu(!showVersionMenu)}
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-xl px-3 py-2",
                "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                "text-[var(--text-bible)] text-sm font-medium",
                "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
                "transition-all duration-200 cursor-pointer"
              )}
            >
              <Globe className="h-4 w-4 shrink-0 text-[var(--accent-bible)]" />
              <span>{currentVersion?.name || 'Versão'}</span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 shrink-0 text-[var(--text-bible-muted)] transition-transform duration-200",
                showVersionMenu && "rotate-180"
              )} />
            </motion.button>

            <AnimatePresence>
              {showVersionMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    "absolute left-0 top-full mt-2 z-50",
                    "w-48 rounded-xl border border-[var(--border-bible)]",
                    "bg-[var(--surface-0)] shadow-lg shadow-black/10 overflow-hidden"
                  )}
                >
                  <div className="p-1">
                    {availableVersions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => {
                          selectVersion(version);
                          setShowVersionMenu(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm",
                          "text-[var(--text-bible)] hover:bg-[var(--surface-hover)]",
                          "transition-colors duration-150"
                        )}
                      >
                        <span>{version.id}</span>
                        {currentVersion?.id === version.id && (
                          <Check className="h-4 w-4 text-[var(--accent-bible)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Navigation (only when reading) */}
        {onNavigate && (
          <>
            <div className="order-3 flex w-full md:hidden">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onNavOpen}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3",
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                  "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
                  "transition-all duration-200 cursor-pointer"
                )}
                aria-label={`Selecionar livro e capítulo. Atual: ${currentBook.name} ${currentChapter}`}
              >
                <div className="min-w-0 text-left">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-bible)]">
                    Livro e capítulo
                  </span>
                  <span className="block truncate text-sm font-bold text-[var(--text-bible)]">
                    {currentBook.name} {currentChapter}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-bible-muted)]">
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.button>
            </div>

            <div className="hidden md:flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (currentChapter > 1) {
                  onNavigate(currentBook.id, currentChapter - 1);
                } else {
                  const bookIdx = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
                  if (bookIdx > 0) {
                    onNavigate(BIBLE_BOOKS[bookIdx - 1].id, BIBLE_BOOKS[bookIdx - 1].chapters);
                  }
                }
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)]",
                "hover:bg-[var(--surface-1)] transition-all duration-200"
              )}
              title="Capítulo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavOpen}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-xl",
                "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
                "transition-all duration-200 cursor-pointer"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-bible)]">
                Lendo
              </span>
              <span className="text-sm font-bold text-[var(--text-bible)]">
                {currentBook.name} {currentChapter}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (currentChapter < currentBook.chapters) {
                  onNavigate(currentBook.id, currentChapter + 1);
                } else {
                  const bookIdx = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
                  if (bookIdx < BIBLE_BOOKS.length - 1) {
                    onNavigate(BIBLE_BOOKS[bookIdx + 1].id, 1);
                  }
                }
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)]",
                "hover:bg-[var(--surface-1)] transition-all duration-200"
              )}
              title="Próximo capítulo"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>

            <div className="relative flex items-center" ref={readingMenuRef}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowReadingMenu((prev) => !prev)}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-xl px-2.5",
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                  "text-[var(--text-bible)] hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
                  "transition-all duration-200 cursor-pointer"
                )}
                title="Ajustes rápidos de leitura"
                aria-label="Ajustes rápidos de leitura"
              >
                <Type className="h-4 w-4 mr-1" />
                <span className="text-xs font-bold tracking-tight">Aa</span>
              </motion.button>

              <AnimatePresence>
                {showReadingMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className={cn(
                      "absolute top-full mt-2 right-0 z-50 w-72 rounded-xl border border-[var(--border-bible)]",
                      "bg-[var(--surface-0)] shadow-lg shadow-black/10 p-2"
                    )}
                  >
                    <div className="px-2 pt-1 pb-2">
                      <div className="text-[11px] uppercase font-semibold tracking-wider text-[var(--accent-bible)]">Ajustes de leitura</div>
                    </div>
                    <div className="space-y-1">
                      {readingQuickOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={option.onClick}
                          className={cn(
                            "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            option.active
                              ? "bg-[var(--accent-bible)]/12 text-[var(--text-bible)]"
                              : "text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-bible)]"
                          )}
                        >
                          <span>{option.label}</span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              option.active
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-[var(--surface-2)] text-[var(--text-bible-muted)]"
                            )}
                          >
                            {option.active ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 border-t border-[var(--border-bible)] pt-2">
                      <div className="px-2 pb-1 text-[11px] font-semibold text-[var(--text-bible-muted)]">Cor de destaque</div>
                      <div className="flex flex-wrap gap-2 px-2 pb-1">
                        {accentColors.map((color) => {
                          const active = (config.accentColor || '').toLowerCase() === color.toLowerCase();
                          return (
                            <button
                              key={color}
                              onClick={() => setAccentColor(color)}
                              className={cn(
                                "h-6 w-6 rounded-full border-2 transition-all",
                                active ? "border-[var(--text-bible)] scale-110" : "border-transparent hover:scale-105"
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`Definir cor de destaque ${color}`}
                              title={color}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-2 border-t border-[var(--border-bible)] pt-2">
                      <button
                        onClick={() => {
                          setShowReadingMenu(false);
                          onSettingsOpen();
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--accent-bible)] hover:bg-[var(--surface-hover)]"
                      >
                        Abrir configurações completas
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          </>
        )}

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Reading Mode Toggle (if has audio) */}
          {hasAudio && onReadingModeChange && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleReadingMode}
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2",
                "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                "text-[var(--text-bible)] text-xs font-medium",
                "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
                "transition-all duration-200 cursor-pointer"
              )}
            >
              {getReadingModeIcon()}
              <span>{getReadingModeLabel()}</span>
            </motion.button>
          )}

          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchOpen}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "bg-[var(--surface-1)] border border-[var(--border-bible)]",
              "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]",
              "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30",
              "transition-all duration-200 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] focus-visible:ring-offset-2"
            )}
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettingsOpen}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]",
              "hover:bg-[var(--surface-1)] transition-all duration-200 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] focus-visible:ring-offset-2"
            )}
            aria-label="Configurações"
          >
            <SettingsIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--border-bible) 50%, transparent 100%)'
        }}
      />
    </header>
  );
});
