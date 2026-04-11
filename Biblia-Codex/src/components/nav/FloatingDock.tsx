import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, BookOpen, Search, Settings, Heart } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'bible', icon: BookOpen, label: 'Bíbia' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'notes', icon: Heart, label: 'Notas' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange }) => {
  const { settings } = useAppContext();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
      initial={settings.navigation.navAnimation ? { y: 60 } : {}}
      animate={{ y: isVisible ? 0 : 80, opacity: isVisible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      style={{ paddingBottom: 'var(--sab)' }}
    >
      <div className="flex items-center gap-1 rounded-full border border-bible-border bg-bible-bg/95 backdrop-blur px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                isActive 
                  ? 'bg-bible-accent text-bible-bg' 
                  : 'text-bible-text-muted hover:text-bible-text hover:bg-bible-surface'
              )}
              title={item.label}
            >
              <Icon size={18} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};