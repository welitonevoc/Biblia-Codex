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

export interface AIExplanation {
  term: string;
  definition: string;
  originalMeaning?: string;
  scripturalReference?: string;
  spiritualApplication: string;
}

/**
 * Obtém a chave de API com base no provedor configurado
 */
export const getApiKey = (): string => {
  const provider = localStorage.getItem('ai-api-provider') || 'google';
  
  if (provider === 'openrouter') {
    return localStorage.getItem('openrouter-api-key') || '';
  }
  
  return localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

/**
 * Obtém o modelo configurado nas configurações
 */
export const getConfiguredModel = (): string => {
  const model = localStorage.getItem('ai-model') || 'gemini-2.0-flash';
  return model;
};

/**
 * Obtém o provider configurado
 */
export const getConfiguredProvider = (): 'google' | 'openrouter' => {
  return (localStorage.getItem('ai-api-provider') || 'google') as 'google' | 'openrouter';
};

/**
 * Gera conteúdo usando a IA configurada
 */
export const getGeminiExplanation = async (term: string, context?: string, apiKey?: string, model?: string): Promise<string> => {
  // Usa a chave fornecida ou busca a configurada
  const key = apiKey || getApiKey();
  if (!key) return "API Key não configurada nas preferências.";

  // Usa o modelo fornecado ou o configurado
  const configuredModel = model || getConfiguredModel();
  const provider = getConfiguredProvider();

  const prompt = `
    ${ASSEMBLEIANO_CLASSICO_PROMPT}

    TAREFA: Defina e explique o termo bíblico ou palavra: "${term}" ${context ? `no contexto de ${context}` : ""}.
    Forneça o significado original (hebraico/grego se aplicável), uso bíblico e aplicação espiritual segundo o perfil teológico citado acima.
    Responda em Markdown.
  `;

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
        messages: [
          { role: 'system', content: 'Você é um assistente de estudo bíblico erudito.' },
          { role: 'user', content: prompt }
        ]
      };
    } else {
      // Google Gemini
      url = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent?key=${key}`;
      headers = { 'Content-Type': 'application/json' };
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: "Você é um assistente de estudo bíblico erudito." }] }
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      return `Erro ${response.status}: ${data.error?.message || 'Falha na requisição'}`;
    }

    // Extrai resposta baseado no provider
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
