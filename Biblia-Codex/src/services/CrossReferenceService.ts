import { BIBLE_BOOKS } from '../data/bibleMetadata';

export interface VerseRef {
  bookId: string;
  chapter: number;
  verse: number;
  endVerse?: number;
}

export interface CrossRefEntry {
  from: VerseRef;
  to: VerseRef;
  votes: number;
}

const crossRefCache = new Map<string, CrossRefEntry[]>();
const reverseCache = new Map<string, CrossRefEntry[]>();

function parseVerseRef(ref: string): VerseRef | null {
  const match = ref.match(/^([A-Za-z]+)\.(\d+)\.(\d+)(?:-(\d+))?$/);
  if (!match) return null;

  const [, bookName, chapter, verse, endVerse] = match;
  const book = BIBLE_BOOKS.find(b => 
    b.name.toLowerCase() === bookName.toLowerCase() ||
    b.id.toLowerCase() === bookName.toLowerCase()
  );
  
  if (!book) return null;

  return {
    bookId: book.id,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    endVerse: endVerse ? parseInt(endVerse) : undefined
  };
}

function verseRefToString(ref: VerseRef, includeEnd?: boolean): string {
  const book = BIBLE_BOOKS.find(b => b.id === ref.bookId);
  const bookName = book?.name || ref.bookId;
  if (includeEnd && ref.endVerse && ref.endVerse !== ref.verse) {
    return `${bookName}.${ref.chapter}.${ref.verse}-${ref.endVerse}`;
  }
  return `${bookName}.${ref.chapter}.${ref.verse}`;
}

export async function loadCrossReferences(): Promise<void> {
  if (crossRefCache.size > 0) return;

  try {
    const response = await fetch('/cross_references.txt');
    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      if (!line.trim() || line.startsWith('From')) continue;
      
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const fromRef = parseVerseRef(parts[0]);
      const toRef = parseVerseRef(parts[1]);
      const votes = parseInt(parts[2]) || 1;

      if (!fromRef || !toRef) continue;

      const entry: CrossRefEntry = { from: fromRef, to: toRef, votes };

      const fromKey = verseRefToString(fromRef);
      const toKey = verseRefToString(toRef);

      if (!crossRefCache.has(fromKey)) {
        crossRefCache.set(fromKey, []);
      }
      crossRefCache.get(fromKey)!.push(entry);

      if (!reverseCache.has(toKey)) {
        reverseCache.set(toKey, []);
      }
      reverseCache.get(toKey)!.push(entry);
    }

    console.log(`[CrossRefService] Carregadas ${crossRefCache.size} referências cruzadas`);
  } catch (err) {
    console.error('[CrossRefService] Erro ao carregar referências:', err);
  }
}

export function getCrossReferences(bookId: string, chapter: number, verse: number): CrossRefEntry[] {
  const refKey = `${bookId}.${chapter}.${verse}`;
  return crossRefCache.get(refKey) || [];
}

export function getReverseReferences(bookId: string, chapter: number, verse: number): CrossRefEntry[] {
  const refKey = `${bookId}.${chapter}.${verse}`;
  return reverseCache.get(refKey) || [];
}

export function hasCrossReference(bookId: string, chapter: number, verse: number): boolean {
  const refKey = `${bookId}.${chapter}.${verse}`;
  return crossRefCache.has(refKey) || reverseCache.has(refKey);
}