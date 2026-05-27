/**
 * index.ts - Exports centralizados para features de IA
 * Facilita imports em outros arquivos
 */

// Serviço princial de IA
export { AIService, aiService } from './AIService';
export type { 
  AIProvider, 
  AIResponse, 
  BibleVerse, 
  StudyContext, 
  TheologicalProfile 
} from './AIService';

// Serviço RAG (Retrieval-Augmented Generation)
export { AIRagService, aiRagService } from './AIRagService';
export type { 
  EmbeddingVector, 
  SemanticSearchResult, 
  RAGContext 
} from './AIRagService';

// Agentes IA especializados
export { AIAgents, aiAgents } from './AIAgents';
export type { 
  AgentType, 
  AgentResponse, 
  MultiAgentResponse 
} from './AIAgents';

// Cache inteligente
export { AICacheService, aiCacheService } from './AICacheService';
export type { 
  AICacheEntry, 
  CacheStats 
} from './AICacheService';

// ==================== HOOKS (React) ====================

import { useState, useEffect, useCallback } from 'react';
import { aiService } from './AIService';
import { aiAgents } from './AIAgents';

/**
 * Hook para usar o serviço de IA
 */
export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explainTerm = useCallback(async (term: string, profile?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiService.explainTerm(term, profile);
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const explainVerses = useCallback(async (references: string, verses: any[], profile?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiService.explainVerses(references, verses, profile);
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReadingPlan = useCallback(async (description: string, days?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiService.generateReadingPlan(description, days);
      return response;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    explainTerm,
    explainVerses,
    generateReadingPlan,
    diagnose: () => aiService.diagnose(),
  };
}

/**
 * Hook para usar agentes IA
 */
export function useAIAgents() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);

  const queryAgent = useCallback(async (agentType: any, query: string, context?: any) => {
    setIsLoading(true);
    setCurrentAgent(agentType);
    try {
      const response = await aiAgents.queryAgent(agentType, query, context);
      return response;
    } finally {
      setIsLoading(false);
      setCurrentAgent(null);
    }
  }, []);

  const queryMultipleAgents = useCallback(async (
    query: string,
    agentTypes: any[],
    context?: any
  ) => {
    setIsLoading(true);
    try {
      const response = await aiAgents.queryMultipleAgents(query, agentTypes, context);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deepBibleStudy = useCallback(async (topic: string, verses?: string) => {
    setIsLoading(true);
    try {
      const response = await aiAgents.deepBibleStudy(topic, verses);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const prepareSermon = useCallback(async (passage: string, verses: string) => {
    setIsLoading(true);
    try {
      const response = await aiAgents.prepareSermon(passage, verses);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const biblicalCounseling = useCallback(async (situation: string, verses?: string) => {
    setIsLoading(true);
    try {
      const response = await aiAgents.biblicalCounseling(situation, verses);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    currentAgent,
    queryAgent,
    queryMultipleAgents,
    deepBibleStudy,
    prepareSermon,
    biblicalCounseling,
  };
}

// ==================== CONSTANTES ====================

export const AI_CONSTANTS = {
  MAX_CACHE_ENTRIES: 1000,
  DEFAULT_TTL: 7 * 24 * 60 * 60 * 1000, // 7 dias
  EMBEDDING_DIMENSION: 768,
  SUPPORTED_PROVIDERS: ['google', 'openrouter', 'opencode', 'groq', 'huggingface'] as const,
  THEOLOGICAL_PROFILES: ['assembleiano', 'biblico-geral', 'academico'] as const,
  AGENT_TYPES: ['theologian', 'historian', 'devotional', 'apologist', 'preacher', 'counselor'] as const,
};
