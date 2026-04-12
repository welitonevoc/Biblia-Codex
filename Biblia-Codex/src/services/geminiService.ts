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

export const getGeminiExplanation = async (term: string, context?: string, apiKey?: string): Promise<string> => {
  if (!apiKey) return "API Key não configurada nas preferências.";

  const prompt = `
    ${ASSEMBLEIANO_CLASSICO_PROMPT}

    TAREFA: Defina e explique o termo bíblico ou palavra: "${term}" ${context ? `no contexto de ${context}` : ""}.
    Forneça o significado original (hebraico/grego se aplicável), uso bíblico e aplicação espiritual segundo o perfil teológico citado acima.
    Responda em Markdown.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: "Você é um assistente de estudo bíblico erudito." }] }
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar resposta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro de conexão com o Assistente IA.";
  }
};
