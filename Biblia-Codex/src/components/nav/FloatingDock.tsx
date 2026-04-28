import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, Search, Heart, Settings, User, Menu, Globe, BookMarked, Type, AlignLeft, Loader2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'menu', icon: Menu, label: 'Menu' },
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'profile', icon: User, label: 'Perfil' },
  { id: 'bible', icon: BookOpen, label: 'BíblIA' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'notes', icon: Heart, label: 'Notas' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

const bibleSubMenu = [
  { id: 'version', icon: Globe, label: 'Versão', value: 'ARA' },
  { id: 'book', icon: BookMarked, label: 'Livro', value: 'Gênesis' },
  { id: 'font', icon: Type, label: 'Aa', value: '18px' },
  { id: 'text', icon: AlignLeft, label: 'Texto', value: 'Parágrafo' },
  { id: 'search', icon: Search, label: 'Lupa', value: '' },
  { id: 'menu2', icon: ChevronRight, label: 'Menu', value: '' },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showBibleMenu, setShowBibleMenu] = useState(false);
  const bibleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.95
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
      }}
      className="fixed top-5 left-1/2 z-50 -translate-x-1/2"
      style={{ paddingTop: 'max(var(--sab), 20px)' }}
    >
      <div 
        className="glass-strong rounded-2xl px-2 py-2"
        style={{
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex items-center gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25
                }}
                onClick={() => {
                if (item.id === 'bible') {
                  setShowBibleMenu(!showBibleMenu);
                } else {
                  onTabChange(item.id);
                }
              }}
                className={cn(
                  'group relative flex h-12 w-12 items-center justify-center rounded-xl',
                  'cursor-pointer transition-all duration-300 ease-premium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] focus-visible:ring-offset-2',
                  isActive 
                    ? 'text-[var(--accent-bible-contrast)]' 
                    : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]'
                )}
                title={item.label}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 500,
                    damping: 25
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-[var(--accent-bible)] to-[var(--accent-bible-strong)]"
                    initial={false}
                    transition={{ 
                      type: 'spring',
                      stiffness: 500,
                      damping: 35
                    }}
                    style={{ zIndex: -1 }}
                  />
                )}
                
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0, 
                    y: isActive ? 0 : 4 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-1 w-1 rounded-full bg-[var(--accent-bible)]" />
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Menu em cascata da bíblIA */}
      <AnimatePresence>
        {showBibleMenu && (
          <motion.div
            ref={bibleMenuRef}
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            className="absolute left-0 top-0 -translate-x-full pr-2"
          >
            <div 
              className="glass-strong rounded-2xl px-2 py-2"
              style={{
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {bibleSubMenu.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setShowBibleMenu(false)}
                      className={cn(
                        'group relative flex h-12 w-12 items-center justify-center rounded-xl',
                        'cursor-pointer transition-all duration-300',
                        'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]'
                      )}
                      title={item.label}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          scale: isVisible ? 1 : 0,
          y: isVisible ? 0 : 10
        }}
        transition={{ delay: 0.1 }}
      >
        <div 
          className="h-6 w-16 rounded-full"
          style={{
            background: 'linear-gradient(0deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      </motion.div>
    </motion.div>
  );
};