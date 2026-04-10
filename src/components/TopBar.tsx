import React from 'react';
import { Book } from '../types';
import { Menu, Search, Settings as SettingsIcon, ChevronDown, BookOpen, Globe, Check, Sparkles } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  currentBook: Book;
  currentChapter: number;
  onNavOpen: () => void;
  onSettingsOpen: () => void;
  onSearchOpen: () => void;
  onToggleSidebar: () => void;
}

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

export const TopBar: React.FC<TopBarProps> = ({
  currentBook,
  currentChapter,
  onNavOpen,
  onSettingsOpen,
  onSearchOpen,
  onToggleSidebar
}) => {
  const { availableVersions, currentVersion, selectVersion } = useAppContext();
  const [showVersionMenu, setShowVersionMenu] = React.useState(false);

  return (
    <header 
      className="app-frame sticky top-0 z-50 px-2 pb-2 sm:px-4 sm:pb-3 md:px-6"
      style={{ paddingTop: 'var(--sat)' }}
    >
      <div className="premium-card mx-auto flex min-h-[64px] max-w-[1320px] items-center justify-between gap-1.5 rounded-[22px] px-2 py-2 sm:min-h-[78px] sm:gap-3 sm:rounded-[30px] sm:px-3 sm:py-3 md:px-5">
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onToggleSidebar} className="premium-icon-button rounded-2xl">
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-bible-accent text-bible-bg shadow-[0_18px_34px_-22px_rgba(var(--accent-bible-rgb),0.9)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="ui-text text-[11px] font-extrabold uppercase tracking-[0.24em] text-bible-text/45">Bíblia Codex</div>
              <div className="font-display text-lg font-semibold tracking-tight text-bible-text md:text-2xl">Leitura premium</div>
            </div>
          </div>
        </div>

        <button
          onClick={onNavOpen}
          className="premium-card-soft flex min-h-[52px] min-w-0 flex-1 items-center justify-start gap-2 sm:gap-3 rounded-[20px] sm:rounded-[24px] px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all hover:border-bible-accent/25 md:max-w-[360px]"
        >
          <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-bible-accent/10 text-bible-accent md:flex">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="ui-text text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] sm:tracking-[0.22em] text-bible-text/40">Posição Atual</div>
            <div className="truncate font-display text-[1.1rem] font-semibold leading-tight tracking-tight text-bible-text sm:text-lg md:text-2xl">
              {currentBook.name} {currentChapter}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-bible-accent/70 mt-0.5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowVersionMenu(!showVersionMenu)}
              className="premium-chip hidden md:flex"
            >
              <Globe className="h-4 w-4" />
              <span className="ui-text text-[11px] font-extrabold uppercase tracking-[0.18em]">
                {currentVersion?.abbreviation || 'Bíblia'}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showVersionMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showVersionMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowVersionMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="premium-card absolute right-0 z-50 mt-3 w-[min(90vw,18rem)] rounded-[24px] p-2"
                  >
                    <div className="premium-section-title px-3 py-2 opacity-80">Versões Instaladas</div>
                    <div className="premium-scroll max-h-72 overflow-y-auto">
                      {availableVersions.map((version) => (
                        <button
                          key={version.id}
                          onClick={() => {
                            selectVersion(version);
                            setShowVersionMenu(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left transition-all",
                            currentVersion?.id === version.id
                              ? "bg-bible-accent text-bible-bg"
                              : "hover:bg-bible-accent/8 text-bible-text"
                          )}
                        >
                          <span className="ui-text text-sm font-bold">{version.name}</span>
                          {currentVersion?.id === version.id && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onSearchOpen} className="premium-icon-button rounded-2xl sm:inline-flex">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={onSettingsOpen} className="premium-icon-button rounded-2xl">
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
