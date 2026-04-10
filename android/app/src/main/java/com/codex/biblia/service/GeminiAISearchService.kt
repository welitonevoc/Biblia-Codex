package com.codex.biblia.service

import com.google.ai.client.generativeai.GenerativeModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GeminiAISearchService(private val apiKey: String) {
    private val generativeModel = GenerativeModel(
        modelName = "gemini-1.5-flash",
        apiKey = apiKey
    )

    suspend fun search(query: String): String = withContext(Dispatchers.IO) {
        val prompt = "Responda à pergunta: '$query' com base na teologia da Assembleia de Deus clássica, sendo teológico, bíblico e conciso."
        val response = generativeModel.generateContent(prompt)
        response.text ?: "Erro ao consultar IA."
    }
}
