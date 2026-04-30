import React from 'react';
import { motion } from 'motion/react';
import { Home, BookOpen, Search, Settings, Heart } from 'lucide-react';
import { useAppContext } from '../../app/AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AsymmetricThumbBarProps {
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

export const AsymmetricThumbBar: React.FC<AsymmetricThumbBarProps> = ({ activeTab, onTabChange }) => {
  const { settings } = useAppContext();

  return (
    <motion.div
      initial={settings.navigation.navAnimation ? { x: -60 } : {}}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-1/2 z-50 -translate-y-1/2"
      style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      <div className="flex flex-col gap-1.5 rounded-r-2xl glass-panel px-1.5 py-2.5 border-r border-[var(--border-bible)]/50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]',
                isActive 
                  ? 'bg-[var(--accent-bible)] text-white shadow-lg shadow-[var(--accent-bible)]/20' 
                  : 'text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] hover:bg-[var(--surface-1)]'
              )}
              aria-label={item.label}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};