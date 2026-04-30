import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, Search, Heart, Settings, BookHeart, Library, MessageSquarePlus, BookA, MoreHorizontal, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBreakpoint } from '../../hooks/useMediaQuery';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'bible', icon: BookOpen, label: 'Bíblia' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'notes', icon: Heart, label: 'Notas' },
  { id: 'encyclopedia', icon: BookA, label: 'Enciclopédia' },
  { id: 'dictionaries', icon: Library, label: 'Dicionário' },
  { id: 'commentary', icon: MessageSquarePlus, label: 'Comentário' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

const mobilePriorityIds = ['home', 'bible', 'search', 'settings'];

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMore(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setShowMore(false);
  }, [isOpen]);

  const visibleItems = isMobile
    ? navItems.filter(item => mobilePriorityIds.includes(item.id))
    : isTablet
      ? navItems.slice(0, 6)
      : navItems;

  const extraItems = isMobile
    ? navItems.filter(item => !mobilePriorityIds.includes(item.id))
    : [];

  const buttonSize = isMobile ? 'h-11 w-11' : 'h-12 w-12';
  const iconSize = isMobile ? 18 : 20;
  const gapSize = isMobile ? 'gap-0.5' : 'gap-1';
  const containerPadding = isMobile ? 'px-1.5 py-1.5' : 'px-2 py-2';

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
    setShowMore(false);
  };

  return (
    <div
      ref={dockRef}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center"
      style={{ paddingBottom: 'max(var(--sab), 24px)' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.6 }}
            className={cn('mb-3 rounded-2xl glass-strong shadow-xl border border-[var(--border-bible)]', containerPadding)}
          >
            <div className={cn('flex items-center', gapSize)}>
              <AnimatePresence mode="popLayout">
                {visibleItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        'group relative flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
                        buttonSize,
                        isActive
                          ? 'text-white'
                          : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]'
                      )}
                      title={item.label}
                    >
                      <motion.div
                        animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        <Icon size={iconSize} strokeWidth={1.5} />
                      </motion.div>
                      {isActive && (
                        <motion.div
                          layoutId="dock-active-bg"
                          className="absolute inset-0 rounded-xl bg-gradient-to-b from-[var(--accent-bible)] to-[var(--accent-bible-strong)]"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          style={{ zIndex: -1 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {isMobile && extraItems.length > 0 && (
                <div className="relative">
                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: visibleItems.length * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => setShowMore(!showMore)}
                    className={cn(
                      'group relative flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
                      buttonSize,
                      showMore
                        ? 'text-white'
                        : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]'
                    )}
                    title="Mais opções"
                  >
                    <motion.div
                      animate={{ scale: showMore ? 1.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <MoreHorizontal size={iconSize} strokeWidth={1.5} />
                    </motion.div>
                    {showMore && (
                      <motion.div
                        layoutId="dock-active-more"
                        className="absolute inset-0 rounded-xl bg-gradient-to-b from-[var(--accent-bible)] to-[var(--accent-bible-strong)]"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-strong rounded-xl px-2 py-2 shadow-xl border border-[var(--border-bible)]"
                      >
                        <div className={cn('flex items-center', gapSize)}>
                          {extraItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <motion.button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={cn(
                                  'group relative flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
                                  buttonSize,
                                  isActive
                                    ? 'text-white'
                                    : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]'
                                )}
                                title={item.label}
                              >
                                <motion.div
                                  animate={{ scale: isActive ? 1.1 : 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                >
                                  <Icon size={iconSize} strokeWidth={1.5} />
                                </motion.div>
                                {isActive && (
                                  <motion.div
                                    layoutId={`dock-extra-${item.id}`}
                                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-[var(--accent-bible)] to-[var(--accent-bible-strong)]"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    style={{ zIndex: -1 }}
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!isMobile && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center justify-center rounded-xl cursor-pointer transition-all ml-1',
                    'h-8 w-8 text-[var(--text-bible-subtle)] hover:text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
                  )}
                  title="Fechar"
                >
                  <X size={14} strokeWidth={2} />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative rounded-full cursor-pointer transition-all',
          'flex items-center justify-center',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
          isOpen ? 'h-3 w-3' : 'h-3 w-12'
        )}
        style={{
          background: isOpen
            ? 'var(--accent-bible)'
            : 'linear-gradient(0deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: isOpen
            ? '0 0 8px var(--accent-bible)'
            : '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
        }}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--accent-bible)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          />
        )}
      </motion.button>
    </div>
  );
};
