import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Book, Sparkles, Loader2, Info, 
  ChevronRight, AlertCircle, Quote,
  Share2, Save, ExternalLink
} from 'lucide-react';
import { searchLocalDictionary, getAIDefinition } from '../services/dictionaryService';
import { useAppContext } from '../AppContext';
import { DictionaryEntry } from '../types';
import { MySwordParser } from '../services/mySwordParser';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DictionaryBottomSheetProps {
  term: string;
  context?: string;
  onClose: () => void;
  isOpen: boolean;
}

export const DictionaryBottomSheet: React.FC<DictionaryBottomSheetProps> = ({ 
  term, context, onClose, isOpen 
}) => {
  const { settings, selectedDictionaryModule } = useAppContext();
  const [activeTab, setActiveTab] = useState<'local' | 'ai'>('local');
  const [localEntry, setLocalEntry] = useState<DictionaryEntry | null>(null);
  const [aiEntry, setAiEntry] = useState<DictionaryEntry | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && term) {
      setAiEntry(null);
      setLocalEntry(null);
      setError(null);
      setActiveTab('local');
      handleSearchLocal();
    }
  }, [isOpen, term, selectedDictionaryModule]);

  const handleSearchLocal = async () => {
    if (!selectedDictionaryModule || selectedDictionaryModule.id === 'ai_assistant') {
      setActiveTab('ai');
      handleSearchAI();
      return;
    }

    setLoadingLocal(true);
    setLocalEntry(null);
    try {
      const result = await searchLocalDictionary(term, selectedDictionaryModule.path);
      setLocalEntry(result);
      if (!result) {
        // Fallback para IA se não houver resultado local
        setActiveTab('ai');
        handleSearchAI();
      }
    } catch (err) {
      console.error("Erro na busca local:", err);
      setActiveTab('ai');
      handleSearchAI();
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleSearchAI = async () => {
    if (aiEntry) return; // Cache simples
    setLoadingAI(true);
    setError(null);
    try {
      const result = await getAIDefinition(term, context, settings.apiKeys?.gemini);
      setAiEntry(result);
    } catch (err) {
      setError('Falha ao conectar com o Assistente IA.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-none">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        />

        {/* Sheet Content */}
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl h-[88dvh] sm:h-[80vh] bg-bible-bg rounded-t-lg sm:rounded-t-lg overflow-hidden flex flex-col pointer-events-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
        >
          {/* Top Handle */}
          <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-4 pt-8 sm:p-8 sm:pt-10 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-gold">{term}</h2>
                {context && <p className="ui-text text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">Ref: {context}</p>}
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <button 
                onClick={() => setActiveTab('local')}
                className={cn(
                  "flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'local' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                <Book className="w-4 h-4" />
                <span className="ui-text text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest">Dicionário Offline</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                className={cn(
                  "flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'ai' ? "bg-gold/20 text-gold shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="ui-text text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest">Assistente IA</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-16 sm:pb-24 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
            <AnimatePresence mode="wait">
              {activeTab === 'local' ? (
                <motion.div 
                  key="local"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {loadingLocal ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-30">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="ui-text text-xs uppercase tracking-widest font-bold">Pesquisando módulos locais...</p>
                    </div>
                  ) : localEntry ? (
                    <div className="space-y-6">
                      <div
                        className="dictionary-sheet-content ui-text text-base leading-relaxed max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(MySwordParser.parseContent(localEntry.definition)) }}
                      />
                      <div className="rounded-[var(--radius-lg)] p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="ui-text text-[9px] font-black uppercase tracking-widest opacity-30">Termo</span>
                        <span className="ui-text text-[10px] font-bold text-white/80">{localEntry.term}</span>
                      </div>
                      <div className="rounded-[var(--radius-lg)] p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="ui-text text-[9px] font-black uppercase tracking-widest opacity-30">Fonte Local</span>
                        <span className="ui-text text-[10px] font-bold text-gold">{localEntry.moduleName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 opacity-30">
                      <Book className="w-12 h-12" />
                      <p className="ui-text text-sm font-bold uppercase tracking-widest">Nenhuma definição encontrada offline</p>
                      <button 
                        onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                        className="ui-text text-[10px] font-black text-gold border-b border-gold/40 pb-1"
                      >
                        Tentar com Assistente IA
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  {loadingAI ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-gold" />
                      <p className="ui-text text-sm uppercase tracking-widest font-black text-gold animate-pulse">Consultando Eruditos e Teologia Clássica...</p>
                    </div>
                  ) : error ? (
                    <div className="p-8 bg-red-500/10 border border-red-500/10 rounded-[2rem] flex flex-col items-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-red-400" />
                      <p className="ui-text text-sm font-bold text-red-400">{error}</p>
                      <button onClick={handleSearchAI} className="px-6 py-2 bg-red-400/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-widest">Tentar Novamente</button>
                    </div>
                  ) : aiEntry ? (
                    <div className="space-y-8">
                      {/* Theological Header */}
                      <div className="p-6 rounded-[var(--radius-2xl)] flex items-start space-x-4" style={{ background: 'rgba(var(--accent-bible-rgb), 0.08)' }}>
                        <Quote className="w-8 h-8 text-gold mt-1 opacity-50" />
                        <div>
                          <span className="ui-text text-[10px] font-black uppercase tracking-widest text-gold">Visão Assembleiana Clássica</span>
                          <p className="ui-text text-sm text-white/80 leading-relaxed mt-1">Explicação fundamentada na teologia bíblica e histórica.</p>
                        </div>
                      </div>

                      {/* AI Content */}
                      <div className="prose prose-invert prose-gold max-w-none prose-p:ui-text prose-p:text-lg prose-p:leading-relaxed prose-li:text-lg">
                        <div className="whitespace-pre-wrap">{aiEntry.definition}</div>
                      </div>

                      {/* AI Actions */}
                      <div className="grid grid-cols-2 gap-3 pt-6 pb-12">
                        <button className="flex items-center justify-center space-x-2 p-4 glass-panel rounded-2xl ui-text text-[10px] font-bold uppercase tracking-widest">
                          <Share2 className="w-4 h-4" />
                          <span>Compartilhar</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 p-4 glass-panel rounded-2xl ui-text text-[10px] font-bold uppercase tracking-widest">
                          <Save className="w-4 h-4" />
                          <span>Salvar Estudo</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Footer Navigation (Optional) */}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
