import React from 'react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { Menu, Search, Settings as SettingsIcon, ChevronDown, ChevronLeft, ChevronRight, BookOpen, Globe, Check, Sparkles, Play } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

function cn(...inputs: (string | false | null | undefined)[]) {
  return clsx(inputs);
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

export const TopBar: React.FC<TopBarProps> = ({
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
  const { availableVersions, currentVersion, selectVersion } = useAppContext();
  const [showVersionMenu, setShowVersionMenu] = React.useState(false);

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
      case 'text':
        return <BookOpen className="h-4 w-4" />;
      case 'audio':
        return <Play className="h-4 w-4" />;
      case 'both':
        return (
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

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl bg-bible-bg/70 dark:bg-bible-bg/80 border-b border-bible-border/50"
      style={{ paddingTop: 'var(--sat)' }}
    >
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-4 md:h-16">

        {/* Left: menu toggle */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="premium-icon-button"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Center: Logo + Current Book/Chapter */}
        <div className="flex items-center gap-2.5">
          {onNavigate ? (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                className="p-1.5 rounded-lg hover:bg-bible-surface transition-colors"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4 text-bible-accent" />
              </motion.button>
              <button
                onClick={onNavOpen}
                className="flex flex-col items-center min-w-[100px]"
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-bible-accent">Lendo agora</span>
                <span className="text-sm font-bold text-bible-text">{currentBook.name} {currentChapter}</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                className="p-1.5 rounded-lg hover:bg-bible-surface transition-colors"
                title="Próximo"
              >
                <ChevronRight className="w-4 h-4 text-bible-accent" />
              </motion.button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2.5">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-bible-accent to-bible-accent-strong text-bible-bg shadow-lg">
                  <BookOpen className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-bible-bg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted">Bíblia</span>
                  <Sparkles className="w-3 h-3 text-bible-accent" />
                </div>
                <div className="text-sm font-bold text-bible-text">Codex</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Reading Mode + Version Selector */}
          <div className="relative">
            <div className="flex items-center gap-1">
              {/* Reading Mode Button */}
              {onReadingModeChange && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cycleReadingMode}
                  className={cn(
                    "hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                    hasAudio
                      ? "border-bible-border bg-bible-surface hover:border-bible-accent/30"
                      : "border-bible-border/30 bg-bible-surface/50 opacity-60 cursor-not-allowed"
                  )}
                  title={hasAudio ? getReadingModeLabel() : "Áudio não disponível"}
                  disabled={!hasAudio}
                >
                  {getReadingModeIcon()}
                  <span className="text-bible-text">{getReadingModeLabel()}</span>
                </motion.button>
              )}

              {/* Version Selector */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVersionMenu(!showVersionMenu)}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-bible-border bg-bible-surface hover:border-bible-accent/30 transition-all"
              >
                <Globe className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="text-bible-text">{currentVersion?.abbreviation || 'Bíblia'}</span>
                <ChevronDown
                  className={cn("h-3 w-3 text-bible-text-muted transition-transform duration-200", showVersionMenu && "rotate-180")}
                  strokeWidth={2.5}
                />
              </motion.button>
            </div>

            <AnimatePresence>
              {showVersionMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowVersionMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-panel absolute right-0 z-50 mt-2 w-60 overflow-hidden p-2 shadow-xl"
                  >
                    <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-bible-border/50">
                      <span className="text-xs font-bold text-bible-text">Versões</span>
                      <span className="text-[10px] font-medium text-bible-text-muted">{availableVersions.length} disponíveis</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {availableVersions.map((version) => (
                        <motion.button
                          key={version.id}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { selectVersion(version); setShowVersionMenu(false); }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150",
                            currentVersion?.id === version.id
                              ? "bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white font-semibold shadow-md"
                              : "hover:bg-bible-surface text-bible-text"
                          )}
                        >
                          <div>
                            <div className="font-medium">{version.name}</div>
                            <div className={cn(
                              "text-[10px]",
                              currentVersion?.id === version.id ? "text-white/80" : "text-bible-text-muted"
                            )}>
                              {version.abbreviation}
                            </div>
                          </div>
                          {currentVersion?.id === version.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Check className="h-4 w-4" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchOpen}
            className="premium-icon-button"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 30 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettingsOpen}
            className="premium-icon-button"
            aria-label="Configurações"
          >
            <SettingsIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Gradient separator */}
      <div className="divider-bible" />
    </header>
  );
};
