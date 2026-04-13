import { Footnote, FootnoteType, StrongsEntry, CrossReferenceGroup } from '../types';
import { storage } from '../StorageService';

export class FootnoteService {
  private static cachedFootnotes: Map<string, Footnote[]> = new Map();

  static parseMySwordFootnotes(text: string, bookId: string, chapter: number, verse: number): Footnote[] {
    const footnotes: Footnote[] = [];
    const footnoteRegex = /<FI>([^<]+)<\*([^<]+)<Fi>/g;
    const translatorNoteRegex = /<TN>([^<]+)<Tn>/g;
    
    let match;
    while ((match = footnoteRegex.exec(text)) !== null) {
      const [, marker, content] = match;
      footnotes.push({
        id: `${bookId}-${chapter}-${verse}-fn-${match.index}`,
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

    while ((match = translatorNoteRegex.exec(text)) !== null) {
      footnotes.push({
        id: `${bookId}-${chapter}-${verse}-tn-${match.index}`,
        bookId,
        chapter,
        verse,
        type: 'textual',
        content: this.sanitizeContent(match[1]),
        language: 'pt',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return footnotes;
  }

  static extractStrongsNumbers(text: string): { number: string; language: 'hebrew' | 'greek' }[] {
    const strongs: { number: string; language: 'hebrew' | 'greek' }[] = [];
    
    const hebrewRegex = /<WH(\d+)>/g;
    const greekRegex = /<WG(\d+)>/g;
    const genericRegex = /<S(\d+)>/g;

    let match;
    while ((match = hebrewRegex.exec(text)) !== null) {
      strongs.push({ number: `H${match[1]}`, language: 'hebrew' });
    }
    while ((match = greekRegex.exec(text)) !== null) {
      strongs.push({ number: `G${match[1]}`, language: 'greek' });
    }
    while ((match = genericRegex.exec(text)) !== null) {
      const num = parseInt(match[1]);
      strongs.push({ number: match[1], language: num < 6000 ? 'hebrew' : 'greek' });
    }

    return strongs;
  }

  static async loadFootnotesFromModule(moduleData: any, bookId: string): Promise<Footnote[]> {
    const allFootnotes: Footnote[] = [];
    
    if (!moduleData || !moduleData.verses) return allFootnotes;

    for (const verse of moduleData.verses) {
      const footnotes = this.parseMySwordFootnotes(
        verse.text,
        bookId,
        verse.chapter,
        verse.verse
      );
      allFootnotes.push(...footnotes);
    }

    return allFootnotes;
  }

  static async saveFootnotes(footnotes: Footnote[]): Promise<void> {
    await storage.saveFootnotes(footnotes);
  }

  static async getFootnotesForVerse(bookId: string, chapter: number, verse: number): Promise<Footnote[]> {
    const cacheKey = `${bookId}-${chapter}-${verse}`;
    
    if (this.cachedFootnotes.has(cacheKey)) {
      return this.cachedFootnotes.get(cacheKey) || [];
    }

    const footnotes = await storage.getFootnotesByReference(bookId, chapter, verse);
    this.cachedFootnotes.set(cacheKey, footnotes);
    
    return footnotes;
  }

  static async searchFootnotes(query: string): Promise<Footnote[]> {
    return storage.searchFootnotes(query);
  }

  static async getStrongsEntry(number: string): Promise<StrongsEntry | undefined> {
    const num = number.replace(/^[HG]/i, '');
    const lang = number.toUpperCase().startsWith('H') ? 'hebrew' : 'greek';
    
    if (lang === 'hebrew') {
      return storage.getStrongsHebrew(`H${num}`);
    } else {
      return storage.getStrongsGreek(`G${num}`);
    }
  }

  static getFootnoteTypeLabel(type: FootnoteType): string {
    const labels: Record<FootnoteType, string> = {
      textual: 'Nota Textual',
      historical: 'Contexto Histórico',
      geographic: 'Informação Geográfica',
      theological: 'Nota Teológica',
      chronological: 'Cronologia',
      application: 'Aplicação',
    };
    return labels[type] || type;
  }

  static getFootnoteTypeColor(type: FootnoteType): string {
    const colors: Record<FootnoteType, string> = {
      textual: '#4A90D9',
      historical: '#D4A84B',
      geographic: '#48C9B0',
      theological: '#9B59B6',
      chronological: '#E74C3C',
      application: '#27AE60',
    };
    return colors[type] || '#888';
  }

  private static detectType(content: string): FootnoteType {
    const lower = content.toLowerCase();
    
    if (lower.includes('variação') || lower.includes('manuscrit') || lower.includes('texto grego') || lower.includes('variação textua')) {
      return 'textual';
    }
    if (lower.includes('histór') || lower.includes('época') || lower.includes('reinado') || lower.includes(' contexto')) {
      return 'historical';
    }
    if (lower.includes('local') || lower.includes('cidade') || lower.includes('terra') || lower.includes('geografia')) {
      return 'geographic';
    }
    if (lower.includes('doutrin') || lower.includes('teológ') || lower.includes('fé') || lower.includes('significado')) {
      return 'theological';
    }
    if (lower.includes('data') || lower.includes('ano') || lower.includes('século') || lower.includes('cronologia')) {
      return 'chronological';
    }
    if (lower.includes('aplic') || lower.includes('prática') || lower.includes('viver') || lower.includes('hoje')) {
      return 'application';
    }
    
    return 'historical';
  }

  private static sanitizeContent(content: string): string {
    return content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static clearCache(): void {
    this.cachedFootnotes.clear();
  }
}

export const footnoteService = FootnoteService;