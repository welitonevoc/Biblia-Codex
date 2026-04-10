import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, BookOpen, ChevronRight, History, Sparkles } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

      // Save recent
      const nextRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="h-full flex flex-col premium-page max-w-4xl mx-auto">
      <div className="premium-hero pb-4">
        <span className="premium-kicker">Explorador Global</span>
        <h1 className="premium-title">O que você procura?</h1>
        
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-bible-accent/40" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Pesquise por palavras, temas ou versículos..."
            className="w-full bg-bible-accent/5 border border-bible-accent/10 focus:border-bible-accent/30 focus:bg-bible-accent/10 rounded-[28px] py-4 pl-14 pr-14 text-lg font-medium placeholder:text-bible-text/25 outline-none transition-all"
          />
          {query && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-4 flex items-center p-2 text-bible-text/30 hover:text-bible-text"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {recentSearches.length > 0 && !results.length && !isSearching && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bible-accent/5 hover:bg-bible-accent/10 text-xs font-bold text-bible-accent/60 transition-all border border-transparent hover:border-bible-accent/10"
              >
                <History className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto premium-scroll px-1 pb-24">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="h-10 w-10 rounded-full border-2 border-bible-accent/15 border-t-bible-accent animate-spin" />
              <p className="ui-text text-xs font-bold uppercase tracking-widest text-bible-accent/40">Vasculhando as Escrituras...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="ui-text text-[10px] font-black uppercase tracking-widest text-bible-accent/30">
                  {results.length} resultados encontrados
                </span>
                <Sparkles className="h-4 w-4 text-bible-accent/20" />
              </div>
              
              {results.map((verse, idx) => (
                <button
                  key={`${verse.bookId}-${verse.chapter}-${verse.verse}-${idx}`}
                  onClick={() => onNavigate(verse.bookId, verse.chapter, verse.verse)}
                  className="w-full premium-card-soft p-5 rounded-[28px] text-left hover:border-bible-accent/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-bible-accent/10 text-bible-accent p-1.5 rounded-xl group-hover:bg-bible-accent group-hover:text-bible-bg transition-colors">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-display font-bold text-bible-text text-lg">
                        {verse.bookId} {verse.chapter}:{verse.verse}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-bible-accent/30 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="bible-text text-sm leading-relaxed text-bible-text/70 line-clamp-3">
                    {verse.text}
                  </p>
                </button>
              ))}
            </motion.div>
          ) : query.length >= 2 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="opacity-20 mb-4 flex justify-center">
                <SearchIcon className="h-16 w-16" />
              </div>
              <p className="font-display text-xl text-bible-text/40">Nenhum versículo encontrado para "{query}"</p>
              <p className="ui-text text-sm text-bible-text/30 mt-2">Tente termos mais genéricos ou verifique a ortografia.</p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
              <Sparkles className="h-12 w-12 mb-4" />
              <p className="max-w-xs ui-text font-bold uppercase tracking-widest text-xs">
                Explore a Bíblia por conceitos como "Paz", "Justiça" ou pesquise passagens específicas.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
