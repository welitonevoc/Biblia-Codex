/**
 * AIAgents.ts - Agentes IA especializados para estudo bíblico
 * Implementa múltiplos agentes com diferentes especialidades
 */

import { aiService } from "./AIService";
import { aiRagService } from "./AIRagService";

// ==================== TIPOS ====================

export type AgentType = 
  | 'theologian'     // Teólogo - foco em doutrina
  | 'historian'      // Historiador - foco em contexto histórico
  | 'devotional'     // Devocional - foco em aplicação pessoal
  | 'apologist'      // Apologista - defesa da fé
  | 'preacher'       // Pregador - foco em exposição
  | 'counselor';     // Conselheiro - foco em aconselhamento bíblico

export interface AgentResponse {
  agentType: AgentType;
  content: string;
  confidence: number; // 0-1
  sources?: string[];
}

export interface MultiAgentResponse {
  query: string;
  responses: AgentResponse[];
  synthesis?: string; // Síntese final
}

// ==================== PROMPTS BASE ====================

const AGENT_PROMPTS = {
  theologian: {
    role: "Você é um Teólogo Sistemático experiente, especializado em doutrina bíblica.",
    instructions: `
INSTRUÇÕES:
1. Analise textos sob a ótica da teologia sistemática
2. Identifique doutrinas presentes no texto
3. Relacione com outras passagens bíblicas (analogia da fé)
4. Explique termos teológicos complexos
5. Mantenha fidelidade ao texto original (hebraico/grego)
6. Use linguagem acadêmica, mas acessível

FORMATO DE RESPOSTA (Markdown):
- **Doutrina(s) Principal(is)**
- **Explicação Teológica**
- **Passagens Relacionadas**
- **Aplicação Doutrinária**
`,
  },

  historian: {
    role: "Você é um Historiador Bíblico, especializado no contexto do Antigo e Novo Testamento.",
    instructions: `
INSTRUÇÕES:
1. Forneça contexto histórico-cultural do período
2. Explique costumes, geografia e política da época
3. Identifique referências a lugares, pessoas e eventos históricos
4. Explique como o contexto influencia a interpretação
5. Use descobertas arqueológicas quando relevante
6. Situe o texto na linha do tempo bíblica

FORMATO DE RESPOSTA (Markdown):
- **Contexto Histórico**
- **Geografia e Cultura**
- **Eventos Contemporâneos**
- **Achados Arqueológicos (se houver)**
- **Impacto na Interpretação**
`,
  },

  devotional: {
    role: "Você é um Assistente de Devoção Espiritual, focado na aplicação prática da Palavra.",
    instructions: `
INSTRUÇÕES:
1. Foque na aplicação pessoal e espiritual
2. Use linguagem acolhedora e edificante
3. Traga reflexões para o dia a dia
4. Inclua sugestões de oração
5. Mantenha tom pastoral e encorajador
6. Evite jargões teológicos complexos

FORMATO DE RESPOSTA (Markdown):
- **Reflexão Espiritual**
- **Aplicação Prática**
- **Sugestão de Oração**
- **Pensamento do Dia**
- **Desafio de Vida**
`,
  },

  apologist: {
    role: "Você é um Apologista Cristão, especializado em defesa da fé e resposta a desafios.",
    instructions: `
INSTRUÇÕES:
1. Identifique possíveis desafios ou dúvidas comuns sobre o texto
2. Apresente evidências bíblicas e históricas
3. Responda objetivamente a objeções
4. Use lógica e razoínio sólidos
5. Cite evidências externas quando apropriado
6. Mantenha tom respeitoso mas firme na verdade bíblica

FORMATO DE RESPOSTA (Markdown):
- **Possíveis Objeções/Desafios**
- **Evidências Bíblicas**
- **Argumentos Lógicos**
- **Evidências Históricas/Externas**
- **Conclusão Apologética**
`,
  },

  preacher: {
    role: "Você é um Pregador Expositivo, especializado em preparação de sermões bíblicos.",
    instructions: `
INSTRUÇÕES:
1. Faça análise expositiva do texto (versículo por versículo se necessário)
2. Identifique o tema central e pontos principais
3. Sugira ilustrações para cada ponto
4. Forneça aplicações para diferentes públicos
5. Estruture como um esboço de sermão
6. Inclua chamada para decisão/compromisso

FORMATO DE RESPOSTA (Markdown):
- **Tema Central**
- **Texto Base**
- **Pontos Principais** (com subpontos e ilustrações)
- **Aplicações**
- **Ilustrações Sugeridas**
- **Conclusão/Chamada**
`,
  },

  counselor: {
    role: "Você é um Conselheiro Bíblico, especializado em aconselhamento cristão baseado nas Escrituras.",
    instructions: `
INSTRUÇÕES:
1. Aborde o texto sob a ótica de aconselhamento
2. Identifique princípios para relacionamentos, emoções, decisões
3. Ofereça sabedoria bíblica para situações da vida
4. Use tom compassivo e compreensivo
5. Foque em cura emocional e crescimento espiritual
6. Cite passagens adicionais para encorajamento

FORMATO DE RESPOSTA (Markdown):
- **Princípios Bíblicos Identificados**
- **Aplicação para Situações de Vida**
- **Orientação para Relacionamentos**
- **Cura Emocional/Esperança**
- **Sugestões Práticas**
- **Versículos de Encorajamento**
`,
  },
};

// ==================== CLASSE DE AGENTES ====================

export class AIAgents {
  /**
   * Consulta um agente específico
   */
  async queryAgent(
    agentType: AgentType,
    query: string,
    context?: { verses?: string; book?: string; chapter?: number }
  ): Promise<AgentResponse> {
    const agent = AGENT_PROMPTS[agentType];
    
    const prompt = `
${context?.verses ? `VERSÍCULOS:\n${context.verses}\n\n` : ''}
${context?.book ? `LIVRO: ${context.book}` : ''}
${context?.chapter ? `CAPÍTULO: ${context.chapter}` : ''}

CONSULTA: ${query}
`;

    const systemInstruction = `
${agent.role}

${agent.instructions}
`;

    const response = await aiService.callAI(prompt, {
      systemInstruction,
      temperature: 0.7,
    });

    return {
      agentType,
      content: response.success ? response.content || '' : `Erro: ${response.error}`,
      confidence: response.success ? 0.85 : 0,
    };
  }

  /**
   * Consulta múltiplos agentes e sintetiza respostas
   */
  async queryMultipleAgents(
    query: string,
    agentTypes: AgentType[],
    context?: { verses?: string; book?: string; chapter?: number }
  ): Promise<MultiAgentResponse> {
    const responses: AgentResponse[] = [];

    // Consultar cada agente
    for (const agentType of agentTypes) {
      const response = await this.queryAgent(agentType, query, context);
      responses.push(response);
    }

    // Sintetizar respostas (usar RAG se disponível)
    let synthesis: string | undefined;
    try {
      synthesis = await this.synthesizeResponses(query, responses);
    } catch (error) {
      console.error('[AIAgents] Erro na sintese:', error);
    }

    return {
      query,
      responses,
      synthesis,
    };
  }

  /**
   * Sintetiza múltiplas respostas em uma visão unificada
   */
  private async synthesizeResponses(
    query: string,
    responses: AgentResponse[]
  ): Promise<string> {
    const responsesText = responses
      .map(r => `=== ${r.agentType.toUpperCase()} ===\n${r.content}`)
      .join('\n\n');

    const prompt = `
SINTESE DE MÚLTIPLAS PERSPECTIVAS

CONSULTA ORIGINAL: ${query}

RESPOSTAS DOS AGENTES:
${responsesText}

TAREFA: Crie uma síntese unificada que combine as melhores perspectivas de cada agente.
Organize por:
1. **Pontos de Consenso** (onde os agentes concordam)
2. **Perspectivas Complementares** (visões únicas de cada agente)
3. **Aplicação Integrada** (como tudo se aplica junto)
4. **Resumo Prático** (takeaways principais)

Responda em Markdown.
`;

    const response = await aiService.callAI(prompt, {
      systemInstruction: 'Você é um síntese especializado em integrar múltiplas perspectivas teológicas de forma coerente e equilibrada.',
      temperature: 0.5,
    });

    return response.success ? response.content || '' : 'Não foi possível gerar síntese.';
  }

  /**
   * Análise comparativa entre traduções (especialidade do agente theologian)
   */
  async compareTranslations(
    verseRef: string,
    translations: { version: string; text: string }[]
  ): Promise<AgentResponse> {
    return await this.queryAgent('theologian', `Compare as traduções de ${verseRef}`, {
      verses: translations.map(t => `${t.version}: ${t.text}`).join('\n'),
    });
  }

  /**
   * Estudo profundo de um tema bíblico usando múltiplos agentes
   */
  async deepBibleStudy(
    topic: string,
    verses?: string
  ): Promise<MultiAgentResponse> {
    const agents: AgentType[] = ['theologian', 'historian', 'devotional'];
    
    return await this.queryMultipleAgents(
      `Faça um estudo profundo sobre: ${topic}`,
      agents,
      { verses }
    );
  }

  /**
   * Preparação de sermão assistida por IA
   */
  async prepareSermon(
    passage: string,
    verses: string
  ): Promise<MultiAgentResponse> {
    return await this.queryMultipleAgents(
      `Prepare um esboço de sermão expositivo para: ${passage}`,
      ['preacher', 'theologian', 'historian'],
      { verses }
    );
  }

  /**
   * Aconselhamento bíblico para situações específicas
   */
  async biblicalCounseling(
    situation: string,
    relevantVerses?: string
  ): Promise<MultiAgentResponse> {
    return await this.queryMultipleAgents(
      `Forneça aconselhamento bíblico para: ${situation}`,
      ['counselor', 'devotional', 'theologian'],
      { verses: relevantVerses }
    );
  }

  /**
   * Apologética: responder desafios à fé
   */
  async apologeticResponse(
    challenge: string,
    relevantVerses?: string
  ): Promise<MultiAgentResponse> {
    return await this.queryMultipleAgents(
      `Responda apologeticamente ao desafio: ${challenge}`,
      ['apologist', 'theologian'],
      { verses: relevantVerses }
    );
  }
}

// ==================== INSTÂNCIA ====================

export const aiAgents = new AIAgents();
