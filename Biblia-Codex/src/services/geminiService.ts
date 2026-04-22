/**
 * Serviço de Integração com Gemini AI
 * Focado em fornecer definições teológicas profundas (Assembleiano Clássico).
 */

const ASSEMBLEIANO_CLASSICO_PROMPT = `
DIRETRIZES DE PERFIL: Assembleiano Clássico (Pentecostalismo Histórico/CPAD).

AUTORES DE REFERÊNCIA (USE COMO BASE):
- Clássicos: Antonio Gilberto, Eurico Bergstén, Severino Pedro da Silva, Claudionor de Andrade, Lawrence Olson, Emílio Conde, Orlando Boyer.
- Atuais: Elienai Cabral, Esequias Soares, Elinaldo Renovato, José Gonçalves, Douglas Baptista, Silas Daniel, Esdras Bentho.
- Liderança/Educação: José Wellington Bezerra da Costa, Ciro Zibordi, Marcos Tuler, Paulo Romeiro.

DIRETRIZES DE RESPOSTA:
1. Baseie-se no pentecostalismo clássico das Assembleias de Deus (Declaração de Fé da CGADB).
2. Use preferencialmente a Bíblia Almeida Corrigida Fiel (ARC).
3. Cite ou faça alusão ao pensamento dos autores acima para validar os argumentos teológicos.
4. Mantenha um tom pastoral, tecnicamente profundo e focado na edificação.
5. Defenda as doutrinas distintivas: Batismo no Espírito Santo como evidência inicial (falar em línguas), dons espirituais para a atualidade e a iminente volta de Cristo (Pré-milenarismo Dispensacionalista).
6. Responda em Português do Brasil de forma organizada.
`;

/**
 * Obtém a chave de API com base no provedor configurado, com auto-detecção
 */
export const getApiKey = (): string => {
  const provider = getConfiguredProvider();
  console.log('[geminiService] Provider final usado:', provider);

  if (provider === 'opencode') {
    const key = localStorage.getItem('opencode-api-key') || '';
    console.log('[geminiService] Usando chave OpenCode:', key ? 'Presente' : 'Ausente');
    return key;
  }

  if (provider === 'openrouter') {
    const key = localStorage.getItem('openrouter-api-key') || '';
    console.log('[geminiService] Usando chave OpenRouter:', key ? 'Presente' : 'Ausente');
    return key;
  }

  const key = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  console.log('[geminiService] Usando chave Gemini:', key ? 'Presente' : 'Ausente');
  return key;
};

/**
 * Detecta automaticamente o provider baseado nas chaves disponíveis
 */
export const autoDetectProvider = (): 'google' | 'openrouter' | 'opencode' | 'groq' => {
  const openCodeKey = localStorage.getItem('opencode-api-key');
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

  if (openCodeKey && openCodeKey.trim()) {
    console.log('[geminiService] OpenCode detectado automaticamente');
    return 'opencode';
  }

  if (openRouterKey && openRouterKey.trim()) {
    console.log('[geminiService] OpenRouter detectado automaticamente');
    return 'openrouter';
  }

  if (geminiKey && geminiKey.trim()) {
    console.log('[geminiService] Gemini detectado automaticamente');
    return 'google';
  }

  console.warn('[geminiService] Nenhuma chave de API encontrada, usando Google por padrão');
  return 'google';
};

/**
 * Obtém o provider configurado, com auto-detecção se necessário
 */
export const getConfiguredProvider = (): 'google' | 'openrouter' | 'opencode' | 'groq' | 'huggingface' => {
  const configured = localStorage.getItem('ai-api-provider') || 'google';
  const openCodeKey = localStorage.getItem('opencode-api-key');
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

  console.log('[geminiService] Provider configurado no localStorage:', configured);
  console.log('[geminiService] Chave OpenCode presente:', !!openCodeKey);
  console.log('[geminiService] Chave OpenRouter presente:', !!openRouterKey);
  console.log('[geminiService] Chave Gemini presente:', !!geminiKey);

  // Verifica se a configuração faz sentido com as chaves disponíveis
  if (configured === 'opencode') {
    if (!openCodeKey || !openCodeKey.trim()) {
      console.warn('[geminiService] OpenCode configurado mas sem chave, auto-detectando...');
      return autoDetectProvider();
    }
  } else if (configured === 'openrouter') {
    if (!openRouterKey || !openRouterKey.trim()) {
      console.warn('[geminiService] OpenRouter configurado mas sem chave, auto-detectando...');
      return autoDetectProvider();
    }
  } else if (configured === 'google') {
    if (!geminiKey || !geminiKey.trim()) {
      console.warn('[geminiService] Google configurado mas sem chave, auto-detectando...');
      return autoDetectProvider();
    }
  }

  console.log('[geminiService] Usando provider:', configured);
  return configured as 'google' | 'openrouter' | 'opencode' | 'groq' | 'huggingface';
};

/**
 * Obtém o modelo configurado nas configurações
 */
export const getConfiguredModel = (): string => {
  const provider = getConfiguredProvider();
  const saved = localStorage.getItem('codex-settings');

  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.ai?.model) {
        // Valida se o modelo é compatível com o provider
        const model = settings.ai.model;
        if (provider === 'openrouter') {
          // Para OpenRouter, modelos devem ter formato "author/model" ou ser da lista de free models
          // Se o modelo for um modelo Google (sem /), usa o openrouter auto
          if (!model.includes('/')) {
            console.warn('[geminiService] Modelo Google não compatível com OpenRouter, usando openrouter/free');
            return 'openrouter/free';
          }
        }
        return model;
      }
    } catch (e) {
      console.error('[geminiService] Erro ao ler settings:', e);
    }
  }

  // Fallback baseado no provider
  return provider === 'openrouter' ? 'openrouter/free' : 'gemini-2.0-flash';
};

/**
 * Função interna para fazer requisição à IA
 */
const callAI = async (prompt: string, systemInstruction?: string, apiKey?: string, model?: string): Promise<string> => {
  const key = apiKey || getApiKey();
  if (!key) return "API Key não configurada nas preferências.";

  const configuredModel = model || getConfiguredModel();
  const provider = getConfiguredProvider();

  try {
    let url: string;
    let headers: Record<string, string> = {};
    let body: any;

    if (provider === 'opencode') {
      url = `https://opencode.ai/api/v1/chat/completions`;
      headers = {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      };
      body = {
        model: 'minimax-m2.5-free',
        messages: systemInstruction
          ? [{ role: 'system', content: systemInstruction }, { role: 'user', content: prompt }]
          : [{ role: 'user', content: prompt }]
      };
      console.log(`[geminiService] OpenCode request:`, {
        model: 'minimax-m2.5-free',
        url,
        keyPrefix: key?.substring(0, 10) + '...',
        hasKey: !!key
      });
    } else if (provider === 'openrouter') {
      url = `https://openrouter.ai/api/v1/chat/completions`;
      headers = {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Bíblia Codex'
      };
      body = {
        model: configuredModel,
        messages: systemInstruction
          ? [{ role: 'system', content: systemInstruction }, { role: 'user', content: prompt }]
          : [{ role: 'user', content: prompt }]
      };
      console.log(`[geminiService] OpenRouter request:`, {
        model: configuredModel,
        url,
        keyPrefix: key?.substring(0, 10) + '...',
        hasKey: !!key,
        keyLength: key?.length || 0
      });
    } else {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent?key=${key}`;
      headers = { 'Content-Type': 'application/json' };
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        ...(systemInstruction && { system_instruction: { parts: [{ text: systemInstruction }] } })
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AI API Error:', data);

      // Tratamento específico para erros de quota
      if (response.status === 429 || data.error?.message?.includes('Quota exceeded')) {
        const quotaMessage = `Limite de uso excedido para ${configuredModel}. `;
        const retryMatch = data.error?.message?.match(/retry in (\d+\.\d+)s/);
        if (retryMatch) {
          const retryTime = parseFloat(retryMatch[1]);
          const minutes = Math.ceil(retryTime / 60);
          return `${quotaMessage}Tente novamente em ${minutes} minuto(s). Ou considere usar OpenRouter para mais quota.`;
        }
        return `${quotaMessage}Tente novamente mais tarde ou configure uma chave OpenRouter para mais quota.`;
      }

      // Outros erros da API
      if (response.status === 403) {
        return `Erro 403: Acesso negado. Verifique se sua chave de API é válida para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}.`;
      }

      if (response.status === 401) {
        return `Erro 401: Não autorizado. Verifique sua chave de API para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}.`;
      }

      return `Erro ${response.status}: ${data.error?.message || 'Falha na requisição'}`;
    }

    if (provider === 'opencode' || provider === 'openrouter') {
      return data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";
    } else {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar resposta.";
    }
  } catch (error) {
    console.error("AI Error:", error);
    return "Erro de conexão com o Assistente IA.";
  }
};

/**
 * Obtém uma explicação detalhada via IA (compatibilidade - usa template de definição)
 */
export const getGeminiExplanation = async (term: string, context?: string, apiKey?: string, model?: string): Promise<string> => {
  const prompt = `
    ${ASSEMBLEIANO_CLASSICO_PROMPT}

    TAREFA: Defina e explique o termo bíblico ou palavra: "${term}" ${context ? `no contexto de ${context}` : ""}.
    Forneça o significado original (hebraico/grego se aplicável), uso bíblico e aplicação espiritual segundo o perfil teológico citado acima.
    Responda em Markdown.
  `;

  return callAI(prompt, "Você é um assistente de estudo bíblico erudito.", apiKey, model);
};

/**
 * Gera conteúdo usando IA com prompt personalizado
 */
export const getAIResponse = async (prompt: string, systemInstruction?: string, apiKey?: string, model?: string): Promise<string> => {
  return callAI(prompt, systemInstruction, apiKey, model);
};

export interface AIExplanation {
  term: string;
  definition: string;
  originalMeaning?: string;
  scripturalReference?: string;
  spiritualApplication: string;
}

/**
 * Diagnóstico completo da configuração IA
 */
export const diagnoseAIConfiguration = () => {
  const configuredProvider = localStorage.getItem('ai-api-provider') || 'google';
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

  console.log('=== DIAGNÓSTICO CONFIGURAÇÃO IA ===');
  console.log('Provider configurado:', configuredProvider);
  console.log('Chave OpenRouter presente:', !!openRouterKey, openRouterKey ? '(comprimento: ' + openRouterKey.length + ')' : '');
  console.log('Chave Gemini presente:', !!geminiKey, geminiKey ? '(comprimento: ' + geminiKey.length + ')' : '');
  console.log('Provider detectado:', getConfiguredProvider());
  console.log('Modelo configurado:', getConfiguredModel());
  console.log('Chave API usada:', getApiKey() ? 'Presente' : 'Ausente');
  console.log('=====================================');

  return {
    configuredProvider,
    hasOpenRouterKey: !!openRouterKey,
    hasGeminiKey: !!geminiKey,
    detectedProvider: getConfiguredProvider(),
    configuredModel: getConfiguredModel(),
    hasApiKey: !!getApiKey()
  };
};

/**
 * Testa a configuração da IA
 */
export const testAIConfiguration = async (): Promise<{ success: boolean; message: string; provider: string; model: string; quotaWarning?: boolean; suggestion?: string }> => {
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
    // Teste simples
    const testPrompt = "Olá, isso é um teste. Responda apenas 'OK'.";
    const response = await getAIResponse(testPrompt, undefined, apiKey, model);
    return {
      success: true,
      message: `Configuração válida: ${provider} com modelo ${model}`,
      provider,
      model
    };
  } catch (error: any) {
    console.error('[geminiService] Erro no teste:', error);

    // Detecta problemas específicos
    let quotaWarning = false;
    let message = `Erro na configuração: ${error.message}`;
    let suggestion: string | undefined;

    if (error.message?.includes('Quota exceeded')) {
      quotaWarning = true;
      message = `Limite de quota excedido para ${model}.`;
      suggestion = 'Para mais quota gratuita, configure OpenRouter nas Configurações → IA. Modelos gratuitos disponíveis: MiniMax, Nemotron, Gemma, Qwen.';
    } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      message = `Chave de API inválida para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}.`;
      suggestion = 'Verifique se a chave foi copiada corretamente das configurações do provedor.';
    } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      message = `Acesso negado. Verifique permissões da chave de API para ${provider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}.`;
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

  // Se já está usando OpenRouter, não sugere
  if (currentProvider === 'openrouter') return false;

  // Se tem chave OpenRouter disponível, sugere
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
    console.log('[geminiService] Provider após switch:', localStorage.getItem('ai-api-provider'));
    return true;
  }

  console.log('[geminiService] Não foi possível fazer auto-switch - chave OpenRouter não encontrada');
  return false;
};
