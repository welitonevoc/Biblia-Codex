import { getConfiguredProvider, getApiKey } from './geminiService';
import { storage } from '../StorageService';
import type { StrongsEntry } from '../types';

let vineCache: Map<string, { word: string; lang: string; text: string }[]> | null = null;
let vineLoadError: string | null = null;
let vineLoadedToStorage = false;

export const loadVineIndex = async (): Promise<void> => {
  if (vineCache) return;
  if (vineLoadError) {
    console.warn('[VineProService] Ja houve erro ao carregar:', vineLoadError);
    return;
  }
    
  console.log('[VineProService] Carregando indice...');
  
  // Usar apenas o formato .json.gz (NDJSON comprimido)
  const gzUrls = [
    '/data/VinePro_clean.json.gz',
    '/VinePro_clean.json.gz',
  ];

  for (const url of gzUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      if (uint8Array[0] === 0x1f && uint8Array[1] === 0x8b) {
        const decompressed = await decompressGzip(uint8Array);
        const text = new TextDecoder().decode(decompressed);
        parseVineData(text);
        console.log('[VineProService] Carregado gz de:', url);
        await loadVineToStorage();
        return;
      } else {
        const text = new TextDecoder().decode(buffer);
        if (text.trim().length > 100) {
          parseVineData(text);
          console.log('[VineProService] Carregado texto de:', url);
          await loadVineToStorage();
          return;
        }
      }
    } catch (_e) {
      console.warn('[VineProService] Falha ao carregar de', url, _e);
    }
  }

  vineLoadError = 'Nenhum formato de VinePro encontrado';
  console.error('[VineProService] Erro: nenhum arquivo VinePro disponivel');
};

function parseVineData(text: string) {
  const lines = text.split('\n').filter(l => l.trim());
  vineCache = new Map();
  
  lines.forEach(line => {
    try {
      const entry = JSON.parse(line);
      const word = entry.w?.toUpperCase();
      if (word) {
        const firstChar = word.charAt(0).toUpperCase();
        if (!vineCache!.has(firstChar)) {
          vineCache!.set(firstChar, []);
        }
        vineCache!.get(firstChar)!.push({
          word,
          lang: entry.l,
          text: entry.t
        });
      }
    } catch (e) {}
  });
  
  console.log('[VineProService] Índice carregado:', vineCache!.size, 'grupos');
}

async function loadVineToStorage() {
  if (vineLoadedToStorage || !vineCache) return;
  
  try {
    const hebrewEntries: StrongsEntry[] = [];
    const greekEntries: StrongsEntry[] = [];
    
    for (const [, group] of vineCache) {
      for (const entry of group) {
        const entryData: StrongsEntry = {
          number: entry.word,
          word: entry.word,
          language: entry.lang === 'H' ? 'hebrew' : 'greek',
          transliteration: entry.word,
          definition: entry.text,
          pronunciation: '',
        };
        
        if (entry.lang === 'H') {
          hebrewEntries.push(entryData);
        } else {
          greekEntries.push(entryData);
        }
      }
    }
    
    if (hebrewEntries.length > 0) {
      await storage.saveStrongsHebrewBatch(hebrewEntries);
      console.log('[VineProService] Salvos', hebrewEntries.length, 'verbetes hebraicos');
    }
    
    if (greekEntries.length > 0) {
      await storage.saveStrongsGreekBatch(greekEntries);
      console.log('[VineProService] Salvos', greekEntries.length, 'verbetes gregos');
    }
    
    vineLoadedToStorage = true;
    console.log('[VineProService] VinePro carregado no storage como dicionário padrão de Strong');
  } catch (e) {
    console.error('[VineProService] Erro ao salvar no storage:', e);
  }
}

async function decompressGzip(data: Uint8Array): Promise<ArrayBuffer> {
  try {
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(data);
    writer.close();
    const response = new Response(ds.readable);
    return await response.arrayBuffer();
  } catch (e) {
    console.error('[VineProService] Erro na descompressão:', e);
    throw e;
  }
}

export const getVineEntry = async (term: string): Promise<string | null> => {
  await loadVineIndex();
  
  if (!vineCache) return null;
  
  const firstChar = term.charAt(0).toUpperCase();
  const group = vineCache.get(firstChar);
  if (!group) return null;
  
  const q = term.toUpperCase();
  const found = group.find(e => e.word === q);
  
  return found?.text || null;
};

export const searchVine = async (term: string, limit = 10) => {
  await loadVineIndex();
  
  if (!vineCache) return [];
  
  const results: { word: string; lang: string; text: string }[] = [];
  const q = term.toUpperCase();
  
  for (const [, group] of vineCache) {
    for (const entry of group) {
      if (entry.word.includes(q) || entry.text.toLowerCase().includes(q.toLowerCase())) {
        results.push(entry);
        if (results.length >= limit) break;
      }
    }
    if (results.length >= limit) break;
  }
  
  return results;
};

export const getVineWithAI = async (term: string): Promise<string> => {
  const vineText = await getVineEntry(term);
  const provider = getConfiguredProvider();
  const apiKey = getApiKey();
  
  if (!vineText) {
    return `⚠️ Verbete "${term}" não encontrado no Multiléxico Vine Pro.\n\nTente buscar no formato Strong (ex: H1 para hebraico, G1 para grego).`;
  }
  
  if (!apiKey) {
    return vineText;
  }
  
  // Se tem API, enriching with IA context
  const prompt = `
Você é um assistente de estudo bíblico. Use as informações do Multiléxico Vine Pro abaixo para fornecer uma explicação detallada.

INFORMAÇÃO DO VINE PRO:
${vineText}

TAREFA: Forneça uma explicação teológica aprofundada da palavra Strong "${term}", baseando-se na definição acima.
Inclua:
1. Significado original (hebraico/grego/aramaico)
2. Uso bíblico
3. Aplicação teológica
4. Referências a outros estudos

Responda em Português do Brasil, em Markdown.
  `;
  
  try {
    const { getAIResponse } = await import('./geminiService');
    return await getAIResponse(prompt, "Você é um assistente de estudo bíblico erudito.");
  } catch (e) {
    return vineText;
  }
};

export const VineProService = {
  loadVineIndex,
  getVineEntry,
  search: searchVine,
  getVineWithAI
};