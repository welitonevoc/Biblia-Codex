import { Verse, BibleModule, DictionaryEntry } from './types';
import { BIBLE_BOOKS } from './data/bibleMetadata';
import { GoogleGenAI } from "@google/genai";
import { readModuleBinary } from './services/moduleService';
import { BookNumberConverter } from './services/BookNumberConverter';
import initSqlJs from 'sql.js';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const isWeb = typeof window !== 'undefined' && !(window as any).Capacitor?.isNativePlatform?.();

// Performance Cache for Premium Experience
let sqlInstance: any = null;
const dbCache = new Map<string, { db: any; schema: { table: string; bookCol: string; chapterCol: string; verseCol: string; textCol: string } }>();

const getSqlInstance = async () => {
  if (!sqlInstance) {
    sqlInstance = await initSqlJs({
      locateFile: () => `/sql-wasm.wasm`
    });
  }
  return sqlInstance;
};

const detectSchema = (db: any) => {
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tableNames = tables[0]?.values.map((v: any) => v[0].toLowerCase()) || [];

  const table = tableNames.includes('bible') ? 'bible' : tableNames.includes('verses') ? 'verses' : null;
  if (!table) return null;

  const pragma = db.exec(`PRAGMA table_info("${table}")`);
  const cols = pragma[0]?.values.map((v: any) => v[1].toLowerCase()) || [];

  return {
    table,
    bookCol: cols.find(c => ['book', 'book_number', 'book_id', 'b'].includes(c)) || 'book',
    chapterCol: cols.find(c => ['chapter', 'c'].includes(c)) || 'chapter',
    verseCol: cols.find(c => ['verse', 'v'].includes(c)) || 'verse',
    textCol: cols.find(c => ['scripture', 'text', 't'].includes(c)) || 'text',
    isMyBible: db.exec(`SELECT COUNT(*) FROM ${table} WHERE ${cols.find(c => ['book', 'book_number', 'book_id', 'b'].includes(c)) || 'book'} > 66`)[0]?.values[0][0] > 0
  };
};

const readModuleBinaryFromPublic = async (modulePath: string): Promise<Uint8Array> => {
  const fileName = modulePath.split('/').pop() || modulePath;
  const response = await fetch(`/${fileName}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} ao buscar ${fileName}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

// Reusable loader to ensure cache hit and low latency
const getDbInstance = async (version: BibleModule) => {
  const cacheKey = version.path;
  let cached = dbCache.get(cacheKey);

  if (!cached) {
    const SQL = await getSqlInstance();
    let binaryData: Uint8Array;
    if (isWeb) {
      binaryData = await readModuleBinaryFromPublic(version.path);
    } else {
      binaryData = await readModuleBinary(version.path);
    }
    const db = new SQL.Database(binaryData);
    const schema = detectSchema(db);
    if (!schema) throw new Error("Schema não suportado");
    
    cached = { db, schema: schema as any };
    dbCache.set(cacheKey, cached);
  }
  return cached;
};

export const BibleService = {
  getVerses: async (bookId: string, chapter: number, version?: BibleModule, _settings?: any): Promise<Verse[]> => {
    if (!version?.path) {
      return Array.from({ length: 20 }, (_, i) => ({ bookId, chapter, verse: i + 1, text: `Texto simulado ${i + 1}`, isChapterHeader: false }));
    }

    try {
      const { db, schema } = await getDbInstance(version);
      const bookMetadata = BIBLE_BOOKS.find(b => b.id === bookId);
      const myBibleBookId = BookNumberConverter.toMyBible(bookMetadata?.numericId || 1);
      const stdBookId = bookMetadata?.numericId || 1;

      // Tenta com os dois tipos de ID (Padrão ou MyBible) de forma eficiente
      const query = `SELECT ${schema.verseCol}, ${schema.textCol} FROM ${schema.table} WHERE ${schema.bookCol} = ? AND ${schema.chapterCol} = ? ORDER BY ${schema.verseCol} ASC`;
      
      let queryRes = db.exec(query, [stdBookId, chapter]);
      if (!queryRes.length || !queryRes[0].values.length) {
        queryRes = db.exec(query, [myBibleBookId, chapter]);
      }

      if (queryRes.length > 0 && queryRes[0].values.length > 0) {
        return queryRes[0].values.map((row: any[]) => {
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
      console.error('Erro ao ler versículos:', error);
    }

    return [];
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
    try {
      const cacheKey = `dict-${modulePath}`;
      let cached = dbCache.get(cacheKey);

      if (!cached) {
        const SQL = await getSqlInstance();
        let binaryData: Uint8Array;
        if (modulePath.startsWith('http') || !modulePath.includes('/')) {
          binaryData = await readModuleBinaryFromPublic(modulePath);
        } else {
          binaryData = await readModuleBinary(modulePath);
        }
        const db = new SQL.Database(binaryData);
        
        // Dicionários MyBible/MySword variam muito. Detectamos as colunas chave.
        const tablesResult = db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);
        const tableNames = (tablesResult[0]?.values ?? []).map((row: any[]) => String(row[0]).toLowerCase());
        const table = ['dictionary', 'dict', 'entries', 'words'].find(t => tableNames.includes(t)) || tableNames[0];

        if (!table) throw new Error("Tabela de dicionário não encontrada");

        const pragma = db.exec(`PRAGMA table_info("${table}")`);
        const cols = pragma[0]?.values.map((v: any) => v[1].toLowerCase()) || [];
        
        const schema = {
          table,
          bookCol: cols.find(c => ['word', 'topic', 'key', 'entry', 'lexeme'].includes(c)) || 'word',
          textCol: cols.find(c => ['data', 'definition', 'content', 'text', 'body'].includes(c)) || 'data',
          chapterCol: '', verseCol: '', verseCol_strong: '' // unused for dict
        };

        cached = { db, schema: schema as any };
        dbCache.set(cacheKey, cached);
      }

      const { db, schema } = cached;
      const cleanWord = word.replace(/^[HG]/i, '');
      const query = `SELECT "${schema.textCol}" FROM "${schema.table}" WHERE "${schema.bookCol}" = ? OR "${schema.bookCol}" = ? LIMIT 1`;
      const result = db.exec(query, [word, cleanWord]);

      if (result.length > 0 && result[0].values.length > 0) {
        return {
          id: `local-${word}`,
          term: word,
          definition: result[0].values[0][0] as string,
          moduleName: modulePath.split('/').pop() || 'Dicionário',
          source: 'local',
          isAiGenerated: false
        };
      }
    } catch (error) {
      console.error('Erro ao buscar no dicionário:', error);
    }
    return null;
  },

  getDictionary: async (word: string): Promise<string> => {
    // Mock para compatibilidade legada se necessário
    return `Definição simulada para ${word}`;
  },

  getCrossReferences: async (bookId: string, chapter: number, verse: number, model = 'gemini-2.0-flash'): Promise<any[]> => {
    const validIds = ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOE','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'];
    const prompt = `Encontre 10 referências cruzadas para ${bookId} ${chapter}:${verse}. JSON: [{"bookId":"GEN","chapter":1,"verse":1,"text":"...","reason":"..."}]`;
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });
      const xrefs = JSON.parse(response.text || '[]');
      return xrefs.map((ref: any) => ({ ...ref, bookName: BIBLE_BOOKS.find(b => b.id === ref.bookId)?.name || ref.bookId }));
    } catch (error) { return []; }
  },

  search: async (query: string, version?: BibleModule): Promise<Verse[]> => {
    if (!version?.path || !query || query.length < 2) return [];

    try {
      const { db, schema } = await getDbInstance(version);
      
      const sqlSearch = `%${query}%`;
      const sqlQuery = `SELECT ${schema.bookCol}, ${schema.chapterCol}, ${schema.verseCol}, ${schema.textCol} 
                        FROM ${schema.table} 
                        WHERE ${schema.textCol} LIKE ? 
                        LIMIT 100`;
      
      const result = db.exec(sqlQuery, [sqlSearch]);
      if (result.length > 0) {
        return result[0].values.map((row: any[]) => {
          const bookNum = Number(row[0]);
          let bookMetadata;
          
          // Heurística para detecção de sistema de numeração (MyBible utiliza 10, 20... Standard utiliza 1-66)
          if ((schema as any).isMyBible || bookNum > 66) {
            const stdId = BookNumberConverter.fromMyBible(bookNum);
            bookMetadata = BIBLE_BOOKS.find(b => b.numericId === stdId);
          } else {
            bookMetadata = BIBLE_BOOKS.find(b => b.numericId === bookNum);
          }

          return {
            bookId: bookMetadata?.id || String(bookNum),
            chapter: Number(row[1]),
            verse: Number(row[2]),
            text: row[3] as string,
            isChapterHeader: Number(row[2]) === 0
          };
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    }
    return [];
  },
};
