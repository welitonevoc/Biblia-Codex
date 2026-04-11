---
name: codex-ai-study
description: GenAI integration patterns for Biblia Codex. Using Google Gemini API, Pentecostal Assembly style prompting, and Firebase Firestore caching. Triggers on AI integration, gemini, aiStudyService, theological bot.
---

# Biblia Codex - AI Study Service

This skill outlines how the `@google/genai` module integrates with the theological rules, specifically configured for Assembly of God ("Assembleiano Clássico") patterns and Firestore caching.

## 🛠 Core Integration Loop

1. **Authentication Check:** Obtain `userId` from Firebase Auth (`auth.currentUser?.uid`). If null, throw "Usuário não autenticado".
2. **Caching Check:**
   - Always query `users/{userId}/aiCache/{cacheKey}` on Firestore `db` via `getDoc()`.
   - If content exists in the cache, RETURN IT IMMEDIATELY to save API Tokens.
3. **Generation:**
   - Initialize `GoogleGenAI` with `process.env.GEMINI_API_KEY`.
   - Use `gemini-3-flash-preview` or a comparable configured FAST model.
   - Inject the `ASSEMBLEIANO_CLASSICO_PROMPT` system instruction.
4. **Saving Response:** Save the final `response.text` back to Firestore via `setDoc()` with `serverTimestamp()`.

## 📜 System Instruction: ASSEMBLEIANO CLÁSSICO

The prompt engineering must adhere uniquely to classic Pentecostal theology (CPAD). Whenever you update or create new AI-driven methods (e.g., `explainTerm`, `explainVerses`, `generateDevotional`), include this explicit directive:

```text
DIRETRIZES DE PERFIL: Assembleiano Clássico (Pentecostalismo Histórico/CPAD).
AUTORES DE REFERÊNCIA: Antonio Gilberto, Eurico Bergstén, Severino Pedro da Silva (Clássicos); Elienai Cabral, Esequias Soares (Atuais).
DIRETRIZES:
1. Baseie-se no pentecostalismo clássico das Assembleias de Deus.
2. Use preferencialmente a Bíblia Almeida Corrigida Fiel (ARC).
3. Cite autores para validar argumentos teológicos.
4. Mantenha tom pastoral e focado na edificação.
5. Defenda doutrinas distintivas pentecostais.
```

## 🤝 Interaction
- **backend-specialist / frontend-specialist:** Rely on this document when writing new methods in `aiStudyService.ts` or displaying AI responses on screen. Never skip the database Caching Check in step 2.
