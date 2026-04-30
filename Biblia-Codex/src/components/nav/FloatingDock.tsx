import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, BookOpen, Search, Heart, Settings } from 'lucide-react';
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
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'bible', icon: BookOpen, label: 'Bíblia' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'notes', icon: Heart, label: 'Notas' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < 100 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: isVisible ? 1 : 0.3 }}
      whileHover={{ opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      style={{ paddingBottom: 'max(var(--sab), 24px)' }}
    >
      <div className={cn('rounded-2xl px-2 py-2 transition-all duration-300', isVisible ? 'glass-strong' : 'glass')}>
        <div className="flex items-center gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'group relative flex h-12 w-12 items-center justify-center rounded-xl',
                  'cursor-pointer transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
                  isActive
                    ? 'text-[var(--accent-bible-contrast)]'
                    : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]'
                )}
                title={item.label}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
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
      </div>

      <motion.div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
        transition={{ delay: 0.1 }}
      >
        <div
          className="h-6 w-16 rounded-full"
          style={{
            background: 'linear-gradient(0deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};