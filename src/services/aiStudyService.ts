import { GoogleGenAI } from "@google/genai";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const ASSEMBLEIANO_CLASSICO_PROMPT = `
    DIRETRIZES DE PERFIL: Assembleiano Clássico (Pentecostalismo Histórico/CPAD).

    AUTORES DE REFERÊNCIA:
    - Clássicos: Antonio Gilberto, Eurico Bergstén, Severino Pedro da Silva
    - Atuais: Elienai Cabral, Esequias Soares, Elinaldo Renovato
    
    DIRETRIZES:
    1. Baseie-se no pentecostalismo clássico das Assembleias de Deus
    2. Use preferencialmente a Bíblia Almeida Corrigida Fiel (ARC)
    3. Cite autores para validar argumentos teológicos
    4. Mantenha tom pastoral e focado na edificação
    5. Defenda doutrinas distintivas pentecostais
`;

export class AIStudyService {
  async explainTerm(term: string): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuário não autenticado");

    const cacheKey = `term:${term}`;
    const cached = await this.getCachedExplanation(userId, cacheKey);
    if (cached) return cached;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explique o termo teológico ou número Strong: "${term}".`,
        config: {
          systemInstruction: ASSEMBLEIANO_CLASSICO_PROMPT,
        },
      });

      const explanation = response.text;
      if (!explanation) {
        throw new Error("A IA não retornou uma resposta válida.");
      }
      
      await this.saveToCache(userId, cacheKey, explanation);
      return explanation;
    } catch (error) {
      console.error("Erro na API Gemini:", error);
      throw error;
    }
  }

  async explainVerses(reference: string, text: string): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuário não autenticado");

    const cacheKey = `verse:${reference}`;
    const cached = await this.getCachedExplanation(userId, cacheKey);
    if (cached) return cached;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Comente e explique os seguintes versículos (${reference}): "${text}"`,
      config: {
        systemInstruction: ASSEMBLEIANO_CLASSICO_PROMPT,
      },
    });

    const explanation = response.text || "Não foi possível gerar uma explicação.";
    
    await this.saveToCache(userId, cacheKey, explanation);
    return explanation;
  }

  private async getCachedExplanation(userId: string, key: string): Promise<string | null> {
    try {
      const cacheRef = doc(db, "users", userId, "aiCache", key);
      const snap = await getDoc(cacheRef);
      if (snap.exists()) {
        return snap.data().content;
      }
    } catch (error) {
      console.error("Erro ao buscar cache da IA:", error);
    }
    return null;
  }

  private async saveToCache(userId: string, key: string, content: string): Promise<void> {
    try {
      const cacheRef = doc(db, "users", userId, "aiCache", key);
      await setDoc(cacheRef, {
        content,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao salvar cache da IA:", error);
    }
  }
}

export const aiStudyService = new AIStudyService();
