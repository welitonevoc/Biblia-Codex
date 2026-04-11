import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Book, BookOpen, Bookmark, FileText, Settings,
  LogIn, ChevronLeft, ChevronRight, Map, MessageSquare,
  Library, Sparkles, Layers, History, HelpCircle as HelpIcon,
  Database, Globe, User, Tag, GraduationCap, FolderOpen
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange
}) => {
  const { settings, user, login, handleLogout } = useAppContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: 'home', name: 'Início', icon: Home, section: 'principal' },
    { id: 'bible', name: 'Bíblia', icon: BookOpen, section: 'principal' },

    { id: 'resources', name: 'Recursos', icon: FolderOpen, section: 'recursos' },
    { id: 'reading-plans', name: 'Planos de Leitura', icon: History, section: 'recursos' },
    { id: 'dictionaries', name: 'Dicionário', icon: Library, section: 'recursos' },
    { id: 'commentaries', name: 'Comentários', icon: MessageSquare, section: 'recursos' },
    { id: 'maps', name: 'Mapas', icon: Map, section: 'recursos' },
    { id: 'xrefs', name: 'Referências Cruzadas', icon: Layers, section: 'recursos' },
    { id: 'epub', name: 'Livros (EPUB)', icon: Book, section: 'recursos' },

    { id: 'study-tools', name: 'Ferramentas de Estudo', icon: GraduationCap, section: 'estudo' },
    { id: 'ai-assistant', name: 'Assistente de Teologia', icon: Sparkles, section: 'estudo' },
    { id: 'bookmarks', name: 'Marcadores', icon: Bookmark, section: 'estudo' },
    { id: 'tags', name: 'Temas Teológicos (Etiquetas)', icon: Tag, section: 'estudo' },
    { id: 'notes', name: 'Minhas Notas', icon: FileText, section: 'estudo' },

    { id: 'settings', name: 'Configurações', icon: Settings, section: 'sistema' },
    { id: 'modules', name: 'Módulos Externos', icon: Database, section: 'sistema' },
    { id: 'sync', name: 'Sincronização', icon: Globe, section: 'sistema' },
    { id: 'support', name: 'Suporte & Ajuda', icon: HelpIcon, section: 'sistema' },
  ];

  const sections = [
    { id: 'principal', name: 'Explorar' },
    { id: 'recursos', name: 'Recursos' },
    { id: 'estudo', name: 'Ferramentas de Estudo' },
    { id: 'sistema', name: 'Sistema' },
  ];

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? (isMobile ? 280 : 280) : (isMobile ? 0 : 80),
          x: isMobile && !isOpen ? -280 : 0
        }}
        className={cn(
          'h-screen bg-bible-bg border-r border-bible-accent/10 flex flex-col transition-all duration-300 ease-in-out',
          isMobile ? 'fixed inset-y-0 left-0 z-[150] shadow-2xl' : 'relative z-20'
        )}
      >
        <div className="p-6 border-b border-bible-accent/10">
          <div className={cn(
            'flex flex-col items-center text-center space-y-4',
            !isOpen && !isMobile && 'items-center'
          )}>
            {user ? (
              <div className="flex flex-col items-center space-y-3 group cursor-pointer w-full">
                <div className="relative">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-16 h-16 rounded-full border-2 border-bible-accent shadow-xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-bible-accent flex items-center justify-center text-bible-bg font-bold shadow-xl">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-bible-bg rounded-full shadow-lg" />
                </div>
                {(isOpen || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="ui-text text-base font-bold text-bible-accent truncate">{user.displayName || 'Usuário'}</p>
                    <p className="ui-text text-[10px] opacity-40 truncate uppercase tracking-widest font-bold">{user.email}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-2xl bg-bible-accent text-bible-bg hover:bg-bible-accent/90 transition-all shadow-lg',
                  !isOpen && !isMobile ? 'w-12 h-12 justify-center p-0' : 'w-full'
                )}
              >
                <LogIn className="w-6 h-6 flex-shrink-0" />
                {(isOpen || isMobile) && (
                  <div className="text-left">
                    <p className="ui-text text-sm font-bold">Acessar Perfil</p>
                    <p className="ui-text text-[10px] opacity-70">Acesse sua conta</p>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-hide">
          {sections.map(section => (
            <div key={section.id} className="space-y-1">
              {(isOpen || isMobile) && (
                <h3 className="ui-text text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 px-4 mb-2">
                  {section.name}
                </h3>
              )}
              {menuItems.filter(item => item.section === section.id).map(item => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 p-3 rounded-xl transition-all group relative',
                    activeTab === item.id
                      ? 'bg-bible-accent/10 text-bible-accent'
                      : 'hover:bg-bible-accent/5 opacity-60 hover:opacity-100',
                    !isOpen && !isMobile && 'justify-center'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-transform',
                    activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                  )} />
                  {(isOpen || isMobile) && <span className="ui-text text-sm font-medium whitespace-nowrap">{item.name}</span>}
                  {!isOpen && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[300]">
                      {item.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {!isMobile && !settings.behavior.alwaysVisible && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-20 w-6 h-6 bg-bible-bg border border-bible-accent/20 rounded-full flex items-center justify-center shadow-md hover:bg-bible-accent/10 transition-colors z-[210]"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        <div className="p-4 border-t border-bible-accent/10">
          <div className={cn(
            'flex items-center space-x-2 opacity-30',
            !isOpen && !isMobile && 'justify-center'
          )}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {(isOpen || isMobile) && <span className="ui-text text-[10px] font-bold tracking-widest uppercase">Online</span>}
          </div>
          {user && (isOpen || isMobile) && (
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center space-x-2 p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
            >
              <LogIn className="w-4 h-4 rotate-180" />
              <span>Sair da Conta</span>
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};
