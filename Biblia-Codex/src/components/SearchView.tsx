import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, BookOpen, ChevronRight, Clock, TrendingUp, Sparkles, Loader2, Play, Pause } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAudioTracksForChapter } from '../data/audioData';
import { getAIResponse } from '../services/geminiService';

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
    if (!aiEnabled || searchResults.length === 0) return;

    const newResults = new Map(aiResults);
    for (const verse of searchResults.slice(0, 3)) {
      const key = `${verse.bookId}-${verse.chapter}:${verse.verse}`;
      try {
        const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
        const bookName = book ? book.name : verse.bookId;
        const prompt = `Pesquise sobre "${term}" no contexto de ${bookName} ${verse.chapter}:${verse.verse}. Texto: ${verse.text}`;
        const explanation = await getAIResponse(
          prompt,
          'Você é um assistente de estudo bíblico. Forneça insights profundos sobre o texto, contextualização e aplicação prática.'
        );
        newResults.set(key, explanation);
      } catch (e) {
        console.error('AI search error:', e);
      }
    }
    setAiResults(newResults);
  }, [aiEnabled, aiResults]);

  useEffect(() => {
    const saved = localStorage.getItem('kerygma-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleSearch = async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (term.length < 2) return;

    setIsSearching(true);
    setAiResults(new Map());
    try {
      const found = await BibleService.search(term, currentVersion || undefined);
      setResults(found);

      const nextRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));

      if (aiEnabled && found.length > 0) {
        handleAISearch(term, found);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

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
        </motion.div>

{/* Search Input Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-bible-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Pesquise na Biblia..."
              className={cn(
                "w-full h-14 pl-12 pr-24 rounded-xl",
                "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                "text-[var(--text-bible)] text-base font-medium",
                "placeholder:text-[var(--text-bible-subtle)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)] focus:ring-offset-2",
                "transition-all duration-200"
              )}
            />
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
                  onClick={() => { setQuery(''); setResults([]); }}
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
              className="flex items-center gap-2 mt-2 text-xs text-[var(--accent-bible)]"
            >
              <Sparkles className="w-3 h-3" />
              <span>Busca com IA ativada - resultados serao enhanced com explicacoes</span>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Searches */}
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

        {/* Loading State */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={cn(
                "w-12 h-12 rounded-full border-4",
                "border-[var(--accent-bible)]/20 border-t-[var(--accent-bible)]"
              )}
            />
            <p className="text-sm text-[var(--text-bible-muted)] mt-4 font-medium">Buscando...</p>
          </motion.div>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider">
                {results.length} resultados
              </h3>
              <button 
                onClick={() => { setQuery(''); setResults([]); }}
                className="text-xs font-medium text-[var(--accent-bible)]"
              >
                Limpar
              </button>
            </div>
            
            <div className="space-y-3">
              {results.slice(0, 20).map((verse, index) => {
                const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
                return (
                  <motion.button
                    key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={() => onNavigate(verse.bookId, verse.chapter, verse.verse)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl",
                      "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                      "hover:border-[var(--accent-bible)]/30 hover:shadow-sm",
                      "transition-all duration-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[var(--accent-bible)]" />
                        <span className="text-xs font-bold text-[var(--accent-bible)] uppercase tracking-wide">
                          {book?.abbreviation} {verse.chapter}:{verse.verse}
                        </span>
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); handlePlayAudio(verse); }}
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer",
                          playingVerse === `${verse.bookId}-${verse.chapter}-${verse.verse}`
                            ? "bg-[var(--accent-bible)] text-white"
                            : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)]"
                        )}
                        role="button"
                        tabIndex={0}
                      >
                        {playingVerse === `${verse.bookId}-${verse.chapter}-${verse.verse}` && audioPlaying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-bible)] line-clamp-2">
                      {verse.text}
                    </p>
                    {aiEnabled && aiResults.has(`${verse.bookId}:${verse.chapter}:${verse.verse}`) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 p-2 rounded-lg bg-[var(--accent-bible)]/10 border border-[var(--accent-bible)]/20"
                      >
                        <div className="flex items-center gap-1 text-xs text-[var(--accent-bible)] font-medium mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Interpretacao IA</span>
                        </div>
                        <p className="text-xs text-[var(--text-bible)] line-clamp-3">
                          {aiResults.get(`${verse.bookId}:${verse.chapter}:${verse.verse}`)}
                        </p>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col items-center justify-center py-16 text-center"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl mb-4 flex items-center justify-center",
              "bg-[var(--surface-1)] border border-[var(--border-bible)]"
            )}>
              <SearchIcon className="w-8 h-8 text-[var(--text-bible-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-bible)] mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-sm text-[var(--text-bible-muted)] max-w-xs">
              Tente buscar com outras palavras ou verifique a ortografia
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};