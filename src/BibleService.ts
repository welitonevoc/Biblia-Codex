import { Verse, BibleModule, DictionaryEntry } from './types';
import { BIBLE_BOOKS } from './data/bibleMetadata';
import { GoogleGenAI } from "@google/genai";
import { readModuleBinary } from './services/moduleService';
import { BookNumberConverter } from './services/BookNumberConverter';
import initSqlJs from 'sql.js';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const isWeb = typeof window !== 'undefined' && !(window as any).Capacitor?.isNativePlatform?.();

const readModuleBinaryFromPublic = async (modulePath: string): Promise<Uint8Array> => {
  const fileName = modulePath.split('/').pop() || modulePath;
  const response = await fetch(`/${fileName}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} ao buscar ${fileName}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

export const BibleService = {
  getVerses: async (bookId: string, chapter: number, version?: BibleModule, _settings?: any): Promise<Verse[]> => {
    if (version?.path) {
      let db: any = null;
      try {
        const bookMetadata = BIBLE_BOOKS.find(b => b.id === bookId);
        const stdBookId = bookMetadata?.numericId || 1;
        const myBibleBookId = BookNumberConverter.toMyBible(stdBookId);

        const SQL = await initSqlJs({
          locateFile: () => `/sql-wasm.wasm`
        });

        let binaryData: Uint8Array;
        if (isWeb) {
          binaryData = await readModuleBinaryFromPublic(version.path);
        } else {
          binaryData = await readModuleBinary(version.path);
        }
        db = new SQL.Database(binaryData);
        let result: any = null;

        const attempts = [
          { q: `SELECT Verse, Scripture FROM Bible WHERE Book = ? AND Chapter = ? ORDER BY Verse ASC`, p: [stdBookId, chapter] },
          { q: `SELECT Verse, Scripture FROM Bible WHERE Book = ? AND Chapter = ? ORDER BY Verse ASC`, p: [myBibleBookId, chapter] },
          { q: `SELECT verse, text FROM verses WHERE book_number = ? AND chapter = ? ORDER BY verse ASC`, p: [myBibleBookId, chapter] },
          { q: `SELECT verse, text FROM verses WHERE book_number = ? AND chapter = ? ORDER BY verse ASC`, p: [stdBookId, chapter] },
          { q: `SELECT verse, text FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC`, p: [myBibleBookId, chapter] },
          { q: `SELECT verse, text FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC`, p: [stdBookId, chapter] },
          { q: `SELECT verse, text FROM bible WHERE book_id = ? AND chapter = ? ORDER BY verse ASC`, p: [myBibleBookId, chapter] },
          { q: `SELECT verse, text FROM bible WHERE book_id = ? AND chapter = ? ORDER BY verse ASC`, p: [stdBookId, chapter] },
          { q: `SELECT v, t FROM verses WHERE b = ? AND c = ? ORDER BY v ASC`, p: [myBibleBookId, chapter] },
          { q: `SELECT verse, text FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC`, p: [bookId, chapter] },
        ];

        for (const attempt of attempts) {
          try {
            const queryRes = db.exec(attempt.q, attempt.p);
            if (queryRes.length > 0 && queryRes[0].values.length > 0) {
              result = queryRes[0];
              break;
            }
          } catch {
            continue;
          }
        }

        if (result) {
          return result.values.map((row: any[]) => {
            const verseNumber = Number(row[0]);
            return {
              bookId,
              chapter,
              verse: verseNumber,
              text: row[1] as string,
              isChapterHeader: verseNumber === 0
            };
          });
        }
      } catch (error) {
        console.error('Erro ao ler módulo SQLite:', error);
      } finally {
        if (db) {
          try { db.close(); } catch {}
        }
      }
    }

    const verses: Verse[] = [];
    for (let i = 1; i <= 20; i++) {
      verses.push({ bookId, chapter, verse: i, text: `Texto simulado ${i}`, isChapterHeader: false });
    }
    return verses;
  },

  getCommentary: async (bookId: string, chapter: number, verse: number, model = 'gemini-2.0-flash'): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model,
        contents: `Para o versículo bíblico ${bookId} ${chapter}:${verse}, forneça um comentário teológico profundo, contexto histórico e aplicação prática. Use um tom erudito, mas acessível. Responda em Português (PT-BR).`,
        config: {
          systemInstruction: 'Você é um estudioso bíblico e teólogo de classe mundial. Seus comentários são perspicazes, equilibrados e profundamente enraizados no contexto histórico e linguístico.',
        },
      });
      return response.text || 'Não foi possível gerar o comentário.';
    } catch (error) {
      console.error('Erro ao buscar comentário:', error);
      return 'Erro ao conectar com o serviço de comentários. Verifique sua conexão.';
    }
  },

  getDictionaryEntry: async (word: string, modulePath: string): Promise<DictionaryEntry | null> => {
    let db: any = null;
    try {
      const SQL = await initSqlJs({
        locateFile: () => `/sql-wasm.wasm`
      });

      let dbBuffer: Uint8Array;
      if (modulePath.startsWith('http') || !modulePath.includes('/')) {
        const response = await fetch(`/${modulePath.split('/').pop()}`);
        const buffer = await response.arrayBuffer();
        dbBuffer = new Uint8Array(buffer);
      } else {
        dbBuffer = await readModuleBinary(modulePath);
      }

      db = new SQL.Database(dbBuffer);
      const cleanWord = word.replace(/^[HG]/i, '');
      const lookupTerms = [word, cleanWord];
      let definition: string | null = null;

      const tablesResult = db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);
      const tableNames = (tablesResult[0]?.values ?? []).map((row: any[]) => String(row[0]));
      const candidateTables = ['dictionary', 'Dictionary', 'dict', 'Dict']
        .filter((tableName, index, all) => tableNames.includes(tableName) && all.indexOf(tableName) === index);

      for (const table of candidateTables) {
        try {
          const pragma = db.exec(`PRAGMA table_info("${table}")`);
          const columns = (pragma[0]?.values ?? []).map((row: any[]) => String(row[1]));
          const keyColumn = ['word', 'topic', 'entry', 'key', 'lexeme'].find(col => columns.includes(col));
          const valueColumn = ['data', 'definition', 'content', 'text', 'body'].find(col => columns.includes(col));

          if (!keyColumn || !valueColumn) {
            continue;
          }

          const query = `SELECT "${valueColumn}" FROM "${table}" WHERE "${keyColumn}" = ? OR "${keyColumn}" = ? LIMIT 1`;
          const result = db.exec(query, lookupTerms);

          if (result.length > 0 && result[0].values.length > 0) {
            definition = result[0].values[0][0] as string;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!definition) {
        return null;
      }

      return {
        id: `local-${word}`,
        term: word,
        definition,
        moduleName: modulePath.split('/').pop() || 'Dicionário',
        source: 'local',
        isAiGenerated: false
      };
    } catch (error) {
      console.error('Erro ao buscar no dicionário:', error);
      return null;
    } finally {
      if (db) {
        try { db.close(); } catch {}
      }
    }
  },

  getDictionary: async (word: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return `<h3 class="mysword-color-blue">Definição de "${word}"</h3>
    <p>Termo bíblico que se refere à proclamação do evangelho e ao ensino das verdades sagradas.</p>
    <p>Veja também: <a href="dGraça">Graça</a>, <a href="dFé">Fé</a>.</p>
    <p>Referência: <a href="b43.3.16">João 3:16</a></p>
    <p>Número Strong: <a href="sG5485">G5485</a></p>`;
  },

  getCrossReferences: async (bookId: string, chapter: number, verse: number, model = 'gemini-2.0-flash'): Promise<any[]> => {
    const validIds = [
      'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI',
      '1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER',
      'LAM','EZK','DAN','HOS','JOE','AMO','OBA','JON','MIC','NAM','HAB','ZEP',
      'HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL',
      'EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE',
      '2PE','1JN','2JN','3JN','JUD','REV',
    ];

    const prompt = `Encontre as 10 referências cruzadas mais importantes para o versículo ${bookId} ${chapter}:${verse}.
Para cada referência, forneça:
1. bookId (DEVE ser um destes: ${validIds.join(', ')})
2. chapter
3. verse
4. text (o texto do versículo em Português ARC)
5. reason (uma breve explicação teológica de por que está relacionado)

Retorne APENAS um array JSON no formato:
[{"bookId":"GEN","chapter":1,"verse":1,"text":"...","reason":"..."}]`;

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const raw = response.text || '[]';
      const xrefs = JSON.parse(raw);

      return xrefs.map((ref: any) => ({
        ...ref,
        bookName: BIBLE_BOOKS.find(b => b.id === ref.bookId)?.name || ref.bookId,
        text: ref.text || `${ref.bookId} ${ref.chapter}:${ref.verse}`,
        reason: ref.reason || 'Referência relacionada por contexto teológico ou linguístico.',
      }));
    } catch (error) {
      console.error('Erro ao buscar referências cruzadas:', error);
      return [];
    }
  },

  search: async (_query: string): Promise<Verse[]> => {
    return [];
  },
};
