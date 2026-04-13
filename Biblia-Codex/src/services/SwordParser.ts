import { Footnote, FootnoteType } from '../types';

export class SwordParser {
  static parseOsisNotes(osmlText: string, bookId: string, chapter: number, verse: number): Footnote[] {
    const footnotes: Footnote[] = [];
    
    const noteRegex = /<note[^>]*>([^<]+)<\/note>/g;
    let match;
    
    while ((match = noteRegex.exec(osmlText)) !== null) {
      footnotes.push({
        id: `sword-${bookId}-${chapter}-${verse}-${match.index}`,
        bookId,
        chapter,
        verse,
        type: this.detectType(match[1]),
        content: this.sanitizeContent(match[1]),
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return footnotes;
  }

  static parseCrossReferences(osmlText: string): { bookId: string; chapter: number; verse: number; refs: string[] }[] {
    const xrefs: { bookId: string; chapter: number; verse: number; refs: string[] }[] = [];
    
    const refRegex = /<reference[^>]*osisRef="([^"]+)"[^>]*>([^<]+)<\/reference>/g;
    let match;
    let currentVerse = { bookId: '', chapter: 0, verse: 0 };
    const verseRefs: string[] = [];

    while ((match = refRegex.exec(osmlText)) !== null) {
      const [, osisRef, text] = match;
      const parsed = this.parseOsisRef(osisRef);
      
      if (parsed && (parsed.bookId !== currentVerse.bookId || parsed.chapter !== currentVerse.chapter || parsed.verse !== currentVerse.verse)) {
        if (verseRefs.length > 0) {
          xrefs.push({ ...currentVerse, refs: [...verseRefs] });
        }
        currentVerse = parsed;
        verseRefs.length = 0;
      }
      
      if (parsed) {
        verseRefs.push(text);
      }
    }

    if (verseRefs.length > 0) {
      xrefs.push({ ...currentVerse, refs: verseRefs });
    }

    return xrefs;
  }

  static extractStrongsFromOsis(osmlText: string): { number: string; language: 'hebrew' | 'greek' }[] {
    const strongs: { number: string; language: 'hebrew' | 'greek' }[] = [];
    
    const lemmaRegex = /lemma="([HG]\d+)"/g;
    const srcRegex = /src="([HG]\d+)"/g;
    
    let match;
    while ((match = lemmaRegex.exec(osmlText)) !== null) {
      strongs.push({ number: match[1], language: match[1].startsWith('H') ? 'hebrew' : 'greek' });
    }
    while ((match = srcRegex.exec(osmlText)) !== null) {
      strongs.push({ number: match[1], language: match[1].startsWith('H') ? 'hebrew' : 'greek' });
    }

    return strongs;
  }

  static extractMorphology(osmlText: string): { word: string; morph: string; lang: string }[] {
    const morphs: { word: string; morph: string; lang: string }[] = [];
    
    const morphRegex = /<w[^>]*>([^<]+)<\/w>/g;
    let match;
    
    while ((match = morphRegex.exec(osmlText)) !== null) {
      const word = match[1];
      const hasMorph = osmlText.substring(match.index, match.index + 200).includes('morph=');
      
      if (hasMorph) {
        const morphMatch = osmlText.substring(match.index, match.index + 300).match(/morph="([^"]+)"/);
        if (morphMatch) {
          morphs.push({ word, morph: morphMatch[1], lang: 'gr' });
        }
      }
    }

    return morphs;
  }

  static parseOsisRef(osisRef: string): { bookId: string; chapter: number; verse: number } | null {
    const match = osisRef.match(/^([A-Za-z]+)\.(\d+)\.(\d+)$/);
    if (!match) return null;

    const [, bookName, chapter, verse] = match;
    const bookId = this.bookNameToId(bookName);
    
    if (!bookId) return null;

    return { bookId, chapter: parseInt(chapter), verse: parseInt(verse) };
  }

  private static bookNameToId(name: string): string | null {
    const books: Record<string, string> = {
      'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
      'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT', '1Sam': '1SA', '2Sam': '2SA',
      '1Kgs': '1KI', '2Kgs': '2KI', '1Chr': '1CH', '2Chr': '2CH', 'Ezra': 'EZR',
      'Neh': 'NEH', 'Esth': 'EST', 'Job': 'JOB', 'Ps': 'PSA', 'Prov': 'PRO',
      'Eccl': 'ECC', 'Song': 'SNG', 'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM',
      'Ezek': 'EZK', 'Dan': 'DAN', 'Hos': 'HOS', 'Joel': 'JOE', 'Amos': 'AMO',
      'Obad': 'OBA', 'Jonah': 'JON', 'Mic': 'MIC', 'Nah': 'NAM', 'Hab': 'HAB',
      'Zeph': 'ZEP', 'Hag': 'HAG', 'Zech': 'ZEC', 'Mal': 'MAL',
      'Matt': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
      'Rom': 'ROM', '1Cor': '1CO', '2Cor': '2CO', 'Gal': 'GAL', 'Eph': 'EPH',
      'Phil': 'PHP', 'Col': 'COL', '1Thess': '1TH', '2Thess': '2TH', '1Tim': '1TI',
      '2Tim': '2TI', 'Titus': 'TIT', 'Phlm': 'PHM', 'Heb': 'HEB', 'Jas': 'JAS',
      '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN', '2John': '2JN', '3John': '3JN',
      'Jude': 'JUD', 'Rev': 'REV',
    };
    return books[name] || null;
  }

  private static detectType(content: string): FootnoteType {
    const lower = content.toLowerCase();
    
    if (lower.includes('variant') || lower.includes('manuscript') || lower.includes('text')) {
      return 'textual';
    }
    if (lower.includes('history') || lower.includes('period') || lower.includes('reign')) {
      return 'historical';
    }
    if (lower.includes('location') || lower.includes('city') || lower.includes('place')) {
      return 'geographic';
    }
    if (lower.includes('doctrine') || lower.includes('theolog') || lower.includes('faith')) {
      return 'theological';
    }
    if (lower.includes('date') || lower.includes('year') || lower.includes('century')) {
      return 'chronological';
    }
    if (lower.includes('applic') || lower.includes('practical') || lower.includes('today')) {
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
}

export function parseSwordModule(text: string, bookId: string, chapter: number, verse: number): Footnote[] {
  return SwordParser.parseOsisNotes(text, bookId, chapter, verse);
}