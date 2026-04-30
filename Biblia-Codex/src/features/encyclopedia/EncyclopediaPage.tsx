import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Loader, BookA, Languages, Hash, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  loadEncyclopediaEntries,
  searchEntries,
  getEntriesByCategory,
  getEntryById,
  getStats,
  getCategories,
  getSuggestions,
} from './EncyclopediaService';
import type { EncyclopediaEntry } from '../../types';

function cnFallback(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[var(--text-bible)] mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[var(--text-bible)] mt-5 mb-3">$1</h2>')
    .replace(/^---$/gm, '<hr class="border-[var(--border-bible)] my-4" />')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\[HEB:(.+?)\]/g, '<span class="font-semibold text-[var(--accent-bible)]" dir="rtl">$1</span>')
    .replace(/→/g, '<span class="text-[var(--accent-bible)]">→</span>')
    .replace(/\n/g, '<br />');
}

interface EncyclopediaDetailViewProps {
  entry: EncyclopediaEntry;
  onBack: () => void;
}

const EncyclopediaDetailView: React.FC<EncyclopediaDetailViewProps> = ({ entry, onBack }) => {
  const htmlContent = useMemo(() => renderMarkdown(entry.text), [entry.text]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="h-full bg-[var(--bg-bible)] overflow-y-auto scrollbar-thin"
    >
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--bg-bible)]/80 border-b border-[var(--border-bible)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-bible)]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[var(--text-bible)] truncate">{entry.word}</h1>
            <div className="flex items-center gap-2 text-xs text-[var(--text-bible-muted)]">
              <span className={cnFallback(
                'px-2 py-0.5 rounded-full font-medium',
                entry.source === 'merrill' ? 'bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]' : 'bg-purple-500/10 text-purple-400'
              )}>
                {entry.source === 'merrill' ? 'Merrill' : 'Vine'}
              </span>
              {entry.language && (
                <span className="flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {entry.language === 'hebrew' ? 'Hebraico' : 'Grego'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 space-y-4"
        >
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

interface EncyclopediaPageProps {
  onBack?: () => void;
}

export const EncyclopediaPage: React.FC<EncyclopediaPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [entries, setEntries] = useState<EncyclopediaEntry[]>([]);
  const [displayEntries, setDisplayEntries] = useState<EncyclopediaEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<EncyclopediaEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<EncyclopediaEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const categories = getCategories();
  const stats = getStats();

  useEffect(() => {
    let cancelled = false;
    loadEncyclopediaEntries().then(allEntries => {
      if (!cancelled) {
        setEntries(allEntries);
        setDisplayEntries(getEntriesByCategory('all', 50));
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load encyclopedia:', err);
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setHighlightedIndex(-1);
    if (query.trim().length < 2) {
      setDisplayEntries(getEntriesByCategory(selectedCategory, 50));
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }
    const sug = getSuggestions(query, 8);
    setSuggestions(sug);
    setShowSuggestions(sug.length > 0);
    setSearching(true);
    const results = searchEntries(query, 50);
    setDisplayEntries(results);
    setSearching(false);
  }, [selectedCategory]);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setDisplayEntries(getEntriesByCategory(catId, 50));
  }, []);

  const handleSuggestionClick = useCallback((entry: EncyclopediaEntry) => {
    setSearchQuery(entry.word);
    setShowSuggestions(false);
    setSelectedEntry(entry);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [suggestions, highlightedIndex, handleSuggestionClick]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-bible)]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-[var(--accent-bible)]" />
          <span className="text-[var(--text-bible-muted)]">Carregando enciclopédias...</span>
        </div>
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <EncyclopediaDetailView
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
      />
    );
  }

  return (
    <div className="h-full bg-[var(--bg-bible)] overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-bible-strong)] shadow-lg">
              <BookA className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-bible)]">Enciclopédia Bíblica</h1>
              <p className="text-sm text-[var(--text-bible-muted)]">
                {stats.total.toLocaleString('pt-BR')} verbetes disponíveis
              </p>
            </div>
          </div>

          {/* Stats Chips */}
          <div className="flex flex-wrap gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-xs text-[var(--text-bible-muted)]"
            >
              <span className="font-semibold text-[var(--accent-bible)]">{stats.merrill.toLocaleString('pt-BR')}</span> Merrill
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-xs text-[var(--text-bible-muted)]"
            >
              <span className="font-semibold text-purple-400">{stats.vine.toLocaleString('pt-BR')}</span> Vine
            </motion.div>
            {stats.hebrew > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-xs text-[var(--text-bible-muted)]"
              >
                <span className="font-semibold text-amber-400">{stats.hebrew.toLocaleString('pt-BR')}</span> Hebraico
              </motion.div>
            )}
            {stats.greek > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-xs text-[var(--text-bible-muted)]"
              >
                <span className="font-semibold text-emerald-400">{stats.greek.toLocaleString('pt-BR')}</span> Grego
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-bible-muted)] pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Buscar verbetes, temas, palavras originais..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-[var(--text-bible)] placeholder:text-[var(--text-bible-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)]/30 focus:border-[var(--accent-bible)] transition-all"
            aria-label="Buscar na enciclopédia"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          />
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-2 glass-card rounded-xl border border-[var(--border-bible)] shadow-xl overflow-hidden"
                role="listbox"
              >
                {suggestions.map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSuggestionClick(entry)}
                    className={cnFallback(
                      'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-[var(--border-bible)]/50 last:border-b-0',
                      index === highlightedIndex
                        ? 'bg-[var(--accent-bible)]/10'
                        : 'hover:bg-[var(--surface-hover)]'
                    )}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    <BookOpen className={cnFallback(
                      'w-4 h-4 flex-shrink-0',
                      entry.source === 'merrill' ? 'text-[var(--accent-bible)]' : 'text-purple-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--text-bible)] truncate block">
                        {entry.word}
                      </span>
                      <span className="text-xs text-[var(--text-bible-subtle)] truncate block">
                        {entry.source === 'merrill' ? 'Merrill' : `Vine ${entry.language === 'hebrew' ? 'Hebraico' : 'Grego'}`}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-bible-subtle)]" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto scrollbar-thin pb-2"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={cnFallback(
                'flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all',
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-bible)] text-white shadow-lg shadow-[var(--accent-bible)]/20'
                  : 'bg-[var(--surface-1)] border border-[var(--border-bible)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)]'
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[var(--text-bible-muted)]">
            <span>
              {searchQuery.trim() ? `Resultados para "${searchQuery}"` : 'Verbetes em destaque'}
            </span>
            <span className="text-xs">{displayEntries.length} verbetes</span>
          </div>

          <AnimatePresence mode="popLayout">
            {displayEntries.map((entry, index) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02, type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setSelectedEntry(entry)}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left glass-card rounded-xl p-4 border border-[var(--border-bible)] hover:border-[var(--accent-bible)]/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className={cnFallback(
                    'p-2 rounded-xl flex-shrink-0',
                    entry.source === 'merrill'
                      ? 'bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]'
                      : 'bg-purple-500/10 text-purple-400'
                  )}>
                    {entry.language ? (
                      <Languages className="w-4 h-4" />
                    ) : entry.source === 'merrill' ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--text-bible)] truncate group-hover:text-[var(--accent-bible)] transition-colors">
                        {entry.word}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-[var(--text-bible-subtle)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-sm text-[var(--text-bible-muted)] line-clamp-2 mt-1">
                      {entry.text.replace(/[#*\[\]→]/g, '').substring(0, 120)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-bible-subtle)]">
                      <span className={cnFallback(
                        'px-1.5 py-0.5 rounded font-medium',
                        entry.source === 'merrill' ? 'bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]' : 'bg-purple-500/10 text-purple-400'
                      )}>
                        {entry.source === 'merrill' ? 'Merrill' : 'Vine'}
                      </span>
                      {entry.language && (
                        <span>{entry.language === 'hebrew' ? '🇮🇱 Hebraico' : '🇬🇷 Grego'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {displayEntries.length === 0 && !searching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookA className="w-12 h-12 mx-auto text-[var(--text-bible-subtle)] mb-3" />
              <p className="text-[var(--text-bible-muted)]">Nenhum verbete encontrado</p>
              <p className="text-sm text-[var(--text-bible-subtle)]">Tente buscar com outros termos</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
