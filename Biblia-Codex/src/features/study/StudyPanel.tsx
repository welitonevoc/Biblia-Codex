import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BookOpen, MessageSquare, Loader2, Copy, Share2, RefreshCw, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../../app/AppContext';
import { getAIResponse } from '../../services/geminiService';
import { cn } from '../../utils/cn';

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

  const analyzeVerses = React.useCallback(async () => {
    if (selectedVerses.length === 0) return;
    
    setLoading(true);
    try {
      const versesText = selectedVerses.map(v => `${v.verse}: ${v.text}`).join('\n');
      const prompt = `Analise os seguintes versículos de ${bookName} ${chapter}:
${versesText}

Siga este roteiro de análise teológica de alto nível:
1. **Contexto e Exegese**: Breve panorama histórico e literário.
2. **Termos Chave**: Explique palavras importantes no original (hebraico/grego) se relevante.
3. **Núcleo Teológico**: Destaque a principal mensagem doutrinária ou teológica.
4. **Aplicação Prática**: Como esses versículos falam ao cristão de hoje?
5. **Conexões Bíblicas**: Sugira referências cruzadas que complementam o estudo.

Use um tom acadêmico, profundo, mas pastoral. Use Markdown rico (títulos, negrito, listas) para uma leitura clara e premium.`;

      const response = await getAIResponse(
        prompt,
        'Você é um teólogo acadêmico especializado em análise bíblica de alto nível.',
        undefined,
        settings.ai.model
      );

      setAnalysis(response || "Não foi possível gerar a análise.");
    } catch (error) {
      console.error(error);
      setAnalysis("Erro ao conectar com a inteligência artificial. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [selectedVerses, bookName, chapter, settings.ai.model]);

  // Auto-analyze when opened with verses
  React.useEffect(() => {
    if (isOpen && selectedVerses.length > 0 && !analysis && !loading) {
      analyzeVerses();
    }
  }, [isOpen, selectedVerses, analysis, loading, analyzeVerses]);

  const handleCopyAnalysis = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[400]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl z-[450] flex flex-col bg-[#0f172a] shadow-[-20px_0_80px_rgba(0,0,0,0.4)]"
          >
            {/* Immersive Header (Social Media Style) */}
            <div className="relative h-48 shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-bible-accent via-indigo-950 to-black" />
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end" style={{ paddingTop: 'var(--sat)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Análise Codex</h2>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">IA Teológica Ativa</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full text-white transition-all active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a] p-6 space-y-8">
              {selectedVerses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-white/40">
                  <BookOpen className="w-16 h-16 mb-6 opacity-20" />
                  <p className="text-lg font-bold">O Codex aguarda sua escolha</p>
                  <p className="text-sm">Selecione versículos no leitor para iniciar o estudo.</p>
                </div>
              ) : (
                <div className="max-w-prose mx-auto space-y-10 pb-20">
                  {/* Selection Bubble (User style) */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-6 rounded-3xl rounded-tr-none bg-bible-accent text-white shadow-xl shadow-bible-accent/20 relative">
                      <div className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Meu Estudo • {bookName} {chapter}</div>
                      <div className="space-y-3">
                        {selectedVerses.map(v => (
                          <div key={v.verse} className="flex gap-3 text-sm leading-relaxed">
                            <span className="font-black opacity-60">{v.verse}</span>
                            <p className="font-medium italic">{v.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Response (Bot style) */}
                  <AnimatePresence mode="wait">
                    {!analysis && !loading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center"
                      >
                        <button 
                          onClick={analyzeVerses}
                          className="px-8 h-16 bg-white text-black rounded-full font-black flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                        >
                          <Sparkles className="w-5 h-5 text-bible-accent group-hover:rotate-12 transition-transform" />
                          SOLICITAR EXPLICAÇÃO CODEX
                        </button>
                      </motion.div>
                    )}

                    {loading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-6 py-12"
                      >
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                          <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                          </div>
                        </div>
                        <p className="text-white font-black text-sm uppercase tracking-[0.3em] animate-pulse">Consultando...</p>
                      </motion.div>
                    )}

                    {analysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[95%] p-8 rounded-3xl rounded-tl-none bg-[#1e293b] border border-white/5 shadow-2xl relative overflow-hidden group">
                          {/* Premium Background Accent */}
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Sparkles className="w-32 h-32" />
                          </div>

                          <div className="prose prose-invert prose-bible max-w-none relative z-10">
                            <div className="text-white/90 leading-[1.8]">
                              <ReactMarkdown>{analysis}</ReactMarkdown>
                            </div>
                          </div>

                          {/* Chat Footer Actions */}
                          <div className="flex items-center gap-2 mt-10 pt-6 border-t border-white/5">
                            <button 
                              onClick={handleCopyAnalysis}
                              className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 text-xs font-black uppercase tracking-tighter transition-all active:scale-95"
                            >
                              <Copy className="w-4 h-4" /> Copiar Estudo
                            </button>
                            <button 
                              onClick={() => setAnalysis(null)}
                              className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all active:scale-90"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* Premium Input-like Footer */}
            <div className="p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center gap-4">
              <div className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 px-6 flex items-center text-white/40 text-sm font-medium">
                Selecione mais versículos para continuar...
              </div>
              <div className="w-14 h-14 rounded-2xl bg-bible-accent flex items-center justify-center shadow-lg shadow-bible-accent/20">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
