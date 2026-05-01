import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Book, BookOpen, Bookmark, FileText, Settings,
  LogIn, User, Database, Map, MessageSquare, Library, Sparkles, Layers, HelpCircle as HelpIcon, Tag, Globe, X, Calendar, History, Palette
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange
}) => {
  const { user, login, handleLogout } = useAppContext();

  const menuItems = [
    { id: 'home', name: 'Início', icon: Home, section: 'principal' },
    { id: 'bible', name: 'Bíbia', icon: BookOpen, section: 'principal' },
    { id: 'devocional', name: 'Devocional', icon: History, section: 'principal' },
    { id: 'notes', name: 'Notas', icon: FileText, section: 'principal' },
    { id: 'bookmarks', name: 'Marcadores', icon: Bookmark, section: 'principal' },
    { id: 'tags', name: 'Destaques', icon: Tag, section: 'principal' },
    { id: 'reading-plans', name: 'Planos', icon: Calendar, section: 'recursos' },
    { id: 'dictionaries', name: 'Dicionários', icon: Library, section: 'recursos' },
    { id: 'commentaries', name: 'Comentários', icon: MessageSquare, section: 'recursos' },
    { id: 'maps', name: 'Mapas', icon: Map, section: 'recursos' },
    { id: 'xrefs', name: 'Refs. Cruzadas', icon: Layers, section: 'recursos' },
    { id: 'epub', name: 'Livros', icon: Book, section: 'recursos' },
    { id: 'ebd', name: 'EBD', icon: BookOpen, section: 'recursos' },
    { id: 'ai-assistant', name: 'Assistente IA', icon: Sparkles, section: 'estudo' },
    { id: 'profile', name: 'Perfil', icon: User, section: 'configuracoes' },
    { id: 'settings', name: 'Aparência', icon: Palette, section: 'configuracoes' },
    { id: 'tts', name: 'TTS', icon: Sparkles, section: 'configuracoes' },
    { id: 'modules', name: 'Módulos', icon: Database, section: 'configuracoes' },
    { id: 'support', name: 'Suporte', icon: HelpIcon, section: 'configuracoes' },
  ];

  const sections = [
    { id: 'principal', name: 'Explorar' },
    { id: 'recursos', name: 'Biblioteca' },
    { id: 'estudo', name: 'Estudo' },
    { id: 'configuracoes', name: 'Configurações' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/30"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[210] w-[min(20rem,calc(100vw-0.75rem))]"
            style={{
              paddingTop: 'var(--sat)',
              paddingBottom: 'var(--sab)',
            }}
          >
            <div className="h-full bg-bible-bg flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-bible-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-bible-accent text-bible-bg">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-bible-text">Bíbia Codex</div>
                  </div>
                </div>
                <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded hover:bg-bible-surface" aria-label="Fechar menu">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 border-b border-bible-border">
                {user ? (
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-bible-surface flex items-center justify-center">
                        <User className="h-5 w-5 text-bible-text-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-bible-text truncate">{user.displayName || 'Usuário'}</div>
                      <div className="text-xs text-bible-text-muted truncate">{user.email}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={login}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded bg-bible-accent px-3 py-2 text-sm font-medium text-bible-bg"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </button>
                )}
              </div>

              <nav className="flex-1 overflow-y-auto p-2">
                {sections.map((section) => {
                  const items = menuItems.filter((item) => item.section === section.id);
                  return (
                    <div key={section.id} className="mb-4">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-bible-text-muted px-2 mb-2">{section.name}</div>
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { onTabChange(item.id); onClose(); }}
                              className={cn(
                                "flex min-h-11 w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors",
                                isActive
                                  ? "bg-bible-accent/10 text-bible-accent"
                                  : "text-bible-text hover:bg-bible-surface"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-bible-border">
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Sair
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
