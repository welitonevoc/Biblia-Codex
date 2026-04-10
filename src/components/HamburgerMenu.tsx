import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Book, BookOpen, Bookmark, FileText, Settings,
  LogIn, User, Database, Map, MessageSquare, Library, Sparkles, Layers, History, HelpCircle as HelpIcon, Tag, Globe, X, Calendar
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
    { id: 'bible', name: 'Bíblia', icon: BookOpen, section: 'principal' },
    { id: 'devocional', name: 'Devocional', icon: History, section: 'principal' },
    { id: 'notes', name: 'Minhas Notas', icon: FileText, section: 'principal' },
    { id: 'bookmarks', name: 'Marcadores', icon: Bookmark, section: 'principal' },
    { id: 'tags', name: 'Destaques e Etiquetas', icon: Tag, section: 'principal' },
    { id: 'reading-plans', name: 'Planos de Leitura', icon: Calendar, section: 'recursos' },
    { id: 'dictionaries', name: 'Dicionários', icon: Library, section: 'recursos' },
    { id: 'commentaries', name: 'Comentários', icon: MessageSquare, section: 'recursos' },
    { id: 'maps', name: 'Mapas', icon: Map, section: 'recursos' },
    { id: 'xrefs', name: 'Ref. Cruzadas', icon: Layers, section: 'recursos' },
    { id: 'epub', name: 'Livros (EPUB)', icon: Book, section: 'recursos' },
    { id: 'ai-assistant', name: 'Assistente Teológico', icon: Sparkles, section: 'estudo' },
    { id: 'settings', name: 'Configurações', icon: Settings, section: 'sistema' },
    { id: 'modules', name: 'Módulos Externos', icon: Database, section: 'sistema' },
    { id: 'sync', name: 'Sincronização', icon: Globe, section: 'sistema' },
    { id: 'support', name: 'Suporte e Ajuda', icon: HelpIcon, section: 'sistema' },
  ];

  const sections = [
    { id: 'principal', name: 'Explorar' },
    { id: 'recursos', name: 'Biblioteca' },
    { id: 'estudo', name: 'Estudo' },
    { id: 'sistema', name: 'Sistema' },
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
            className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-md"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed inset-y-0 left-0 z-[210] w-[86vw] max-w-[380px]"
            style={{ 
              paddingTop: 'var(--sat)', 
              paddingBottom: 'var(--sab)',
              paddingLeft: 'var(--sal)',
              paddingRight: '12px' 
            }}
          >
            <div className="premium-card flex h-full flex-col rounded-[34px] p-3">
              <div className="premium-card-soft rounded-[28px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-bible-accent text-bible-bg shadow-[0_18px_34px_-22px_rgba(var(--accent-bible-rgb),0.9)]">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="premium-section-title opacity-80">Bíblia Kerygma</div>
                      <div className="font-display text-2xl font-semibold tracking-tight">Leitura viva</div>
                    </div>
                  </div>
                  <button onClick={onClose} className="premium-icon-button rounded-2xl">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 rounded-[24px] border border-bible-accent/12 bg-bible-accent/7 p-4">
                  {user ? (
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="h-14 w-14 rounded-[18px] object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-bible-accent/12 text-bible-accent">
                          <User className="h-7 w-7" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="ui-text truncate text-sm font-bold">{user.displayName || 'Usuário'}</div>
                        <div className="ui-text truncate text-[11px] text-bible-text/45">{user.email}</div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={login} className="premium-button flex w-full items-center justify-center gap-2 px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.18em]">
                      <LogIn className="h-4 w-4" />
                      Acessar Perfil
                    </button>
                  )}
                </div>
              </div>

              <div className="premium-scroll mt-3 flex-1 space-y-6 overflow-y-auto px-1 py-2">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="premium-section-title px-3">{section.name}</div>
                    <div className="space-y-2">
                      {menuItems.filter((item) => item.section === section.id).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onTabChange(item.id);
                            onClose();
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[24px] px-4 py-3 text-left transition-all",
                            activeTab === item.id
                              ? "premium-card-strong border-gold/40 text-bible-text"
                              : "premium-card-soft hover:border-bible-accent/20"
                          )}
                        >
                          <div className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                            activeTab === item.id ? "bg-bible-accent text-bible-bg" : "bg-bible-accent/10 text-bible-accent"
                          )}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="ui-text truncate text-sm font-bold">{item.name}</div>
                            <div className="ui-text text-[10px] uppercase tracking-[0.18em] text-bible-text/35">
                              {section.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-bible-accent/10 pt-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="premium-button-ghost flex w-full items-center justify-center gap-2 px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--danger-bible)]"
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Sair da Conta
                  </button>
                ) : (
                  <button
                    onClick={login}
                    className="premium-button-ghost flex w-full items-center justify-center gap-2 px-4 py-3 ui-text text-[11px] font-extrabold uppercase tracking-[0.18em]"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
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
