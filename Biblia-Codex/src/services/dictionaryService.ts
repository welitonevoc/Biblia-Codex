import { getGeminiExplanation } from './geminiService';
import { BibleService } from '../BibleService';
import { DictionaryEntry } from '../types';

/**
 * Busca uma definição em um módulo local (SQLite)
 */
export const searchLocalDictionary = async (term: string, modulePath: string): Promise<DictionaryEntry | null> => {
  return BibleService.getDictionaryEntry(term, modulePath);
};

/**
 * Obtém uma explicação detalhada via IA
 */
export const getAIDefinition = async (term: string, context?: string, apiKey?: string): Promise<DictionaryEntry> => {
  const definition = await getGeminiExplanation(term, context, apiKey);
  return {
    id: `ai-${term}-${Date.now()}`,
    term,
    definition,
    source: 'ai',
    moduleName: 'Assistente de Estudo IA',
    isAiGenerated: true
  };
};

export const AI_MODULE_ID = 'ai_assistant';

export const createAiModule = (type: string): any => ({
  id: AI_MODULE_ID,
  name: 'Assistente IA',
  format: 'AI',
  category: type,
  path: 'ai'
});

export const dictionaryService = {
  searchLocalDictionary,
  getAIDefinition,
  getEntries: async (term: string, module: any): Promise<DictionaryEntry[]> => {
    if (!module) return [];
    if (module.id === AI_MODULE_ID) {
      const entry = await getAIDefinition(term);
      return [entry];
    }
    const local = await searchLocalDictionary(term, module.path || 'local');
    return local ? [local] : [];
  }
};
