import { Verse, BibleModule, DictionaryEntry, Footnote, FootnoteType, CrossReference, PeopleData, PlacesData, SQLiteRow, SQLiteSchema, CachedDB, ParseSettings, ModuleData, StrongsEntry } from './types';
import { storage } from './StorageService';
import { BIBLE_BOOKS } from './data/bibleMetadata';
import { readModuleBinary } from './services/moduleService';
import { BookNumberConverter } from './services/BookNumberConverter';
import { footnoteService } from './services/FootnoteService';
import initSqlJs from 'sql.js';
import { getGeminiExplanation, getAIResponse } from './services/geminiService';
import { LRUCache } from 'lru-cache';

const isWeb = typeof window !== 'undefined' && !(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

// Performance Cache for Premium Experience
let sqlInstance: Awaited<ReturnType<typeof initSqlJs>> | null = null;
const dbCache = new Map<string, CachedDB>();

// LRU Cache for SQL query results (5 min TTL, 100 entries max)
const queryCache = new LRUCache<string, Verse[]>({
  max: 100,
  ttl: 5 * 60 * 1000,
});

export const getSqlInstance = async () => {
  if (!sqlInstance) {
    sqlInstance = await initSqlJs({
      locateFile: () => `/sql-wasm.wasm`
    });
  }
  return sqlInstance;
};

const detectSchema = (db: unknown): SQLiteSchema | null => {
  const execFunc = (sql: string) => (db as { exec(sql: string): Array<{ columns: string[]; values: unknown[][] }> }).exec(sql);
  const tables = execFunc("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tableNames = (tables[0]?.values.map((v: unknown[]) => String(v[0]).toLowerCase()) || []) as string[];

  const table = tableNames.includes('bible') ? 'bible' : 
                tableNames.includes('verses') ? 'verses' : 
                tableNames.includes('cross_reference') ? 'cross_reference' :
                tableNames.includes('xrefs') ? 'xrefs' : null;
  if (!table) return null;

  const pragma = execFunc(`PRAGMA table_info("${table}")`);
  const cols = (pragma[0]?.values.map((v: unknown[]) => String(v[1]).toLowerCase()) || []) as string[];

  return {
    table,
    bookCol: cols.find(c => ['book', 'book_number', 'book_id', 'b'].includes(c)) || 'book',
    chapterCol: cols.find(c => ['chapter', 'c'].includes(c)) || 'chapter',
    verseCol: cols.find(c => ['verse', 'v'].includes(c)) || 'verse',
    textCol: cols.find(c => ['scripture', 'text', 't'].includes(c)) || 'text',
    isMyBible: (execFunc(`SELECT COUNT(*) FROM ${table} WHERE ${cols.find(c => ['book', 'book_number', 'book_id', 'b'].includes(c)) || 'book'} > 66`)[0]?.values[0][0] as number) > 0
  };
};

const readModuleBinaryFromPublic = async (modulePath: string): Promise<Uint8Array> => {
  const fileName = modulePath.split('/').pop() || modulePath;
  try {
    const response = await fetch(`/${fileName}`);
    if (!response.ok) throw new Error(`HTTP ${response.status} ao buscar ${fileName}`);
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) {
      console.error(`[BibleService] Arquivo vazio: ${fileName}`);
      throw new Error(`Arquivo vazio: ${fileName}`);
    }
    console.log(`[BibleService] Carregado: ${fileName} (${buffer.byteLength} bytes)`);
    return new Uint8Array(buffer);
  } catch (error) {
    console.error(`[BibleService] Erro ao carregar ${fileName}:`, error);
    throw error;
  }
};

const readModuleBinaryFromAssets = async (modulePath: string): Promise<Uint8Array> => {
  const fileName = modulePath.split('/').pop() || modulePath;
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const contents = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Documents
    });
    const raw = contents.data;
    if (typeof raw === 'string') {
      const cleanBase64 = raw.replace(/\s/g, '');
      const binaryData = atob(cleanBase64);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      return bytes;
    }
    return new Uint8Array(0);
  } catch (e: unknown) {
    console.log('[Assets] Error, trying HTTP fallback:', fileName);
    try {
      const response = await fetch(`https://biblia-codex.vercel.app/${fileName}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (e2: unknown) {
      console.log('[Assets] HTTP fallback also failed:', e2);
      return new Uint8Array(0);
    }
  }
};

// Helper to execute SQL on unknown db type
const execSQL = (db: unknown, sql: string, params?: unknown[]): Array<{ columns: string[]; values: unknown[][] }> => {
  const database = db as { exec(sql: string, params?: unknown[]): Array<{ columns: string[]; values: unknown[][] }> };
  return database.exec(sql, params || []);
};

const mapResultRow = <T>(columns: string[], row: unknown[]): T => {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, idx) => {
    obj[col.toLowerCase()] = row[idx];
  });
  return obj as unknown as T;
};

// Reusable loader to ensure cache hit and low latency
const getDbInstance = async (version: BibleModule): Promise<CachedDB> => {
  const cacheKey = version.path;
  let cached = dbCache.get(cacheKey);

  if (!cached) {
    console.log(`[BibleService] Carregando módulo: ${version.path}`);
    const SQL = await getSqlInstance();
    let binaryData: Uint8Array;
    if (isWeb) {
      binaryData = await readModuleBinaryFromPublic(version.path);
    } else {
      binaryData = await readModuleBinary(version.path);
    }
    console.log(`[BibleService] Dados binários carregados: ${binaryData.length} bytes`);
    const db = new SQL.Database(binaryData);
    const schema = detectSchema(db);
    console.log(`[BibleService] Schema detectado:`, schema);
    if (!schema) throw new Error("Schema não suportado");

    cached = { db, schema };
    dbCache.set(cacheKey, cached);
  }
  return cached!;
};

export const BibleService = {
  getVerses: async (bookId: string, chapter: number, version?: BibleModule, _settings?: ParseSettings): Promise<Verse[]> => {
    console.log(`[BibleService.getVerses] bookId=${bookId}, chapter=${chapter}, version=${version?.path || 'undefined'}`);

    if (!version?.path) {
      console.log('[BibleService.getVerses] Sem versão, retornando dados simulados');
      return Array.from({ length: 20 }, (_, i) => ({ bookId, chapter, verse: i + 1, text: `Texto simulado ${i + 1}`, isChapterHeader: false }));
    }

    // Check query cache first
    const cacheKey = `verses-${version.path}-${bookId}-${chapter}`;
    const cached = queryCache.get(cacheKey);
    if (cached) {
      console.log(`[BibleService.getVerses] Cache hit for ${cacheKey}`);
      return cached;
    }

    try {
      const { db, schema } = await getDbInstance(version);
      const bookMetadata = BIBLE_BOOKS.find(b => b.id === bookId);
      const myBibleBookId = BookNumberConverter.toMyBible(bookMetadata?.numericId || 1);
      const stdBookId = bookMetadata?.numericId || 1;

      console.log(`[BibleService.getVerses] Consultando: book=${stdBookId} ou ${myBibleBookId}, chapter=${chapter}`);

      const query = `SELECT ${schema.verseCol}, ${schema.textCol} FROM ${schema.table} WHERE ${schema.bookCol} = ? AND ${schema.chapterCol} = ? ORDER BY ${schema.verseCol} ASC`;

      let queryRes = execSQL(db, query, [stdBookId, chapter]);
      console.log(`[BibleService.getVerses] Resultado padrão (book=${stdBookId}):`, queryRes.length > 0 ? queryRes[0].values.length : 0, 'versículos');

      if (!queryRes.length || !queryRes[0].values.length) {
        queryRes = execSQL(db, query, [myBibleBookId, chapter]);
        console.log(`[BibleService.getVerses] Resultado MyBible (book=${myBibleBookId}):`, queryRes.length > 0 ? queryRes[0].values.length : 0, 'versículos');
      }

      if (queryRes.length > 0 && queryRes[0].values.length > 0) {
        const verses = queryRes[0].values.map((row: unknown[]) => {
          const verseNumber = Number(row[0]);
          return {
            bookId,
            chapter,
            verse: verseNumber,
            text: String(row[1]),
            isChapterHeader: verseNumber === 0
          };
        });
        
        // Cache the result
        queryCache.set(cacheKey, verses);
        return verses;
      }

      console.log('[BibleService.getVerses] Nenhum versículo encontrado!');
    } catch (error: unknown) {
      console.error('Erro ao ler versículos:', error);
    }

    return [];
  },

  getAICommentary: async (bookId: string, chapter: number, verse: number, model?: string): Promise<string> => {
    try {
      const prompt = `Para o versículo bíblico ${bookId} ${chapter}:${verse}, forneça um comentário teológico profundo, contexto histórico e aplicação prática. Use um tom erudito, mas acessível. Responda em Português (PT-BR).`;
      const response = await getAIResponse(
        prompt,
        'Você é um estudioso bíblico e teólogo de classe mundial. Seus comentários são perspicazes, equilibrados e profundamente enraizados no contexto histórico e linguístico.',
        undefined,
        model
      );
      return response || 'Não foi possível gerar o comentário.';
    } catch (error: unknown) {
      console.error('Erro ao buscar comentário IA:', error);
      return 'Erro ao conectar com o serviço de comentários IA.';
    }
  },

  getCommentary: async (bookId: string, chapter: number, verse: number, model?: string): Promise<string> => {
    return BibleService.getAICommentary(bookId, chapter, verse, model);
  },

  getLocalCommentary: async (bookId: string, chapter: number, verse: number, modulePath: string): Promise<{ text: string, moduleName: string } | null> => {
    try {
      const cacheKey = `cmt-${modulePath}`;
      let cached = dbCache.get(cacheKey);

      if (!cached) {
        const SQL = await getSqlInstance();
        let binaryData: Uint8Array;
        if (isWeb) {
          binaryData = await readModuleBinaryFromPublic(modulePath);
        } else {
          binaryData = await readModuleBinary(modulePath);
        }
        const db = new SQL.Database(binaryData);
        const schema = detectSchema(db);
        if (!schema) throw new Error("Schema de comentário não detectado");
        cached = { db, schema };
        dbCache.set(cacheKey, cached);
      }

      const { db, schema } = cached!;
      const bookMetadata = BIBLE_BOOKS.find(b => b.id === bookId);
      const myBibleBookId = BookNumberConverter.toMyBible(bookMetadata?.numericId || 1);
      const stdBookId = bookMetadata?.numericId || 1;

      const query = `SELECT ${schema.textCol} FROM ${schema.table} WHERE ${schema.bookCol} = ? AND ${schema.chapterCol} = ? AND ${schema.verseCol} = ? LIMIT 1`;
      
      let result = execSQL(db, query, [stdBookId, chapter, verse]);
      if (!result.length || !result[0].values.length) {
        result = execSQL(db, query, [myBibleBookId, chapter, verse]);
      }

      if (result.length > 0 && result[0].values.length > 0) {
        return {
          text: String(result[0].values[0][0]),
          moduleName: modulePath.split('/').pop() || 'Comentário'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar comentário local:', error);
    }
    return null;
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

        const tablesResult = execSQL(db, `SELECT name FROM sqlite_master WHERE type='table'`);
        const tableNames = (tablesResult[0]?.values ?? []).map((row: unknown[]) => String(row[0]).toLowerCase()) as string[];
        const table = ['dictionary', 'dict', 'entries', 'words'].find(t => tableNames.includes(t)) || tableNames[0];

        if (!table) throw new Error("Tabela de dicionário não encontrada");

        const pragma = execSQL(db, `PRAGMA table_info("${table}")`);
        const cols = (pragma[0]?.values.map((v: unknown[]) => String(v[1]).toLowerCase()) || []) as string[];

        const schema: SQLiteSchema = {
          table,
          bookCol: cols.find(c => ['word', 'topic', 'key', 'entry', 'lexeme'].includes(c)) || 'word',
          textCol: cols.find(c => ['data', 'definition', 'content', 'text', 'body'].includes(c)) || 'data',
          chapterCol: '',
          verseCol: '',
          isMyBible: false
        };

        cached = { db, schema };
        dbCache.set(cacheKey, cached);
      }

      const { db, schema } = cached!;
      const cleanWord = word.replace(/^[HG]/i, '');
      const query = `SELECT "${schema.textCol}" FROM "${schema.table}" WHERE "${schema.bookCol}" = ? OR "${schema.bookCol}" = ? LIMIT 1`;
      const result = execSQL(db, query, [word, cleanWord]);

      if (result.length > 0 && result[0].values.length > 0) {
        return {
          id: `local-${word}`,
          term: word,
          definition: String(result[0].values[0][0]),
          moduleName: modulePath.split('/').pop() || 'Dicionário',
          source: 'local',
          isAiGenerated: false
        };
      }
    } catch (error: unknown) {
      console.error('Erro ao buscar no dicionário:', error);
    }
    return null;
  },

  getCommentedVersesForChapter: async (bookId: string, chapter: number, modulePath: string): Promise<number[]> => {
    try {
      const cacheKey = `cmt-${modulePath}`;
      let cached = dbCache.get(cacheKey);

      if (!cached) {
        const SQL = await getSqlInstance();
        let binaryData: Uint8Array;
        if (isWeb) {
          binaryData = await readModuleBinaryFromPublic(modulePath);
        } else {
          binaryData = await readModuleBinary(modulePath);
        }
        const db = new SQL.Database(binaryData);
        const schema = detectSchema(db);
        if (!schema) throw new Error("Schema de comentário não detectado");
        cached = { db, schema };
        dbCache.set(cacheKey, cached);
      }

      const { db, schema } = cached!;
      const bookMetadata = BIBLE_BOOKS.find(b => b.id === bookId);
      const myBibleBookId = BookNumberConverter.toMyBible(bookMetadata?.numericId || 1);
      const stdBookId = bookMetadata?.numericId || 1;

      const query = `SELECT ${schema.verseCol} FROM ${schema.table} WHERE ${schema.bookCol} = ? AND ${schema.chapterCol} = ?`;
      
      let result = execSQL(db, query, [stdBookId, chapter]);
      if (!result.length || !result[0].values.length) {
        result = execSQL(db, query, [myBibleBookId, chapter]);
      }

      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values.map(row => Number(row[0]));
      }
    } catch (error) {
      console.error('Erro ao buscar versículos com comentário:', error);
    }
    return [];
  },

  getStrongsDefinition: async (strongsNumber: string, modulePath?: string): Promise<StrongsEntry | null> => {
    try {
      // Default module if not provided
      const path = modulePath || 'Strong KJ Concordância.dct.mybible';
      const entry = await BibleService.getDictionaryEntry(strongsNumber, path);
      
      if (entry) {
        // Parse the definition to extract components if possible
        // For simplicity, we'll return a basic StrongsEntry
        const isHebrew = strongsNumber.startsWith('H');
        return {
          number: strongsNumber,
          language: isHebrew ? 'hebrew' : 'greek',
          word: '', // We could extract this from the definition
          transliteration: '',
          pronunciation: '',
          definition: entry.definition
        };
      }
    } catch (error) {
      console.error('Error fetching Strongs:', error);
    }
    return null;
  },

  getDictionary: async (word: string): Promise<string> => {
    return `Definição simulada para ${word}`;
  },

  getAICrossReferences: async (bookId: string, chapter: number, verse: number, model?: string): Promise<CrossReference[]> => {
    const validIds = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOE', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];
    const prompt = `Encontre 10 referências cruzadas para ${bookId} ${chapter}:${verse}. Responda APENAS com um array JSON no formato: [{"bookId":"GEN","chapter":1,"verse":1,"text":"...","reason":"..."}]. Não inclua texto fora do JSON.`;
    try {
      const response = await getAIResponse(
        prompt,
        'Você é um assistente de estudo bíblico. Retorne apenas JSON válido sem texto adicional.',
        undefined,
        model
      );
      const xrefs = JSON.parse(response || '[]') as Array<{ bookId: string; chapter: number; verse: number; text?: string; reason?: string; rank?: number }>;
      return xrefs.map((ref, index) => ({
        id: `xref-${ref.bookId}-${ref.chapter}-${ref.verse}-${index}`,
        ...ref,
        bookName: BIBLE_BOOKS.find(b => b.id === ref.bookId)?.name || ref.bookId,
        rank: ref.rank || 0
      }));
    } catch (error: unknown) { return []; }
  },

  getCrossReferences: async (bookId: string, chapter: number, verse: number, model?: string): Promise<CrossReference[]> => {
    return BibleService.getAICrossReferences(bookId, chapter, verse, model);
  },

  getLocalCrossReferences: async (bookId: string, chapter: number, verse: number, modulePath: string): Promise<{ text: string, moduleName: string } | null> => {
    try {
      const cacheKey = `xrefs-${modulePath}`;
      let cached = dbCache.get(cacheKey);

      if (!cached) {
        const SQL = await getSqlInstance();
        let binaryData: Uint8Array;
        if (isWeb) {
          binaryData = await readModuleBinaryFromPublic(modulePath);
        } else {
          binaryData = await readModuleBinary(modulePath);
        }
        const db = new SQL.Database(binaryData);
        const schema = detectSchema(db);
        if (!schema) throw new Error("Schema de referências não detectado");
        cached = { db, schema };
        dbCache.set(cacheKey, cached);
      }

      const { db, schema } = cached!;
      const bookMetadata = BIBLE_BOOKS.find(b => b.id === bookId);
      const myBibleBookId = BookNumberConverter.toMyBible(bookMetadata?.numericId || 1);
      const stdBookId = bookMetadata?.numericId || 1;

      const query = `SELECT ${schema.textCol} FROM ${schema.table} WHERE ${schema.bookCol} = ? AND ${schema.chapterCol} = ? AND ${schema.verseCol} = ? LIMIT 1`;
      
      let result = execSQL(db, query, [stdBookId, chapter, verse]);
      if (!result.length || !result[0].values.length) {
        result = execSQL(db, query, [myBibleBookId, chapter, verse]);
      }

      if (result.length > 0 && result[0].values.length > 0) {
        return {
          text: String(result[0].values[0][0]),
          moduleName: modulePath.split('/').pop() || 'Referências'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar referências locais:', error);
    }
    return null;
  },

  getPeopleData: async (bookId: string, chapter: number, verse: number): Promise<PeopleData[]> => {
    try {
      const bundledPaths = ['peopledata.mybible'];

      let bookInfo = BIBLE_BOOKS.find(b => b.id === bookId);
      if (!bookInfo) bookInfo = BIBLE_BOOKS.find(b => b.abbreviation === bookId);
      if (!bookInfo) bookInfo = BIBLE_BOOKS.find(b => b.numericId === parseInt(bookId));

      const bookNumericId = bookInfo?.numericId || parseInt(bookId) || 1;
      const bookAbbrEn: Record<number, string> = {
        1: 'Gn', 2: 'Ex', 3: 'Le', 4: 'Nu', 5: 'Dt',
        6: 'Jos', 7: 'Jz', 8: 'Ru', 9: '1Sa', 10: '2Sa',
        11: '1Ki', 12: '2Ki', 13: '1Ch', 14: '2Ch', 15: 'Ez',
        16: 'Ne', 17: 'Es', 18: 'Job', 19: 'Ps', 20: 'Pr',
        21: 'Ec', 22: 'So', 23: 'Is', 24: 'Je', 25: 'La',
        26: 'Eze', 27: 'Da', 28: 'Ho', 29: 'Joe', 30: 'Am',
        31: 'Ob', 32: 'Jon', 33: 'Mic', 34: 'Na', 35: 'Hab',
        36: 'Zep', 37: 'Hag', 38: 'Zec', 39: 'Mal',
        40: 'Mt', 41: 'Mk', 42: 'Lu', 43: 'Joh', 44: 'Ac',
        45: 'Ro', 46: '1Co', 47: '2Co', 48: 'Ga', 49: 'Eph',
        50: 'Php', 51: 'Col', 52: '1Th', 53: '2Th', 54: '1Ti',
        55: '2Ti', 56: 'Tit', 57: 'Phm', 58: 'Heb', 59: 'Jas',
        60: '1Pe', 61: '2Pe', 62: '1Jo', 63: '2Jo', 64: '3Jo',
        65: 'Jud', 66: 'Re'
      };

      const bookAbbr = bookAbbrEn[bookNumericId] || bookInfo?.id || 'Ge';
      const verseRef = `${chapter}:${verse}`;

      for (const path of bundledPaths) {
        try {
          const SQL = await getSqlInstance();
          let binaryData: Uint8Array;
          if (isWeb) {
            binaryData = await readModuleBinaryFromPublic(path);
          } else {
            try {
              binaryData = await readModuleBinary(path);
            } catch {
              binaryData = await readModuleBinaryFromAssets(path);
            }
          }

          if (!binaryData || binaryData.length === 0) continue;

          const db = new SQL.Database(binaryData);

          let result = execSQL(db, `SELECT * FROM people WHERE verses LIKE ? LIMIT 15`, [`%${bookAbbr} ${verseRef}%`]);

          if (!result.length || !result[0].values.length) {
            result = execSQL(db, `SELECT * FROM people WHERE verses LIKE ? LIMIT 15`, [`%${bookAbbr} ${chapter}:%`]);
          }

          if (result.length > 0 && result[0].values.length > 0) {
            const columns = result[0].columns;
            return result[0].values.map((row: unknown[]) => mapResultRow<PeopleData>(columns, row));
          }
        } catch (e: unknown) { console.log(`Error:`, e); }
      }
    } catch (error: unknown) {
      console.error('Erro ao buscar dados de pessoas:', error);
    }
    return [];
  },

  getGenealogyTree: async (treeId: number): Promise<PeopleData[]> => {
    try {
      const bundledPaths = ['peopledata.mybible', 'people.mybible'];
      for (const path of bundledPaths) {
        try {
          const SQL = await getSqlInstance();
          let binaryData: Uint8Array;
          if (isWeb) {
            binaryData = await readModuleBinaryFromPublic(path);
          } else {
            binaryData = await readModuleBinary(path);
          }
          const db = new SQL.Database(binaryData);

          const tablesResult = execSQL(db, `SELECT name FROM sqlite_master WHERE type='table'`);
          const tableNames = (tablesResult[0]?.values ?? []).map((row: unknown[]) => String(row[0]).toLowerCase()) as string[];
          const table = tableNames.find(t => t.includes('people')) || tableNames[0];

          if (!table) continue;

          const result = execSQL(db, `SELECT * FROM ${table} WHERE tree_id = ? ORDER BY name`, [treeId]);

          if (result.length > 0 && result[0].values.length > 0) {
            const columns = result[0].columns;
            return result[0].values.map((row: unknown[]) => mapResultRow<PeopleData>(columns, row));
          }
        } catch (e: unknown) { console.log(e); }
      }
    } catch (error: unknown) { console.error(error); }
    return [];
  },

  getPlacesData: async (bookId: string, chapter: number, verse: number): Promise<PlacesData[]> => {
    try {
      const bundledPaths = ['mapgeodata.mybible'];

      let bookInfo = BIBLE_BOOKS.find(b => b.id === bookId);
      if (!bookInfo) bookInfo = BIBLE_BOOKS.find(b => b.abbreviation === bookId);
      if (!bookInfo) bookInfo = BIBLE_BOOKS.find(b => b.numericId === parseInt(bookId));
      if (!bookInfo) bookInfo = BIBLE_BOOKS.find(b => b.abbreviation?.toLowerCase() === bookId.toLowerCase());
      const bookNum = bookInfo?.numericId || parseInt(bookId) || 1;

      for (const path of bundledPaths) {
        try {
          const SQL = await getSqlInstance();
          let binaryData: Uint8Array;
          if (isWeb) {
            binaryData = await readModuleBinaryFromPublic(path);
          } else {
            try {
              binaryData = await readModuleBinary(path);
            } catch (e: unknown) {
              binaryData = await readModuleBinaryFromAssets(path);
            }
          }

          if (!binaryData || binaryData.length === 0) {
            continue;
          }

          const db = new SQL.Database(binaryData);

          const tablesResult = execSQL(db, `SELECT name FROM sqlite_master WHERE type='table'`);
          const allTables = (tablesResult[0]?.values?.flat() || []) as string[];
          const locationTable = allTables.find((t: string) => t.toLowerCase().includes('place') || t.toLowerCase().includes('location')) || 'location';
          const verseTable = allTables.find((t: string) => t.toLowerCase() === 'verse');

          let places: PlacesData[] = [];

          if (verseTable) {
            try {
              const verseResult = execSQL(db,
                `SELECT v.location, l.location as place_name, l.lat, l.lon, l.verses, l.comment
                 FROM "${verseTable}" v
                 LEFT JOIN "${locationTable}" l ON v.location = l.location
                 WHERE v.book = ? AND v.chapter = ? AND v.verse = ?`,
                [bookNum, chapter, verse]
              );

              if (verseResult.length > 0 && verseResult[0].values.length > 0) {
                places = verseResult[0].values.map(row => ({
                  id: String(row[0]?.toString().charCodeAt(0) || '0'),
                  name: String(row[1] || row[0]),
                  latitude: Number(row[2]) || undefined,
                  longitude: Number(row[3]) || undefined,
                  description: String(row[5] || ''),
                  type: 'location'
                }));
              }
            } catch (e: unknown) {
              console.log('[Places] verse table query failed:', e);
            }
          }

          if (places.length === 0) {
            const pragma = execSQL(db, `PRAGMA table_info("${locationTable}")`);
            const cols = (pragma[0]?.values.map((v: unknown[]) => v[1]) || []) as string[];
            const versesCol = cols.find(c => c.toLowerCase() === 'verses') || 'verses';

            const abbreviationMap: Record<string, string[]> = {
              'GEN': ['Gen', 'Gn', 'Ge'], 'EXO': ['Exo', 'Ex', 'Êx'], 'LEV': ['Lev', 'Lv'],
              'NUM': ['Num', 'Nm'], 'DEU': ['Deu', 'Dt'], 'JOS': ['Jos', 'Js'],
              'JDG': ['Jdg', 'Jz'], 'RUT': ['Rut', 'Rt'], '1SA': ['1Sa', '1Sm'],
              '2SA': ['2Sa', '2Sm'], '1KI': ['1Ki', '1Rs'], '2KI': ['2Ki', '2Rs'],
              '1CR': ['1Ch', '1Cr'], '2CR': ['2Ch', '2Cr'], 'EZR': ['Ezr', 'Ed'],
              'NEH': ['Neh', 'Ne'], 'EST': ['Est', 'Et'], 'JOB': ['Job', 'Jó'],
              'PSA': ['Psa', 'Sl'], 'PRO': ['Pro', 'Pv'], 'ECC': ['Ecc', 'Ec'],
              'SNG': ['Sng', 'Ct'], 'ISA': ['Isa', 'Is'], 'JER': ['Jer', 'Jr'],
              'LAM': ['Lam', 'Lm'], 'EZK': ['Ezk', 'Eze', 'Ez'], 'DAN': ['Dan', 'Dn'],
              'HOS': ['Hos', 'Os'], 'JOL': ['Joe', 'Jl'], 'AMO': ['Amo', 'Am'],
              'OBD': ['Oba', 'Ob'], 'JON': ['Jon', 'Jn'], 'MIC': ['Mic', 'Mq'],
              'NAM': ['Nah', 'Na'], 'HAB': ['Hab', 'Hb'], 'ZEP': ['Zep', 'Sf'],
              'HAG': ['Hag', 'Ag'], 'ZEC': ['Zec', 'Zc'], 'MAL': ['Mal', 'Ml'],
              'MAT': ['Mat', 'Mt'], 'MAR': ['Mar', 'Mc', 'Mr'], 'LUK': ['Luk', 'Lc', 'Luke'],
              'JAN': ['Joh', 'Jo', 'Jhn'], 'ACT': ['Act', 'At'], 'ROM': ['Rom', 'Rm'],
              '1CO': ['1Co'], '2CO': ['2Co'], 'GAL': ['Gal', 'Gl'],
              'EFS': ['Eph', 'Ef'], 'FP': ['Phil', 'Fp'], 'CL': ['Col', 'Cl'],
              '1TS': ['1Th', '1Ts'], '2TS': ['2Th', '2Ts'], '1TM': ['1Ti', '1Tm'],
              '2TM': ['2Ti', '2Tm'], 'TT': ['Tit', 'Tt'], 'HB': ['Heb', 'Hb'],
              '1PE': ['1Pe', '1P'], '2PE': ['2Pe', '2P'], '1JO': ['1Jn', '1Jo'],
              '2JO': ['2Jn', '2Jo'], '3JO': ['3Jn', '3Jo'], 'JD': ['Jude', 'Jd'],
              'AP': ['Rev', 'Ap']
            };

            const bookRefs = abbreviationMap[bookInfo?.id || ''] || [bookInfo?.abbreviation || ''];

            for (const bookRef of bookRefs) {
              const searchPattern = `%${bookRef} ${chapter}:${verse}%`;
              const searchResult = execSQL(db,
                `SELECT * FROM "${locationTable}" WHERE "${versesCol}" LIKE ? LIMIT 15`,
                [searchPattern]
              );
              if (searchResult.length > 0 && searchResult[0].values.length > 0) {
                const resultCols = searchResult[0].columns;
                places = searchResult[0].values.slice(0, 10).map(row => mapResultRow<PlacesData>(resultCols, row));
                break;
              }
            }
          }

          db.close();
          return places;
        } catch (e: unknown) {
          console.log('[Places] Module load failed:', e);
        }
      }
    } catch (error: unknown) {
      console.error('[Places] Error:', error);
    }
    return [];
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

      const result = execSQL(db, sqlQuery, [sqlSearch]);
      if (result.length > 0) {
        return result[0].values.map((row: unknown[]) => {
          const bookNum = Number(row[0]);
          let bookMetadata;

          if (schema.isMyBible || bookNum > 66) {
            const stdId = BookNumberConverter.fromMyBible(bookNum);
            bookMetadata = BIBLE_BOOKS.find(b => b.numericId === stdId);
          } else {
            bookMetadata = BIBLE_BOOKS.find(b => b.numericId === bookNum);
          }

          return {
            bookId: bookMetadata?.id || String(bookNum),
            chapter: Number(row[1]),
            verse: Number(row[2]),
            text: String(row[3]),
            isChapterHeader: Number(row[2]) === 0
          };
        });
      }
    } catch (error: unknown) {
      console.error('Erro na busca:', error);
    }
    return [];
  },

  globalSearch: async (query: string, version?: BibleModule) => {
    const [verses, notes, footnotes] = await Promise.all([
      BibleService.search(query, version),
      storage.searchNotes(query),
      storage.searchFootnotes(query)
    ]);

    return {
      verses,
      notes,
      footnotes
    };
  },

  getFootnotes: async (bookId: string, chapter: number, verse: number): Promise<Footnote[]> => {
    try {
      const footnotes = await footnoteService.getFootnotesForVerse(bookId, chapter, verse);

      if (footnotes.length > 0) {
        return footnotes;
      }

      return getDefaultFootnotes(bookId, chapter, verse);
    } catch (error: unknown) {
      console.error('Erro ao buscar notas de rodapé:', error);
      return [];
    }
  },
};

function getDefaultFootnotes(bookId: string, chapter: number, verse: number): Footnote[] {
  const allDefaultFootnotes = getDefaultFootnotesData();
  return allDefaultFootnotes.filter(f => f.bookId === bookId && f.chapter === chapter && f.verse === verse);
}

function getDefaultFootnotesData(): Footnote[] {
  return [
    {
      id: 'default-jn316-1',
      bookId: 'JHN',
      chapter: 3,
      verse: 16,
      type: 'theological' as FootnoteType,
      content: 'Este é o versículo mais conhecido da Bíblia. O termo "kosmos" refere-se à totalidade da criação material, não apenas ao planeta Terra. A palavra "único" (monogenes) enfatiza a singularidade de Jesus como o Filho unigênito de Deus.',
      references: ['Rm 3:24', 'Ef 1:7', '1Jo 4:9'],
      language: 'pt',
      source: 'Bible de Estudo NAA',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ];
}
