import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, Book, History, Play, Loader2, AlertCircle, BookOpen, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { DictionaryEntry } from '../types';
import { createAiModule, AI_MODULE_ID, getAIDefinition } from '../services/dictionaryService';
import { storage } from '../StorageService';
import { motion, AnimatePresence } from 'motion/react';
import DOMPurify from 'dompurify';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { speakText, stopSpeaking, isTTSSupported } from '../services/ttsService';
import { getConfiguredProvider, testAIConfiguration, diagnoseAIConfiguration } from '../services/geminiService';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

export const DictionaryView: React.FC = () => {
  const { searchDictionary, selectedDictionaryModule, setSelectedDictionaryModule, availableDictionaries, settings, updateSettings } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ term: string; timestamp: number }[]>([]);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayingTerm, setCurrentPlayingTerm] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(() => settings.ai.termDefinition ?? true);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [configTest, setConfigTest] = useState<{ success: boolean; message: string; quotaWarning?: boolean; suggestion?: string } | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await storage.getDictionaryHistory();
      setHistory(savedHistory);
    };
    loadHistory();
  }, []);

  const toggleAI = useCallback(() => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    updateSettings({ ai: { ...settings.ai, termDefinition: newValue } });
  }, [aiEnabled, settings.ai, updateSettings]);

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && (href.startsWith('d') || href.startsWith('s'))) {
        e.preventDefault();
        const word = href.startsWith('d-') ? href.split(' ').slice(1).join(' ') : href.substring(1);
        setSearchTerm(word);
      }
    }
  };

  const handleSearch = async (e?: React.FormEvent, termToSearch?: string) => {
    e?.preventDefault();
    const term = termToSearch || searchTerm;
    if (!term.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    console.log('[DictionaryView] Pesquisando:', term, 'AI:', aiEnabled, 'Module:', selectedDictionaryModule?.id);

    try {
      const entries = await searchDictionary(term);
      console.log('[DictionaryView] Resultados:', entries.length, entries[0]?.definition?.substring(0, 100));
      setResults(entries);
      
      if (entries.length > 0) {
        await storage.saveDictionaryCache(term, entries[0].definition, entries[0].moduleName);
      }
      
      await storage.saveDictionaryHistory(term);
      const updatedHistory = await storage.getDictionaryHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error('[DictionaryView] Erro:', err);
      setError(err.message || 'Erro ao Pesquisar');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (entry: DictionaryEntry) => {
    if (!isTTSSupported) return;
    
    if (isSpeakingTTS && currentPlayingTerm === entry.term) {
      stopSpeaking();
      setIsSpeakingTTS(false);
      setCurrentPlayingTerm(null);
      return;
    }

    setIsSpeakingTTS(true);
    setCurrentPlayingTerm(entry.term);
    
    try {
      const plainText = entry.definition.replace(/<[^>]+>/g, ' ').replace(/\n/g, ' ');
      await speakText(`${entry.term}. ${plainText}`, { rate: 0.85, lang: 'pt-BR' });
    } catch (e) {
      console.error('Erro TTS:', e);
    } finally {
      setIsSpeakingTTS(false);
      setCurrentPlayingTerm(null);
    }
  };

  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    handleSearch(undefined, term);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-bible)] bg-[var(--surface-1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-bible)]">Pesquisa Bíblica</h2>
          <button
            onClick={toggleAI}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold transition-all",
              aiEnabled 
                ? "bg-[var(--accent-bible)] text-white" 
                : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] border border-[var(--border-bible)]"
            )}
          >
            <Sparkles className="w-3 h-3" />
            {aiEnabled ? 'IA On' : 'IA Off'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar na Palavra..."
            className="w-full bg-[var(--bg-bible)] border border-[var(--border-bible)] rounded-xl py-3 pl-11 pr-4 text-sm text-[var(--text-bible)] placeholder:text-[var(--text-bible-muted)] focus:outline-none focus:border-[var(--accent-bible)] transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-bible-muted)]" />
          {isLoading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-bible)]" />
            </div>
          )}
        </form>

        {/* AI Panel - Same as SearchView */}
        {aiEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--accent-bible)]">
              <Sparkles className="w-3 h-3" />
              <span>Modo IA ativo: resultados terão explicações contextuais</span>
            </div>

            {/* Aviso sobre plano gratuito */}
            {getConfiguredProvider() === 'google' && (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3" />
                <span>Usando plano gratuito do Gemini (limite baixo). Considere OpenRouter para mais quota.</span>
              </div>
            )}

            {/* Botões de teste */}
            <div className="flex flex-wrap items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  const result = await testAIConfiguration();
                  setConfigTest(result);
                  console.log('Resultado do teste IA:', result);
                  setTimeout(() => setConfigTest(null), 8000);
                }}
                className="text-xs px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] transition-colors"
              >
                Testar Configuração IA
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const diag = diagnoseAIConfiguration();
                  console.log('Diagnóstico IA:', diag);
                  alert(`Diagnóstico IA:\n\nProvider configurado: ${diag.configuredProvider}\nProvider detectado: ${diag.detectedProvider}\nModelo: ${diag.configuredModel}\n\nChave OpenCode: ${diag.hasOpenCodeKey ? 'Sim' : 'Não'}\nChave OpenRouter: ${diag.hasOpenRouterKey ? 'Sim' : 'Não'}\nChave Gemini: ${diag.hasGeminiKey ? 'Sim' : 'Não'}\n\nVerifique o console para mais detalhes.`);
                }}
                className="text-xs px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] transition-colors"
                title="Diagnóstico detalhado da configuração IA"
              >
                🔍 Diagnosticar IA
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (confirm('Isso irá resetar todas as configurações de IA e voltar para o padrão (Google). Você terá que reconfigurar as chaves. Continuar?')) {
                    localStorage.removeItem('ai-api-provider');
                    localStorage.removeItem('opencode-api-key');
                    localStorage.removeItem('openrouter-api-key');
                    localStorage.removeItem('gemini-api-key');
                    alert('Configurações resetadas. A página será recarregada.');
                    window.location.reload();
                  }
                }}
                className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                title="Reset de emergência da configuração IA"
              >
                🔄 Reset IA
              </motion.button>

              {configTest && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "text-xs px-3 py-2 rounded-lg max-w-xs",
                    configTest.success
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : configTest.quotaWarning
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  )}
                >
                  <div className="font-medium mb-1">
                    {configTest.success ? '✅' : configTest.quotaWarning ? '⚠️' : '❌'} Configuração IA
                  </div>
                  <div className="text-xs leading-tight">
                    {configTest.message}
                  </div>
                  {configTest.suggestion && (
                    <div className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                      💡 {configTest.suggestion}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-[var(--accent-bible)] border-t-transparent rounded-full"
            />
            <p className="mt-4 text-[var(--text-bible-muted)] text-sm">Pesquisando...</p>
            {aiEnabled && (
              <p className="mt-2 text-[var(--text-bible-muted)] text-xs">Preparando interpretações com IA...</p>
            )}
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[var(--text-bible-muted)]">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{searchTerm}"
              </h3>
              {aiEnabled && (
                <span className="text-xs text-[var(--accent-bible)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  IA ativa
                </span>
              )}
            </div>
            
            {results.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-xl p-4 bg-[var(--surface-1)] border border-[var(--border-bible)] hover:border-[var(--accent-bible)]/30 hover:shadow-md transition-all"
              >
                {/* Header with module and play button */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--accent-bible)]" />
                    <span className="text-xs font-bold text-[var(--accent-bible)] uppercase tracking-wide">
                      {entry.moduleName}
                    </span>
                    {entry.isAiGenerated && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" />
                        IA
                      </span>
                    )}
                  </div>
                  
                  {isTTSSupported && (
                    <button
                      onClick={() => handlePlayAudio(entry)}
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                        currentPlayingTerm === entry.term && isSpeakingTTS
                          ? "bg-[var(--accent-bible)] text-white scale-105"
                          : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)] hover:scale-105"
                      )}
                    >
                      {currentPlayingTerm === entry.term && isSpeakingTTS ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Term */}
                <h4 className="text-base font-bold text-[var(--text-bible)] mb-3">{entry.term}</h4>
                
                {/* Definition */}
                <div 
                  onClick={handleLinkClick}
                  className="text-sm text-[var(--text-bible)] leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(entry.definition.replace(/\n/g, '<br/>'))
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Book className="w-12 h-12 text-[var(--text-bible-muted)] opacity-30 mb-4" />
            <p className="text-[var(--text-bible-muted)] text-sm">Pesquise um termo para ver a definição.</p>
            <p className="text-[var(--text-bible-muted)] text-xs mt-2 opacity-60">Ex: Graça, Fé, Salvação...</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && results.length === 0 && !isLoading && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[var(--text-bible-muted)]">
                <History className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Buscas Recentes</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 10).map((h) => (
                <button
                  key={h.term}
                  onClick={() => handleHistoryClick(h.term)}
                  className="px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-xs hover:bg-[var(--surface-2)] transition-colors"
                >
                  {h.term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};