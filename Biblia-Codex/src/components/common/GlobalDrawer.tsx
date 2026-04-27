import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Book, Search, Bookmark, History, Settings, HelpCircle, 
  User, LogOut, Moon, Sun, Monitor, Maximize2, Minimize2,
  BookOpen, Layers, Sparkles, MessageSquare
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DrawerItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: string | number;
  description?: string;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ 
  icon: Icon, label, active, onClick, badge, description 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 p-3 rounded-2xl transition-all active:scale-[0.98]",
      active 
        ? "bg-bible-accent text-bible-bg shadow-lg shadow-bible-accent/20" 
        : "text-bible-text/70 hover:bg-bible-accent/10 hover:text-bible-accent"
    )}
  >
    <Icon className={cn("w-5 h-5 shrink-0", active ? "opacity-100" : "opacity-60")} />
    <div className="flex flex-col items-start flex-1 overflow-hidden">
      <span className="ui-text text-sm font-bold tracking-tight">{label}</span>
      {description && !active && (
        <span className="ui-text text-[10px] opacity-40 truncate w-full">{description}</span>
      )}
    </div>
    {badge !== undefined && (
      <span className={cn(
        "px-1.5 py-0.5 rounded-full text-[10px] font-black",
        active ? "bg-bible-bg text-bible-accent" : "bg-bible-accent text-bible-bg"
      )}>
        {badge}
      </span>
    )}
  </button>
);

export const GlobalDrawer: React.FC = () => {
  const { 
    isDrawerOpen, setDrawerOpen, drawerContext, settings, updateSettings, toggleSetting,
    activeTab, setActiveTab // Assumindo que o AppContent passa isso ou movemos para o Context
  } = useAppContext() as any; // Usando any temporário para campos que podem não estar no interface se eu esqueci de algo

  if (!isDrawerOpen) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[300px] bg-bible-bg border-r border-bible-accent/10 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header: User & App Brand */}
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-bible-accent flex items-center justify-center text-bible-bg shadow-lg shadow-bible-accent/30">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="ui-text text-lg font-black uppercase tracking-widest text-bible-accent">Codex</h1>
                    <span className="ui-text text-[10px] font-bold opacity-30">V. 2.5.0 Premium</span>
                  </div>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-bible-accent/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile info */}
              <div className="p-4 rounded-3xl bg-bible-accent/5 border border-bible-accent/10 flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-bible-accent/10 flex items-center justify-center border border-bible-accent/20">
                  <User className="w-6 h-6 text-bible-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="ui-text text-sm font-bold truncate max-w-[140px]">Convidado</span>
                  <span className="ui-text text-[10px] opacity-40">Nível Estudante</span>
                </div>
              </div>
            </div>

            {/* Content: Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Contextual Section: Bible Tools */}
              {drawerContext === 'bible' && (
                <div className="space-y-2">
                  <div className="px-3 flex items-center space-x-2 opacity-30 mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span className="ui-text text-[9px] uppercase font-black tracking-[0.2em]">Ferramentas de Leitura</span>
                  </div>
                  <DrawerItem 
                    icon={Maximize2} 
                    label="Modo Foco" 
                    description="Oculta distrações laterais"
                    onClick={() => {}} 
                  />
                  <DrawerItem 
                    icon={Layers} 
                    label="Compare" 
                    description="Visualize duas versões juntas"
                    onClick={() => {}} 
                  />
                  <DrawerItem 
                    icon={MessageSquare} 
                    label="Perguntar à IA" 
                    description="Tire dúvidas sobre o versículo"
                    onClick={() => {}} 
                  />
                </div>
              )}

              {/* Main Navigation */}
              <div className="space-y-2">
                <div className="px-3 flex items-center space-x-2 opacity-30 mb-2">
                  <Monitor className="w-3 h-3" />
                  <span className="ui-text text-[9px] uppercase font-black tracking-[0.2em]">Caminhos</span>
                </div>
                <DrawerItem 
                  icon={Book} 
                  label="Bíblia Sagrada" 
                  active={activeTab === 'bible'}
                  onClick={() => setActiveTab('bible')} 
                />
                <DrawerItem 
                  icon={Search} 
                  label="Explorador" 
                  active={activeTab === 'search'}
                  onClick={() => setActiveTab('search')} 
                />
                <DrawerItem 
                  icon={Bookmark} 
                  label="Meus Marcadores" 
                  description="24 itens salvos"
                  onClick={() => setActiveTab('tags')} 
                />
                <DrawerItem 
                  icon={History} 
                  label="Histórico" 
                  onClick={() => {}} 
                />
              </div>

              {/* Preferences Quick Toggle */}
              <div className="p-4 rounded-3xl bg-bible-accent/5 border border-bible-accent/10 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateSettings({ mode: 'light' })}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all",
                    settings.mode === 'light' ? "bg-white text-black border-black/10" : "bg-transparent border-transparent opacity-40"
                  )}
                >
                  <Sun className="w-5 h-5 mb-1" />
                  <span className="ui-text text-[10px] font-bold">Luz</span>
                </button>
                <button 
                  onClick={() => updateSettings({ mode: 'dark' })}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all",
                    settings.mode === 'dark' ? "bg-bible-bg text-bible-text border-bible-accent/40" : "bg-transparent border-transparent opacity-40"
                  )}
                >
                  <Moon className="w-5 h-5 mb-1" />
                  <span className="ui-text text-[10px] font-bold">Noite</span>
                </button>
              </div>
            </div>

            {/* Footer: Settings & Support */}
            <div className="p-4 border-t border-bible-accent/10 space-y-2">
              <DrawerItem 
                icon={Settings} 
                label="Configurações" 
                onClick={() => setActiveTab('settings')} 
              />
              <DrawerItem 
                icon={HelpCircle} 
                label="Suporte e Ajuda" 
                onClick={() => setActiveTab('support')} 
              />
              <DrawerItem 
                icon={LogOut} 
                label="Sair da Conta" 
                onClick={() => {}} 
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
