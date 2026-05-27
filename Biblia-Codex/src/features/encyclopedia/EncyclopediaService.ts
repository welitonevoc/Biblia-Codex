import type { EncyclopediaEntry } from '../types';
import { getDataUrl } from '../../utils/dataAssets';
import { Capacitor } from '@capacitor/core';

interface MerrillRaw { w: string; t: string }
interface VineRaw { w: string; l: string; t: string }

const CATEGORIES = [
  { id: 'all', label: 'Todos', iconId: 'library' },
  { id: 'merrill', label: 'Enciclopédia Merrill', iconId: 'book-open' },
  { id: 'vine-hebrew', label: 'Vine Hebraico', iconId: 'hebrew' },
  { id: 'vine-greek', label: 'Vine Grego', iconId: 'greek' },
  { id: 'quem-quem', label: 'Quem é Quem', iconId: 'user' },
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

async function decompressGzip(data: Uint8Array): Promise<ArrayBuffer> {
  if (typeof DecompressionStream === 'undefined') {
    console.error('DecompressionStream not supported');
    throw new Error('Seu dispositivo não suporta descompressão nativa (DecompressionStream). Por favor, atualize o Android System WebView nas configurações do seu celular.');
  }
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  const response = new Response(ds.readable);
  return response.arrayBuffer();
}

async function loadNDJSON<T>(filename: string): Promise<T[]> {
  const cleanName = filename.replace(/^\//, '');
  const isNative = Capacitor.isNativePlatform();

  console.log(`Encyclopedia: Platform: ${Capacitor.getPlatform()}, Native: ${isNative}, Loading: ${cleanName}`);

  // Build URL list based on platform
  const urls: string[] = [];

  if (isNative) {
    // On Android with capacitor:// scheme, use relative paths or capacitor:// URLs
    const origin = window.location.origin; // Should be capacitor://localhost
    urls.push(
      `${origin}/data/${cleanName}`,
      `./data/${cleanName}`,
      `data/${cleanName}`,
      `/data/${cleanName}`
    );
  } else {
    urls.push(
      `${import.meta.env.BASE_URL}data/${cleanName}`,
      getDataUrl(filename),
      `/data/${cleanName}`
    );
  }

  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      console.log(`Encyclopedia: Trying ${url}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} for ${url}`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
         console.warn(`Encyclopedia: Received HTML instead of data from ${url}. Skipping.`);
         continue;
      }

      const buffer = await response.arrayBuffer();
      console.log(`Encyclopedia: Loaded buffer from ${url}, size: ${buffer.byteLength}`);

      if (buffer.byteLength === 0) {
        lastError = new Error(`Empty file at ${url}`);
        continue;
      }

      const bytes = new Uint8Array(buffer);
      let text: string;

      if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
        console.log(`Encyclopedia: Decompressing ${cleanName}...`);
        const decompressed = await decompressGzip(bytes);
        text = new TextDecoder().decode(decompressed);
      } else {
        text = new TextDecoder().decode(buffer);
      }

      const lines = text.trim().split('\n').filter(l => l.trim());
      console.log(`Encyclopedia: Successfully parsed ${lines.length} lines from ${cleanName}`);
      return lines.map(line => {
        try {
          return JSON.parse(line) as T;
        } catch (e) {
          console.error(`Error parsing line in ${cleanName}:`, line.substring(0, 100));
          throw e;
        }
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(`Encyclopedia: Timeout loading ${url}`);
        lastError = new Error(`Tempo esgotado ao carregar ${cleanName}`);
      } else {
        console.warn(`Encyclopedia: Failed to load from ${url}:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
      continue;
    }
  }

  throw lastError || new Error(`Não foi possível carregar o arquivo ${cleanName}. Verifique sua conexão.`);
}

async function loadMerrill(): Promise<EncyclopediaEntry[]> {
  const raw = await loadNDJSON<MerrillRaw>('EnciclopediaMerril_clean.json.gz');
  return raw.map((item, idx) => ({
    id: `merrill-${idx}`,
    word: item.w,
    text: item.t,
    source: 'merrill' as const,
    category: 'merrill',
    searchIndex: `${normalizeText(item.w)} ${normalizeText(item.t)}`,
  }));
}

async function loadQuemQuem(): Promise<EncyclopediaEntry[]> {
  const raw = await loadNDJSON<MerrillRaw>('QuemQuem_clean.json.gz');
  return raw.map((item, idx) => ({
    id: `quem-quem-${idx}`,
    word: item.w,
    text: item.t,
    source: 'quem-quem' as const,
    category: 'quem-quem',
    searchIndex: `${normalizeText(item.w)} ${normalizeText(item.t)}`,
  }));
}

async function loadVine(): Promise<EncyclopediaEntry[]> {
  const raw = await loadNDJSON<VineRaw>('VinePro_clean.json.gz');
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
    try {
      const [merrill, vine, quemQuem] = await Promise.all([
        loadMerrill(),
        loadVine(),
        loadQuemQuem(),
      ]);
      cachedEntries = [...merrill, ...vine, ...quemQuem];
      searchIndex = cachedEntries.map(entry => ({
        word: normalizeText(entry.word),
        text: entry.searchIndex || '',
        entry,
      }));
      return cachedEntries;
    } catch (err) {
      // Reset so next call can retry instead of returning a rejected promise forever
      loadingPromise = null;
      throw err;
    }
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

export function getEntriesByLetter(letter: string, category = 'all'): EncyclopediaEntry[] {
  if (!cachedEntries) return [];
  const upperLetter = letter.toUpperCase();
  return cachedEntries.filter(e => {
    const firstChar = e.word.charAt(0).toUpperCase();
    const matchesLetter = firstChar === upperLetter;
    if (category === 'all') return matchesLetter;
    return matchesLetter && e.category === category;
  });
}

export function getAvailableLetters(category = 'all'): Set<string> {
  if (!cachedEntries) return new Set();
  const letters = new Set<string>();
  for (const entry of cachedEntries) {
    if (category !== 'all' && entry.category !== category) continue;
    const firstChar = entry.word.charAt(0).toUpperCase();
    if (/[A-ZÀ-Ú]/.test(firstChar)) {
      letters.add(firstChar);
    }
  }
  return letters;
}

export function getSuggestions(query: string, limit = 8): EncyclopediaEntry[] {
  if (!searchIndex || !query.trim()) return [];
  
  const normalizedQuery = normalizeText(query);
  const seen = new Set<string>();
  
  // Prioridade 1: palavras que começam exatamente com a query
  const startsWithMatches = searchIndex
    .filter(({ word }) => word.startsWith(normalizedQuery))
    .sort((a, b) => {
      // Exact match first, then shorter words first
      if (a.word === normalizedQuery) return -1;
      if (b.word === normalizedQuery) return 1;
      return a.word.length - b.word.length || a.word.localeCompare(b.word);
    });

  const matched: EncyclopediaEntry[] = [];
  for (const { entry } of startsWithMatches) {
    const key = entry.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      matched.push(entry);
      if (matched.length >= limit) break;
    }
  }
  
  // Prioridade 2: palavras que contêm a query
  if (matched.length < limit) {
    const containsMatches = searchIndex
      .filter(({ word }) => word.includes(normalizedQuery) && !word.startsWith(normalizedQuery))
      .sort((a, b) => a.word.length - b.word.length || a.word.localeCompare(b.word));

    for (const { entry } of containsMatches) {
      const key = entry.word.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        matched.push(entry);
        if (matched.length >= limit) break;
      }
    }
  }
  
  return matched;
}

export function getStats() {
  if (!cachedEntries) return { total: 0, merrill: 0, vine: 0, hebrew: 0, greek: 0, quemQuem: 0 };
  return {
    total: cachedEntries.length,
    merrill: cachedEntries.filter(e => e.source === 'merrill').length,
    vine: cachedEntries.filter(e => e.source === 'vine').length,
    hebrew: cachedEntries.filter(e => e.language === 'hebrew').length,
    greek: cachedEntries.filter(e => e.language === 'greek').length,
    quemQuem: cachedEntries.filter(e => e.source === 'quem-quem').length,
  };
}
