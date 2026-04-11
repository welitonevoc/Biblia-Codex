import React from 'react';
import { motion } from 'motion/react';
import { Home, BookOpen, Search, Settings, Heart } from 'lucide-react';
import { useAppContext } from '../../AppContext';
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
      <div className="flex flex-col gap-1 rounded-r border-r border-bible-border bg-bible-bg/95 px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded transition-colors',
                isActive 
                  ? 'bg-bible-accent/10 text-bible-accent' 
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