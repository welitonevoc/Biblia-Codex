/**
 * AIService.ts - Serviço unificado de IA para Biblia Codex
 * Consolida geminiService e aiStudyService com arquitetura RAG
 * Suporta múltiplos providers e implementa cache inteligente
 */

import { GoogleGenAI } from "@google/genai";
import { db } from "../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getMerrillEntry } from "../../services/MerrillService";

// ==================== TIPOS ====================

export interface AIProvider {
  name: 'google' | 'openrouter' | 'opencode' | 'groq' | 'huggingface';
  apiKey: string;
  model: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  provider?: string;
  model?: string;
  cached?: boolean;
  quotaWarning?: boolean;
  suggestion?: string;
}

export interface BibleVerse {
  book: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface StudyContext {
  verses?: BibleVerse[];
  dictionaryTerms?: string[];
  crossReferences?: string[];
  theologicalTheme?: string;
}

// ==================== PERFIS TEOLÓGICOS ====================

export const THEOLOGICAL_PROFILES = {
  assembleiano: {
    name: "Assembleiano Clássico",
    systemPrompt: `
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
6. Responda em Português do Brasil de forma organizada e usando Markdown.
`,
  },
  
  reformado: {
    name: "Reformado",
    systemPrompt: `
DIRETRIZES DE PERFIL: Teologia Reformada (Calvinismo/Tradição Reformada).

AUTORES DE REFERÊNCIA:
- Clássicos: João Calvino, João Knox, Francisco Turretin, Charles Hodge, Benjamin Warfield.
- Contemporâneos: R.C. Sproul, John Piper, Tim Keller, John MacArthur, Wayne Grudem.

DIRETRIZES DE RESPOSTA:
1. Baseie-se nos cinco solas da Reforma: Sola Scriptura, Sola Fide, Sola Gratia, Solus Christus, Soli Deo Gloria.
2. Defenda a soberania de Deus em todas as coisas, especialmente na salvação (eleição incondicional).
3. Use preferencialmente a Bíblia Almeida Revista e Corrigida (ARC) ou Nova Versão Transformadora.
4. Explique passagens à luz da aliança e da soberania divina.
5. Mantenha tom acadêmico, preciso e centrado nas Escrituras.
6. Responda em Português do Brasil usando Markdown.
`,
  },

  catolico: {
    name: "Católico Romano",
    systemPrompt: `
DIRETRIZES DE PERFIL: Teologia Católica Romana.

AUTORES DE REFERÊNCIA:
- Santos da Igreja: Agostinho, Tomás de Aquino, Jerônimo, João Crisóstomo.
- Contemporâneos: Papa Francisco, Scott Hahn, Karl Rahner, Henri de Lubac.

DIRETRIZES DE RESPOSTA:
1. Baseie-se no Magistério da Igreja Católica, Tradição Apostólica e Sagrada Escritura.
2. Use preferencialmente a Bíblia de Jerusalém ou Ave Maria.
3. Explique passagens à luz do Catecismo da Igreja Católica.
4. Reconheça a autoridade papal, a intercessão dos santos, os sacramentos e a Tradição.
5. Mantenha tom respeitoso, litúrgico e doutrinariamente preciso.
6. Responda em Português do Brasil usando Markdown.
`,
  },
} as const;

export type TheologicalProfile = keyof typeof THEOLOGICAL_PROFILES;

// ==================== CLASSE PRINCIPAL ====================

export class AIService {
  private provider: AIProvider;
  private userId: string | null = null;

  constructor(provider?: Partial<AIProvider>) {
    this.provider = this.resolveProvider(provider);
  }

  // ==================== CONFIGURAÇÃO ====================

  private resolveProvider(provider?: Partial<AIProvider>): AIProvider {
    const configuredProvider = localStorage.getItem('ai-api-provider') || 'google';
    const savedSettings = localStorage.getItem('codex-settings');
    let model = 'gemini-2.0-flash';
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.ai?.model) model = settings.ai.model;
      } catch (e) {
        console.error('[AIService] Erro ao ler settings:', e);
      }
    }
    
    const providers = {
      google: {
        name: 'google' as const,
        // Ler e limpar a chave (remover espaços)
        apiKey: (provider?.apiKey || localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY || '').replace(/\s+/g, ''),
        model: provider?.model || (configuredProvider === 'google' ? model : 'gemini-2.0-flash'),
      },
      openrouter: {
        name: 'openrouter' as const,
        apiKey: provider?.apiKey || localStorage.getItem('openrouter-api-key') || '',
        model: provider?.model || (configuredProvider === 'openrouter' ? model : 'openrouter/free'),
      },
      opencode: {
        name: 'opencode' as const,
        apiKey: provider?.apiKey || localStorage.getItem('opencode-api-key') || '',
        model: provider?.model || 'minimax-m2.5-free',
      },
      groq: {
        name: 'groq' as const,
        apiKey: provider?.apiKey || localStorage.getItem('groq-api-key') || '',
        model: provider?.model || 'llama3-8b-8192',
      },
      huggingface: {
        name: 'huggingface' as const,
        apiKey: provider?.apiKey || localStorage.getItem('huggingface-api-key') || '',
        model: provider?.model || 'mistralai/Mistral-7B-Instruct-v0.1',
      },
    };
    
    return providers[configuredProvider as keyof typeof providers] || providers.google;
  }

  setUser(userId: string | null) {
    this.userId = userId;
  }

  // ==================== CHAMADA À IA ====================

  async callAI(
    prompt: string,
    options?: {
      systemInstruction?: string;
      theologicalProfile?: TheologicalProfile;
      context?: StudyContext;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    const {
      systemInstruction,
      theologicalProfile = 'assembleiano',
      context,
      temperature = 0.7,
      maxTokens,
    } = options || {};

    // Resolver provider a cada chamada para pegar configurações mais recentes
    this.provider = this.resolveProvider();
    
    console.log('[AIService] Provider atual:', this.provider);
    console.log('[AIService] API Key presente:', !!this.provider.apiKey);
    
    const profile = THEOLOGICAL_PROFILES[theologicalProfile];
    const finalSystemInstruction = systemInstruction || profile.systemPrompt;

    // Construir contexto enriquecido
    let enrichedPrompt = prompt;
    if (context) {
      enrichedPrompt = this.buildContextualPrompt(prompt, context);
    }

    try {
      // Google Gemini
      if (this.provider.name === 'google') {
        return await this.callGemini(enrichedPrompt, finalSystemInstruction, temperature, maxTokens);
      }

      // OpenRouter
      if (this.provider.name === 'openrouter') {
        return await this.callOpenRouter(enrichedPrompt, finalSystemInstruction, temperature);
      }

      // OpenCode
      if (this.provider.name === 'opencode') {
        return await this.callOpenCode(enrichedPrompt, finalSystemInstruction);
      }

      // Groq
      if (this.provider.name === 'groq') {
        return await this.callGroq(enrichedPrompt, finalSystemInstruction, temperature);
      }

      return {
        success: false,
        error: `Provedor ${this.provider.name} não suportado para este tipo de chamada.`,
      };
    } catch (error: any) {
      console.error('[AIService] Erro:', error);
      return {
        success: false,
        error: this.parseError(error),
      };
    }
  }

  private async callGemini(
    prompt: string,
    systemInstruction: string,
    temperature: number,
    maxTokens?: number
  ): Promise<AIResponse> {
    if (!this.provider.apiKey) {
      return { success: false, error: 'API Key do Gemini não configurada.' };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.provider.apiKey });
      
      const response = await ai.models.generateContent({
        model: this.provider.model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          ...(maxTokens && { maxOutputTokens: maxTokens }),
        },
      });

      const content = response.text;
      if (!content) {
        return { success: false, error: 'A IA não retornou uma resposta válida.' };
      }
      
      return {
        success: true,
        content,
        provider: 'google',
        model: this.provider.model,
      };
    } catch (error: any) {
      console.error('[AIService] Erro completo do Gemini:', error);
      
      let errorMessage = 'Erro ao conectar com Gemini.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('invalid')) {
        errorMessage = `Chave de API inválida. Verifique se:
1. A chave foi copiada corretamente (sem espaços)
2. A chave é para Google AI Studio (Gemini)
3. A chave não expirou ou foi revogada
4. O formato da chave está correto (começa com AIzaSy...)`;
      }
      
      return {
        success: false,
        error: errorMessage,
        provider: 'google',
        model: this.provider.model,
      };
    }
  }

  private async callOpenRouter(
    prompt: string,
    systemInstruction: string,
    temperature: number
  ): Promise<AIResponse> {
    if (!this.provider.apiKey) {
      return { success: false, error: 'API Key do OpenRouter não configurada.' };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Bíblia Codex',
        },
        body: JSON.stringify({
          model: this.provider.model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Erro ${response.status}: ${data.error?.message || 'Falha na requisição'}`,
          quotaWarning: response.status === 429,
        };
      }

      return {
        success: true,
        content: data.choices?.[0]?.message?.content || 'Erro ao gerar resposta.',
        provider: 'openrouter',
        model: this.provider.model,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao conectar: ${error.message}`,
      };
    }
  }

  private async callOpenCode(
    prompt: string,
    systemInstruction: string
  ): Promise<AIResponse> {
    if (!this.provider.apiKey) {
      return { success: false, error: 'API Key do OpenCode não configurada.' };
    }

    try {
      const response = await fetch('https://opencode.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.provider.model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Erro ${response.status}: ${data.error?.message || 'Falha na requisição'}`,
        };
      }

      return {
        success: true,
        content: data.choices?.[0]?.message?.content || 'Erro ao gerar resposta.',
        provider: 'opencode',
        model: this.provider.model,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao conectar: ${error.message}`,
      };
    }
  }

  private async callGroq(
    prompt: string,
    systemInstruction: string,
    temperature: number
  ): Promise<AIResponse> {
    if (!this.provider.apiKey) {
      return { success: false, error: 'API Key do Groq não configurada.' };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.provider.model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Erro ${response.status}: ${data.error?.message || 'Falha na requisição'}`,
        };
      }

      return {
        success: true,
        content: data.choices?.[0]?.message?.content || 'Erro ao gerar resposta.',
        provider: 'groq',
        model: this.provider.model,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Erro ao conectar: ${error.message}`,
      };
    }
  }

  // ==================== CONTEXTO E RAG ====================

  private buildContextualPrompt(prompt: string, context: StudyContext): string {
    let contextualPrompt = prompt + '\n\n';

    if (context.verses && context.verses.length > 0) {
      contextualPrompt += '=== VERSÍCULOS CONTEXTUAIS ===\n';
      context.verses.forEach(v => {
        contextualPrompt += `${v.book} ${v.chapter}:${v.verse} - ${v.text}\n`;
      });
      contextualPrompt += '\n';
    }

    if (context.dictionaryTerms && context.dictionaryTerms.length > 0) {
      contextualPrompt += '=== TERMOS PARA CONSULTA ===\n';
      context.dictionaryTerms.forEach(async (term) => {
        const entry = await getMerrillEntry(term);
        if (entry) {
          contextualPrompt += `**${term}**: ${entry}\n`;
        }
      });
      contextualPrompt += '\n';
    }

    if (context.crossReferences && context.crossReferences.length > 0) {
      contextualPrompt += '=== REFERÊNCIAS CRUZADAS ===\n';
      context.crossReferences.forEach(ref => {
        contextualPrompt += `- ${ref}\n`;
      });
      contextualPrompt += '\n';
    }

    if (context.theologicalTheme) {
      contextualPrompt += `Tema Teológico: ${context.theologicalTheme}\n\n`;
    }

    return contextualPrompt;
  }

  // ==================== CACHE ====================

  async getCachedResponse(cacheKey: string): Promise<string | null> {
    if (!this.userId || !db) return null;

    try {
      const cacheRef = doc(db, 'users', this.userId, 'aiCache', cacheKey);
      const snap = await getDoc(cacheRef);
      if (snap.exists()) {
        return snap.data().content;
      }
    } catch (error) {
      console.error('[AIService] Erro ao buscar cache:', error);
    }
    return null;
  }

  async saveToCache(cacheKey: string, content: string): Promise<void> {
    if (!this.userId || !db) return;

    try {
      const cacheRef = doc(db, 'users', this.userId, 'aiCache', cacheKey);
      await setDoc(cacheRef, {
        content,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[AIService] Erro ao salvar cache:', error);
    }
  }

  // ==================== FUNÇÕES ESPECIALIZADAS ====================

  async explainTerm(
    term: string,
    profile: TheologicalProfile = 'assembleiano'
  ): Promise<AIResponse> {
    const cacheKey = `term:${term}:${profile}`;
    const cached = await this.getCachedResponse(cacheKey);
    if (cached) {
      return { success: true, content: cached, cached: true };
    }

    // Buscar definição Merrill
    const merrillContext = await getMerrillEntry(term);

    const prompt = `
${merrillContext ? `INFORMAÇÃO DA ENCICLOPÉDIA MERRILL:\n${merrillContext}\n\n` : ''}

TAREFA: Defina e explique o termo bíblico ou palavra: "${term}".

${merrillContext 
  ? 'Use a informação da Enciclopédia Merrill como base, complementando com seu conhecimento teológico.' 
  : 'Forneça o significado original (hebraico/grego se aplicável), uso bíblico e aplicação espiritual segundo o perfil teológico citado.'}

Responda em Markdown com seções claras:
1. **Definição**
2. **Significado Original**
3. **Uso Bíblico**
4. **Aplicação Espiritual**
5. **Referências Adicionais**
`;

    const response = await this.callAI(prompt, { 
      theologicalProfile: profile 
    });

    if (response.success && response.content) {
      await this.saveToCache(cacheKey, response.content);
    }

    return response;
  }

  async explainVerses(
    references: string,
    verses: BibleVerse[],
    profile: TheologicalProfile = 'assembleiano'
  ): Promise<AIResponse> {
    const cacheKey = `verses:${references}:${profile}`;
    const cached = await this.getCachedResponse(cacheKey);
    if (cached) {
      return { success: true, content: cached, cached: true };
    }

    const verseTexts = verses.map(v => `${v.book} ${v.chapter}:${v.verse} - ${v.text}`).join('\n');

    const prompt = `
Comente e explique os seguintes versículos:

${verseTexts}

Forneça uma explicação teológica profunda cobrindo:
1. **Contexto Histórico-Cultural**
2. **Análise Linguística** (palavras originais relevantes)
3. **Interpretação Teológica**
4. **Aplicação Prática**
5. **Conexões com Outros Textos Bíblicos**

Responda em Markdown.
`;

    const response = await this.callAI(prompt, { 
      theologicalProfile: profile,
      context: { verses },
    });

    if (response.success && response.content) {
      await this.saveToCache(cacheKey, response.content);
    }

    return response;
  }

  async generateReadingPlan(
    description: string,
    preferredDays?: number,
    profile: TheologicalProfile = 'assembleiano'
  ): Promise<AIResponse & { plan?: any }> {
    const prompt = `
Por favor, crie um plano de leitura bíblica personalizado ${preferredDays ? `com aproximadamente ${preferredDays} dias` : 'com duração adequada'}.

Descrição do usuário: ${description}

DIRETRIZES:
1. Crie planos que sejam teologicamente ricos e espiritualmente edificantes.
2. Inclua uma mistura de leituras bíblicas e, opcionalmente, devocionais.
3. Use referências bíblicas precisas (formato: Livro Capítulo:Versículos).
4. Para devocionais, escreva conteúdo original e reflexivo de aproximadamente 200-300 palavras.
5. Responda sempre em JSON válido, sem texto adicional.

FORMATO DE RESPOSTA (JSON):
{
  "title": "Nome do plano",
  "description": "Breve descrição do plano",
  "totalDays": número de dias,
  "readings": [
    {
      "day": número do dia,
      "title": "Título da leitura",
      "type": "scripture" ou "devotional",
      "passages": ["Referência bíblica"],
      "devotionalContent": "Conteúdo do devocional (apenas se type for devotional)"
    }
  ]
}
`;

    const response = await this.callAI(prompt, { 
      theologicalProfile: profile,
      systemInstruction: `
Você é um assistente especializado em criar planos de leitura bíblica personalizados.
Seu trabalho é criar planos de leitura baseados em descrições do usuário.

DIRETRIZES:
1. Crie planos que sejam teologicamente ricos e espiritualmente edificantes.
2. Inclua uma mistura de leituras bíblicas e, opcionalmente, devocionais.
3. Use referências bíblicas precisas (formato: Livro Capítulo:Versículos).
4. Para devocionais, escreva conteúdo original e reflexivo de aproximadamente 200-300 palavras.
5. Responda sempre em JSON válido, sem texto adicional.
`,
    });

    if (!response.success) return response;

    try {
      const jsonMatch = response.content?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { ...response, error: 'Não foi possível entender a resposta da IA.' };
      }

      const plan = JSON.parse(jsonMatch[0]);
      const planId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        ...response,
        plan: {
          id: planId,
          title: plan.title || 'Plano Personalizado',
          description: plan.description || '',
          totalDays: plan.totalDays || plan.readings?.length || 1,
          readings: plan.readings || [],
        },
      };
    } catch (error) {
      return { ...response, error: 'Erro ao processar plano gerado.' };
    }
  }

  async compareTranslations(
    verseRef: string,
    translations: { version: string; text: string }[]
  ): Promise<AIResponse> {
    const prompt = `
Compare as seguintes traduções de ${verseRef}:

${translations.map(t => `**${t.version}**: ${t.text}`).join('\n\n')}

Forneça uma análise comparativa cobrindo:
1. **Diferenças de Tradução** (palavras escolhidas, interpretações)
2. **Precisão Linguística** (qual versão captura melhor o original)
3. **Clareza para o Leitor Moderno**
4. **Nuances Teológicas** (se houver)
5. **Recomendação** (qual versão usar para diferentes propósitos)

Responda em Markdown.
`;

    return await this.callAI(prompt, {
      systemInstruction: 'Você é um especialista em crítica textual e tradução bíblica.',
    });
  }

  // ==================== UTILITÁRIOS ====================

  private parseError(error: any): string {
    if (error?.message?.includes('Quota exceeded')) {
      return `Limite de uso excedido para ${this.provider.model}. Tente novamente mais tarde ou configure uma chave OpenRouter para mais quota.`;
    }
    if (error?.status === 403 || error?.message?.includes('Forbidden')) {
      return `Acesso negado. Verifique se sua chave de API é válida.`;
    }
    if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
      return `Não autorizado. Verifique sua chave de API.`;
    }
    return error?.message || 'Erro de conexão com o Assistente IA.';
  }

  diagnose(): Record<string, any> {
    const configuredProvider = localStorage.getItem('ai-api-provider') || 'google';
    const openCodeKey = localStorage.getItem('opencode-api-key');
    const openRouterKey = localStorage.getItem('openrouter-api-key');
    const geminiKey = localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;

    return {
      configuredProvider,
      hasOpenCodeKey: !!openCodeKey,
      hasOpenRouterKey: !!openRouterKey,
      hasGeminiKey: !!geminiKey,
      detectedProvider: this.provider.name,
      configuredModel: this.provider.model,
      hasApiKey: !!this.provider.apiKey,
    };
  }
}

// ==================== INSTÂNCIA SINGLETON ====================

export const aiService = new AIService();
