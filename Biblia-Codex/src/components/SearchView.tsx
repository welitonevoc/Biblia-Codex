import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, BookOpen, ChevronRight, Clock, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';

interface SearchViewProps {
  onNavigate: (bookId: string, chapter: number, verse: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onNavigate }) => {
  const { currentVersion } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('kerygma-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleSearch = async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (term.length < 2) return;

    setIsSearching(true);
    try {
      const found = await BibleService.search(term, currentVersion || undefined);
      setResults(found);

      const nextRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));
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
    <div className="h-full flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-28 space-y-6">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-5"
        >
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-bible-accent/10">
              <SearchIcon className="w-6 h-6 text-bible-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-bible-accent" />
                <span className="premium-kicker">Pesquisa Bíblica</span>
              </div>
              <h1 className="premium-title mt-2 mb-1">Buscar</h1>
              <p className="premium-subtitle text-sm">
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
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-bible-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Pesquise na Bíblia..."
              className="premium-input pl-12 pr-12 py-4 text-base font-medium"
            />
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => { setQuery(''); setResults([]); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 premium-icon-button"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Recent Searches */}
        {!isSearching && results.length === 0 && query.length < 2 && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-bible-accent" />
              <h3 className="text-sm font-bold text-bible-text">Buscas recentes</h3>
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
                  className="premium-chip px-4 py-2"
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
              className="w-12 h-12 border-4 border-bible-accent/20 border-t-bible-accent rounded-full"
            />
            <p className="text-sm text-bible-text-muted mt-4 font-medium">Buscando...</p>
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
              <div>
                <h3 className="text-sm font-bold text-bible-text">Resultados</h3>
                <p className="text-xs text-bible-text-muted">{results.length} {results.length === 1 ? 'encontrado' : 'encontrados'}</p>
              </div>
              <div className="premium-chip">
                <BookOpen className="w-3.5 h-3.5" />
                {results.length}
              </div>
            </div>
            <div className="space-y-3">
              {results.slice(0, 20).map((verse, i) => {
                const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onNavigate(verse.bookId, verse.chapter, verse.verse)}
                    className="premium-card p-4 w-full text-left group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-bible-accent" />
                          <span className="text-xs font-semibold text-bible-accent">{book?.name} {verse.chapter}:{verse.verse}</span>
                        </div>
                        <p className="text-sm text-bible-text line-clamp-2 leading-relaxed font-serif">{verse.text}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && query.length < 2 && recentSearches.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="premium-card-soft p-12 text-center"
          >
            <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
              <SearchIcon className="w-10 h-10 text-bible-accent" />
            </div>
            <h3 className="text-lg font-bold text-bible-text mb-2">Pesquise a Palavra</h3>
            <p className="text-sm text-bible-text-muted">
              Digite um termo para buscar na Bíblia
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
