import { Footnote, FootnoteType } from '../types';
import initSqlJs, { Database } from 'sql.js';

export class MyBibleParser {
  private db: Database | null = null;

  async loadDatabase(data: ArrayBuffer): Promise<void> {
    const SQL = await initSqlJs({ locateFile: () => new URL('sql-wasm.wasm', import.meta.url).pathname }).catch(async () => {
      const response = await fetch('sql-wasm.wasm');
      if (!response.ok) throw new Error('Falha ao carregar sql-wasm.wasm');
      const wasmBinary = await response.arrayBuffer();
      return initSqlJs({ wasmBinary });
    });
    this.db = new SQL.Database(new Uint8Array(data));
  }

  async loadFromUrl(url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    await this.loadDatabase(arrayBuffer);
  }

  getFootnotes(): Footnote[] {
    if (!this.db) return [];

    const footnotes: Footnote[] = [];
    
    try {
      const result = this.db.exec(`
        SELECT book_number, chapter_number_from, verse_number_from, commentary 
        FROM commentaries 
        ORDER BY book_number, chapter_number_from, verse_number_from
      `);

      if (result.length > 0) {
        for (const row of result[0].values) {
          const bookNum = row[0] as number;
          const chapter = row[1] as number;
          const verse = row[2] as number;
          const content = row[3] as string;

          const bookId = this.bookNumberToId(bookNum);
          if (!bookId) continue;

          footnotes.push({
            id: `${bookId}-${chapter}-${verse}-commentary`,
            bookId,
            chapter,
            verse,
            type: this.detectType(content),
            content: this.sanitizeContent(content),
            language: 'pt',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
    } catch (e) {
      console.warn('MyBibleParser: No commentaries table', e);
    }

    return footnotes;
  }

  getCommentaryForVerse(bookId: string, chapter: number, verse: number): string | null {
    if (!this.db) return null;

    const bookNum = this.bookIdToNumber(bookId);
    if (!bookNum) return null;

    try {
      const result = this.db.exec(`
        SELECT commentary 
        FROM commentaries 
        WHERE book_number = ${bookNum} 
          AND chapter_number_from <= ${chapter}
          AND (chapter_number_to IS NULL OR chapter_number_to >= ${chapter})
          AND verse_number_from <= ${verse}
          AND (verse_number_to IS NULL OR verse_number_to >= ${verse})
        LIMIT 1
      `);

      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0] as string;
      }
    } catch (e) {
      console.warn('MyBibleParser: Error getting commentary', e);
    }

    return null;
  }

  getModuleInfo(): Record<string, string> {
    if (!this.db) return {};

    const info: Record<string, string> = {};
    
    try {
      const result = this.db.exec('SELECT name, value FROM info');
      if (result.length > 0) {
        for (const row of result[0].values) {
          info[row[0] as string] = row[1] as string;
        }
      }
    } catch (e) {
      console.warn('MyBibleParser: No info table', e);
    }

    return info;
  }

  hasStrongs(): boolean {
    const info = this.getModuleInfo();
    return info.strongs === 'yes' || info.strongs === 'true';
  }

  hasNewTestament(): boolean {
    const info = this.getModuleInfo();
    return info.new_testament === 'yes' || info.new_testament === 'true';
  }

  hasOldTestament(): boolean {
    const info = this.getModuleInfo();
    return info.old_testament === 'yes' || info.old_testament === 'true';
  }

  private bookNumberToId(num: number): string | null {
    const books: Record<number, string> = {
      1: 'GEN', 2: 'EXO', 3: 'LEV', 4: 'NUM', 5: 'DEU',
      6: 'JOS', 7: 'JDG', 8: 'RUT', 9: '1SA', 10: '2SA',
      11: '1KI', 12: '2KI', 13: '1CH', 14: '2CH', 15: 'EZR',
      16: 'NEH', 17: 'EST', 18: 'JOB', 19: 'PSA', 20: 'PRO',
      21: 'ECC', 22: 'SNG', 23: 'ISA', 24: 'JER', 25: 'LAM',
      26: 'EZK', 27: 'DAN', 28: 'HOS', 29: 'JOE', 30: 'AMO',
      31: 'OBA', 32: 'JON', 33: 'MIC', 34: 'NAM', 35: 'HAB',
      36: 'ZEP', 37: 'HAG', 38: 'ZEC', 39: 'MAL',
      40: 'MAT', 41: 'MRK', 42: 'LUK', 43: 'JHN', 44: 'ACT',
      45: 'ROM', 46: '1CO', 47: '2CO', 48: 'GAL', 49: 'EPH',
      50: 'PHP', 51: 'COL', 52: '1TH', 53: '2TH', 54: '1TI',
      55: '2TI', 56: 'TIT', 57: 'PHM', 58: 'HEB', 59: 'JAS',
      60: '1PE', 61: '2PE', 62: '1JN', 63: '2JN', 64: '3JN',
      65: 'JUD', 66: 'REV',
    };
    return books[num] || null;
  }

  private bookIdToNumber(bookId: string): number | null {
    const books: Record<string, number> = {
      'GEN': 1, 'EXO': 2, 'LEV': 3, 'NUM': 4, 'DEU': 5,
      'JOS': 6, 'JDG': 7, 'RUT': 8, '1SA': 9, '2SA': 10,
      '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14, 'EZR': 15,
      'NEH': 16, 'EST': 17, 'JOB': 18, 'PSA': 19, 'PRO': 20,
      'ECC': 21, 'SNG': 22, 'ISA': 23, 'JER': 24, 'LAM': 25,
      'EZK': 26, 'DAN': 27, 'HOS': 28, 'JOE': 29, 'AMO': 30,
      'OBA': 31, 'JON': 32, 'MIC': 33, 'NAM': 34, 'HAB': 35,
      'ZEP': 36, 'HAG': 37, 'ZEC': 38, 'MAL': 39,
      'MAT': 40, 'MRK': 41, 'LUK': 42, 'JHN': 43, 'ACT': 44,
      'ROM': 45, '1CO': 46, '2CO': 47, 'GAL': 48, 'EPH': 49,
      'PHP': 50, 'COL': 51, '1TH': 52, '2TH': 53, '1TI': 54,
      '2TI': 55, 'TIT': 56, 'PHM': 57, 'HEB': 58, 'JAS': 59,
      '1PE': 60, '2PE': 61, '1JN': 62, '2JN': 63, '3JN': 64,
      'JUD': 65, 'REV': 66,
    };
    return books[bookId] || null;
  }

  private detectType(content: string): FootnoteType {
    const lower = (content || '').toLowerCase();
    
    if (lower.includes('variação') || lower.includes('manuscrit') || lower.includes('texto')) {
      return 'textual';
    }
    if (lower.includes('histór') || lower.includes('época') || lower.includes('reinado')) {
      return 'historical';
    }
    if (lower.includes('local') || lower.includes('cidade') || lower.includes('geografia')) {
      return 'geographic';
    }
    if (lower.includes('doutrin') || lower.includes('teológ') || lower.includes('fé')) {
      return 'theological';
    }
    if (lower.includes('data') || lower.includes('ano') || lower.includes('cronologia')) {
      return 'chronological';
    }
    if (lower.includes('aplic') || lower.includes('prática') || lower.includes('hoje')) {
      return 'application';
    }
    
    return 'historical';
  }

  private sanitizeContent(content: string): string {
    return (content || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export async function parseMyBibleCommentary(url: string): Promise<Footnote[]> {
  const parser = new MyBibleParser();
  await parser.loadFromUrl(url);
  return parser.getFootnotes();
}