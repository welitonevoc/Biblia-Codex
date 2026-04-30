import type { EncyclopediaEntry } from '../types';

interface MerrillRaw { w: string; t: string }
interface VineRaw { w: string; l: string; t: string }

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '📚' },
  { id: 'merrill', label: 'Enciclopédia Merrill', icon: '📖' },
  { id: 'vine-hebrew', label: 'Vine Hebraico', icon: '🔤' },
  { id: 'vine-greek', label: 'Vine Grego', icon: '🔠' },
];

let cachedEntries: EncyclopediaEntry[] | null = null;
let searchIndex: { word: string; text: string; entry: EncyclopediaEntry }[] | null = null;
let loadingPromise: Promise<EncyclopediaEntry[]> | null = null;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '');
}

async function loadNDJSON<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);

  const decompressedStream = response.body!.pipeThrough(new DecompressionStream('gzip'));
  const text = await new Response(decompressedStream).text();
  return text.trim().split('\n').map(line => JSON.parse(line) as T);
}

async function loadMerrill(): Promise<EncyclopediaEntry[]> {
  const raw = await loadNDJSON<MerrillRaw>('/EnciclopediaMerril_clean.json.gz');
  return raw.map((item, idx) => ({
    id: `merrill-${idx}`,
    word: item.w,
    text: item.t,
    source: 'merrill' as const,
    category: 'merrill',
    searchIndex: `${normalizeText(item.w)} ${normalizeText(item.t)}`,
  }));
}

async function loadVine(): Promise<EncyclopediaEntry[]> {
  const raw = await loadNDJSON<VineRaw>('/VinePro_clean.json.gz');
  return raw.map((item, idx) => {
    const isHebrew = item.l === 'H';
    return {
      id: `vine-${idx}`,
      word: item.w,
      text: item.t,
      source: 'vine' as const,
      language: isHebrew ? 'hebrew' as const : 'greek' as const,
      strongNumber: item.w,
      category: isHebrew ? 'vine-hebrew' : 'vine-greek',
      searchIndex: `${normalizeText(item.w)} ${normalizeText(item.t)}`,
    };
  });
}

export async function loadEncyclopediaEntries(): Promise<EncyclopediaEntry[]> {
  if (cachedEntries) return cachedEntries;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const [merrill, vine] = await Promise.all([
      loadMerrill(),
      loadVine(),
    ]);
    cachedEntries = [...merrill, ...vine];
    searchIndex = cachedEntries.map(entry => ({
      word: normalizeText(entry.word),
      text: entry.searchIndex || '',
      entry,
    }));
    return cachedEntries;
  })();

  return loadingPromise;
}

export function searchEntries(query: string, limit = 50): EncyclopediaEntry[] {
  if (!searchIndex || !query.trim()) return [];
  
  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  
  const scored = searchIndex.map(({ word, text, entry }) => {
    let score = 0;
    
    for (const w of words) {
      if (word.startsWith(w)) score += 10;
      else if (word.includes(w)) score += 5;
      if (text.includes(w)) score += 1;
    }
    
    if (word === normalizedQuery) score += 50;
    
    return { entry, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function getCategories() {
  return CATEGORIES;
}

export function getEntriesByCategory(category: string, limit = 100): EncyclopediaEntry[] {
  if (!cachedEntries) return [];
  if (category === 'all') return cachedEntries.slice(0, limit);
  return cachedEntries.filter(e => e.category === category).slice(0, limit);
}

export function getEntryById(id: string): EncyclopediaEntry | undefined {
  return cachedEntries?.find(e => e.id === id);
}

export function getSuggestions(query: string, limit = 8): EncyclopediaEntry[] {
  if (!searchIndex || !query.trim()) return [];
  
  const normalizedQuery = normalizeText(query);
  
  const matched = searchIndex
    .filter(({ word }) => word.startsWith(normalizedQuery))
    .sort((a, b) => a.word.localeCompare(b.word))
    .slice(0, limit)
    .map(({ entry }) => entry);
  
  if (matched.length < limit) {
    const remaining = searchIndex
      .filter(({ word }) => word.includes(normalizedQuery) && !word.startsWith(normalizedQuery))
      .sort((a, b) => a.word.localeCompare(b.word))
      .slice(0, limit - matched.length)
      .map(({ entry }) => entry);
    matched.push(...remaining);
  }
  
  return matched.slice(0, limit);
}

export function getStats() {
  if (!cachedEntries) return { total: 0, merrill: 0, vine: 0, hebrew: 0, greek: 0 };
  return {
    total: cachedEntries.length,
    merrill: cachedEntries.filter(e => e.source === 'merrill').length,
    vine: cachedEntries.filter(e => e.source === 'vine').length,
    hebrew: cachedEntries.filter(e => e.language === 'hebrew').length,
    greek: cachedEntries.filter(e => e.language === 'greek').length,
  };
}
