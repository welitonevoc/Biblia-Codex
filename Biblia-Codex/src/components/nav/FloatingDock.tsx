import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, BookOpen, Search, Heart, Settings, User, Menu, 
  Bookmark, Book, Map, Link2, Library, Calendar,
  MessageSquare, MapPin, Languages, FileText, GraduationCap,
  Sparkles, Palette, Volume2, Database, HelpCircle, ChevronRight,
  X, BookMarked
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  submenu?: MenuItem[];
}

const mainItems: MenuItem[] = [
  { id: 'home', icon: Home, label: 'Início' },
  { 
    id: 'bible', 
    icon: BookOpen, 
    label: 'Bíbia',
    submenu: [
      { id: 'version', icon: BookOpen, label: 'Versão' },
      { id: 'books', icon: BookMarked, label: 'Livros' },
      { id: 'typography', icon: FileText, label: 'Aa' },
    ]
  },
  { id: 'devotional', icon: Calendar, label: 'Devocional' },
  { id: 'notes', icon: Heart, label: 'Notas' },
  { id: 'bookmarks', icon: Bookmark, label: 'Marcadores' },
  { id: 'highlights', icon: Book, label: 'Destaques' },
  { id: 'library', icon: Library, label: 'Biblioteca' },
  { id: 'reading-plans', icon: Calendar, label: 'Planos' },
  { id: 'dictionaries', icon: Languages, label: 'Dicionários' },
  { id: 'commentary', icon: MessageSquare, label: 'Comentários' },
  { id: 'maps', icon: Map, label: 'Mapas' },
  { id: 'xrefs', icon: Link2, label: 'Refs. Cruzadas' },
  { id: 'books-nav', icon: BookMarked, label: 'Livros' },
  { id: 'ebd', icon: GraduationCap, label: 'EBD' },
  { id: 'study', icon: Sparkles, label: 'Estudo' },
  { id: 'ai-assistant', icon: Sparkles, label: 'Assistente IA' },
];

const configItems: MenuItem[] = [
  { id: 'settings', icon: Settings, label: 'Configurações' },
  { id: 'profile', icon: User, label: 'Perfil' },
  { id: 'appearance', icon: Palette, label: 'Aparência' },
  { id: 'tts', icon: Volume2, label: 'TTS' },
  { id: 'modules', icon: Database, label: 'Módulos' },
  { id: 'support', icon: HelpCircle, label: 'Suporte' },
];

const navItems = [
  { id: 'menu', icon: Menu, label: 'Menu' },
  { id: 'home', icon: Home, label: 'Início' },
  { id: 'bible', icon: BookOpen, label: 'Bíbia' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'notes', icon: Heart, label: 'Notas' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [menuHistory, setMenuHistory] = useState<MenuItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < 100 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setMenuHistory([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (item: MenuItem) => {
    if (item.submenu && item.submenu.length > 0) {
      setMenuHistory(prev => [...prev, item]);
    } else {
      onTabChange(item.id);
      setShowMenu(false);
      setMenuHistory([]);
    }
  };

  const handleBack = () => {
    setMenuHistory(prev => prev.slice(0, -1));
  };

  const currentMenu = menuHistory.length === 0 
    ? [...mainItems, { id: 'divider', icon: Settings, label: '---' }, ...configItems]
    : menuHistory[menuHistory.length - 1].submenu || [];

  return (
    <>
      {/* Floating Dock */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: isVisible ? 1 : 0.3,
        }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30,
          mass: 0.8
        }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        whileHover={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
        style={{ paddingBottom: 'max(var(--sab), 24px)' }}
      >
        <div 
          className={cn(
            "rounded-2xl px-2 py-2 transition-all duration-300",
            isVisible ? "glass-strong" : "glass"
          )}
        >
          <div className="flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isMenu = item.id === 'menu';
              
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
                    if (isMenu) {
                      setShowMenu(true);
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
                </motion.button>
              );
            })}
          </div>
        </div>
        
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

      {/* Cascading Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMenu(false);
                setMenuHistory([]);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[85%] max-w-[340px]"
            >
              <div 
                className="glass-strong rounded-3xl p-4"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {menuHistory.length > 0 && (
                      <button
                        onClick={handleBack}
                        className="p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                    )}
                    <h2 className="text-lg font-bold text-[var(--text-bible)]">
                      {menuHistory.length === 0 ? 'Menu' : menuHistory[menuHistory.length - 1].label}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setMenuHistory([]);
                    }}
                    className="p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="grid grid-cols-2 gap-2">
                  {currentMenu.map((item) => {
                    if (item.id === 'divider') {
                      return <div key="divider" className="col-span-2 border-t border-[var(--border-bible)] my-2" />;
                    }
                    const menuItem = item as MenuItem;
                    const Icon = item.icon;
                    const hasSubmenu = menuItem.submenu && menuItem.submenu.length > 0;
                    
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMenuClick(item)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-2xl',
                          'bg-[var(--surface-1)] border border-[var(--border-bible)]',
                          'hover:border-[var(--accent-bible)]/30 hover:bg-[var(--surface-2)]',
                          'transition-all duration-200 text-left'
                        )}
                      >
                        <div className="p-2 rounded-xl bg-[var(--accent-bible)]/10">
                          <Icon className="w-5 h-5 text-[var(--accent-bible)]" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-[var(--text-bible)]">
                          {item.label}
                        </span>
                        {hasSubmenu && (
                          <ChevronRight className="w-4 h-4 text-[var(--text-bible-muted)]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};