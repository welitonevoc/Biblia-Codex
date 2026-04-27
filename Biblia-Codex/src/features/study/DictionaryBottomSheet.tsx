import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Book, Sparkles, Loader2, 
  ChevronRight, AlertCircle, Quote,
  Share2, Save, Languages
} from 'lucide-react';
import { searchLocalDictionary, getAIDefinition } from '../services/dictionaryService';
import { useAppContext } from '../AppContext';
import { DictionaryEntry, BibleModule } from '../types';
import { MySwordParser } from '../services/mySwordParser';
import { cn } from '../utils/cn';
import DOMPurify from 'dompurify';

interface DictionaryBottomSheetProps {
  term: string;
  context?: string;
  onClose: () => void;
  isOpen: boolean;
}

export const DictionaryBottomSheet: React.FC<DictionaryBottomSheetProps> = ({ 
  term, context, onClose, isOpen 
}) => {
  const { settings, availableDictionaries, setSelectedDictionaryModule, selectedDictionaryModule } = useAppContext();
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
  }, [isOpen, term]);

  const handleSearchLocal = async (forcedModule?: BibleModule) => {
    const targetModule = forcedModule || selectedDictionaryModule;
    
    if (!targetModule || targetModule.isVirtual) {
      setActiveTab('ai');
      handleSearchAI();
      return;
    }

    setLoadingLocal(true);
    setLocalEntry(null);
    try {
      const result = await searchLocalDictionary(term, targetModule.path);
      setLocalEntry(result);
      if (!result && !aiEntry) {
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
    if (aiEntry) return;
    setLoadingAI(true);
    setError(null);
    try {
      const result = await getAIDefinition(term, context);
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
          className="relative w-full max-w-2xl h-[80dvh] bg-bible-bg rounded-t-3xl overflow-hidden flex flex-col pointer-events-auto border-t border-bible-border/10 shadow-2xl"
        >
          {/* Top Handle */}
          <div className="h-6 flex items-center justify-center shrink-0">
            <div className="w-10 h-1 bg-bible-text/10 rounded-full" />
          </div>

          {/* Compact Header */}
          <div className="px-5 pb-3 border-b border-bible-border/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-bible-text/5 text-bible/60">
                      Dicionário
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/10 text-gold">
                      Teológico
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-bible mt-0.5">
                    {term}
                  </h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-bible-text/5 hover:bg-bible-text/10 rounded-full transition-all text-bible opacity-40 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Tabs */}
            <div className="flex space-x-1 p-1 rounded-xl bg-bible-text/5">
              <button 
                onClick={() => setActiveTab('local')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'local' ? "bg-bible-text/10 text-bible shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Definição</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                className={cn(
                  "flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'ai' ? "bg-gold/20 text-gold shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Erudição IA</span>
              </button>
            </div>

            {/* Module Selector */}
            {activeTab === 'local' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Book className="w-3 h-3 text-gold opacity-50" />
                </div>
                <select 
                  className="w-full pl-8 pr-3 py-2 bg-bible-text/5 border border-bible-border/5 rounded-xl ui-text text-[10px] font-bold text-bible/70 appearance-none focus:outline-none transition-all cursor-pointer"
                  value={selectedDictionaryModule?.path || ''}
                  onChange={(e) => {
                    const module = availableDictionaries.find(m => m.path === e.target.value);
                    if (module) {
                      setSelectedDictionaryModule(module);
                      handleSearchLocal(module);
                    }
                  }}
                >
                  {availableDictionaries.map(module => (
                    <option key={module.path} value={module.path}>{module.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-20">
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-12 scrollbar-premium">
            <AnimatePresence mode="wait">
              {activeTab === 'local' ? (
                <motion.div 
                  key="local"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {loadingLocal ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-20">
                      <Loader2 className="w-6 h-6 animate-spin text-bible" />
                      <p className="ui-text text-[9px] uppercase tracking-widest font-black text-bible">Consultando Módulos...</p>
                    </div>
                  ) : localEntry ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="glass-panel p-5">
                        <div 
                          className="prose prose-gold max-w-none ui-text text-[15px] leading-relaxed text-bible/80"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(MySwordParser.parseContent(localEntry.definition)) }}
                        />
                      </div>
                      <div className="flex items-center justify-end px-2 opacity-30">
                        <span className="text-[9px] font-black uppercase tracking-widest text-bible">Fonte: {localEntry.moduleName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20 text-center">
                      <Book className="w-10 h-10 text-bible" />
                      <p className="ui-text text-[10px] font-black uppercase tracking-widest text-bible">Termo não encontrado offline</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {loadingAI ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-6 h-6 animate-spin text-gold" />
                      <p className="ui-text text-[9px] uppercase tracking-widest font-black text-gold">IA Processando Definição...</p>
                    </div>
                  ) : error ? (
                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center space-y-3 text-red-500">
                      <AlertCircle className="w-8 h-8 opacity-60" />
                      <p className="ui-text text-[10px] font-black leading-tight text-center">{error}</p>
                      <button onClick={handleSearchAI} className="px-4 py-1.5 bg-red-500/10 rounded-lg text-[9px] font-black uppercase tracking-widest">Tentar Novamente</button>
                    </div>
                  ) : aiEntry ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="prose prose-gold max-w-none">
                        <div className="whitespace-pre-wrap ui-text text-[15px] leading-relaxed text-bible/80">
                           {aiEntry.definition}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-bible-border/5">
                        <button className="flex items-center justify-center gap-2 p-4 glass-panel rounded-2xl text-bible">
                          <Share2 className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Compartilhar</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 glass-panel rounded-2xl text-gold">
                          <Save className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Salvar</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
