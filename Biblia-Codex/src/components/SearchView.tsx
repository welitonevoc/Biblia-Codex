import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, BookOpen, ChevronRight, Clock, TrendingUp, Sparkles, Loader2, Play, Pause, AlertCircle, Wrench } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAudioTracksForChapter } from '../data/audioData';
import { getAIResponse, getApiKey, getConfiguredProvider } from '../services/geminiService';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface SearchViewProps {
  onNavigate: (bookId: string, chapter: number, verse: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onNavigate }) => {
  const { currentVersion, settings, updateSettings } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [aiEnabled, setAiEnabled] = useState(() => settings.ai.searchWithAI ?? false);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [aiResults, setAiResults] = useState<Map<string, string>>(new Map());
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const toggleAI = useCallback(() => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    updateSettings({ ai: { ...settings.ai, searchWithAI: newValue } });
  }, [aiEnabled, settings.ai, updateSettings]);

  const handlePlayAudio = useCallback((verse: Verse) => {
    const trackId = `${verse.bookId}-${verse.chapter}-${verse.verse}`;
    if (playingVerse === trackId) {
      setPlayingVerse(null);
      setAudioPlaying(false);
      return;
    }
    setPlayingVerse(trackId);
    setAudioPlaying(true);
    setTimeout(() => {
      setPlayingVerse(null);
      setAudioPlaying(false);
    }, 3000);
  }, [playingVerse]);

  const handleAISearch = useCallback(async (term: string, searchResults: Verse[]) => {
    if (!aiEnabled || searchResults.length === 0) {
      if (!aiEnabled) {
        setAiError('Busca com IA desativada. Ative o interruptor para usar.');
      }
      return;
    }

    // Verificar se há chave de API configurada
    const apiKey = getApiKey();
    if (!apiKey) {
      const provider = getConfiguredProvider();
      const message = `Chave de API não configurada. Vá em Configurações → IA e adicione sua chave para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}.`;
      setAiError(message);
      setAiEnabled(false);
      updateSettings({ ai: { ...settings.ai, searchWithAI: false } });
      return;
    }

    setAiError(null);
    setIsAiLoading(true);
    const newResults = new Map(aiResults);
    let hadError = false;

    try {
      // Processar até 3 resultados com IA
      for (const verse of searchResults.slice(0, 3)) {
        const key = `${verse.bookId}-${verse.chapter}:${verse.verse}`;
        try {
          const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
          const bookName = book ? book.name : verse.bookId;
          
          // Usar skills do agente-IA se disponível, caso contrário usar geminiService
          const prompt = `Pesquise sobre "${term}" no contexto de ${bookName} ${verse.chapter}:${verse.verse}. Texto: ${verse.text}`;
          const explanation = await getAIResponse(
            prompt,
            'Você é um assistente de estudo bíblico. Forneça insights profundos sobre o texto, contextualização e aplicação prática. Se houver palavras-chave como "safe" ou "warning" mencione aspectos de segurança espiritual.'
          );
          newResults.set(key, explanation);
        } catch (err: any) {
          hadError = true;
          const errorMsg = `Erro ao processar versículo ${verse.bookId} ${verse.chapter}:${verse.verse}`;
          newResults.set(key, `❌ ${errorMsg}: ${err.message || 'Erro desconhecido'}`);
        }
      }
      setAiResults(newResults);
      if (hadError) {
        setAiError('Algumas interpretações não puderam ser geradas. Verifique sua chave de API e conexão.');
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [aiEnabled, aiResults, settings.ai, updateSettings]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (term.length < 2) return;

    setIsSearching(true);
    setAiResults(new Map());
    setAiError(null);
    try {
      const found = await BibleService.search(term, currentVersion || undefined);
      setResults(found);

      const nextRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));

      if (aiEnabled && found.length > 0) {
        await handleAISearch(term, found);
      }
    } catch (error) {
      console.error('Search error:', error);
      setAiError('Erro na busca. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  }, [currentVersion, aiEnabled, handleAISearch]);

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-28 space-y-6">
        
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5",
            "bg-[var(--surface-1)] border border-[var(--border-bible)]",
            "transition-all duration-300 hover:shadow-md"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--accent-bible) 0%, transparent 70%)'
            }}
          />
          <div className="relative flex items-start gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
            )}>
              <SearchIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-bible)]" />
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full",
                  "text-[10px] font-bold uppercase tracking-wider",
                  "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
                )}>
                  Pesquisa Bíblica
                </span>
              </div>
              <h1 className={cn(
                "text-3xl font-bold text-[var(--text-bible)]",
                "tracking-tight"
              )} style={{ fontFamily: 'var(--font-display)' }}>
                Buscar
              </h1>
              <p className="mt-1 text-[var(--text-bible-muted)] text-sm">
                Encontre versículos, palavras e temas na Palavra
              </p>
            </div>
          </div>
          
          <div className="mt-4 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                }
              }}
              placeholder="Digite um versículo, palavra ou tema..."
              className={cn(
                "w-full pl-12 pr-20 py-4 rounded-2xl",
                "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                "text-[var(--text-bible)] text-base font-medium",
                "placeholder:text-[var(--text-bible-subtle)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)] focus:ring-offset-2",
                "transition-all duration-200"
              )}
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--accent-bible)]/40" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAI}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                  aiEnabled 
                    ? "bg-[var(--accent-bible)] text-white" 
                    : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]"
                )}
                title={aiEnabled ? "IA ativa - clique para desativar" : "Ativar busca com IA"}
              >
                <Sparkles className="w-4 h-4" />
              </motion.button>
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => { setQuery(''); setResults([]); setAiResults(new Map()); }}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    "bg-[var(--surface-2)] text-[var(--text-bible-muted)]",
                    "hover:bg-[var(--surface-3)] hover:text-[var(--text-bible)]",
                    "transition-all duration-200"
                  )}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
          
          {aiEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 text-xs text-[var(--accent-bible)]"
            >
              <Sparkles className="w-3 h-3" />
              <span>Modo IA ativo: resultados terão explicações contextuais</span>
            </motion.div>
          )}
          
          {/* Error message */}
          {aiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {aiError}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Configure em Configurações → IA ou desative o modo IA.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {isSearching && (
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
            <p className="mt-4 text-[var(--text-bible-muted)] text-sm">Buscando...</p>
          </motion.div>
        )}

        {!isSearching && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-bible)]">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
              </h2>
              {aiEnabled && (
                <span className="text-xs text-[var(--accent-bible)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  IA ativa
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {results.slice(0, 20).map((verse, index) => {
                const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
                const hasAiResult = aiResults.has(`${verse.bookId}-${verse.chapter}:${verse.verse}`);
                const aiLoading = isAiLoading && !hasAiResult && aiEnabled;
                
                return (
                  <motion.div
                    key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div
                      onClick={() => onNavigate(verse.bookId, verse.chapter, verse.verse)}
                      className={cn(
                        "relative rounded-xl p-4 cursor-pointer transition-all",
                        "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                        "hover:border-[var(--accent-bible)]/30 hover:shadow-md",
                      )}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onNavigate(verse.bookId, verse.chapter, verse.verse);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[var(--accent-bible)]" />
                          <span className="text-xs font-bold text-[var(--accent-bible)] uppercase tracking-wide">
                            {book?.abbreviation} {verse.chapter}:{verse.verse}
                          </span>
                        </div>
                        <div
                          onClick={(e) => { e.stopPropagation(); handlePlayAudio(verse); }}
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                            playingVerse === `${verse.bookId}-${verse.chapter}-${verse.verse}`
                              ? "bg-[var(--accent-bible)] text-white scale-105"
                              : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)] hover:scale-105"
                          )}
                          role="button"
                          tabIndex={0}
                          aria-label="Ouvir versículo"
                        >
                          {playingVerse === `${verse.bookId}-${verse.chapter}-${verse.verse}` && audioPlaying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-[var(--text-bible)] leading-relaxed mb-3">
                        {verse.text}
                      </p>
                      
                      {/* AI Result */}
                      {aiEnabled && (
                        <AnimatePresence>
                          {aiLoading && !hasAiResult && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-center gap-2 text-xs text-[var(--accent-bible)]/60 py-2"
                            >
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Processando com IA...</span>
                            </motion.div>
                          )}
                          
                          {hasAiResult && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "mt-3 p-3 rounded-lg border-l-2",
                                "bg-[var(--accent-bible)]/5 border-[var(--accent-bible)]/20"
                              )}
                            >
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-bible)] mb-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Interpretação IA</span>
                                <Wrench className="w-3 h-3 ml-auto" title="Processado com agente-IA skills" />
                              </div>
                              <p className="text-xs text-[var(--text-bible)] leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                                 dangerouslySetInnerHTML={{ 
                                   __html: aiResults.get(`${verse.bookId}-${verse.chapter}:${verse.verse}`)?.replace(/\n/g, '<br/>') || '' 
                                 }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Show AI error if exists */}
            {aiError && results.length <= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Nota sobre a busca com IA</span>
                </div>
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  A funcionalidade de IA requer uma chave de API configurada em Configurações → IA.
                  Se você comprou o app ou tem uma assinatura, acesse as configurações para ativar.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="p-4 rounded-full bg-[var(--surface-2)] mb-4">
              <SearchIcon className="w-8 h-8 text-[var(--text-bible-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-bible)] mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-sm text-[var(--text-bible-muted)] max-w-xs">
              Tente buscar com palavras diferentes, verifique a ortografia ou use termos mais genéricos.
            </p>
          </motion.div>
        )}

        {/* Recent Searches (shown when no query) */}
        {!isSearching && results.length === 0 && query.length < 2 && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "rounded-2xl p-5",
              "bg-[var(--surface-1)] border border-[var(--border-bible)]"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[var(--accent-bible)]" />
              <h3 className="text-sm font-bold text-[var(--text-bible)]">Buscas recentes</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRecentSearch(term)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                    "text-sm font-medium",
                    "bg-[var(--surface-2)] text-[var(--text-bible-muted)]",
                    "hover:bg-[var(--surface-3)] hover:text-[var(--text-bible)]",
                    "transition-all duration-200"
                  )}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {term}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default SearchView;