/**
 * Serviço de Integração com Gemini AI
 * Focado em fornecer definições teológicas profundas (Assembleiano Clássico).
 * 
 * NOTA: Este arquivo agora atua como uma camada de compatibilidade (facade)
 * que utiliza os novos serviços em src/features/ai/
 */

// Importar o novo serviço unificado
import { aiService } from '../features/ai/AIService';
import type { AIResponse } from '../features/ai/AIService';

// ==================== FUNÇÕES DE CONFIGURAÇÃO ====================

/**
 * Obtém a chave de API (compatibilidade)
 */
export const getApiKey = (): string => {
  const provider = getConfiguredProvider();
  switch (provider) {
    case 'opencode':
      return localStorage.getItem('opencode-api-key') || '';
    case 'openrouter':
      return localStorage.getItem('openrouter-api-key') || '';
    case 'groq':
      return localStorage.getItem('groq-api-key') || '';
    case 'huggingface':
      return localStorage.getItem('huggingface-api-key') || '';
    default:
      return localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  }
};

/**
 * Detecta automaticamente o provider (compatibilidade)
 */
export const autoDetectProvider = (): 'google' | 'openrouter' | 'opencode' | 'groq' | 'huggingface' => {
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const groqKey = localStorage.getItem('groq-api-key');
  const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

  if (openRouterKey && openRouterKey.trim()) return 'openrouter';
  if (groqKey && groqKey.trim()) return 'groq';
  if (geminiKey && geminiKey.trim()) return 'google';
  
  return 'openrouter';
};

/**
 * Obtém o provider configurado (compatibilidade)
 */
export const getConfiguredProvider = (): 'google' | 'openrouter' | 'opencode' | 'groq' | 'huggingface' => {
  const configured = localStorage.getItem('ai-api-provider') || 'google';
  return configured as any;
};

/**
 * Obtém o modelo configurado (compatibilidade)
 */
export const getConfiguredModel = (): string => {
  const provider = getConfiguredProvider();
  const saved = localStorage.getItem('codex-settings');
  
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.ai?.model) return settings.ai.model;
    } catch (e) {
      // Ignorar erro
    }
  }
  
  return provider === 'openrouter' ? 'openrouter/free' : 'gemini-2.0-flash';
};

// ==================== FUNÇÕES DE COMPATIBILIDADE ====================

/**
 * Obtém uma explicação detalhada via IA (compatibilidade)
 */
export const getGeminiExplanation = async (
  term: string,
  context?: string,
  apiKey?: string,
  model?: string
): Promise<string> => {
  try {
    const response = await aiService.explainTerm(term, 'assembleiano');
    return response.success ? response.content || '' : `Erro: ${response.error}`;
  } catch (error: any) {
    return `Erro ao gerar explicação: ${error.message}`;
  }
};

/**
 * Gera conteúdo usando IA com prompt personalizado (compatibilidade)
 */
export const getAIResponse = async (
  prompt: string,
  systemInstruction?: string,
  apiKey?: string,
  model?: string
): Promise<string> => {
  try {
    const response = await aiService.callAI(prompt, {
      systemInstruction,
      theologicalProfile: 'assembleiano',
    });
    return response.success ? response.content || '' : `Erro: ${response.error}`;
  } catch (error: any) {
    return `Erro ao gerar resposta: ${error.message}`;
  }
};

export interface AIExplanation {
  term: string;
  definition: string;
  originalMeaning?: string;
  scripturalReference?: string;
  spiritualApplication: string;
}

export interface ReadingPlanAI {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  readings: {
    day: number;
    title: string;
    type: 'scripture' | 'devotional';
    passages: string[];
    devotionalContent?: string;
  }[];
}

/**
 * Gera plano de leitura usando IA (compatibilidade)
 */
export const generateReadingPlan = async (
  userDescription: string,
  preferredDays?: number
): Promise<{ success: boolean; plan?: ReadingPlanAI; error?: string }> => {
  try {
    const response = await aiService.generateReadingPlan(userDescription, preferredDays);
    return response;
  } catch (error: any) {
    return { success: false, error: `Erro ao gerar plano: ${error.message}` };
  }
};

/**
 * Diagnóstico completo da configuração IA (compatibilidade)
 */
export const diagnoseAIConfiguration = () => {
  const configuredProvider = localStorage.getItem('ai-api-provider') || 'google';
  const openCodeKey = localStorage.getItem('opencode-api-key');
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

  console.log('=== DIAGNÓSTICO CONFIGURAÇÃO IA ===');
  console.log('Provider configurado:', configuredProvider);
  console.log('Chave OpenCode presente:', !!openCodeKey);
  console.log('Chave OpenRouter presente:', !!openRouterKey);
  console.log('Chave Gemini presente:', !!geminiKey);
  console.log('Provider detectado:', getConfiguredProvider());
  console.log('Modelo configurado:', getConfiguredModel());
  console.log('Chave API usada:', getApiKey() ? 'Presente' : 'Ausente');
  console.log('=====================================');

  return {
    configuredProvider,
    hasOpenCodeKey: !!openCodeKey,
    hasOpenRouterKey: !!openRouterKey,
    hasGeminiKey: !!geminiKey,
    detectedProvider: getConfiguredProvider(),
    configuredModel: getConfiguredModel(),
    hasApiKey: !!getApiKey()
  };
};

/**
 * Testa a configuração da IA (compatibilidade)
 */
export const testAIConfiguration = async (): Promise<{ 
  success: boolean; 
  message: string; 
  provider: string; 
  model: string; 
  quotaWarning?: boolean; 
  suggestion?: string 
}> => {
  const provider = getConfiguredProvider();
  const model = getConfiguredModel();
  const apiKey = getApiKey();

  console.log('[geminiService] Testando configuração:', { provider, model, hasKey: !!apiKey });

  if (!apiKey) {
    return {
      success: false,
      message: `Nenhuma chave de API configurada para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}`,
      provider,
      model
    };
  }

  try {
    const testPrompt = "Olá, isso é um teste. Responda apenas 'OK'.";
    const response = await getAIResponse(testPrompt);
    return {
      success: true,
      message: `Configuração válida: ${provider} com modelo ${model}`,
      provider,
      model
    };
  } catch (error: any) {
    console.error('[geminiService] Erro no teste:', error);
    
    let quotaWarning = false;
    let message = `Erro na configuração: ${error.message}`;
    let suggestion: string | undefined;

    if (error.message?.includes('Quota exceeded')) {
      quotaWarning = true;
      message = `Limite de quota excedido para ${model}.`;
      suggestion = 'Para mais quota gratuita, configure OpenRouter nas Configurações → IA.';
    } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      message = `Chave de API inválida para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}.`;
      suggestion = 'Verifique se a chave foi copiada corretamente das configurações do provedor.';
    } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      message = `Acesso negado. Verifique permissões da chave de API.`;
      suggestion = 'A chave pode não ter permissões suficientes ou ter expirado.';
    }

    return {
      success: false,
      message,
      provider,
      model,
      quotaWarning,
      suggestion
    };
  }
};

/**
 * Sugere automaticamente trocar para OpenRouter se houver problemas de quota
 */
export const suggestOpenRouterForQuota = (): boolean => {
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const currentProvider = getConfiguredProvider();

  if (currentProvider === 'openrouter') return false;
  return !!(openRouterKey && openRouterKey.trim());
};

/**
 * Auto-configura para usar OpenRouter se disponível
 */
export const autoSwitchToOpenRouter = (): boolean => {
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  console.log('[geminiService] Tentando auto-switch, chave OpenRouter:', openRouterKey ? 'Presente' : 'Ausente');

  if (openRouterKey && openRouterKey.trim()) {
    localStorage.setItem('ai-api-provider', 'openrouter');
    console.log('[geminiService] Auto-switched to OpenRouter for better quota');
    return true;
  }

  return false;
};
