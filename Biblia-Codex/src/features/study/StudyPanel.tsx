import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, BookOpen, MessageSquare, Loader2, 
  Copy, Share2, RefreshCw, Send, Brain, 
  ScrollText, Quote, ArrowRight, Zap
} from 'lucide-react';
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
  const [userQuestion, setUserQuestion] = useState('');
  const { settings } = useAppContext();

  const analyzeVerses = useCallback(async (customQuestion?: string) => {
    if (selectedVerses.length === 0) return;
    
    setLoading(true);
    try {
      const versesText = selectedVerses.map(v => `${v.verse}: ${v.text}`).join('\n');
      let prompt = '';
      
      if (customQuestion) {
        prompt = `Com base nos versículos de ${bookName} ${chapter}:\n${versesText}\n\nResponda à seguinte dúvida: ${customQuestion}\n\nMantenha o tom acadêmico e teológico profundo.`;
      } else {
        prompt = `Analise os seguintes versículos de ${bookName} ${chapter}:
${versesText}

Siga este roteiro de análise teológica de alto nível:
1. **Exegese e Contexto**: Panorama histórico e literário.
2. **Conceitos Chave**: Explique termos profundos ou originais.
3. **Núcleo Doutrinário**: A mensagem teológica central.
4. **Aplicação Prática**: Relevância para a vida contemporânea.
5. **Conexões**: Referências cruzadas importantes.

Use um tom acadêmico, mas pastoral. Use Markdown rico e estruturado.`;
      }

      const response = await getAIResponse(
        prompt,
        'Você é o Codex, um teólogo acadêmico especializado em análise bíblica de alta fidelidade.',
        undefined,
        settings.ai.model
      );

      setAnalysis(response || "Não foi possível processar a análise.");
    } catch (error) {
      console.error(error);
      setAnalysis("Erro ao conectar com o servidor Codex. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [selectedVerses, bookName, chapter, settings.ai.model]);

  // Auto-analyze when opened with verses if no analysis exists
  useEffect(() => {
    if (isOpen && selectedVerses.length > 0 && !analysis && !loading) {
      analyzeVerses();
    }
  }, [isOpen, selectedVerses, analysis, loading, analyzeVerses]);

  const handleCopyAnalysis = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
  };

  const handleSendQuestion = () => {
    if (!userQuestion.trim() || loading) return;
    analyzeVerses(userQuestion);
    setUserQuestion('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[400]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl z-[450] flex flex-col bg-[#050505] shadow-[-30px_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header Pro Max */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-bible-accent via-bible-accent/40 to-transparent" />
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <motion.div 
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                      className="w-16 h-16 rounded-[22px] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3 h-3 text-bible-accent fill-bible-accent" />
                        <span className="text-[10px] font-black text-bible-accent uppercase tracking-[0.3em]">IA Analítica Ativa</span>
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight">Codex Insight</h2>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
              {selectedVerses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <ScrollText className="w-10 h-10 text-white/20" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Seleção Necessária</p>
                    <p className="text-sm text-white/40 mt-2 max-w-[280px]">Escolha versículos no leitor para que eu possa realizar uma análise profunda.</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[560px] mx-auto space-y-12 pb-32">
                  {/* Selected Verses Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-bible-accent/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-7 rounded-[32px] bg-[#111] border border-white/5 shadow-2xl overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                        <Quote className="w-24 h-24" />
                      </div>
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-4 h-4 text-bible-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-bible-text-muted">Minha Seleção • {bookName} {chapter}</span>
                      </div>
                      <div className="space-y-4">
                        {selectedVerses.map(v => (
                          <div key={v.verse} className="flex gap-4">
                            <span className="text-xs font-black text-bible-accent opacity-60 mt-1">{v.verse}</span>
                            <p className="text-sm font-medium text-white/80 leading-relaxed italic">{v.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Interaction Zone */}
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6 py-12"
                      >
                        <div className="relative w-24 h-24">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[3px] border-bible-accent/10 border-t-bible-accent rounded-full"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-bible-accent animate-pulse" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-xs uppercase tracking-[0.4em] animate-pulse">Sincronizando Codex</p>
                          <p className="text-[10px] text-white/30 uppercase mt-2">Processando análise teológica...</p>
                        </div>
                      </motion.div>
                    ) : analysis ? (
                      <motion.div
                        key="analysis"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                        <div className="p-8 rounded-[40px] bg-[#1a1a1a] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
                          <div className="prose prose-invert prose-bible max-w-none">
                            <div className="text-white/90 text-sm leading-[1.8] font-medium selection:bg-bible-accent/30">
                              <ReactMarkdown>{analysis}</ReactMarkdown>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-10 pt-8 border-t border-white/5">
                            <button 
                              onClick={handleCopyAnalysis}
                              className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/5"
                            >
                              <Copy className="w-4 h-4" /> Copiar Estudo
                            </button>
                            <button 
                              onClick={() => setAnalysis(null)}
                              className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all active:scale-90 border border-white/5"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cta"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center pt-8"
                      >
                        <button 
                          onClick={() => analyzeVerses()}
                          className="px-10 h-20 bg-bible-accent text-white rounded-[24px] font-black flex items-center gap-4 shadow-2xl shadow-bible-accent/40 hover:scale-105 active:scale-95 transition-all group"
                        >
                          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                          <span>SOLICITAR INSIGHT TEOLÓGICO</span>
                          <ArrowRight className="w-5 h-5 opacity-40" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* Interactive Chat Footer */}
            <div className="p-6 pb-10 bg-black/60 backdrop-blur-3xl border-t border-white/10">
              <div className="relative max-w-xl mx-auto flex items-center gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-bible-accent/5 rounded-[22px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input 
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
                    placeholder="Dúvida sobre estes versículos? Pergunte ao Codex..."
                    className="w-full h-16 rounded-[22px] bg-white/5 border border-white/10 px-6 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-bible-accent/50 focus:bg-white/[0.08] transition-all relative z-10"
                  />
                </div>
                <button 
                  onClick={handleSendQuestion}
                  disabled={!userQuestion.trim() || loading}
                  className={cn(
                    "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all shadow-xl active:scale-90 disabled:opacity-30 disabled:grayscale relative z-10",
                    userQuestion.trim() ? "bg-bible-accent text-white shadow-bible-accent/40" : "bg-white/5 text-white/20"
                  )}
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-[0.4em] mt-4">
                Desenvolvido por Google Gemini AI
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
