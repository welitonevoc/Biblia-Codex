import { getConfiguredProvider, getApiKey } from './geminiService';

let vineCache: Map<string, { word: string; lang: string; text: string }[]> | null = null;

export const loadVineIndex = async (): Promise<void> => {
  if (vineCache) return;
  
  console.log('[VineProService] Carregando índice...');
  const response = await fetch('/VinePro_clean.json.gz');
  const buffer = await response.arrayBuffer();
  
  const decompressed = await decompressGzip(new Uint8Array(buffer));
  const text = new TextDecoder().decode(decompressed);
  
  const lines = text.split('\n').filter(l => l.trim());
  vineCache = new Map();
  
  lines.forEach(line => {
    try {
      const entry = JSON.parse(line);
      const word = entry.w?.toUpperCase();
      if (word) {
        if (!vineCache!.has(word[0].toUpperCase())) {
          vineCache!.set(word[0].toUpperCase(), []);
        }
        vineCache!.get(word[0].toUpperCase())!.push({
          word,
          lang: entry.l,
          text: entry.t
        });
      }
    } catch (e) {}
  });
  
  console.log('[VineProService] Índice carregado:', vineCache!.size, 'grupos');
};

async function decompressGzip(data: Uint8Array): Promise<ArrayBuffer> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  const response = new Response(ds.readable);
  return response.arrayBuffer();
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