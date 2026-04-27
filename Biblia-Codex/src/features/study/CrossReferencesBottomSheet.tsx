import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Layers, Sparkles, Loader2, Book, 
  ChevronRight, AlertCircle, Share2, Save,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { MySwordParser } from '../services/mySwordParser';
import { CrossReference } from '../types';
import { cn } from '../utils/cn';
import DOMPurify from 'dompurify';

interface CrossReferencesBottomSheetProps {
  bookId: string;
  chapter: number;
  verse: number;
  onClose: () => void;
  isOpen: boolean;
  onNavigate?: (bookId: string, chapter: number, verse?: number) => void;
}

export const CrossReferencesBottomSheet: React.FC<CrossReferencesBottomSheetProps> = ({ 
  bookId, chapter, verse, onClose, isOpen, onNavigate 
}) => {
  const { settings, availableXrefs } = useAppContext();
  const [activeTab, setActiveTab] = useState<'local' | 'ai'>('local');
  const [localEntry, setLocalEntry] = useState<{ text: string, moduleName: string } | null>(null);
  const [aiContent, setAiContent] = useState<CrossReference[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModulePath, setSelectedModulePath] = useState('');

  useEffect(() => {
    if (availableXrefs.length > 0 && !selectedModulePath) {
      setSelectedModulePath(availableXrefs[0].path);
    }
  }, [availableXrefs]);

  useEffect(() => {
    if (isOpen && bookId) {
      setLocalEntry(null);
      setAiContent(null);
      setActiveTab('local');
      if (availableXrefs.length > 0) {
        handleSearchLocal(selectedModulePath || availableXrefs[0].path);
      } else {
        setActiveTab('ai');
        handleSearchAI();
      }
    }
  }, [isOpen, bookId, chapter, verse]);

  const handleSearchLocal = async (forcedPath?: string) => {
    const targetPath = forcedPath || selectedModulePath;
    if (!targetPath) {
      setActiveTab('ai');
      handleSearchAI();
      return;
    }

    setLoading(true);
    setLocalEntry(null);
    try {
      const result = await BibleService.getLocalCrossReferences(bookId, chapter, verse, targetPath);
      setLocalEntry(result);
      if (!result && !aiContent) {
        setActiveTab('ai');
        handleSearchAI();
      }
    } catch (err) {
      console.error("Erro na busca de referências locais:", err);
      setActiveTab('ai');
      handleSearchAI();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAI = async () => {
    if (aiContent && aiContent.length > 0) return;
    setLoadingAI(true);
    setError(null);
    try {
      const result = await BibleService.getCrossReferences(bookId, chapter, verse, settings.ai.model);
      if (result && result.length > 0) {
        setAiContent(result);
      } else {
        setError('Nenhuma referência cruzada encontrada ou gerada.');
      }
    } catch (err) {
      setError('Falha ao gerar referências cruzadas.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (!isOpen) return null;

  const verseLabel = `${bookId} ${chapter}:${verse}`;

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
                      Estudo
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      Referências
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-bible mt-0.5">
                    {verseLabel}
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
                <Layers className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Base de Dados</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                className={cn(
                  "flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'ai' ? "bg-blue-500/20 text-blue-500 shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Descoberta IA</span>
              </button>
            </div>

            {/* Module Selector */}
            {activeTab === 'local' && availableXrefs.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Book className="w-3 h-3 text-blue-500 opacity-50" />
                </div>
                <select 
                  className="w-full pl-8 pr-3 py-2 bg-bible-text/5 border border-bible-border/5 rounded-xl ui-text text-[10px] font-bold text-bible/70 appearance-none focus:outline-none transition-all cursor-pointer"
                  value={selectedModulePath}
                  onChange={(e) => {
                    const path = e.target.value;
                    setSelectedModulePath(path);
                    handleSearchLocal(path);
                  }}
                >
                  {availableXrefs.map(module => (
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
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-20">
                      <Loader2 className="w-6 h-6 animate-spin text-bible" />
                      <p className="ui-text text-[9px] uppercase tracking-widest font-black text-bible">Consultando Ligações...</p>
                    </div>
                  ) : localEntry ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="glass-panel p-5">
                        <div 
                          className="prose prose-bible max-w-none ui-text text-[15px] leading-relaxed text-bible/80"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(MySwordParser.parseContent(localEntry.text)) }}
                        />
                      </div>
                      <div className="flex items-center justify-end px-2 opacity-30">
                        <span className="text-[9px] font-black uppercase tracking-widest text-bible">Fonte: {localEntry.moduleName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20 text-center">
                      <Layers className="w-10 h-10 text-bible" />
                      <p className="ui-text text-[10px] font-black uppercase tracking-widest text-bible">Nenhuma referência cruzada local</p>
                      <button 
                        onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest"
                      >
                        Encontrar com IA
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
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="relative">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <Sparkles className="w-4 h-4 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <p className="ui-text text-[9px] uppercase tracking-widest font-black text-blue-500">Mapeando Conexões Bíblicas...</p>
                    </div>
                  ) : error ? (
                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-red-500 opacity-60" />
                      <p className="ui-text text-[10px] font-black text-red-500">{error}</p>
                      <button onClick={handleSearchAI} className="px-4 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Tentar Novamente</button>
                    </div>
                  ) : aiContent && aiContent.length > 0 ? (
                    <div className="space-y-3 animate-in fade-in duration-500">
                      {aiContent.map((xref) => (
                        <div 
                          key={xref.id} 
                          className="glass-panel p-4 rounded-2xl hover:bg-bible-text/5 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(xref.bookId, xref.chapter, xref.verse);
                              onClose();
                            }
                          }}
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="ui-text text-[11px] font-black text-blue-500 uppercase tracking-wider">
                                {xref.bookName || xref.bookId} {xref.chapter}:{xref.verse}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300" />
                            </div>
                            {xref.text && (
                              <p className="ui-text text-sm leading-relaxed text-bible/80">"{xref.text}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-bible-border/5">
                        <button className="flex items-center justify-center gap-2 p-4 glass-panel rounded-2xl text-bible hover:bg-bible-text/5 transition-all">
                          <Share2 className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Compartilhar</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 glass-panel rounded-2xl text-blue-500 hover:bg-blue-500/10 transition-all">
                          <Save className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Salvar Tópico</span>
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
