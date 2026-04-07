package com.kerygma.biblia.service

import com.kerygma.biblia.data.AIStudyCacheDao
import com.kerygma.biblia.data.AIStudyCache
import com.kerygma.biblia.data.DictionaryEntryDao
import java.util.UUID

class DictionaryService(
    private val aiSearchService: GeminiAISearchService,
    private val aiCacheDao: AIStudyCacheDao,
    private val dictionaryEntryDao: DictionaryEntryDao
) {
    suspend fun getDefinition(query: String, useAI: Boolean): String {
        // 1. Try Local Dictionary first (Static entries)
        val localEntry = dictionaryEntryDao.findByTitle(query)
        if (localEntry != null) return localEntry.definition

        // 2. Try AI Cache
        val cached = aiCacheDao.getByQuery(query)
        if (cached != null) return cached.explanation

        // 3. If not in cache and AI is requested
        if (!useAI) {
            return "Termo não encontrado no dicionário local."
        }

        // 4. Call AI
        return try {
            val response = aiSearchService.search(query)
            
            // Cache response (pruning if > 100)
            if (aiCacheDao.getCount() >= 100) {
                val oldest = aiCacheDao.getOldest()
                if (oldest != null) aiCacheDao.deleteById(oldest.id)
            }

            aiCacheDao.insert(AIStudyCache(UUID.randomUUID().toString(), query, response, System.currentTimeMillis()))
            response
        } catch (e: Exception) {
            "Erro ao consultar a IA: ${e.localizedMessage ?: "Tente novamente mais tarde."}"
        }
    }
}
