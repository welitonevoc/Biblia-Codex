import { DictionaryEntry } from '../types';

let merrillCache: Map<string, { word: string; text: string }[]> | null = null;

export const loadMerrillIndex = async (): Promise<void> => {
  if (merrillCache) return;
  
  console.log('[MerrillService] Carregando índice...');
  const response = await fetch('/EnciclopediaMerril_clean.json.gz');
  const buffer = await response.arrayBuffer();
  
  const decompressed = await decompressGzip(new Uint8Array(buffer));
  const text = new TextDecoder().decode(decompressed);
  
  const lines = text.split('\n').filter(l => l.trim());
  merrillCache = new Map();
  
  lines.forEach(line => {
    try {
      const entry = JSON.parse(line);
      const word = entry.w?.toLowerCase();
      if (word) {
        const firstChar = word.charAt(0).toUpperCase();
        if (!merrillCache!.has(firstChar)) {
          merrillCache!.set(firstChar, []);
        }
        merrillCache!.get(firstChar)!.push({ word, text: entry.t });
      }
    } catch (e) {}
  });
  
  console.log('[MerrillService] Índice carregado:', merrillCache?.size, 'grupos');
};

async function decompressGzip(data: Uint8Array): Promise<ArrayBuffer> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  const response = new Response(ds.readable);
  return response.arrayBuffer();
}

export const getMerrillEntry = async (term: string): Promise<string | null> => {
  await loadMerrillIndex();
  
  if (!merrillCache) return null;
  
  const firstChar = term.charAt(0).toUpperCase();
  const group = merrillCache.get(firstChar);
  if (!group) return null;
  
  const q = term.toLowerCase();
  const found = group.find(e => e.word === q || e.word.toLowerCase() === q);
  
  return found?.text || null;
};

export const searchMerrill = async (term: string, limit = 5): Promise<DictionaryEntry[]> => {
  await loadMerrillIndex();
  
  if (!merrillCache) return [];
  
  const results: DictionaryEntry[] = [];
  const q = term.toLowerCase();
  
  for (const [, group] of merrillCache) {
    for (const entry of group) {
      if (entry.word.includes(q) || entry.text.toLowerCase().includes(q)) {
        results.push({
          id: `merrill-${entry.word}`,
          term: entry.word,
          definition: entry.text,
          source: 'local',
          moduleName: 'Enciclopédia Merrill',
          isAiGenerated: false
        });
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
  }
  
  return results;
};

export const MerrillService = {
  loadMerrillIndex,
  getMerrillEntry,
  search: searchMerrill
};