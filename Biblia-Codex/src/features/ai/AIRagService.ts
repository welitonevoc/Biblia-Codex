/**
 * AIRagService.ts - Sistema RAG (Retrieval-Augmented Generation) para Biblia
 * Implementa busca semântica e recuperação de contexto bíblico
 */

import { aiService } from "./AIService";
import { db } from "../../firebase";
import { collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";

// ==================== TIPOS ====================

export interface EmbeddingVector {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    book: string;
    bookNumber: number;
    chapter: number;
    verse: number;
    version: string;
    testament?: 'old' | 'new';
  };
}

export interface SemanticSearchResult {
  verse: string;
  reference: string;
  similarity: number;
  text: string;
}

export interface RAGContext {
  query: string;
  relevantVerses: SemanticSearchResult[];
  dictionaryContext?: string;
  theologicalContext?: string;
}

// ==================== SERVIÇO RAG ====================

export class AIRagService {
  private embeddingCache: Map<string, number[]> = new Map();
  private readonly EMBEDDING_DIMENSION = 768; // Dimensão padrão para embeddings

  /**
   * Gera embedding para um texto usando o provedor configurado
   * Nota: Gemini 2.0+ suporta embeddings nativamente
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Verificar cache
    const cacheKey = `emb:${text.substring(0, 100)}`;
    const cached = this.embeddingCache.get(cacheKey);
    if (cached) return cached;

    try {
      // Usar Gemini para embeddings (se disponível) ou simular
      const embedding = await this.callEmbeddingAPI(text);
      
      // Guardar no cache
      this.embeddingCache.set(cacheKey, embedding);
      
      // Limitar tamanho do cache
      if (this.embeddingCache.size > 1000) {
        const firstKey = this.embeddingCache.keys().next().value;
        this.embeddingCache.delete(firstKey);
      }

      return embedding;
    } catch (error) {
      console.error('[AIRagService] Erro ao gerar embedding:', error);
      // Fallback: retornar vetor aleatório (para desenvolvimento)
      return this.generateFallbackEmbedding(text);
    }
  }

  private async callEmbeddingAPI(text: string): Promise<number[]> {
    const provider = (aiService as any).provider;
    
    // Google Gemini Embeddings
    if (provider?.name === 'google' && provider?.apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${provider.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: { parts: [{ text }] },
            }),
          }
        );

        const data = await response.json();
        if (data.embedding?.values) {
          return data.embedding.values;
        }
      } catch (e) {
        console.warn('[AIRagService] Falha no embedding Gemini:', e);
      }
    }

    // OpenRouter (pode não suportar embeddings diretamente)
    // Por enquanto, usar TF-IDF simplificado como fallback
    
    throw new Error('Embedding API não disponível');
  }

  /**
   * Gera embedding de fallback baseado em TF-IDF simplificado
   * Útil para desenvolvimento e quando APIs não estão disponíveis
   */
  private generateFallbackEmbedding(text: string): number[] {
    const vector = new Array(this.EMBEDDING_DIMENSION).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = hash % this.EMBEDDING_DIMENSION;
      vector[position] = (vector[position] || 0) + 1;
    });

    // Normalizar
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }

    return vector;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calcula similaridade de cosseno entre dois vetores
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Busca semântica em versículos
   * Em produção, isso seria feito com um banco vetorial (Pinecone, Weaviate, etc.)
   * Para o app local, usamos busca em memória ou IndexedDB
   */
  async semanticSearch(
    query: string,
    verses: { reference: string; text: string; metadata: any }[],
    topK: number = 5
  ): Promise<SemanticSearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const results: SemanticSearchResult[] = [];

    for (const verse of verses) {
      const verseEmbedding = await this.generateEmbedding(verse.text);
      const similarity = this.cosineSimilarity(queryEmbedding, verseEmbedding);

      results.push({
        verse: verse.reference,
        reference: verse.reference,
        similarity,
        text: verse.text,
      });
    }

    // Ordenar por similaridade e retornar top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Recupera contexto para RAG baseado em uma query
   */
  async retrieveContext(
    query: string,
    options?: {
      maxVerses?: number;
      books?: string[];
      testament?: 'old' | 'new';
    }
  ): Promise<RAGContext> {
    const { maxVerses = 10, books, testament } = options || {};

    // Buscar versículos relevantes (em produção, viria do banco de dados)
    // Por enquanto, vamos simular buscando em textos conhecidos
    const relevantVerses = await this.searchRelevantVerses(query, maxVerses, books, testament);

    // Buscar contexto teológico adicional
    const theologicalContext = await this.getTheologicalContext(query);

    return {
      query,
      relevantVerses,
      theologicalContext,
    };
  }

  private async searchRelevantVerses(
    query: string,
    maxVerses: number,
    books?: string[],
    testament?: 'old' | 'new'
  ): Promise<SemanticSearchResult[]> {
    // Esta função seria implementada com acesso ao banco de dados real
    // Por enquanto, retornamos resultados simulados
    
    // Em implementação real:
    // 1. Gerar embedding da query
    // 2. Buscar no banco vetorial os versículos mais similares
    // 3. Filtrar por livros/testamento se especificado
    // 4. Retornar top N resultados

    return [];
  }

  private async getTheologicalContext(query: string): Promise<string> {
    // Buscar contexto teológico baseado em palavras-chave na query
    const theologicalKeywords = [
      'salvação', 'graça', 'fé', 'amor', 'esperança', 'justificação',
      'santificação', 'batismo', 'espírito santo', 'eucaristia', 'pecado',
    ];

    const queryLower = query.toLowerCase();
    const matchedKeywords = theologicalKeywords.filter(kw => 
      queryLower.includes(kw)
    );

    if (matchedKeywords.length === 0) return '';

    // Buscar explicações teológicas para as palavras-chaves
    // Em produção, viria de um banco de dados teológico
    return `Contexto teológico relacionado a: ${matchedKeywords.join(', ')}`;
  }

  /**
   * Gera resposta usando RAG (Retrieve + Generate)
   */
  async generateRAGResponse(
    query: string,
    context: RAGContext,
    profile?: 'assembleiano' | 'reformado' | 'catolico'
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    // Construir prompt enriquecido com contexto recuperado
    const ragPrompt = `
CONSULTA DO USUÁRIO: ${query}

CONTEXTO BÍBLICO RECUPERADO:
${context.relevantVerses.map(v => `${v.reference}: ${v.text}`).join('\n')}

${context.theologicalContext ? `CONTEXTO TEOLÓGICO:\n${context.theologicalContext}\n` : ''}

TAREFA: Responda à consulta do usuário usando APENAS o contexto fornecido.
Cite os versículos relevantes. Se o contexto não for suficiente, diga que não há informações suficientes.
Baseie-se no perfil teológico configurado.

Responda em Markdown.
`;

    return await aiService.callAI(ragPrompt, {
      systemInstruction: `Você é um assistente de estudo bíblico especializado em fornecer respostas baseadas em textos bíblicos específicos.`,
      theologicalProfile: profile,
    });
  }

  /**
   * Indexa versículos para busca semântica (preparação)
   */
  async indexVersesForSearch(
    verses: { reference: string; text: string; metadata: any }[]
  ): Promise<void> {
    console.log(`[AIRagService] Indexando ${verses.length} versículos...`);
    
    // Em produção, salvar embeddings em banco vetorial
    // Para o app, podemos usar IndexedDB para cache local
    
    const batchSize = 50;
    for (let i = 0; i < verses.length; i += batchSize) {
      const batch = verses.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (verse) => {
          const embedding = await this.generateEmbedding(verse.text);
          // Salvar no cache/local
          this.embeddingCache.set(verse.reference, embedding);
        })
      );

      console.log(`[AIRagService] Indexados ${Math.min(i + batchSize, verses.length)} de ${verses.length}`);
    }
  }
}

// ==================== INSTÂNCIA ====================

export const aiRagService = new AIRagService();
