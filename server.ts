import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

  // Cross-references API using Gemini
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

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const xrefs = JSON.parse(response.text || "[]");
      res.json(xrefs);
    } catch (error) {
      console.error("Erro ao buscar referências cruzadas:", error);
      res.status(500).json({ error: "Falha ao buscar referências cruzadas" });
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
