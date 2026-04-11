import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BookOpen, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../AppContext';

interface StudyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVerses: { verse: number, text: string }[];
  bookName: string;
  chapter: number;
}

export const StudyPanel: React.FC<StudyPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedVerses,
  bookName,
  chapter
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { settings } = useAppContext();

  const analyzeVerses = async () => {
    if (selectedVerses.length === 0) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Analise os seguintes versículos de ${bookName} ${chapter}:
      ${selectedVerses.map(v => `${v.verse}: ${v.text}`).join('\n')}
      
      Forneça uma análise teológica profunda, contexto histórico e aplicação prática para os dias de hoje. Use um tom acadêmico mas acessível.`;

      const response = await ai.models.generateContent({
        model: settings.ai.model,
        contents: prompt,
      });

      setAnalysis(response.text || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error(error);
      setAnalysis("Erro ao conectar com a inteligência artificial. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[150]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-[200] flex flex-col"
            style={{
              background: 'var(--surface-overlay)',
              backdropFilter: 'blur(24px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
              boxShadow: 'var(--shadow-float)',
            }}
          >
            <div className="p-5 sm:p-8 flex items-center justify-between" style={{ paddingTop: 'var(--sat)' }}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-bible-accent" strokeWidth={1.8} />
                <h2 className="font-display text-xl sm:text-2xl font-bold">Análise Codex</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bible-surface rounded-full"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="border-b border-bible-border" />

            <div className="flex-1 overflow-y-auto p-4">
              {selectedVerses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <BookOpen className="w-10 h-10 mb-3" />
                  <p className="text-sm">Selecione versículos para analisar.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded border border-bible-border bg-bible-surface">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-bible-text-muted mb-3">Selecionados</h3>
                    <div className="space-y-2">
                      {selectedVerses.map(v => (
                        <p key={v.verse} className="text-sm italic">
                          <span className="font-bold mr-2">{v.verse}</span>
                          {v.text}
                        </p>
                      ))}
                    </div>
                  </div>

                  {!analysis && !loading && (
                    <button 
                      onClick={analyzeVerses}
                      className="w-full bg-bible-accent text-bible-bg py-4 rounded-xl font-bold ui-text flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform shadow-lg shadow-bible-accent/20"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>GERAR ANÁLISE TEOLÓGICA</span>
                    </button>
                  )}

                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-bible-accent" />
                      <p className="ui-text text-sm opacity-50 italic">Consultando os mestres...</p>
                    </div>
                  )}

                  {analysis && (
                    <div className="prose prose-bible max-w-none">
                      <div className="ui-text text-sm leading-relaxed space-y-4">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                      </div>
                      <button 
                        onClick={() => setAnalysis(null)}
                        className="mt-8 ui-text text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                      >
                        Nova Análise
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
