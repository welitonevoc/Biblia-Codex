import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Home, BookOpen, Search, Heart, Settings, Library, MessageSquarePlus, BookA, ChevronRight, X, Sparkles, ChevronLeft } from 'lucide-react';
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
  const [showExtra, setShowExtra] = useState(false);
  const { isSmallMobile, isMobile, isTablet } = useBreakpoint();
  const dockRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowExtra(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setShowExtra(false);
  }, [isOpen]);

  // Check scrollability for extra items
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    if (showExtra) {
      checkScroll();
      // Add a small delay to ensure DOM is updated
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showExtra]);

  const visibleItems = isMobile
    ? navItems.filter(item => mobilePriorityIds.includes(item.id))
    : isTablet
      ? navItems.slice(0, 6)
      : navItems;

  const extraItems = isMobile
    ? navItems.filter(item => !mobilePriorityIds.includes(item.id))
    : [];

  const buttonSize = isSmallMobile ? 'h-11 w-11' : isMobile ? 'h-12 w-12' : 'h-14 w-14';
  const iconSize = isSmallMobile ? 18 : isMobile ? 20 : 22;
  const gapSize = isSmallMobile ? 'gap-0.5' : isMobile ? 'gap-1' : 'gap-2';
  const containerPadding = isSmallMobile ? 'px-1 py-1' : isMobile ? 'px-2 py-2' : 'px-3 py-3';

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
    setShowExtra(false);
  };

  const renderNavItem = (item: typeof navItems[0], index: number, extra = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <motion.button
        key={item.id}
        initial={extra ? { opacity: 0, x: 20 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, [extra ? 'x' : 'y']: 0 }}
        exit={{ opacity: 0, [extra ? 'x' : 'y']: 20 }}
        transition={{ 
          delay: index * 0.05, 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          mass: 0.8
        }}
        onClick={() => handleTabChange(item.id)}
        className={cn(
          'group relative flex shrink-0 items-center justify-center rounded-2xl cursor-pointer transition-all duration-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
          buttonSize,
          isActive
            ? 'text-white'
            : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] hover:bg-[var(--surface-1)]/50'
        )}
        title={item.label}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative z-10 flex flex-col items-center gap-1">
          <Icon size={iconSize} strokeWidth={isActive ? 2 : 1.5} className="transition-all duration-300" />
          {isActive && !isMobile && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-bold uppercase tracking-tighter"
            >
              {item.label}
            </motion.span>
          )}
        </div>
        
        {isActive && (
          <motion.div
            layoutId={extra ? `dock-extra-bg` : 'dock-active-bg'}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-strong-bible)] shadow-lg shadow-[var(--accent-bible)]/40"
            initial={false}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ zIndex: 0 }}
          />
        )}
        
        {!isActive && (
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface-1)]/80 -z-10" />
        )}
      </motion.button>
    );
  };

  return (
    <div
      ref={dockRef}
      className="fixed bottom-4 left-1/2 z-50 flex w-full max-w-fit -translate-x-1/2 flex-col items-center px-2 sm:bottom-6 sm:px-4"
      style={{ paddingBottom: 'max(var(--sab), 24px)' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
            className={cn(
              'mb-4 rounded-[32px] premium-dock border border-white/20 dark:border-white/10 overflow-hidden',
              containerPadding
            )}
          >
            <div className={cn('flex items-center justify-center', gapSize)}>
              <AnimatePresence mode="popLayout">
                {visibleItems.map((item, index) => renderNavItem(item, index))}
              </AnimatePresence>

              {isMobile && extraItems.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowExtra(!showExtra)}
                  className={cn(
                    'group relative flex shrink-0 items-center justify-center rounded-2xl cursor-pointer transition-all duration-500',
                    buttonSize,
                    showExtra
                      ? 'text-white'
                      : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] bg-[var(--surface-1)]/30'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: showExtra ? 180 : 0, scale: showExtra ? 1.2 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <ChevronRight size={iconSize} strokeWidth={2.5} />
                  </motion.div>
                  {showExtra && (
                    <motion.div
                      layoutId="dock-extra-toggle-bg"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-strong-bible)] shadow-lg shadow-[var(--accent-bible)]/40 -z-10"
                    />
                  )}
                </motion.button>
              )}

              {!isMobile && (
                <div className="w-[1px] h-8 bg-white/10 mx-1" />
              )}

              {!isMobile && (
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-xl cursor-pointer transition-all ml-1',
                    'h-10 w-10 text-[var(--text-bible-subtle)]'
                  )}
                >
                  <X size={18} strokeWidth={2.5} />
                </motion.button>
              )}
            </div>

            <AnimatePresence>
               {showExtra && extraItems.length > 0 && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                   className="mt-3 pt-3 border-t border-white/10"
                 >
                    <div className="relative group/extra">
                      {/* Left Gradient/Indicator */}
                      <AnimatePresence>
                        {canScrollLeft && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-r from-[var(--surface-1)] to-transparent pointer-events-none flex items-center justify-start"
                          >
                            <ChevronLeft size={16} className="text-[var(--accent-bible)] ml-1" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div 
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 px-1 scroll-smooth"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        <div className="flex items-center gap-2 min-w-max">
                          {extraItems.map((item, index) => renderNavItem(item, index, true))}
                        </div>
                      </div>

                      {/* Right Gradient/Indicator */}
                      <AnimatePresence>
                        {canScrollRight && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-0 top-0 bottom-0 w-12 z-20 bg-gradient-to-l from-[var(--surface-1)] to-transparent pointer-events-none flex items-center justify-end"
                          >
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ChevronRight size={20} className="text-[var(--accent-bible)] mr-1 drop-shadow-glow" />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative rounded-full cursor-pointer overflow-hidden',
          'flex items-center justify-center',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-bible)]/30',
          'h-14 w-14 shadow-2xl transition-all duration-500'
        )}
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: isOpen
            ? 'var(--accent-bible)'
            : 'rgba(var(--accent-bible-rgb), 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(var(--accent-bible-rgb), 0.2)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <X className="text-white" size={24} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="relative flex items-center justify-center"
            >
              <Sparkles className="text-[var(--accent-bible)]" size={24} strokeWidth={2} />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-[var(--accent-bible)]/20 rounded-full blur-md"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
