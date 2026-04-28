import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search as SearchIcon,
  X,
  BookOpen,
  ChevronRight,
  Clock,
  Sparkles,
  Loader2,
  FileText,
  MessageSquare,
  Settings2,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse, Note, Footnote } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { cn } from '../utils/cn';
import { getAIResponse, getApiKey } from '../services/geminiService';

interface SearchViewProps {
  onNavigate: (bookId: string, chapter: number, verse: number) => void;
}

type SearchCategory = 'verses' | 'notes' | 'footnotes';
type SearchLogicMode = 'OR' | 'AND';
type NearScope = 'verse' | 'chapter';

interface SearchOptions {
  logicMode: SearchLogicMode;
  nearEnabled: boolean;
  nearDistance: number;
  nearScope: NearScope;
  wholeWords: boolean;
  regex: boolean;
  ignoreCase: boolean;
  ignoreDiacritics: boolean;
  ignorePunctuation: boolean;
  startsWith: boolean;
}

const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  logicMode: 'OR',
  nearEnabled: false,
  nearDistance: 3,
  nearScope: 'verse',
  wholeWords: false,
  regex: false,
  ignoreCase: true,
  ignoreDiacritics: true,
  ignorePunctuation: true,
  startsWith: false,
};

export const SearchView: React.FC<SearchViewProps> = ({ onNavigate }) => {
  const { currentVersion, settings, updateSettings, setActiveTab } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    verses: Verse[];
    notes: Note[];
    footnotes: Footnote[];
  }>({ verses: [], notes: [], footnotes: [] });

  const [activeCategory, setActiveCategory] = useState<SearchCategory>('verses');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);

  const [aiEnabled, setAiEnabled] = useState(() => settings.ai.searchWithAI ?? false);
  const [aiResults, setAiResults] = useState<Map<string, string>>(new Map());
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [previewVerse, setPreviewVerse] = useState<Verse | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kerygma-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const toggleAI = useCallback(() => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    updateSettings({ ai: { ...settings.ai, searchWithAI: newValue } });
  }, [aiEnabled, settings.ai, updateSettings]);

  const cleanStrongsCodes = useCallback((text: string) => {
    return text
      .replace(/<W[HG]\d+>/gi, '')
      .replace(/<S>\s*[HG]?\d+\s*<\/S>/gi, '')
      .replace(/<S\d+>/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }, []);

  const normalizeText = useCallback((input: string): string => {
    let text = input;
    if (searchOptions.ignoreCase) text = text.toLowerCase();
    if (searchOptions.ignoreDiacritics) text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (searchOptions.ignorePunctuation) text = text.replace(/[.,;:!?()[\]{}"'`´~^_+=/@\\|-]/g, ' ');
    return text.replace(/\s+/g, ' ').trim();
  }, [searchOptions.ignoreCase, searchOptions.ignoreDiacritics, searchOptions.ignorePunctuation]);

  const tokenizeQuery = useCallback((input: string): string[] => {
    return normalizeText(input).split(' ').filter(Boolean);
  }, [normalizeText]);

  const matchesNear = useCallback((tokens: string[], text: string): boolean => {
    if (tokens.length < 2) return true;
    const words = normalizeText(text).split(' ').filter(Boolean);
    if (words.length === 0) return false;

    const positions = tokens.map((token) =>
      words.map((w, idx) => (w === token ? idx : -1)).filter((idx) => idx >= 0)
    );
    if (positions.some((list) => list.length === 0)) return false;

    for (const anchor of positions[0]) {
      let valid = true;
      for (let i = 1; i < positions.length; i++) {
        const nearest = positions[i].reduce((best, current) => {
          return Math.abs(current - anchor) < Math.abs(best - anchor) ? current : best;
        }, positions[i][0]);

        if (Math.abs(nearest - anchor) > searchOptions.nearDistance) {
          valid = false;
          break;
        }
      }
      if (valid) return true;
    }

    return false;
  }, [normalizeText, searchOptions.nearDistance]);

  const matchesVerseByOptions = useCallback((verseText: string, rawQuery: string): boolean => {
    const cleanedText = cleanStrongsCodes(verseText);
    if (!rawQuery.trim()) return true;

    if (searchOptions.regex) {
      try {
        const flags = searchOptions.ignoreCase ? 'i' : '';
        const expression = new RegExp(rawQuery, flags);
        return expression.test(cleanedText);
      } catch {
        return false;
      }
    }

    const tokens = tokenizeQuery(rawQuery);
    if (tokens.length === 0) return true;

    const normalizedText = normalizeText(cleanedText);

    if (searchOptions.startsWith) {
      return normalizedText.startsWith(tokens[0]);
    }

    const tokenMatches = tokens.map((token) => {
      if (searchOptions.wholeWords) {
        const safeToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${safeToken}\\b`, 'i').test(normalizedText);
      }
      return normalizedText.includes(token);
    });

    const logicOk = searchOptions.logicMode === 'AND' ? tokenMatches.every(Boolean) : tokenMatches.some(Boolean);
    if (!logicOk) return false;
    if (!searchOptions.nearEnabled) return true;

    return matchesNear(tokens, cleanedText);
  }, [cleanStrongsCodes, searchOptions, tokenizeQuery, normalizeText, matchesNear]);

  const handleAISearch = useCallback(async (term: string, searchResults: Verse[]) => {
    if (!aiEnabled || searchResults.length === 0) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setAiError('Chave de API não configurada.');
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
          const book = BIBLE_BOOKS.find((b) => b.id === verse.bookId);
          const prompt = `Analise "${term}" em ${book?.name || verse.bookId} ${verse.chapter}:${verse.verse}. Texto: ${cleanStrongsCodes(verse.text)}`;
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
  }, [aiEnabled, aiResults, cleanStrongsCodes]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (term.length < 2) return;

    setIsSearching(true);
    setAiResults(new Map());
    setAiError(null);

    try {
      const rawData = await BibleService.globalSearch(term, currentVersion || undefined);
      const filteredVerses = rawData.verses.filter((verse) => matchesVerseByOptions(verse.text, term));

      const data = {
        verses: filteredVerses,
        notes: rawData.notes,
        footnotes: rawData.footnotes,
      };

      setResults(data);

      const nextRecent = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));

      if (aiEnabled && data.verses.length > 0) {
        await handleAISearch(term, data.verses);
      }

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
  }, [currentVersion, aiEnabled, handleAISearch, recentSearches, matchesVerseByOptions]);

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const escapeRegExp = useCallback((value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), []);

  const highlightSearchTerms = useCallback((text: string, rawQuery: string) => {
    const cleaned = cleanStrongsCodes(text);
    const tokens = tokenizeQuery(rawQuery).filter((t) => t.length > 1);
    if (tokens.length === 0) return cleaned;

    const pattern = tokens.map(escapeRegExp).join('|');
    const flags = searchOptions.ignoreCase ? 'gi' : 'g';
    try {
      return cleaned.replace(new RegExp(`(${pattern})`, flags), '<mark class="bg-yellow-300/80 text-black px-0.5 rounded">$1</mark>');
    } catch {
      return cleaned;
    }
  }, [cleanStrongsCodes, tokenizeQuery, escapeRegExp, searchOptions.ignoreCase]);

  const openVersePreview = useCallback((verse: Verse, event: React.MouseEvent | React.TouchEvent) => {
    let x = 0;
    let y = 0;
    if ('touches' in event && event.touches.length > 0) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else if ('clientX' in event) {
      x = event.clientX;
      y = event.clientY;
    }
    setPreviewVerse(verse);
    setPreviewAnchor({ x, y });
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bible-bg">
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-2 space-y-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4 sm:p-6">
          <div className="relative flex items-center gap-4 mb-4">
            <div className="p-2 rounded-xl bg-bible-accent/10">
              <SearchIcon className="w-5 h-5 text-bible-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-bible-text">Busca Global</h1>
              <p className="text-xs text-bible-text-muted">Encontre versículos, suas notas e rodapés</p>
            </div>
            <button
              onClick={() => setShowSearchOptions((prev) => !prev)}
              className="ml-auto p-2 rounded-xl bg-bible-surface border border-bible-border hover:bg-bible-surface-strong transition-colors"
              title="Configurar busca avançada"
              aria-label="Configurar busca avançada"
            >
              <Settings2 className="w-4 h-4 text-bible-text-muted" />
            </button>
          </div>

          <AnimatePresence>
            {showSearchOptions && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-4 rounded-xl border border-bible-border bg-bible-surface/60 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="OU encontra qualquer palavra; E exige todas as palavras.">
                    Modo lógico
                    <select value={searchOptions.logicMode} onChange={(e) => setSearchOptions((prev) => ({ ...prev, logicMode: e.target.value as SearchLogicMode }))} className="px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs">
                      <option value="OR">OU (qualquer palavra)</option>
                      <option value="AND">E (todas as palavras)</option>
                    </select>
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Ativa expressão regular para padrões avançados como ^amor|graça$.">
                    Expressão regular
                    <input type="checkbox" checked={searchOptions.regex} onChange={(e) => setSearchOptions((prev) => ({ ...prev, regex: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Exige correspondência de palavra inteira, evitando trechos parciais.">
                    Somente palavras inteiras
                    <input type="checkbox" checked={searchOptions.wholeWords} onChange={(e) => setSearchOptions((prev) => ({ ...prev, wholeWords: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Busca textos que começam com o termo digitado.">
                    Partidas (começa com)
                    <input type="checkbox" checked={searchOptions.startsWith} onChange={(e) => setSearchOptions((prev) => ({ ...prev, startsWith: e.target.checked }))} />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Ignora diferença entre maiúsculas e minúsculas.">
                    Ignorar maiúsc/minúsc
                    <input type="checkbox" checked={searchOptions.ignoreCase} onChange={(e) => setSearchOptions((prev) => ({ ...prev, ignoreCase: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Trata acentos como equivalentes: coração = coracao.">
                    Ignorar diacríticos
                    <input type="checkbox" checked={searchOptions.ignoreDiacritics} onChange={(e) => setSearchOptions((prev) => ({ ...prev, ignoreDiacritics: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Remove pontuação para facilitar correspondência textual.">
                    Ignorar pontuação
                    <input type="checkbox" checked={searchOptions.ignorePunctuation} onChange={(e) => setSearchOptions((prev) => ({ ...prev, ignorePunctuation: e.target.checked }))} />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-bible-border pt-3">
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="NEAR exige que as palavras apareçam próximas no texto.">
                    Operador NEAR
                    <input type="checkbox" checked={searchOptions.nearEnabled} onChange={(e) => setSearchOptions((prev) => ({ ...prev, nearEnabled: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Quantidade máxima de palavras de distância no NEAR.">
                    Distância
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={searchOptions.nearDistance}
                      onChange={(e) => setSearchOptions((prev) => ({ ...prev, nearDistance: Math.max(1, Math.min(20, Number(e.target.value) || 3)) }))}
                      className="w-16 px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs"
                    />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Escopo da proximidade. Capítulos usa o mesmo comportamento de versículo nesta versão.">
                    Interrompe em
                    <select value={searchOptions.nearScope} onChange={(e) => setSearchOptions((prev) => ({ ...prev, nearScope: e.target.value as NearScope }))} className="px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs">
                      <option value="verse">Versículos</option>
                      <option value="chapter">Capítulos</option>
                    </select>
                  </label>
                </div>

                <div className="border-t border-bible-border pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSearchOptions(DEFAULT_SEARCH_OPTIONS)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bible-surface border border-bible-border text-bible-text-muted hover:text-bible-text hover:bg-bible-surface-strong transition-colors"
                    title="Restaura os padrões da busca avançada"
                  >
                    Restaurar padrão
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                className={cn('p-2 rounded-lg transition-all', aiEnabled ? 'bg-bible-accent text-white' : 'bg-bible-surface-strong text-bible-text-muted')}
                title="Liga análise de IA para alguns resultados"
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

          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'verses', label: 'Escrituras', icon: BookOpen, count: results.verses.length },
              { id: 'notes', label: 'Minhas Notas', icon: FileText, count: results.notes.length },
              { id: 'footnotes', label: 'Rodapés', icon: MessageSquare, count: results.footnotes.length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as SearchCategory)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                  activeCategory === cat.id ? 'bg-bible-accent text-white shadow-lg' : 'bg-bible-surface text-bible-text-muted hover:bg-bible-surface-strong'
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
                {cat.count > 0 && <span className={cn('ml-1 px-1.5 py-0.5 rounded-full text-[10px]', activeCategory === cat.id ? 'bg-white/20' : 'bg-bible-accent/10 text-bible-accent')}>{cat.count}</span>}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

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
                      <button key={i} onClick={() => handleRecentSearch(term)} className="px-4 py-2 rounded-xl bg-bible-surface hover:bg-bible-surface-strong text-sm text-bible-text-muted transition-colors">
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
                  {aiError && <p className="text-xs text-red-500 mt-2">{aiError}</p>}
                </div>
              )}
            </div>
          ) : (
            <motion.div key={activeCategory} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pt-4">
              {activeCategory === 'verses' && results.verses.map((v, i) => {
                const book = BIBLE_BOOKS.find((b) => b.id === v.bookId);
                const aiKey = `${v.bookId}-${v.chapter}:${v.verse}`;
                return (
                  <div
                    key={i}
                    onClick={() => onNavigate(v.bookId, v.chapter, v.verse)}
                    onMouseEnter={(e) => openVersePreview(v, e)}
                    onMouseMove={(e) => setPreviewAnchor({ x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setPreviewVerse(null)}
                    onTouchStart={(e) => openVersePreview(v, e)}
                    onTouchEnd={() => setTimeout(() => setPreviewVerse(null), 1200)}
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
                  <div className="text-sm text-bible-text line-clamp-3 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: n.content }} />
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setActiveTab('notes'); }} className="text-[10px] font-bold text-bible-accent uppercase hover:underline">
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

      {(isAiLoading || aiError) && (
        <div className="fixed bottom-20 right-4 z-20 rounded-lg bg-bible-surface border border-bible-border px-3 py-2 text-[11px] text-bible-text-muted shadow-lg">
          {isAiLoading ? 'IA analisando...' : aiError}
        </div>
      )}

      {previewVerse && previewAnchor && (
        <div
          className="fixed z-30 w-[min(92vw,540px)] rounded-xl border border-bible-border bg-bible-surface shadow-2xl p-3 pointer-events-none"
          style={{
            left: Math.min(previewAnchor.x + 16, window.innerWidth - 560),
            top: Math.min(previewAnchor.y + 16, window.innerHeight - 240),
          }}
        >
          <div className="text-[11px] font-bold text-bible-accent mb-1 uppercase tracking-wide">
            {BIBLE_BOOKS.find((b) => b.id === previewVerse.bookId)?.name} {previewVerse.chapter}:{previewVerse.verse}
          </div>
          <div
            className="text-sm text-bible-text leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightSearchTerms(previewVerse.text, query) }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchView;
