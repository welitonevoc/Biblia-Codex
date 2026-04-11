import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

console.log('🔧 Variáveis de ambiente carregadas:');
console.log('  OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL);
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('  OPENAI_MODEL:', process.env.OPENAI_MODEL);

const useOllama = process.env.OPENAI_BASE_URL?.includes('ollama') || process.env.OPENAI_API_KEY === 'ollama';

console.log('🤖 Usando Ollama:', useOllama);

let ai: GoogleGenAI | null = null;
if (!useOllama) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
}

async function callAI(prompt: string, model: string): Promise<string> {
  if (useOllama) {
    // Chamar Ollama via endpoint nativo
    const baseUrl = (process.env.OPENAI_BASE_URL || 'http://localhost:11434').replace(/\/v1$/, '');
    const modelName = process.env.OPENAI_MODEL || model;

    console.log(`🤖 Chamando Ollama: ${baseUrl}/api/generate`);
    console.log(`📦 Modelo: ${modelName}`);
    console.log(`📝 Prompt length: ${prompt.length} caracteres`);

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false
      })
    });

    console.log(`📡 Ollama response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ollama error: ${errorText}`);
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Ollama respondeu com ${data.response?.length || 0} caracteres`);
    return data.response || '';
  } else if (ai) {
    // Usar Gemini
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return response.text || '[]';
  }

  throw new Error('Nenhum provedor de IA configurado');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ✅ CORREÇÃO: Servir arquivos da pasta public explicitamente
  app.use(express.static('public', {
    setHeaders: (res, path) => {
      if (path.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
      }
    }
  }));

  // ✅ CORREÇÃO COOP: permite que o popup do Firebase se comunique de volta com o app
  app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });

  // API Route for health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Cross-references API usando IA configurada (Ollama ou Gemini)
  app.get('/api/xrefs/:bookId/:chapter/:verse', async (req, res) => {
    const { bookId, chapter, verse } = req.params;

    try {
      const validIds = [
        'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOE', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
        'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
      ];

      const prompt = `Encontre as 10 referências cruzadas mais importantes para o versículo ${bookId} ${chapter}:${verse}.
      Para cada referência, forneça:
      1. bookId (DEVE ser um destes: ${validIds.join(', ')})
      2. chapter
      3. verse
      4. text (o texto do versículo em Português ARC)
      5. reason (uma breve explicação teológica de por que está relacionado)

      Retorne APENAS um JSON no formato: [{"bookId": "GEN", "chapter": 1, "verse": 1, "text": "...", "reason": "..."}, ...]`;

      const model = process.env.OPENAI_MODEL || "gemini-3-flash-preview";
      const responseText = await callAI(prompt, model);

      // Tenta extrair JSON da resposta (modelos locais podem adicionar texto extra)
      let xrefs;
      try {
        // Primeiro tenta parse direto
        xrefs = JSON.parse(responseText);
      } catch {
        // Se falhar, tenta extrair JSON do texto
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          xrefs = JSON.parse(jsonMatch[0]);
        } else {
          console.error("Resposta da IA não é JSON válido:", responseText);
          throw new Error("Resposta da IA não é JSON válido");
        }
      }

      res.json(xrefs);
    } catch (error) {
      console.error("Erro ao buscar referências cruzadas:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).json({ error: "Falha ao buscar referências cruzadas", details: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
