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
export const autoDetectProvider = (): 'google' | 'openrouter' => {
  const openRouterKey = localStorage.getItem('openrouter-api-key');
  const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

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
export const getConfiguredProvider = (): 'google' | 'openrouter' => {
  const configured = localStorage.getItem('ai-api-provider') || 'google';
  console.log('[geminiService] Provider configurado:', configured);

  // Verifica se a configuração faz sentido com as chaves disponíveis
  if (configured === 'openrouter') {
    const openRouterKey = localStorage.getItem('openrouter-api-key');
    if (!openRouterKey || !openRouterKey.trim()) {
      console.warn('[geminiService] OpenRouter configurado mas sem chave, auto-detectando...');
      return autoDetectProvider();
    }
  } else if (configured === 'google') {
    const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey || !geminiKey.trim()) {
      console.warn('[geminiService] Google configurado mas sem chave, auto-detectando...');
      return autoDetectProvider();
    }
  }

  return configured as 'google' | 'openrouter';
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
    let headers: Record<string, string>;
    let body: any;

    if (provider === 'openrouter') {
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
      return `Erro ${response.status}: ${data.error?.message || 'Falha na requisição'}`;
    }

    if (provider === 'openrouter') {
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
 * Testa a configuração da IA
 */
export const testAIConfiguration = async (): Promise<{ success: boolean; message: string; provider: string; model: string }> => {
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
    await getAIResponse(testPrompt, undefined, apiKey, model);
    return {
      success: true,
      message: `Configuração válida: ${provider} com modelo ${model}`,
      provider,
      model
    };
  } catch (error: any) {
    console.error('[geminiService] Erro no teste:', error);
    return {
      success: false,
      message: `Erro na configuração: ${error.message}`,
      provider,
      model
    };
  }
};
