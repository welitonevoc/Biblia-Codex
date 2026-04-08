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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-bible-bg border-l border-bible-accent/20 z-[200] shadow-2xl flex flex-col"
          >
            <div className="p-4 sm:p-8 border-b border-bible-accent/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-bible-accent" />
                <h2 className="text-xl sm:text-2xl font-display font-bold">Análise Kerygma</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bible-accent/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {selectedVerses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <BookOpen className="w-12 h-12" />
                  <p className="ui-text max-w-xs">Selecione um ou mais versículos no texto para iniciar uma análise profunda.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-bible-accent/5 rounded-2xl p-6 border border-bible-accent/10">
                    <h3 className="ui-text text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4">Versículos Selecionados</h3>
                    <div className="space-y-3">
                      {selectedVerses.map(v => (
                        <p key={v.verse} className="bible-text text-sm italic">
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
