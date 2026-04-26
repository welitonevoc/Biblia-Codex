import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Book, Sparkles, Loader2, Info, 
  ChevronRight, AlertCircle, Quote,
  Share2, Save, ExternalLink, Languages,
  Zap, History, Layers
} from 'lucide-react';
import { searchLocalDictionary, getAIDefinition } from '../services/dictionaryService';
import { useAppContext } from '../AppContext';
import { DictionaryEntry, StrongsEntry } from '../types';
import { MySwordParser } from '../services/mySwordParser';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StrongsBottomSheetProps {
  strongsNumber: string;
  context?: string;
  onClose: () => void;
  isOpen: boolean;
}

export const StrongsBottomSheet: React.FC<StrongsBottomSheetProps> = ({ 
  strongsNumber, context, onClose, isOpen 
}) => {
  const { settings, availableDictionaries } = useAppContext();
  const [activeTab, setActiveTab] = useState<'lexicon' | 'ai'>('lexicon');
  const [lexiconEntry, setLexiconEntry] = useState<DictionaryEntry | null>(null);
  const [aiEntry, setAiEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && strongsNumber) {
      setAiEntry(null);
      setLexiconEntry(null);
      setError(null);
      setActiveTab('lexicon');
      handleSearchLexicon();
    }
  }, [isOpen, strongsNumber]);

  const handleSearchLexicon = async () => {
    setLoading(true);
    setLexiconEntry(null);
    try {
      // Find Strong's specific dictionary
      const lexiconModule = availableDictionaries.find(d => d.path.toLowerCase().includes('strong')) 
        || availableDictionaries[0];

      if (lexiconModule) {
        const result = await searchLocalDictionary(strongsNumber, lexiconModule.path);
        setLexiconEntry(result);
      }
    } catch (err) {
      console.error("Erro na busca léxica:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAI = async () => {
    if (aiEntry) return;
    setLoadingAI(true);
    try {
      const prompt = `Analise o número Strong ${strongsNumber} no contexto de ${context || 'um versículo bíblico'}. Forneça a palavra original em Grego ou Hebraico, transliteração, significado léxico, uso no contexto específico e implicações teológicas. Responda em Português formatado com Markdown.`;
      const result = await getAIDefinition(strongsNumber, prompt);
      setAiEntry(result);
    } catch (err) {
      setError('Falha ao conectar com o Assistente IA.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (!isOpen) return null;

  const isHebrew = strongsNumber.startsWith('H');
  const langLabel = isHebrew ? 'Hebraico' : 'Grego';
  const langColor = isHebrew ? 'text-amber-500' : 'text-blue-500';

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
          className="relative w-full max-w-2xl h-[85dvh] bg-bible-bg rounded-t-3xl overflow-hidden flex flex-col pointer-events-auto border-t border-white/10"
        >
          {/* Top Handle */}
          <div className="h-10 flex items-center justify-center shrink-0">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-6 border-b border-white/5 space-y-4 shrink-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-white/5", langColor)}>
                    {langLabel}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-gold/10 text-gold">
                    Estudo Profundo
                  </span>
                </div>
                <h2 className="text-4xl font-display font-black text-white flex items-baseline gap-2">
                  {strongsNumber}
                </h2>
                {context && (
                  <div className="flex items-center gap-1 opacity-40">
                    <History className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{context}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 p-1 rounded-2xl bg-white/5">
              <button 
                onClick={() => setActiveTab('lexicon')}
                className={cn(
                  "flex-1 py-3 rounded-xl flex items-center justify-center space-x-3 transition-all",
                  activeTab === 'lexicon' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                <Languages className="w-4 h-4" />
                <span className="ui-text text-[10px] font-black uppercase tracking-widest">Léxico Clássico</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                className={cn(
                  "flex-1 py-3 rounded-xl flex items-center justify-center space-x-3 transition-all",
                  activeTab === 'ai' ? "bg-gold/20 text-gold shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="ui-text text-[10px] font-black uppercase tracking-widest">Exegese IA</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
            <AnimatePresence mode="wait">
              {activeTab === 'lexicon' ? (
                <motion.div 
                  key="lexicon"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-30">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="ui-text text-[10px] uppercase tracking-widest font-black">Consultando Manuscritos...</p>
                    </div>
                  ) : lexiconEntry ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {/* Detailed Entry Card */}
                      <div className="glass-panel p-6 space-y-6">
                        <div className="prose prose-invert prose-gold max-w-none prose-p:ui-text prose-p:text-lg prose-p:leading-relaxed prose-strong:text-gold">
                           <div 
                             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(MySwordParser.parseContent(lexiconEntry.definition)) }}
                           />
                        </div>
                      </div>

                      {/* Info Chips */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block mb-1">Módulo Léxico</span>
                            <span className="text-xs font-bold text-gold truncate block">{lexiconEntry.moduleName}</span>
                         </div>
                         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block mb-1">Códice Original</span>
                            <span className="text-xs font-bold text-white/80">{isHebrew ? 'BHS / DSS' : 'NA28 / TR'}</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 opacity-30">
                      <Zap className="w-12 h-12" />
                      <p className="ui-text text-sm font-black uppercase tracking-widest text-center max-w-[200px]">Número Strong não encontrado nos módulos locais</p>
                      <button 
                        onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                        className="px-6 py-2 bg-gold/20 text-gold rounded-full text-[10px] font-black uppercase tracking-widest"
                      >
                        Pedir Análise à IA
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  {loadingAI ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-gold" />
                        <Sparkles className="w-6 h-6 text-gold absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="ui-text text-sm uppercase tracking-[0.3em] font-black text-gold">Análise Exegética</p>
                        <p className="ui-text text-[10px] font-bold text-white/40 uppercase tracking-widest">Processando contextos originais...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col items-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-red-500" />
                      <p className="ui-text text-sm font-black text-red-500">{error}</p>
                      <button onClick={handleSearchAI} className="px-6 py-2 bg-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Recarregar</button>
                    </div>
                  ) : aiEntry ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                      {/* AI Theological Badge */}
                      <div className="bg-gradient-to-r from-gold/20 to-transparent p-1 rounded-2xl">
                        <div className="bg-bible-bg p-4 rounded-xl flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                            <Quote className="w-5 h-5 text-gold" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gold block">Visão Teológica Profunda</span>
                            <span className="text-xs font-bold text-white/60">Análise morfológica e contextual completa.</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Content */}
                      <div className="prose prose-invert prose-gold max-w-none">
                        <div className="whitespace-pre-wrap ui-text text-lg leading-relaxed text-white/90">
                           {aiEntry.definition}
                        </div>
                      </div>

                      {/* AI Footer Actions */}
                      <div className="grid grid-cols-2 gap-4 pb-20">
                          <button className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/5 transition-all">
                             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <Share2 className="w-5 h-5" />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest">Compartilhar</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-6 glass-panel rounded-3xl hover:bg-white/5 transition-all">
                             <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Save className="w-5 h-5 text-gold" />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-gold text-center">Salvar no<br/>Estudo</span>
                          </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Action Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bible-bg via-bible-bg to-transparent">
             <button 
               onClick={onClose}
               className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black ui-text text-[10px] uppercase tracking-[0.3em] transition-all backdrop-blur-md border border-white/5"
             >
               Fechar Estudo
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
