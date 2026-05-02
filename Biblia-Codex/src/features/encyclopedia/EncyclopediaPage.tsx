import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Loader, BookA, Languages, Hash, ChevronRight, ChevronLeft, Library, RefreshCw, AlertCircle, Type, User } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../utils/cn';
import {
  loadEncyclopediaEntries,
  searchEntries,
  getEntriesByCategory,
  getEntriesByLetter,
  getAvailableLetters,
  getEntryById,
  getStats,
  getCategories,
  getSuggestions,
} from './EncyclopediaService';
import type { EncyclopediaEntry, Verse } from '../../types';
import { getBibleReferenceRegex, normalizeReference } from '../../utils/bibleReferenceRegex';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { BIBLE_BOOKS } from '../../data/bibleMetadata';

/* ── helpers ────────────────────────────────────────────── */

function renderMarkdown(text: string): string {
  let rendered = text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[var(--text-bible)] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[var(--text-bible)] mt-7 mb-3">$1</h2>')
    .replace(/^---$/gm, '<hr class="border-[var(--border-bible)] my-5 opacity-40" />')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--text-bible)]">$1</strong>')
    .replace(/\[HEB:(.+?)\]/g, '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold text-base" dir="rtl">$1</span>')
    .replace(/\b([HG]\d{1,5})\b/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--accent-bible)]/10 text-[var(--accent-bible)] text-xs font-mono font-medium">$1</span>')
    .replace(/→/g, '<span class="text-[var(--accent-bible)] mx-0.5">→</span>')
    .replace(/\n\n/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/\n/g, '<br />');

  // Bible verse recognition
  const bibleRegex = getBibleReferenceRegex();
  rendered = rendered.replace(bibleRegex, (match, book, chapter, verse) => {
    const norm = normalizeReference(book, chapter, verse);
    if (!norm) return match;
    return `<span class="bible-ref text-[var(--accent-bible)] font-medium underline underline-offset-4 decoration-[var(--accent-bible)]/30 hover:decoration-[var(--accent-bible)] cursor-pointer transition-all" data-book="${norm.bookId}" data-chapter="${norm.chapter}" data-verse="${norm.verse}">${match}</span>`;
  });

  return rendered;
}

/** Maps category iconId → Lucide component */
function CategoryIcon({ iconId, className }: { iconId: string; className?: string }) {
  switch (iconId) {
    case 'library': return <Library className={className} />;
    case 'book-open': return <BookOpen className={className} />;
    case 'hebrew': return <Type className={className} />;
    case 'greek': return <Languages className={className} />;
    case 'user': return <User className={className} />;
    default: return <BookA className={className} />;
  }
}

/** Language badge with Lucide icon instead of emoji flag */
function LanguageBadge({ language }: { language?: string }) {
  if (!language) return null;
  const isHebrew = language === 'hebrew';
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${isHebrew ? 'text-amber-400' : 'text-emerald-400'}`}>
      {isHebrew ? <Type className="w-3 h-3" /> : <Languages className="w-3 h-3" />}
      {isHebrew ? 'Hebraico' : 'Grego'}
    </span>
  );
}

/** Source badge */
function SourceBadge({ source, size = 'sm' }: { source: string; size?: 'sm' | 'xs' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[10px]';
  
  if (source === 'merrill') {
    return <span className={`${sizeClasses} rounded-full font-medium bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]`}>Merrill</span>;
  }
  if (source === 'quem-quem') {
    return <span className={`${sizeClasses} rounded-full font-medium bg-blue-500/10 text-blue-400`}>Quem é Quem</span>;
  }
  return <span className={`${sizeClasses} rounded-full font-medium bg-purple-500/10 text-purple-400`}>Vine</span>;
}

/* ── Entry Row ── */
const EntryRow: React.FC<{ entry: EncyclopediaEntry; onClick: () => void }> = ({ entry, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    whileHover={{ scale: 1.01, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="w-full text-left premium-card-strong rounded-xl p-4 border border-[var(--border-bible)] hover:border-[var(--accent-bible)]/30 transition-all group cursor-pointer"
  >
    <div className="flex items-start gap-3">
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${
        entry.source === 'merrill'
          ? 'bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]'
          : entry.source === 'quem-quem'
            ? 'bg-blue-500/10 text-blue-400'
            : 'bg-purple-500/10 text-purple-400'
      }`}>
        {entry.language ? (
          entry.language === 'hebrew'
            ? <Type className="w-4 h-4" />
            : <Languages className="w-4 h-4" />
        ) : entry.source === 'merrill' ? (
          <BookOpen className="w-4 h-4" />
        ) : entry.source === 'quem-quem' ? (
          <User className="w-4 h-4" />
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
        <p className="text-sm text-[var(--text-bible-muted)] line-clamp-2 mt-1 leading-relaxed">
          {entry.text.replace(/[#*\[\]→]/g, '').replace(/\b[HG]\d+\b/g, '').substring(0, 140).trim()}...
        </p>
        <div className="flex items-center gap-2 mt-2">
          <SourceBadge source={entry.source} size="xs" />
          <LanguageBadge language={entry.language} />
        </div>
      </div>
    </div>
  </motion.button>
);

/* ── Alphabet Bar ── */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AlphabetBar: React.FC<{ 
  availableLetters: Set<string>; 
  selectedLetter: string | null; 
  onLetterClick: (letter: string) => void;
  onClear: () => void;
}> = ({ availableLetters, selectedLetter, onLetterClick, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="premium-card-strong rounded-2xl border border-[var(--border-bible)] p-2 sm:p-3 shadow-lg"
  >
    <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center gap-1 pb-1 sm:pb-0">
      {ALPHABET.map((letter) => {
        const isAvailable = availableLetters.has(letter);
        const isSelected = selectedLetter === letter;
        return (
          <button
            key={letter}
            onClick={() => isAvailable && onLetterClick(letter)}
            disabled={!isAvailable}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
              isSelected
                ? 'bg-[var(--accent-bible)] text-white shadow-md shadow-[var(--accent-bible)]/30 scale-105 sm:scale-110'
                : isAvailable
                  ? 'bg-[var(--surface-1)] text-[var(--text-bible)] hover:bg-[var(--accent-bible)]/15 hover:text-[var(--accent-bible)] active:scale-95'
                  : 'text-[var(--text-bible-subtle)]/30 cursor-not-allowed opacity-30'
            }`}
            aria-label={`Filtrar por letra ${letter}`}
          >
            {letter}
          </button>
        );
      })}
    </div>
    {selectedLetter && (
      <div className="flex justify-center mt-2 pt-2 border-t border-[var(--border-bible)]/50">
        <button
          onClick={onClear}
          className="text-[10px] sm:text-xs text-[var(--accent-bible)] font-bold uppercase tracking-wider hover:underline cursor-pointer"
        >
          Limpar filtro de letra
        </button>
      </div>
    )}
  </motion.div>
);

/* ── Detail View ───────────────────────────────────────── */

interface EncyclopediaDetailViewProps {
  entry: EncyclopediaEntry;
  onBack: () => void;
}

const EncyclopediaDetailView: React.FC<EncyclopediaDetailViewProps> = ({ entry, onBack }) => {
  const { currentVersion } = useAppContext();
  const htmlContent = useMemo(() => renderMarkdown(entry.text), [entry.text]);
  const [previewVerse, setPreviewVerse] = useState<Verse | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<{ x: number; y: number } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleMouseOver = useCallback(async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const refSpan = target.closest('.bible-ref') as HTMLElement;
    
    if (refSpan) {
      const bookId = refSpan.dataset.book;
      const chapter = parseInt(refSpan.dataset.chapter || '0');
      const verse = parseInt(refSpan.dataset.verse || '0');
      
      if (bookId && chapter && verse) {
        setPreviewAnchor({ x: e.clientX, y: e.clientY });
        setLoadingPreview(true);
        
        try {
          const verses = await BibleService.getVerses(bookId, chapter, currentVersion || undefined);
          const found = verses.find(v => v.verse === verse);
          if (found) {
            setPreviewVerse(found);
          }
        } catch (err) {
          console.error('Error fetching verse for preview:', err);
        } finally {
          setLoadingPreview(false);
        }
      }
    }
  }, [currentVersion]);

  const handleMouseLeave = useCallback(() => {
    setPreviewVerse(null);
    setLoadingPreview(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="h-full bg-bible-bg overflow-y-auto scrollbar-thin relative"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--bg-bible)]/80 border-b border-[var(--border-bible)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors cursor-pointer active:scale-95"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text-bible)]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[var(--text-bible)] truncate">{entry.word}</h1>
            <div className="flex items-center gap-2 text-xs text-[var(--text-bible-muted)]">
              <SourceBadge source={entry.source} />
              <LanguageBadge language={entry.language} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card-strong rounded-2xl p-6 space-y-4 shadow-xl"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="prose prose-invert max-w-none text-[var(--text-bible-muted)] leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: `<p class="mb-3 leading-relaxed">${htmlContent}</p>` }}
          />
        </motion.div>
      </div>

      {/* Hover Preview Tooltip */}
      <AnimatePresence>
        {(previewVerse || loadingPreview) && previewAnchor && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 w-[min(90vw,400px)] pointer-events-none"
            style={{
              left: Math.min(previewAnchor.x + 15, window.innerWidth - 415),
              top: Math.min(previewAnchor.y + 15, window.innerHeight - 200),
            }}
          >
            <div className="premium-card-strong p-4 border border-[var(--accent-bible)]/30 shadow-2xl rounded-2xl backdrop-blur-2xl bg-bible-surface">
              {loadingPreview ? (
                <div className="flex items-center gap-3 py-2">
                  <Loader className="w-4 h-4 text-[var(--accent-bible)] animate-spin" />
                  <span className="text-xs text-[var(--text-bible-muted)] font-medium">Carregando versículo...</span>
                </div>
              ) : previewVerse && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent-bible)]" />
                    <span className="text-[11px] font-bold text-[var(--accent-bible)] uppercase tracking-wider">
                      {BIBLE_BOOKS.find(b => b.id === previewVerse.bookId)?.name} {previewVerse.chapter}:{previewVerse.verse}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-bible)] leading-relaxed line-clamp-6">
                    {previewVerse.text.replace(/<[^>]+>/g, '')}
                  </p>
                  <div className="pt-2 border-t border-[var(--border-bible)]/30 flex justify-between items-center">
                    <span className="text-[10px] text-[var(--text-bible-muted)] uppercase font-semibold">
                      {currentVersion?.name || 'Bíblia'}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bible)]/40" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bible)]/20" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Main Page ─────────────────────────────────────────── */

interface EncyclopediaPageProps {
  onBack?: () => void;
}

export const EncyclopediaPage: React.FC<EncyclopediaPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [entries, setEntries] = useState<EncyclopediaEntry[]>([]);
  const [displayEntries, setDisplayEntries] = useState<EncyclopediaEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<EncyclopediaEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<EncyclopediaEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [retryCount, setRetryCount] = useState(0);

  const parentRef = useRef<HTMLDivElement>(null);
  const categories = getCategories();
  const availableLetters = useMemo(() => getAvailableLetters(selectedCategory), [selectedCategory, entries]);
  const stats = getStats();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    loadEncyclopediaEntries().then(allEntries => {
      if (!cancelled) {
        setEntries(allEntries);
        setDisplayEntries(getEntriesByCategory('all', 100));
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load encyclopedia:', err);
      if (!cancelled) {
        setLoadError(err?.message || 'Erro desconhecido ao carregar dados');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: displayEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // Safer estimate to prevent overlaps
    overscan: 5,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedLetter(null);
    setHighlightedIndex(-1);
    if (query.trim().length < 1) {
      setDisplayEntries(getEntriesByCategory(selectedCategory, 100));
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }
    // Show suggestions from 1 char
    const sug = getSuggestions(query, 10);
    setSuggestions(sug);
    setShowSuggestions(sug.length > 0);
    
    // Update results from 2 chars
    if (query.trim().length >= 2) {
      setSearching(true);
      const results = searchEntries(query, 100);
      setDisplayEntries(results);
      setSearching(false);
    }
  }, [selectedCategory]);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    setSelectedLetter(null);
    setShowSuggestions(false);
    setSuggestions([]);
    setDisplayEntries(getEntriesByCategory(catId, 100));
  }, []);

  const handleLetterClick = useCallback((letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setDisplayEntries(getEntriesByCategory(selectedCategory, 100));
    } else {
      setSelectedLetter(letter);
      setSearchQuery('');
      setShowSuggestions(false);
      setSuggestions([]);
      // Important: Here we return ALL entries for the letter, no slice
      setDisplayEntries(getEntriesByLetter(letter, selectedCategory));
      // Scroll to top of the virtual list
      rowVirtualizer.scrollToIndex(0);
    }
  }, [selectedLetter, selectedCategory, rowVirtualizer]);

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
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [suggestions, highlightedIndex, handleSuggestionClick]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-bible)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-bible-strong)] flex items-center justify-center shadow-lg shadow-[var(--accent-bible)]/20">
              <BookA className="w-7 h-7 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--surface-1)] border-2 border-[var(--bg-bible)] flex items-center justify-center"
            >
              <Loader className="w-3.5 h-3.5 text-[var(--accent-bible)]" />
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-bible)]">Carregando enciclopédias</p>
            <p className="text-xs text-[var(--text-bible-muted)] mt-1">21.000+ verbetes sendo preparados...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Error state ── */
  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-bible)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5 text-center px-6 max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-bible)]">Erro ao carregar enciclopédia</h2>
            <p className="text-sm text-[var(--text-bible-muted)] mt-2 leading-relaxed">
              Não foi possível carregar os dados. Verifique sua conexão e tente novamente.
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-bible)] text-white font-medium hover:opacity-90 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Detail view ── */
  if (selectedEntry) {
    return (
      <EncyclopediaDetailView
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
      />
    );
  }

  /* ── Main view ── */
  return (
    <div ref={parentRef} className="h-full bg-bible-bg overflow-y-auto">
      {/* Header Area */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-bible-strong)] shadow-lg shadow-[var(--accent-bible)]/20">
            <BookA className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-bible)]">Enciclopédia</h1>
            <p className="text-[11px] sm:text-sm text-[var(--text-bible-muted)]">
              {stats.total.toLocaleString('pt-BR')} verbetes
            </p>
          </div>
        </motion.div>

        {/* Stats Chips */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-[10px] sm:text-xs text-[var(--text-bible-muted)]"
          >
            <BookOpen className="w-3 h-3 text-[var(--accent-bible)]" />
            <span className="font-semibold text-[var(--accent-bible)]">{stats.merrill.toLocaleString('pt-BR')}</span> Merrill
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-[10px] sm:text-xs text-[var(--text-bible-muted)]"
          >
            <Hash className="w-3 h-3 text-purple-400" />
            <span className="font-semibold text-purple-400">{stats.vine.toLocaleString('pt-BR')}</span> Vine
          </motion.div>
          {stats.quemQuem > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-bible)] text-[10px] sm:text-xs text-[var(--text-bible-muted)]"
            >
              <User className="w-3 h-3 text-blue-400" />
              <span className="font-semibold text-blue-400">{stats.quemQuem.toLocaleString('pt-BR')}</span> Quem é Quem
            </motion.div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-bible-muted)] pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Pesquisar verbetes..."
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-sm sm:text-base text-[var(--text-bible)] placeholder:text-[var(--text-bible-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-bible)]/30 focus:border-[var(--accent-bible)] transition-all"
          />
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-50 w-full mt-2 premium-card-strong rounded-xl border border-[var(--border-bible)] shadow-2xl overflow-hidden"
              >
                {suggestions.map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSuggestionClick(entry)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-[var(--border-bible)]/50 last:border-b-0 cursor-pointer ${
                      index === highlightedIndex ? 'bg-[var(--accent-bible)]/10' : 'hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 flex-shrink-0 ${
                      entry.source === 'merrill' ? 'text-[var(--accent-bible)]' : 'text-purple-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--text-bible)] truncate block">{entry.word}</span>
                      <span className="text-xs text-[var(--text-bible-subtle)] truncate block">
                        {entry.source === 'merrill' ? 'Merrill' : entry.source === 'quem-quem' ? 'Quem é Quem' : 'Vine'}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-bible)] text-white shadow-lg'
                  : 'bg-[var(--surface-1)] border border-[var(--border-bible)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <CategoryIcon iconId={cat.iconId} className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Alphabet Bar Top */}
        <AlphabetBar 
          availableLetters={availableLetters}
          selectedLetter={selectedLetter}
          onLetterClick={handleLetterClick}
          onClear={() => {
            setSelectedLetter(null);
            setDisplayEntries(getEntriesByCategory(selectedCategory, 100));
          }}
        />
      </div>

      {/* Main List Area (Virtual) */}
      <div 
        
        className="mt-6"
      >
        <div className="max-w-4xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between text-sm text-[var(--text-bible-muted)] mb-3">
            <span>
              {searchQuery.trim()
                ? `Resultados para "${searchQuery}"`
                : selectedLetter
                  ? `Verbetes com a letra "${selectedLetter}"`
                  : 'Verbetes em destaque'}
            </span>
            <span className="text-xs">{displayEntries.length} verbetes</span>
          </div>

          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const entry = displayEntries[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: '12px'
                  }}
                >
                  <EntryRow 
                    entry={entry} 
                    onClick={() => setSelectedEntry(entry)} 
                  />
                </div>
              );
            })}
          </div>

          {displayEntries.length === 0 && !searching && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-1)] flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-[var(--text-bible-subtle)]" />
              </div>
              <p className="text-[var(--text-bible-muted)] font-medium">Nenhum verbete encontrado</p>
            </div>
          )}

          {/* Alphabet Bar Bottom */}
          <div className="pt-8 pb-20">
            <div className="text-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-bible-subtle)]">Navegar por Letra</span>
            </div>
            <AlphabetBar 
              availableLetters={availableLetters}
              selectedLetter={selectedLetter}
              onLetterClick={handleLetterClick}
              onClear={() => {
                setSelectedLetter(null);
                setDisplayEntries(getEntriesByCategory(selectedCategory, 100));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
