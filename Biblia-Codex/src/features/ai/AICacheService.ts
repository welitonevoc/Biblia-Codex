/**
 * AICacheService.ts - Cache inteligente para respostas da IA usando Dexie.js
 * Implementa cache multi-camada com IndexedDB
 */

import Dexie, { Table } from 'dexie';
import { db } from '../../data/local/schema'; // Reutilizar banco existente

// ==================== TIPOS ====================

export interface AICacheEntry {
  id?: number;
  cacheKey: string;
  prompt: string;
  response: string;
  provider: string;
  model: string;
  theologicalProfile?: string;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  tokenCount?: number;
  expiresAt?: number; // Para cache com expiração
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number; // Em bytes (estimado)
  hitRate: number;
  mostAccessed: AICacheEntry[];
  oldestEntry?: AICacheEntry;
  newestEntry?: AICacheEntry;
}

// ==================== SERVIÇO DE CACHE ====================

export class AICacheService {
  private readonly MAX_CACHE_SIZE = 1000; // Máximo de entradas
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private readonly MAX_RESPONSE_LENGTH = 50000; // 50KB por resposta

  /**
   * Busca no cache
   */
  async get(cacheKey: string): Promise<string | null> {
    try {
      const entry = await db.aiCache
        .where('cacheKey')
        .equals(cacheKey)
        .first();

      if (!entry) return null;

      // Verificar expiração
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.delete(entry.cacheKey);
        return null;
      }

      // Atualizar estatísticas de acesso
      await db.aiCache.update(entry.id!, {
        lastAccessed: Date.now(),
        accessCount: (entry.accessCount || 0) + 1,
      });

      return entry.response;
    } catch (error) {
      console.error('[AICacheService] Erro ao buscar cache:', error);
      return null;
    }
  }

  /**
   * Salva no cache
   */
  async set(
    cacheKey: string,
    prompt: string,
    response: string,
    metadata?: {
      provider?: string;
      model?: string;
      theologicalProfile?: string;
      ttl?: number; // Time to live em ms
    }
  ): Promise<void> {
    try {
      // Verificar tamanho da resposta
      const trimmedResponse = response.length > this.MAX_RESPONSE_LENGTH
        ? response.substring(0, this.MAX_RESPONSE_LENGTH) + '...[truncado]'
        : response;

      const entry: AICacheEntry = {
        cacheKey,
        prompt: prompt.substring(0, 500), // Limitar tamanho do prompt armazenado
        response: trimmedResponse,
        provider: metadata?.provider || 'unknown',
        model: metadata?.model || 'unknown',
        theologicalProfile: metadata?.theologicalProfile,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        expiresAt: metadata?.ttl ? Date.now() + metadata.ttl : Date.now() + this.DEFAULT_TTL,
      };

      // Verificar se já existe (update) ou inserir novo
      const existing = await db.aiCache
        .where('cacheKey')
        .equals(cacheKey)
        .first();

      if (existing) {
        await db.aiCache.update(existing.id!, entry);
      } else {
        await db.aiCache.add(entry);
      }

      // Limpar cache se exceder tamanho máximo
      await this.enforceCacheLimit();
    } catch (error) {
      console.error('[AICacheService] Erro ao salvar cache:', error);
    }
  }

  /**
   * Deleta uma entrada específica
   */
  async delete(cacheKey: string): Promise<void> {
    try {
      await db.aiCache
        .where('cacheKey')
        .equals(cacheKey)
        .delete();
    } catch (error) {
      console.error('[AICacheService] Erro ao deletar cache:', error);
    }
  }

  /**
   * Busca por termo (busca parcial na chave)
   */
  async searchByKey(searchTerm: string): Promise<AICacheEntry[]> {
    try {
      const allEntries = await db.aiCache.toArray();
      return allEntries.filter(entry =>
        entry.cacheKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('[AICacheService] Erro na busca:', error);
      return [];
    }
  }

  /**
   * Busca por perfil teológico
   */
  async getByProfile(profile: string): Promise<AICacheEntry[]> {
    try {
      return await db.aiCache
        .where('theologicalProfile')
        .equals(profile)
        .toArray();
    } catch (error) {
      console.error('[AICacheService] Erro ao buscar por perfil:', error);
      return [];
    }
  }

  /**
   * Limpa entradas expiradas
   */
  async cleanExpired(): Promise<number> {
    try {
      const now = Date.now();
      const expired = await db.aiCache
        .where('expiresAt')
        .below(now)
        .toArray();

      const count = expired.length;
      
      for (const entry of expired) {
        await db.aiCache.delete(entry.id!);
      }

      console.log(`[AICacheService] ${count} entradas expiradas removidas`);
      return count;
    } catch (error) {
      console.error('[AICacheService] Erro ao limpar expirados:', error);
      return 0;
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearAll(): Promise<void> {
    try {
      await db.aiCache.clear();
      console.log('[AICacheService] Cache completamente limpo');
    } catch (error) {
      console.error('[AICacheService] Erro ao limpar cache:', error);
    }
  }

  /**
   * Estatísticas do cache
   */
  async getStats(): Promise<CacheStats> {
    try {
      const allEntries = await db.aiCache.toArray();
      const totalEntries = allEntries.length;

      // Calcular tamanho estimado
      const totalSize = allEntries.reduce((sum, entry) => {
        return sum + (entry.cacheKey?.length || 0) + (entry.response?.length || 0);
      }, 0);

      // Mais acessados
      const mostAccessed = [...allEntries]
        .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
        .slice(0, 10);

      // Mais antigo e mais recente
      const sortedByTime = [...allEntries].sort((a, b) => a.timestamp - b.timestamp);
      const oldestEntry = sortedByTime[0];
      const newestEntry = sortedByTime[sortedByTime.length - 1];

      return {
        totalEntries,
        totalSize,
        hitRate: 0, // Implementar tracking de hit rate se necessário
        mostAccessed,
        oldestEntry,
        newestEntry,
      };
    } catch (error) {
      console.error('[AICacheService] Erro ao obter estatísticas:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        mostAccessed: [],
      };
    }
  }

  /**
   * Força limite de tamanho do cache (remove os menos acessados)
   */
  private async enforceCacheLimit(): Promise<void> {
    try {
      const count = await db.aiCache.count();
      
      if (count <= this.MAX_CACHE_SIZE) return;

      // Remover entradas mais antigas e menos acessadas
      const entries = await db.aiCache.toArray();
      const sorted = entries.sort((a, b) => {
        // Priorizar por accessCount, depois por lastAccessed
        if (a.accessCount !== b.accessCount) {
          return (a.accessCount || 0) - (b.accessCount || 0);
        }
        return (a.lastAccessed || 0) - (b.lastAccessed || 0);
      });

      const toDelete = sorted.slice(0, count - this.MAX_CACHE_SIZE);
      
      for (const entry of toDelete) {
        await db.aiCache.delete(entry.id!);
      }

      console.log(`[AICacheService] ${toDelete.length} entradas removidas para manter limite`);
    } catch (error) {
      console.error('[AICacheService] Erro ao forçar limite:', error);
    }
  }

  /**
   * Pré-aquece o cache com perguntas comuns
   */
  async preloadCommonQueries(): Promise<void> {
    const commonQueries = [
      { key: 'term:amor', prompt: 'Explique o termo bíblico: amor' },
      { key: 'term:graça', prompt: 'Explique o termo bíblico: graça' },
      { key: 'term:salvação', prompt: 'Explique o termo bíblico: salvação' },
    ];

    console.log('[AICacheService] Pré-carregando consultas comuns...');
    
    // Em produção, buscar respostas da IA e salvar no cache
    // Por enquanto, apenas log
    for (const query of commonQueries) {
      const exists = await this.get(query.key);
      if (!exists) {
        console.log(`[AICacheService] Cache não encontrado para: ${query.key}`);
      }
    }
  }
}

// ==================== EXTENSÃO DO SCHEMA DO BANCO ====================

// Adicionar ao schema.ts existente:
export interface AICacheDB extends Dexie {
  aiCache: Table<AICacheEntry, number>;
}

// ==================== INSTÂNCIA ====================

export const aiCacheService = new AICacheService();
