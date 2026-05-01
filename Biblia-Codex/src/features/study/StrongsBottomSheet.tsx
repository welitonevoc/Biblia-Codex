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
  const { settings, availableDictionaries, updateSettings } = useAppContext();
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

  const handleSearchLexicon = async (forcedPath?: string) => {
    setLoading(true);
    setLexiconEntry(null);
    try {
      // Prioridade: path forçado > settings > busca automática
      const savedPath = settings.studyTools.selectedStrongsDictionary;
      const targetPath = forcedPath || savedPath;
      
      let lexiconModule;
      if (targetPath) {
        lexiconModule = availableDictionaries.find(d => d.path === targetPath);
      }
      
      if (!lexiconModule) {
        lexiconModule = availableDictionaries.find(d => d.path.toLowerCase().includes('strong')) 
          || availableDictionaries[0];
      }

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
          className="relative w-full max-w-2xl h-[85dvh] bg-bible-bg rounded-t-3xl overflow-hidden flex flex-col pointer-events-auto border-t border-bible-border/10"
        >
          {/* Top Handle - More compact */}
          <div className="h-6 flex items-center justify-center shrink-0">
            <div className="w-10 h-1 bg-bible-text/10 rounded-full" />
          </div>

          {/* Compact Header */}
          <div className="px-5 pb-3 border-b border-bible-border/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-bible-text/5", langColor)}>
                      {langLabel}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/10 text-gold">
                      Estudo
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-bible mt-0.5">
                    {strongsNumber}
                  </h2>
                </div>
                {context && (
                  <div className="flex items-center gap-1 opacity-20 border-l border-bible-border/20 pl-3 h-8 self-end mb-1">
                    <History className="w-2.5 h-2.5 text-bible" />
                    <span className="text-[9px] font-bold uppercase tracking-tight text-bible">{context}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-full bg-bible-text/5 text-bible opacity-60 transition-all hover:bg-bible-text/10 hover:opacity-100"
                aria-label="Fechar léxico"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Tabs */}
            <div className="flex space-x-1 p-1 rounded-xl bg-bible-text/5">
              <button 
                onClick={() => setActiveTab('lexicon')}
                className={cn(
                  "flex-1 min-h-10 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'lexicon' ? "bg-bible-text/10 text-bible shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Léxico</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                className={cn(
                  "flex-1 min-h-10 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'ai' ? "bg-gold/20 text-gold shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Exegese IA</span>
              </button>
            </div>

            {/* Dictionary List Selector - Moved to TOP */}
            {activeTab === 'lexicon' && (
              <div className="relative group mt-4">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Book className="w-3.5 h-3.5 text-gold" />
                </div>
                <select 
                  className="w-full pl-8 pr-3 py-2 bg-bible-text/5 border border-bible-border/5 rounded-xl ui-text text-[10px] font-bold text-bible/60 appearance-none focus:outline-none transition-all cursor-pointer"
                  value={settings.studyTools.selectedStrongsDictionary || availableDictionaries.find(d => d.path.toLowerCase().includes('strong'))?.path || ''}
                  onChange={(e) => {
                    const path = e.target.value;
                    updateSettings({ studyTools: { ...settings.studyTools, selectedStrongsDictionary: path } });
                    handleSearchLexicon(path);
                  }}
                >
                  <optgroup label="Dicionários Strong" className="bg-bible-bg text-bible">
                    {availableDictionaries.filter(d => d.name.toLowerCase().includes('strong') || d.path.toLowerCase().includes('strong')).map(module => (
                      <option key={module.path} value={module.path}>{module.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Outros Dicionários" className="bg-bible-bg text-bible">
                    {availableDictionaries.filter(d => !d.name.toLowerCase().includes('strong') && !d.path.toLowerCase().includes('strong')).map(module => (
                      <option key={module.path} value={module.path}>{module.name}</option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-40">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content Area - More focus on content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-12 scrollbar-premium">
            <AnimatePresence mode="wait">
              {activeTab === 'lexicon' ? (
                <motion.div 
                  key="lexicon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3 opacity-20">
                      <Loader2 className="w-5 h-5 animate-spin text-bible" />
                      <p className="ui-text text-[8px] uppercase tracking-widest font-black text-bible">Buscando...</p>
                    </div>
                  ) : lexiconEntry ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      {/* Analysis Block */}
                      <div className="glass-panel p-4">
                        <div className="prose prose-gold max-w-none prose-p:ui-text prose-p:text-[15px] prose-p:leading-relaxed prose-strong:text-gold prose-p:text-bible">
                           <div 
                             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(MySwordParser.parseContent(lexiconEntry.definition)) }}
                           />
                        </div>
                      </div>

                      {/* Info Chips - Compact */}
                      <div className="grid grid-cols-2 gap-2 mt-4 opacity-50">
                         <div className="p-3 rounded-xl bg-bible-text/5 flex items-center justify-between border border-bible-border/5">
                            <span className="text-[7px] font-black uppercase tracking-tight text-bible">Strong</span>
                            <span className="text-[9px] font-bold text-gold">{strongsNumber}</span>
                         </div>
                         <div className="p-3 rounded-xl bg-bible-text/5 flex items-center justify-between border border-bible-border/5">
                            <span className="text-[7px] font-black uppercase tracking-tight text-bible">Origem</span>
                            <span className="text-[9px] font-bold text-bible">{isHebrew ? 'Hebraico' : 'Grego'}</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 opacity-30">
                      <Zap className="w-12 h-12 text-bible" />
                      <p className="ui-text text-sm font-black uppercase tracking-widest text-center max-w-[200px] text-bible">Número Strong não encontrado nos módulos locais</p>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {loadingAI ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-gold" />
                      <p className="ui-text text-[8px] uppercase tracking-widest font-black text-gold">IA em Contexto...</p>
                    </div>
                  ) : error ? (
                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-xl flex flex-col items-center space-y-2">
                      <AlertCircle className="w-6 h-6 text-red-500 opacity-60" />
                      <p className="ui-text text-[9px] font-black text-red-500">{error}</p>
                      <button onClick={handleSearchAI} className="px-4 py-1 bg-red-500/10 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest">Repetir</button>
                    </div>
                  ) : aiEntry ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      {/* AI Content */}
                      <div className="prose prose-gold max-w-none">
                        <div className="whitespace-pre-wrap ui-text text-[15px] leading-relaxed text-bible/80">
                           {aiEntry.definition}
                        </div>
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
