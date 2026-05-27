import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Copy,
  ArrowUpDown,
  Hash,
  Navigation,
  Lightbulb,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse, Note, Footnote } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { cn } from '../utils/cn';
import { getAIResponse, getApiKey } from '../services/geminiService';
import { getVineEntry } from '../../services/VineProService';

interface SearchViewProps {
  onNavigate: (bookId: string, chapter: number, verse: number) => void;
}

type SearchCategory = 'verses' | 'notes' | 'footnotes';
type SearchLogicMode = 'OR' | 'AND';
type NearScope = 'verse' | 'chapter';
type SearchScope =
  | 'all' | 'ot' | 'nt'
  | 'ot_pentateuch' | 'ot_historical' | 'ot_wisdom'
  | 'ot_major_prophets' | 'ot_minor_prophets'
  | 'nt_gospels_acts' | 'nt_pauline' | 'nt_general_revelation'
  | 'nt_synoptic' | 'nt_johannine' | 'nt_lukan';

type SortMode = 'book' | 'relevance';

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
  scope: SearchScope;
  otColor: string;
  ntColor: string;
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
  scope: 'all',
  otColor: '#3b82f6',
  ntColor: '#ef4444',
};

const BOOK_ALIASES: Record<string, string> = {
  genesis: 'GEN', gen: 'GEN', gn: 'GEN', gênesis: 'GEN',
  exodo: 'EXO', ex: 'EXO', exod: 'EXO', êxodo: 'EXO',
  levitico: 'LEV', lev: 'LEV', lv: 'LEV', levítico: 'LEV',
  numeros: 'NUM', num: 'NUM', nm: 'NUM', números: 'NUM',
  deuteronomio: 'DEU', deut: 'DEU', dt: 'DEU', deuteronômio: 'DEU',
  josue: 'JOS', josh: 'JOS', js: 'JOS', josué: 'JOS',
  juizes: 'JDG', judg: 'JDG', jz: 'JDG', juízes: 'JDG',
  rute: 'RUT', ruth: 'RUT', rt: 'RUT',
  '1samuel': '1SA', '1sam': '1SA', '1sm': '1SA',
  '2samuel': '2SA', '2sam': '2SA', '2sm': '2SA',
  '1reis': '1KI', '1kgs': '1KI', '1rs': '1KI',
  '2reis': '2KI', '2kgs': '2KI', '2rs': '2KI',
  '1cronicas': '1CH', '1chr': '1CH', '1cr': '1CH', '1crônicas': '1CH',
  '2cronicas': '2CH', '2chr': '2CH', '2cr': '2CH', '2crônicas': '2CH',
  esdras: 'EZR', ezra: 'EZR', ed: 'EZR',
  neemias: 'NEH', neh: 'NEH', ne: 'NEH',
  ester: 'EST', esth: 'EST', et: 'EST',
  jo: 'JOB', job: 'JOB',
  salmos: 'PSA', ps: 'PSA', salmo: 'PSA', sl: 'PSA',
  proverbios: 'PRO', prov: 'PRO', pv: 'PRO', provérbios: 'PRO',
  eclesiastes: 'ECC', eccl: 'ECC', ec: 'ECC',
  cantares: 'SNG', song: 'SNG', ct: 'SNG',
  isaías: 'ISA', isaías: 'ISA', isa: 'ISA', is: 'ISA',
  jeremias: 'JER', jer: 'JER', jr: 'JER',
  lamentacoes: 'LAM', lam: 'LAM', lm: 'LAM', lamentações: 'LAM',
  ezequiel: 'EZK', ezek: 'EZK', ez: 'EZK',
  daniel: 'DAN', dan: 'DAN', dn: 'DAN',
  oseias: 'HOS', hos: 'HOS', os: 'HOS', oséias: 'HOS',
  joel: 'JOE', jl: 'JOE',
  amos: 'AMO', am: 'AMO',
  obadias: 'OBA', obad: 'OBA', ob: 'OBA',
  jonas: 'JON', jonah: 'JON', jn: 'JON',
  miqueias: 'MIC', mic: 'MIC', mq: 'MIC', miquéias: 'MIC',
  naum: 'NAH', nah: 'NAH', na: 'NAH',
  habacuque: 'HAB', hab: 'HAB', hc: 'HAB',
  sofonias: 'ZEP', zeph: 'ZEP', sf: 'ZEP', sofônias: 'ZEP',
  ageu: 'HAG', hag: 'HAG', ag: 'HAG',
  zacarias: 'ZEC', zech: 'ZEC', zc: 'ZEC',
  malaquias: 'MAL', mal: 'MAL', ml: 'MAL',
  mateus: 'MAT', matt: 'MAT', mt: 'MAT',
  marcos: 'MRK', mark: 'MRK', mc: 'MRK',
  lucas: 'LUK', luke: 'LUK', lc: 'LUK',
  joao: 'JHN', john: 'JHN', jo: 'JHN', joão: 'JHN',
  atos: 'ACT', acts: 'ACT', at: 'ACT',
  romanos: 'ROM', rom: 'ROM', rm: 'ROM',
  '1corintios': '1CO', '1cor': '1CO', '1co': '1CO', '1coríntios': '1CO',
  '2corintios': '2CO', '2cor': '2CO', '2co': '2CO', '2coríntios': '2CO',
  galatas: 'GAL', gal: 'GAL', gl: 'GAL', gálatas: 'GAL',
  efesios: 'EPH', eph: 'EPH', ef: 'EPH', efésios: 'EPH',
  filipenses: 'PHP', phil: 'PHP', fp: 'PHP',
  colossenses: 'COL', col: 'COL', cl: 'COL',
  '1tessalonicenses': '1TH', '1thess': '1TH', '1ts': '1TH',
  '2tessalonicenses': '2TH', '2thess': '2TH', '2ts': '2TH',
  '1timoteo': '1TI', '1tim': '1TI', '1tm': '1TI', '1timóteo': '1TI',
  '2timoteo': '2TI', '2tim': '2TI', '2tm': '2TI', '2timóteo': '2TI',
  tito: 'TIT', titus: 'TIT', tt: 'TIT',
  filemom: 'PHM', phlm: 'PHM', fm: 'PHM',
  hebreus: 'HEB', heb: 'HEB', hb: 'HEB',
  tiago: 'JAS', jas: 'JAS', tg: 'JAS',
  '1pedro': '1PE', '1pet': '1PE', '1pe': '1PE',
  '2pedro': '2PE', '2pet': '2PE', '2pe': '2PE',
  '1joao': '1JN', '1john': '1JN', '1jo': '1JN', '1joão': '1JN',
  '2joao': '2JN', '2john': '2JN', '2jo': '2JN', '2joão': '2JN',
  '3joao': '3JN', '3john': '3JN', '3jo': '3JN', '3joão': '3JN',
  judas: 'JUD', jude: 'JUD', jd: 'JUD',
  apocalipse: 'REV', rev: 'REV', ap: 'REV',
};

const POPULAR_REFERENCES = [
  'João 3:16', 'Salmos 23:1', 'Salmos 23:4', 'Gênesis 1:1',
  'Romanos 8:28', 'Filipenses 4:13', 'Jeremias 29:11',
  'Provérbios 3:5', 'Isaías 40:31', 'Mateus 28:19',
  'Mateus 6:33', 'Romanos 8:1', '2 Coríntios 5:17',
  'Efésios 2:8', '1 João 1:9', 'Salmos 121:1', 'Salmos 91:1',
  'Mateus 11:28', 'João 14:6', 'Romanos 12:2',
];

const STRONG_REGEX = /^[HG]\d{1,4}$/i;

type BoolNode =
  | { type: 'word'; value: string }
  | { type: 'and'; left: BoolNode; right: BoolNode }
  | { type: 'or'; left: BoolNode; right: BoolNode }
  | { type: 'not'; child: BoolNode };

let _tokenIdx = 0;
let _tokens: string[] = [];

function tokenizeBool(input: string): string[] {
  const cleaned = input
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .replace(/\bAND\b/gi, ' AND ')
    .replace(/\bOR\b/gi, ' OR ')
    .replace(/\bNOT\b/gi, ' NOT ');
  return cleaned.split(/\s+/).filter(Boolean);
}

function parseOr(): BoolNode {
  let left = parseAnd();
  while (_tokenIdx < _tokens.length && _tokens[_tokenIdx].toUpperCase() === 'OR') {
    _tokenIdx++;
    const right = parseAnd();
    left = { type: 'or', left, right };
  }
  return left;
}

function parseAnd(): BoolNode {
  let left = parseUnary();
  while (_tokenIdx < _tokens.length && _tokens[_tokenIdx].toUpperCase() === 'AND') {
    _tokenIdx++;
    const right = parseUnary();
    left = { type: 'and', left, right };
  }
  return left;
}

function parseUnary(): BoolNode {
  if (_tokenIdx < _tokens.length && _tokens[_tokenIdx].toUpperCase() === 'NOT') {
    _tokenIdx++;
    return { type: 'not', child: parseUnary() };
  }
  return parsePrimary();
}

function parsePrimary(): BoolNode {
  if (_tokenIdx >= _tokens.length) return { type: 'word', value: '' };
  if (_tokens[_tokenIdx] === '(') {
    _tokenIdx++;
    const expr = parseOr();
    if (_tokenIdx < _tokens.length && _tokens[_tokenIdx] === ')') _tokenIdx++;
    return expr;
  }
  return { type: 'word', value: _tokens[_tokenIdx++] };
}

function parseBooleanExpression(input: string): BoolNode {
  _tokens = tokenizeBool(input);
  _tokenIdx = 0;
  if (_tokens.length === 1) return { type: 'word', value: _tokens[0] };
  return parseOr();
}

function normalizeMatch(text: string, options: SearchOptions): string {
  let t = text;
  if (options.ignoreCase) t = t.toLowerCase();
  if (options.ignoreDiacritics) t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (options.ignorePunctuation) t = t.replace(/[.,;:!?()[\]{}"'`´~^_+=/@\\|-]/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

function evalBoolNode(node: BoolNode, text: string, options: SearchOptions): boolean {
  switch (node.type) {
    case 'word': {
      if (!node.value) return true;
      let pattern = node.value;
      if (pattern.includes('*')) {
        pattern = pattern.split('*').map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
        const re = new RegExp(pattern, options.ignoreCase ? 'i' : '');
        return re.test(text);
      }
      if (options.wholeWords) {
        const safe = node.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${safe}\\b`, options.ignoreCase ? 'i' : '').test(text);
      }
      const nt = normalizeMatch(text, options);
      const nq = normalizeMatch(node.value, options);
      return nt.includes(nq);
    }
    case 'and':
      return evalBoolNode(node.left, text, options) && evalBoolNode(node.right, text, options);
    case 'or':
      return evalBoolNode(node.left, text, options) || evalBoolNode(node.right, text, options);
    case 'not':
      return !evalBoolNode(node.child, text, options);
  }
}

function escapeHighlight(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractHighlightTokens(rawQuery: string): string[] {
  const parensRemoved = rawQuery.replace(/[()]/g, ' ');
  return parensRemoved
    .replace(/\b(AND|OR|NOT)\b/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function normalizeToken(t: string, opts: SearchOptions): string {
  let result = t;
  if (opts.ignoreCase) result = result.toLowerCase();
  if (opts.ignoreDiacritics) result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return result;
}

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
  const [previewContext, setPreviewContext] = useState<Verse[]>([]);
  const [previewAnchor, setPreviewAnchor] = useState<{ x: number; y: number } | null>(null);
  const [previewPinned, setPreviewPinned] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('book');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedRef, setDetectedRef] = useState<{ bookId: string; chapter: number; verse?: number } | null>(null);
  const [strongResult, setStrongResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanStrongsCodes = useCallback((text: string) => {
    return text
      .replace(/<TS\d*>/gi, '').replace(/<\/?TS>/gi, '')
      .replace(/<W[HG]\d+>/gi, '').replace(/<S>\s*[HG]?\d+\s*<\/S>/gi, '')
      .replace(/<S\d+>/gi, '').replace(/\s{2,}/g, ' ').trim();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('kerygma-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const toggleAI = useCallback(() => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    updateSettings({ ai: { ...settings.ai, searchWithAI: newValue } });
  }, [aiEnabled, settings.ai, updateSettings]);

  const getBookIdByAlias = useCallback((input: string): string | null => {
    const key = input.replace(/[.\s-]/g, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return BOOK_ALIASES[key] || BIBLE_BOOKS.find(b => b.id.toLowerCase() === key || b.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === key)?.id || null;
  }, []);

  const parseReference = useCallback((input: string): { bookId: string; chapter: number; verse?: number } | null => {
    const refMatch = input.match(/^([A-Za-zÀ-ÿ0-9]+(?:\.?\s+[A-Za-zÀ-ÿ0-9]+)?)\s+(\d+)(?::(\d+))?$/);
    if (!refMatch) return null;
    const bookId = getBookIdByAlias(refMatch[1]);
    if (!bookId) return null;
    return { bookId, chapter: parseInt(refMatch[2]), verse: refMatch[3] ? parseInt(refMatch[3]) : undefined };
  }, [getBookIdByAlias]);

  const updateSuggestions = useCallback((value: string) => {
    if (!value.trim()) { setSuggestions([]); setShowSuggestions(false); setDetectedRef(null); setStrongResult(null); return; }

    const ref = parseReference(value);
    setDetectedRef(ref);

    if (STRONG_REGEX.test(value.trim())) {
      setSuggestions([`🔍 Buscar Strong: ${value.trim().toUpperCase()}`]);
      setShowSuggestions(true);
      return;
    }

    if (ref) {
      setSuggestions([`📖 Ir para ${BIBLE_BOOKS.find(b => b.id === ref.bookId)?.name || ref.bookId} ${ref.chapter}${ref.verse ? `:${ref.verse}` : ''}`]);
      setShowSuggestions(true);
      return;
    }

    const lower = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const bookSuggestions = Object.entries(BOOK_ALIASES)
      .filter(([key]) => key.startsWith(lower))
      .slice(0, 5)
      .map(([, id]) => BIBLE_BOOKS.find(b => b.id === id))
      .filter((b, i, arr): b is typeof b & { name: string } => !!b && arr.findIndex(x => x?.id === b.id) === i)
      .map(b => `${b.name} 1`);

    const popularMatches = POPULAR_REFERENCES.filter(r => r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(lower)).slice(0, 3);
    const all = [...bookSuggestions, ...popularMatches.map(r => `📖 ${r}`)];
    setSuggestions(all);
    setShowSuggestions(all.length > 0);
  }, [parseReference]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    updateSuggestions(value);
  };

  const getSortedVerses = useCallback((verses: Verse[], _query: string): Verse[] => {
    const sorted = [...verses];
    if (sortMode === 'book') {
      sorted.sort((a, b) => {
        const na = BIBLE_BOOKS.find(bk => bk.id === a.bookId)?.numericId ?? 0;
        const nb = BIBLE_BOOKS.find(bk => bk.id === b.bookId)?.numericId ?? 0;
        if (na !== nb) return na - nb;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      });
    }
    return sorted;
  }, [sortMode]);

  const exportResults = useCallback(() => {
    const lines: string[] = [];
    if (results.verses.length > 0) {
      lines.push('=== ESCRITURAS ===');
      const sorted = getSortedVerses(results.verses, query);
      sorted.forEach(v => {
        const book = BIBLE_BOOKS.find(b => b.id === v.bookId);
        lines.push(`${book?.abbreviation || v.bookId} ${v.chapter}:${v.verse} — ${cleanStrongsCodes(v.text)}`);
      });
      lines.push('');
    }
    if (results.notes.length > 0) {
      lines.push('=== MINHAS NOTAS ===');
      results.notes.forEach(n => {
        const book = BIBLE_BOOKS.find(b => b.id === n.bookId);
        const title = n.title || 'Sem título';
        lines.push(`${book?.abbreviation || n.bookId} ${n.chapter}:${n.verse} — ${title}`);
        lines.push(n.content.replace(/<[^>]*>/g, ''));
        lines.push('');
      });
    }
    if (results.footnotes.length > 0) {
      lines.push('=== RODAPÉS ===');
      results.footnotes.forEach(f => {
        const book = BIBLE_BOOKS.find(b => b.id === f.bookId);
        lines.push(`${book?.abbreviation || f.bookId} ${f.chapter}:${f.verse} — ${f.content}`);
      });
    }
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  }, [results, cleanStrongsCodes, getSortedVerses, query]);

  const fetchContextVerses = useCallback(async (bookId: string, chapter: number, verse: number) => {
    try {
      const startVerse = Math.max(1, verse - 2);
      const count = 5;
      const allVerses: Verse[] = [];
      for (let v = startVerse; v < startVerse + count; v++) {
        const data = await BibleService.getVerses(bookId, chapter, currentVersion || undefined);
        const found = data.find(d => d.verse === v);
        if (found) allVerses.push(found);
      }
      setPreviewContext(allVerses);
    } catch { setPreviewContext([]); }
  }, [currentVersion]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const term = searchQuery.trim();
    if (term.length < 2 && !STRONG_REGEX.test(term) && !parseReference(term)) return;

    const ref = parseReference(term);
    if (ref) {
      onNavigate(ref.bookId, ref.chapter, ref.verse || 1);
      return;
    }

    if (STRONG_REGEX.test(term)) {
      const entry = await getVineEntry(term.toUpperCase());
      if (entry) {
        setStrongResult(entry);
        setResults({ verses: [], notes: [], footnotes: [] });
        return;
      }
    }

    setStrongResult(null);
    setIsSearching(true);
    setAiResults(new Map());
    setAiError(null);
    setShowSuggestions(false);

    try {
      const rawData = await BibleService.globalSearch(term, currentVersion || undefined);

      const hasParens = /[()]/.test(term);
      const hasBoolOp = /\b(AND|OR|NOT)\b/i.test(term);
      const useBoolean = (hasParens || hasBoolOp) && !searchOptions.regex;

      let filteredVerses: Verse[];
      if (useBoolean) {
        let ast: BoolNode;
        try { ast = parseBooleanExpression(term); } catch { ast = { type: 'word', value: term }; }
        filteredVerses = rawData.verses.filter(v => {
          const text = cleanStrongsCodes(v.text);
          const cleaned = text.replace(/<[^>]*>/g, '');
          return evalBoolNode(ast, cleaned, searchOptions);
        });
      } else if (searchOptions.regex) {
        filteredVerses = rawData.verses.filter(v => {
          const text = cleanStrongsCodes(v.text);
          try {
            const re = new RegExp(term, searchOptions.ignoreCase ? 'i' : '');
            return re.test(text);
          } catch { return false; }
        });
      } else if (term.includes('*') && !searchOptions.regex) {
        const pattern = term.split('*').map(p => escapeHighlight(p)).join('.*');
        filteredVerses = rawData.verses.filter(v => {
          const text = cleanStrongsCodes(v.text);
          try {
            return new RegExp(pattern, searchOptions.ignoreCase ? 'i' : '').test(text);
          } catch { return false; }
        });
      } else {
        filteredVerses = rawData.verses.filter(v => {
          const text = cleanStrongsCodes(v.text);
          const tokens = term.split(/\s+/).filter(Boolean);

          if (searchOptions.startsWith) {
            const cleaned = text.replace(/<[^>]*>/g, '');
            return normalizeMatch(cleaned, searchOptions).startsWith(normalizeMatch(tokens[0], searchOptions));
          }

          const normalized = normalizeMatch(text.replace(/<[^>]*>/g, ''), searchOptions);
          const matches = tokens.map(t => {
            const nt = normalizeMatch(t, searchOptions);
            if (searchOptions.wholeWords) {
              const safe = nt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              return new RegExp(`\\b${safe}\\b`, 'i').test(normalized);
            }
            return normalized.includes(nt);
          });

          const ok = searchOptions.logicMode === 'AND' ? matches.every(Boolean) : matches.some(Boolean);
          if (!ok) return false;

          if (!searchOptions.nearEnabled) return true;
          const words = normalized.split(/\s+/).filter(Boolean);
          const positions = tokens.map(t => {
            const nt = normalizeMatch(t, searchOptions);
            return words.map((w, i) => (w === nt ? i : -1)).filter(i => i >= 0);
          });
          if (positions.some(p => p.length === 0)) return false;
          for (const anchor of positions[0]) {
            let valid = true;
            for (let i = 1; i < positions.length; i++) {
              const nearest = positions[i].reduce((best, curr) =>
                Math.abs(curr - anchor) < Math.abs(best - anchor) ? curr : best, positions[i][0]);
              if (Math.abs(nearest - anchor) > searchOptions.nearDistance) { valid = false; break; }
            }
            if (valid) return true;
          }
          return false;
        });
      }

      const scopedVerses = filteredVerses.filter(v => {
        const n = BIBLE_BOOKS.find(b => b.id === v.bookId)?.numericId ?? 0;
        switch (searchOptions.scope) {
          case 'all': return true;
          case 'ot': return n >= 1 && n <= 39;
          case 'nt': return n >= 40 && n <= 66;
          case 'ot_pentateuch': return n >= 1 && n <= 5;
          case 'ot_historical': return n >= 6 && n <= 17;
          case 'ot_wisdom': return n >= 18 && n <= 22;
          case 'ot_major_prophets': return n >= 23 && n <= 27;
          case 'ot_minor_prophets': return n >= 28 && n <= 39;
          case 'nt_gospels_acts': return n >= 40 && n <= 44;
          case 'nt_pauline': return n >= 45 && n <= 57;
          case 'nt_general_revelation': return n >= 58 && n <= 66;
          case 'nt_synoptic': return n >= 40 && n <= 42;
          case 'nt_johannine': return n === 43 || n === 62 || n === 63 || n === 64 || n === 65;
          case 'nt_lukan': return n === 42 || n === 44;
          default: return true;
        }
      });

      const data = { verses: scopedVerses, notes: rawData.notes, footnotes: rawData.footnotes };
      setResults(data);

      const nextRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(nextRecent);
      localStorage.setItem('kerygma-recent-searches', JSON.stringify(nextRecent));

      if (aiEnabled && data.verses.length > 0) {
        setAiError(null);
        setIsAiLoading(true);
        const newResults = new Map(aiResults);
        const apiKey = getApiKey();
        if (apiKey) {
          for (const verse of data.verses.slice(0, 3)) {
            const key = `${verse.bookId}-${verse.chapter}:${verse.verse}`;
            try {
              const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
              const prompt = `Analise "${term}" em ${book?.name || verse.bookId} ${verse.chapter}:${verse.verse}. Texto: ${cleanStrongsCodes(verse.text)}`;
              const explanation = await getAIResponse(prompt, 'Você é um teólogo bíblico.');
              newResults.set(key, explanation);
            } catch {}
          }
          setAiResults(newResults);
        } else {
          setAiError('Chave de API não configurada.');
        }
        setIsAiLoading(false);
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
  }, [currentVersion, aiEnabled, aiResults, recentSearches, searchOptions, cleanStrongsCodes, onNavigate, parseReference, updateSettings, settings.ai]);

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
    handleSearch(term);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    if (detectedRef) {
      onNavigate(detectedRef.bookId, detectedRef.chapter, detectedRef.verse || 1);
      return;
    }
    if (STRONG_REGEX.test(query.trim())) {
      handleSearch(query.trim());
      return;
    }
    const cleanSuggestion = suggestion.replace(/^📖\s*/, '');
    setQuery(cleanSuggestion);
    handleSearch(cleanSuggestion);
  };

  const distributionByBook = results.verses.reduce((acc, verse) => {
    const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
    if (!book) return acc;
    const key = book.id;
    if (!acc[key]) acc[key] = { id: book.id, name: book.abbreviation || book.name, numericId: book.numericId, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { id: string; name: string; numericId: number; count: number }>);
  const distributionRows = Object.values(distributionByBook).sort((a, b) => a.numericId - b.numericId);
  const maxCount = distributionRows.reduce((m, r) => Math.max(m, r.count), 1);
  const totalVerseMatches = results.verses.length || 1;

  const sortedVerses = useMemo(() => getSortedVerses(results.verses, query), [results.verses, getSortedVerses, query]);

  const highlightSearchTerms = useCallback((text: string, rawQuery: string) => {
    const cleaned = cleanStrongsCodes(text);
    const tokens = extractHighlightTokens(rawQuery).filter(t => t.length > 1);
    if (tokens.length === 0) return cleaned;
    const pattern = tokens.map(t => {
      const escaped = escapeHighlight(t);
      if (t.includes('*')) return t.split('*').map(p => escapeHighlight(p)).join('\\w*');
      return escaped;
    }).join('|');
    const flags = searchOptions.ignoreCase ? 'gi' : 'g';
    try {
      return cleaned.replace(new RegExp(`(${pattern})`, flags), '<mark class="bg-yellow-300/80 text-black px-0.5 rounded">$1</mark>');
    } catch { return cleaned; }
  }, [cleanStrongsCodes, searchOptions.ignoreCase]);

  const openVersePreview = useCallback((verse: Verse, event: React.MouseEvent | React.TouchEvent, pinned = false) => {
    let x = 0, y = 0;
    if ('touches' in event && event.touches.length > 0) { x = event.touches[0].clientX; y = event.touches[0].clientY; }
    else if ('clientX' in event) { x = event.clientX; y = event.clientY; }
    setPreviewVerse(verse);
    setPreviewAnchor({ x, y });
    setPreviewPinned(pinned);
    fetchContextVerses(verse.bookId, verse.chapter, verse.verse);
  }, [fetchContextVerses]);

  const toggleSort = () => setSortMode(prev => prev === 'book' ? 'relevance' : 'book');

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
              onClick={() => setShowSearchOptions(prev => !prev)}
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
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="OU encontra qualquer palavra; E exige todas as palavras; parênteses suportados: (fé OR graça) AND amor">
                    Modo lógico
                    <select value={searchOptions.logicMode} onChange={e => setSearchOptions(prev => ({ ...prev, logicMode: e.target.value as SearchLogicMode }))} className="px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs">
                      <option value="OR">OU (qualquer palavra)</option>
                      <option value="AND">E (todas as palavras)</option>
                    </select>
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2" title="Ativa expressão regular. Use * como coringa quando desligado.">
                    Expressão regular
                    <input type="checkbox" checked={searchOptions.regex} onChange={e => setSearchOptions(prev => ({ ...prev, regex: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Somente palavras inteiras
                    <input type="checkbox" checked={searchOptions.wholeWords} onChange={e => setSearchOptions(prev => ({ ...prev, wholeWords: e.target.checked }))} />
                  </label>

                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Partidas (começa com)
                    <input type="checkbox" checked={searchOptions.startsWith} onChange={e => setSearchOptions(prev => ({ ...prev, startsWith: e.target.checked }))} />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Ignorar maiúsc/minúsc
                    <input type="checkbox" checked={searchOptions.ignoreCase} onChange={e => setSearchOptions(prev => ({ ...prev, ignoreCase: e.target.checked }))} />
                  </label>
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Ignorar diacríticos
                    <input type="checkbox" checked={searchOptions.ignoreDiacritics} onChange={e => setSearchOptions(prev => ({ ...prev, ignoreDiacritics: e.target.checked }))} />
                  </label>
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Ignorar pontuação
                    <input type="checkbox" checked={searchOptions.ignorePunctuation} onChange={e => setSearchOptions(prev => ({ ...prev, ignorePunctuation: e.target.checked }))} />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-bible-border pt-3">
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Operador NEAR
                    <input type="checkbox" checked={searchOptions.nearEnabled} onChange={e => setSearchOptions(prev => ({ ...prev, nearEnabled: e.target.checked }))} />
                  </label>
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Distância
                    <input type="number" min={1} max={20} value={searchOptions.nearDistance}
                      onChange={e => setSearchOptions(prev => ({ ...prev, nearDistance: Math.max(1, Math.min(20, Number(e.target.value) || 3)) }))}
                      className="w-16 px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs" />
                  </label>
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Interrompe em
                    <select value={searchOptions.nearScope} onChange={e => setSearchOptions(prev => ({ ...prev, nearScope: e.target.value as NearScope }))} className="px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs">
                      <option value="verse">Versículos</option>
                      <option value="chapter">Capítulos</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-bible-border pt-3">
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Intervalo
                    <select value={searchOptions.scope}
                      onChange={e => setSearchOptions(prev => ({ ...prev, scope: e.target.value as SearchScope }))}
                      className="px-2 py-1 rounded-md bg-bible-bg border border-bible-border text-bible-text text-xs">
                      <option value="all">Bíblia completa</option>
                      <option value="ot">Antigo Testamento</option>
                      <option value="ot_pentateuch">Pentateuco (AT)</option>
                      <option value="ot_historical">Histórico (AT)</option>
                      <option value="ot_wisdom">Sabedoria (AT)</option>
                      <option value="ot_major_prophets">Profetas Maiores (AT)</option>
                      <option value="ot_minor_prophets">Profetas Menores (AT)</option>
                      <option value="nt">Novo Testamento</option>
                      <option value="nt_gospels_acts">Evangelhos & Atos (NT)</option>
                      <option value="nt_pauline">Epístolas de Paulo (NT)</option>
                      <option value="nt_general_revelation">Epístolas Gerais & Apocalipse (NT)</option>
                      <option value="nt_synoptic">Evangelhos Sinóticos (NT)</option>
                      <option value="nt_johannine">Escritos Joaninos (NT)</option>
                      <option value="nt_lukan">Escritos de Lucas (NT)</option>
                    </select>
                  </label>
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Cor AT
                    <input type="color" value={searchOptions.otColor}
                      onChange={e => setSearchOptions(prev => ({ ...prev, otColor: e.target.value }))}
                      className="h-7 w-10 rounded border border-bible-border bg-transparent" />
                  </label>
                  <label className="text-xs text-bible-text-muted flex items-center justify-between gap-2">
                    Cor NT
                    <input type="color" value={searchOptions.ntColor}
                      onChange={e => setSearchOptions(prev => ({ ...prev, ntColor: e.target.value }))}
                      className="h-7 w-10 rounded border border-bible-border bg-transparent" />
                  </label>
                </div>

                <div className="border-t border-bible-border pt-3 flex justify-end">
                  <button type="button" onClick={() => setSearchOptions(DEFAULT_SEARCH_OPTIONS)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bible-surface border border-bible-border text-bible-text-muted hover:text-bible-text hover:bg-bible-surface-strong transition-colors">
                    Restaurar padrão
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { setShowSuggestions(false); handleSearch(query); }
                if (e.key === 'Escape') setShowSuggestions(false);
                if (e.key === 'ArrowDown' && showSuggestions) { e.preventDefault(); }
              }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder='Pesquisar... Ex: "João 3:16", "H1234", "(fé OR graça) AND amor"'
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
                <button onClick={() => { setQuery(''); setResults({ verses: [], notes: [], footnotes: [] }); setSuggestions([]); setShowSuggestions(false); setDetectedRef(null); setStrongResult(null); }} className="p-2 text-bible-text-muted hover:text-bible-text">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-bible-border bg-bible-surface shadow-2xl overflow-hidden"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={e => { e.preventDefault(); handleSuggestionClick(s); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-bible-text hover:bg-bible-surface-strong transition-colors border-b border-bible-border/50 last:border-0"
                    >
                      {s.startsWith('📖') ? <Navigation className="w-3.5 h-3.5 text-bible-accent shrink-0" /> :
                       s.startsWith('🔍') ? <Hash className="w-3.5 h-3.5 text-bible-accent shrink-0" /> :
                       <Lightbulb className="w-3.5 h-3.5 text-bible-accent shrink-0" />}
                      <span>{s.replace(/^[^\s]+\s/, '')}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {strongResult && (
            <div className="mt-4 p-4 rounded-xl border border-bible-accent/20 bg-bible-accent/5">
              <div className="flex items-center gap-2 text-xs font-bold text-bible-accent uppercase mb-1">
                <Hash className="w-3.5 h-3.5" /> Dicionário Strong — {query.trim().toUpperCase()}
              </div>
              <p className="text-sm text-bible-text leading-relaxed">{strongResult}</p>
            </div>
          )}

          {(results.verses.length > 0 || results.notes.length > 0 || results.footnotes.length > 0) && (
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'verses', label: 'Escrituras', icon: BookOpen, count: results.verses.length },
                { id: 'notes', label: 'Minhas Notas', icon: FileText, count: results.notes.length },
                { id: 'footnotes', label: 'Rodapés', icon: MessageSquare, count: results.footnotes.length },
              ].map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id as SearchCategory)}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                    activeCategory === cat.id ? 'bg-bible-accent text-white shadow-lg' : 'bg-bible-surface text-bible-text-muted hover:bg-bible-surface-strong')}>
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                  {cat.count > 0 && <span className={cn('ml-1 px-1.5 py-0.5 rounded-full text-[10px]', activeCategory === cat.id ? 'bg-white/20' : 'bg-bible-accent/10 text-bible-accent')}>{cat.count}</span>}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={toggleSort} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bible-surface border border-bible-border text-[10px] font-bold text-bible-text-muted hover:text-bible-text transition-colors" title="Alternar ordenação">
                  <ArrowUpDown className="w-3 h-3" />
                  {sortMode === 'book' ? 'Livro' : 'Relevância'}
                </button>
                <button onClick={exportResults} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bible-surface border border-bible-border text-[10px] font-bold text-bible-text-muted hover:text-bible-text transition-colors" title="Copiar resultados">
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full">
          {activeCategory === 'verses' && distributionRows.length > 0 && (
            <div className="premium-card p-4 mb-4">
              <div className="text-xs font-bold uppercase text-bible-text-muted mb-3">Distribuição por livro</div>
              <div className="space-y-1.5">
                {distributionRows.map(row => {
                  const isNT = row.numericId >= 40;
                  const color = isNT ? searchOptions.ntColor : searchOptions.otColor;
                  const pct = Math.max(3, (row.count / maxCount) * 100);
                  const pctLabel = Math.round((row.count / totalVerseMatches) * 100);
                  return (
                    <div key={row.id} className="grid grid-cols-[56px_78px_1fr] items-center gap-2 text-xs">
                      <span className="font-semibold text-bible-text">{row.name}</span>
                      <span className="text-bible-text-muted">{row.count} ({pctLabel}%)</span>
                      <div className="h-3 rounded-sm border border-bible-border bg-bible-surface overflow-hidden">
                        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-bible-accent animate-spin mb-4" />
              <p className="text-sm text-bible-text-muted">Vasculhando toda a biblioteca...</p>
            </div>
          ) : results.verses.length === 0 && results.notes.length === 0 && results.footnotes.length === 0 && !strongResult ? (
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
              {query.length >= 2 && !strongResult && (
                <div className="text-center py-20">
                  <div className="inline-block p-6 rounded-full bg-bible-surface mb-4">
                    <SearchIcon className="w-12 h-12 text-bible-text-muted/20" />
                  </div>
                  <h3 className="text-lg font-bold text-bible-text">Nenhum resultado</h3>
                  <p className="text-sm text-bible-text-muted">Tente usar termos mais curtos ou genéricos.</p>
                  {aiError && <p className="text-xs text-red-500 mt-2">{aiError}</p>}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-bible-surface text-bible-text-muted">💡 Dica: use * como coringa: "am*" acha amor, amado...</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-bible-surface text-bible-text-muted">💡 Dica: parênteses: "(fé OR graça) AND obras"</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-bible-surface text-bible-text-muted">💡 Dica: Strong: H1234 ou G5678</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-bible-surface text-bible-text-muted">💡 Dica: Referência: "João 3:16" navega direto</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div key={activeCategory} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 pt-4">
              {activeCategory === 'verses' && (() => {
                const verses = sortedVerses;
                if (verses.length === 0) return null;
                return verses.map((v, i) => {
                  const book = BIBLE_BOOKS.find(b => b.id === v.bookId);
                  const aiKey = `${v.bookId}-${v.chapter}:${v.verse}`;
                  return (
                    <div
                      key={`${v.bookId}-${v.chapter}-${v.verse}-${i}`}
                      onClick={() => onNavigate(v.bookId, v.chapter, v.verse)}
                      onMouseEnter={e => openVersePreview(v, e, false)}
                      onMouseMove={e => { if (!previewPinned) setPreviewAnchor({ x: e.clientX, y: e.clientY }); }}
                      onMouseLeave={() => { if (!previewPinned) setPreviewVerse(null); }}
                      onTouchStart={e => openVersePreview(v, e, true)}
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
                });
              })()}

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
                    <button onClick={e => { e.stopPropagation(); setActiveTab('notes'); }} className="text-[10px] font-bold text-bible-accent uppercase hover:underline">
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
          className={cn(
            'fixed z-30 w-[min(92vw,540px)] max-h-[60vh] overflow-y-auto rounded-xl border border-bible-border bg-bible-surface shadow-2xl p-3',
            previewPinned ? 'pointer-events-auto' : 'pointer-events-none'
          )}
          style={{
            left: Math.min(previewAnchor.x + 16, window.innerWidth - 560),
            top: Math.min(previewAnchor.y + 16, window.innerHeight - 400),
          }}
        >
          {previewPinned && (
            <button type="button" onClick={() => { setPreviewVerse(null); setPreviewPinned(false); }}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-bible-surface-strong text-bible-text-muted hover:text-bible-text pointer-events-auto" aria-label="Fechar preview">
              ×
            </button>
          )}
          <div className="text-[11px] font-bold text-bible-accent mb-1 uppercase tracking-wide">
            {BIBLE_BOOKS.find(b => b.id === previewVerse.bookId)?.name} {previewVerse.chapter}:{previewVerse.verse}
          </div>

          {previewContext.length > 0 && (
            <div className="mb-2 space-y-1 border-l-2 border-bible-accent/30 pl-3">
              {previewContext.map(ctx => {
                const isTarget = ctx.verse === previewVerse.verse;
                return (
                  <div key={ctx.verse} className={cn('text-xs leading-relaxed', isTarget ? 'text-bible-text font-medium' : 'text-bible-text-muted/70')}>
                    <span className={cn('text-[10px] font-bold mr-1', isTarget ? 'text-bible-accent' : 'text-bible-text-muted/50')}>
                      v{ctx.verse}:
                    </span>
                    {isTarget ? (
                      <span dangerouslySetInnerHTML={{ __html: highlightSearchTerms(ctx.text, query) }} />
                    ) : (
                      cleanStrongsCodes(ctx.text)
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {previewContext.length === 0 && (
            <div className="text-sm text-bible-text leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightSearchTerms(previewVerse.text, query) }} />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
