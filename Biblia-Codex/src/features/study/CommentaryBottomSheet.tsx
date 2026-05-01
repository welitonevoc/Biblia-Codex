import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, Loader2, Book, 
  History, ChevronRight, AlertCircle, Quote,
  Share2, Save, MessageSquare, Languages
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { MySwordParser } from '../services/mySwordParser';
import { cn } from '../utils/cn';
import DOMPurify from 'dompurify';

interface CommentaryBottomSheetProps {
  bookId: string;
  chapter: number;
  verse: number;
  onClose: () => void;
  isOpen: boolean;
}

export const CommentaryBottomSheet: React.FC<CommentaryBottomSheetProps> = ({ 
  bookId, chapter, verse, onClose, isOpen 
}) => {
  const { settings, availableCommentaries, updateSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'local' | 'ai'>('local');
  const [localEntry, setLocalEntry] = useState<{ text: string, moduleName: string } | null>(null);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookId) {
      setLocalEntry(null);
      setAiContent(null);
      setActiveTab('local');
      handleSearchLocal();
    }
  }, [isOpen, bookId, chapter, verse]);

  const handleSearchLocal = async (forcedPath?: string) => {
    setLoading(true);
    setLocalEntry(null);
    try {
      const savedPath = settings.studyTools.selectedCommentaryDictionary;
      const targetPath = forcedPath || savedPath;
      
      let commentaryModule;
      if (targetPath) {
        commentaryModule = availableCommentaries.find(c => c.path === targetPath);
      }
      
      if (!commentaryModule) {
        commentaryModule = availableCommentaries[0];
      }

      if (commentaryModule) {
        const result = await BibleService.getLocalCommentary(bookId, chapter, verse, commentaryModule.path);
        setLocalEntry(result);
        if (!result && !aiContent) {
          // Fallback para IA se não houver local
          setActiveTab('ai');
          handleSearchAI();
        }
      } else {
        // Sem módulos locais, vai direto pra IA
        setActiveTab('ai');
        handleSearchAI();
      }
    } catch (err) {
      console.error("Erro na busca de comentário local:", err);
      setActiveTab('ai');
      handleSearchAI();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAI = async () => {
    if (aiContent) return;
    setLoadingAI(true);
    setError(null);
    try {
      const result = await BibleService.getCommentary(bookId, chapter, verse, settings.ai.model);
      setAiContent(result);
    } catch (err) {
      setError('Falha ao gerar comentário exegético.');
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
                      Comentário
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/10 text-gold">
                      Exegese
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-bible mt-0.5">
                    {verseLabel}
                  </h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-full bg-bible-text/5 text-bible opacity-60 transition-all hover:bg-bible-text/10 hover:opacity-100"
                aria-label="Fechar comentário"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Tabs */}
            <div className="flex space-x-1 p-1 rounded-xl bg-bible-text/5">
              <button 
                onClick={() => setActiveTab('local')}
                className={cn(
                  "flex-1 min-h-10 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'local' ? "bg-bible-text/10 text-bible shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Exposição</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                className={cn(
                  "flex-1 min-h-10 py-1.5 rounded-lg flex items-center justify-center space-x-2 transition-all",
                  activeTab === 'ai' ? "bg-gold/20 text-gold shadow-sm" : "text-bible/40 hover:text-bible/60"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="ui-text text-[9px] font-black uppercase tracking-widest">Erudição IA</span>
              </button>
            </div>

            {/* Commentary Module Selector */}
            {activeTab === 'local' && availableCommentaries.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Book className="w-3 h-3 text-gold opacity-50" />
                </div>
                <select 
                  className="w-full pl-8 pr-3 py-2 bg-bible-text/5 border border-bible-border/5 rounded-xl ui-text text-[10px] font-bold text-bible/70 appearance-none focus:outline-none transition-all cursor-pointer"
                  value={settings.studyTools.selectedCommentaryDictionary || availableCommentaries[0].path}
                  onChange={(e) => {
                    const path = e.target.value;
                    updateSettings({ studyTools: { ...settings.studyTools, selectedCommentaryDictionary: path } });
                    handleSearchLocal(path);
                  }}
                >
                  <optgroup label="Comentários Instalados" className="bg-bible-bg text-bible">
                    {availableCommentaries.map(module => (
                      <option key={module.path} value={module.path}>{module.name}</option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-20">
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content Area */}
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
                      <p className="ui-text text-[9px] uppercase tracking-widest font-black text-bible">Consultando Módulo...</p>
                    </div>
                  ) : localEntry ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="glass-panel p-5">
                        <div className="prose prose-gold max-w-none prose-p:ui-text prose-p:text-base prose-p:leading-relaxed prose-strong:text-gold prose-p:text-bible">
                           <div 
                             dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(MySwordParser.parseContent(localEntry.text)) }}
                           />
                        </div>
                      </div>
                      <div className="flex items-center justify-end px-2 opacity-30">
                        <span className="text-[9px] font-black uppercase tracking-widest text-bible">Fonte: {localEntry.moduleName}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20 text-center">
                      <MessageSquare className="w-10 h-10 text-bible" />
                      <p className="ui-text text-[10px] font-black uppercase tracking-widest text-bible">Nenhum comentário local para este versículo</p>
                      <button 
                        onClick={() => { setActiveTab('ai'); handleSearchAI(); }}
                        className="px-4 py-2 bg-gold/20 text-gold rounded-full text-[9px] font-black uppercase tracking-widest"
                      >
                        Usar Erudição IA
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
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        <Sparkles className="w-4 h-4 text-gold absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <p className="ui-text text-[9px] uppercase tracking-widest font-black text-gold">Analista IA em Ação...</p>
                    </div>
                  ) : error ? (
                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-red-500 opacity-60" />
                      <p className="ui-text text-[10px] font-black text-red-500">{error}</p>
                      <button onClick={handleSearchAI} className="min-h-10 px-4 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Tentar Novamente</button>
                    </div>
                  ) : aiContent ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="prose prose-gold max-w-none">
                        <div className="whitespace-pre-wrap ui-text text-[15px] leading-relaxed text-bible/80">
                           {aiContent}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-bible-border/5">
                        <button className="flex items-center justify-center gap-2 p-4 glass-panel rounded-2xl text-bible">
                          <Share2 className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Compartilhar</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 glass-panel rounded-2xl text-gold">
                          <Save className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Arquivar</span>
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
