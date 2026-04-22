import { getGeminiExplanation, getConfiguredModel, getConfiguredProvider, getApiKey } from './geminiService';
import { BibleService } from '../BibleService';
import { DictionaryEntry } from '../types';
import { storage } from '../StorageService';

const AI_CACHE_PREFIX = 'ai_dict_';

export const searchLocalDictionary = async (term: string, modulePath: string): Promise<DictionaryEntry | null> => {
  return BibleService.getDictionaryEntry(term, modulePath);
};

export const getAIDefinition = async (term: string, context?: string): Promise<DictionaryEntry> => {
  const provider = getConfiguredProvider();
  const apiKey = getApiKey();
  
  console.log('[dictionaryService] getAIDefinition - Provider:', provider, 'HasKey:', !!apiKey);

  if (!apiKey) {
    return {
      id: `ai-${term}-${Date.now()}`,
      term,
      definition: '⚠️ **Chave de API não configurada**\n\nPor favor, configure sua chave de API nas **Configurações → IA** para usar o assistente de IA.',
      source: 'ai',
      moduleName: 'Assistente de Estudo IA',
      isAiGenerated: true
    };
  }

  try {
    const definition = await getGeminiExplanation(term, context);
    
    await storage.saveDictionaryCache(term, definition, `IA (${provider})`);
    
    return {
      id: `ai-${term}-${Date.now()}`,
      term,
      definition,
      source: 'ai',
      moduleName: 'Assistente de Estudo IA',
      isAiGenerated: true
    };
  } catch (error: any) {
    console.error('[dictionaryService] Erro ao buscar definição:', error);
    
    const cached = await storage.getDictionaryCache(term);
    if (cached) {
      return {
        id: `ai-${term}-cached-${Date.now()}`,
        term,
        definition: `${cached.definition}\n\n---
⚠️ *Resposta em cache (offline)*`,
        source: 'ai',
        moduleName: cached.moduleName || 'Assistente IA (Offline)',
        isAiGenerated: true
      };
    }
    
    return {
      id: `ai-${term}-${Date.now()}`,
      term,
      definition: `❌ Erro ao conectar com a IA: ${error.message || 'Erro desconhecido'}\n\nVerifique:\n1. Chave de API está configurada nas Configurações → IA\n2. Há conexão com a internet\n3. A chave de API é válida`,
      source: 'ai',
      moduleName: 'Assistente de Estudo IA',
      isAiGenerated: true
    };
  }
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