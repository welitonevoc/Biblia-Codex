import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, X, BookOpen, ChevronRight, Clock, 
  TrendingUp, Sparkles, Loader2, Play, Pause, AlertCircle,
  FileText, MessageSquare, Tag, Bookmark
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse, Note, Footnote } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { cn } from '../utils/cn';
import { getAIResponse, getApiKey, getConfiguredProvider, testAIConfiguration, suggestOpenRouterForQuota, autoSwitchToOpenRouter, diagnoseAIConfiguration } from '../services/geminiService';

interface SearchViewProps {
  onNavigate: (bookId: string, chapter: number, verse: number) => void;
}

type SearchCategory = 'verses' | 'notes' | 'footnotes';

export const SearchView: React.FC<SearchViewProps> = ({ onNavigate }) => {
  const { currentVersion, settings, updateSettings, setActiveTab } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    verses: Verse[],
    notes: Note[],
    footnotes: Footnote[]
  }>({ verses: [], notes: [], footnotes: [] });
  
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('verses');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [aiEnabled, setAiEnabled] = useState(() => settings.ai.searchWithAI ?? false);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [aiResults, setAiResults] = useState<Map<string, string>>(new Map());
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [configTest, setConfigTest] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kerygma-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const toggleAI = useCallback(() => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    updateSettings({ ai: { ...settings.ai, searchWithAI: newValue } });
  }, [aiEnabled, settings.ai, updateSettings]);

  const handleStudyVerse = useCallback((verse: Verse) => {
    onNavigate(verse.bookId, verse.chapter, verse.verse);
  }, [onNavigate]);

  const handleAISearch = useCallback(async (term: string, searchResults: Verse[]) => {
    if (!aiEnabled || searchResults.length === 0) return;
    
    const apiKey = getApiKey();
    if (!apiKey) {
      setAiError(`Chave de API não configurada.`);
      setAiEnabled(false);
      return;
    }

    setAiError(null);
    setIsAiLoading(true);
    const newResults = new Map(aiResults);

    try {
      for (const verse of searchResults.slice(0, 3)) {
        const key = `${verse.bookId}-${verse.chapter}:${verse.verse}`;
        try {
          const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
          const prompt = `Analise "${term}" em ${book?.name || verse.bookId} ${verse.chapter}:${verse.verse}. Texto: ${verse.text}`;
          const explanation = await getAIResponse(prompt, 'Você é um teólogo bíblico.');
          newResults.set(key, explanation);
        } catch (err) {
          console.error(err);
        }
      }
      setAiResults(newResults);
    } finally {
      setIsAiLoading(false);
    }
  }, [aiEnabled, aiResults]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (term.length < 2) return;

    setIsSearching(true);
    setAiResults(new Map());
    setAiError(null);
    try {
      const data = await BibleService.globalSearch(term, currentVersion || undefined);
      setResults(data);

      const nextRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));

      if (aiEnabled && data.verses.length > 0) {
        await handleAISearch(term, data.verses);
      }
      
      // Auto-switch to category with results if current is empty
      if (data.verses.length === 0) {
        if (data.notes.length > 0) setActiveCategory('notes');
        else if (data.footnotes.length > 0) setActiveCategory('footnotes');
      }
    } catch (error) {
      console.error('Search error:', error);
      setAiError('Erro na busca.');
    } finally {
      setIsSearching(false);
    }
  }, [currentVersion, aiEnabled, handleAISearch, recentSearches]);

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const currentResultsCount = useMemo(() => {
    return results[activeCategory].length;
  }, [results, activeCategory]);

  const cleanStrongsCodes = useCallback((text: string) => {
    return text
      .replace(/<W[HG]\d+>/gi, '')
      .replace(/<S>\s*[HG]?\d+\s*<\/S>/gi, '')
      .replace(/<S\d+>/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bible-bg">
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-2 space-y-4">
        {/* Search Bar Premium */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-4 sm:p-6"
        >
          <div className="relative flex items-center gap-4 mb-4">
            <div className="p-2 rounded-xl bg-bible-accent/10">
              <SearchIcon className="w-5 h-5 text-bible-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-bible-text">Busca Global</h1>
              <p className="text-xs text-bible-text-muted">Encontre versículos, suas notas e rodapés</p>
            </div>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Pesquisar..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-bible-surface border border-bible-border text-bible-text focus:ring-2 focus:ring-bible-accent outline-none transition-all"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bible-text-muted/50 group-focus-within:text-bible-accent transition-colors" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAI}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  aiEnabled ? "bg-bible-accent text-white" : "bg-bible-surface-strong text-bible-text-muted"
                )}
              >
                <Sparkles className="w-4 h-4" />
              </motion.button>
              {query && (
                <button onClick={() => { setQuery(''); setResults({ verses: [], notes: [], footnotes: [] }); }} className="p-2 text-bible-text-muted hover:text-bible-text">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'verses', label: 'Escrituras', icon: BookOpen, count: results.verses.length },
              { id: 'notes', label: 'Minhas Notas', icon: FileText, count: results.notes.length },
              { id: 'footnotes', label: 'Rodapés', icon: MessageSquare, count: results.footnotes.length }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as SearchCategory)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  activeCategory === cat.id 
                    ? "bg-bible-accent text-white shadow-lg" 
                    : "bg-bible-surface text-bible-text-muted hover:bg-bible-surface-strong"
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
                {cat.count > 0 && <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[10px]", activeCategory === cat.id ? "bg-white/20" : "bg-bible-accent/10 text-bible-accent")}>{cat.count}</span>}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-bible-accent animate-spin mb-4" />
              <p className="text-sm text-bible-text-muted">Vasculhando toda a biblioteca...</p>
            </div>
          ) : results.verses.length === 0 && results.notes.length === 0 && results.footnotes.length === 0 ? (
            <div className="py-12">
              {query.length < 2 && recentSearches.length > 0 && (
                <div className="premium-card p-6">
                  <h3 className="text-sm font-bold text-bible-text mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-bible-accent" /> Buscas Recentes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleRecentSearch(term)}
                        className="px-4 py-2 rounded-xl bg-bible-surface hover:bg-bible-surface-strong text-sm text-bible-text-muted transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {query.length >= 2 && (
                <div className="text-center py-20">
                  <div className="inline-block p-6 rounded-full bg-bible-surface mb-4">
                    <SearchIcon className="w-12 h-12 text-bible-text-muted/20" />
                  </div>
                  <h3 className="text-lg font-bold text-bible-text">Nenhum resultado</h3>
                  <p className="text-sm text-bible-text-muted">Tente usar termos mais curtos ou genéricos.</p>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 pt-4"
            >
              {activeCategory === 'verses' && results.verses.map((v, i) => {
                const book = BIBLE_BOOKS.find(b => b.id === v.bookId);
                const aiKey = `${v.bookId}-${v.chapter}:${v.verse}`;
                return (
                  <div 
                    key={i} 
                    onClick={() => handleStudyVerse(v)}
                    className="premium-card p-4 hover:border-bible-accent/30 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-bible-accent" />
                        <span className="text-xs font-black text-bible-accent tracking-tighter uppercase">{book?.abbreviation} {v.chapter}:{v.verse}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-bible-text-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm text-bible-text leading-relaxed">{cleanStrongsCodes(v.text)}</p>
                    
                    {aiResults.has(aiKey) && (
                      <div className="mt-3 p-3 rounded-xl bg-bible-accent/5 border border-bible-accent/10">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-bible-accent uppercase mb-1">
                          <Sparkles className="w-3 h-3" /> Insight da IA
                        </div>
                        <p className="text-xs text-bible-text leading-snug">{aiResults.get(aiKey)}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeCategory === 'notes' && results.notes.map((n, i) => (
                <div key={i} className="premium-card p-4 hover:border-blue-500/30 cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-blue-500 uppercase">{n.title || 'Nota sem título'}</span>
                    </div>
                    <span className="text-[10px] text-bible-text-muted">{n.bookId} {n.chapter}:{n.verse}</span>
                  </div>
                  <div 
                    className="text-sm text-bible-text line-clamp-3 prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: n.content }}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveTab('notes'); }}
                      className="text-[10px] font-bold text-bible-accent uppercase hover:underline"
                    >
                      Ver em Notas
                    </button>
                  </div>
                </div>
              ))}

              {activeCategory === 'footnotes' && results.footnotes.map((f, i) => (
                <div key={i} className="premium-card p-4 hover:border-purple-500/30 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-purple-500 uppercase">{f.bookId} {f.chapter}:{f.verse}</span>
                  </div>
                  <p className="text-sm text-bible-text italic">"{f.content}"</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {f.references?.map((r, idx) => (
                      <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 uppercase">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
