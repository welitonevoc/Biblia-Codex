import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { getDataUrl } from '../utils/dataAssets';

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
  const match = ref.match(/^([A-Za-z0-9]+)\.(\d+)\.(\d+)(?:-(\d+))?$/);
  if (!match) return null;

  const [, bookName, chapter, verse, endVerse] = match;

  const OBIB_ABBR_TO_BOOK: Record<string, string> = {
    gen: 'GEN', exod: 'EXO', lev: 'LEV', num: 'NUM', deut: 'DEU',
    josh: 'JOS', judg: 'JDG', ruth: 'RUT',
    '1sam': '1SA', '2sam': '2SA', '1kgs': '1KI', '2kgs': '2KI',
    '1chr': '1CH', '2chr': '2CH', ezra: 'EZR', neh: 'NEH', esth: 'EST',
    job: 'JOB', ps: 'PSA', prov: 'PRO', eccl: 'ECC', song: 'SNG',
    isa: 'ISA', jer: 'JER', lam: 'LAM', ezek: 'EZK', dan: 'DAN',
    hos: 'HOS', joel: 'JOE', amos: 'AMO', obad: 'OBA', jonah: 'JON',
    mic: 'MIC', nah: 'NAH', hab: 'HAB', zeph: 'ZEP', hag: 'HAG',
    zech: 'ZEC', mal: 'MAL',
    matt: 'MAT', mark: 'MRK', luke: 'LUK', john: 'JHN', acts: 'ACT',
    rom: 'ROM', '1cor': '1CO', '2cor': '2CO', gal: 'GAL', eph: 'EPH',
    phil: 'PHP', col: 'COL', '1thess': '1TH', '2thess': '2TH',
    '1tim': '1TI', '2tim': '2TI', titus: 'TIT', phlm: 'PHM',
    heb: 'HEB', jas: 'JAS', '1pet': '1PE', '2pet': '2PE',
    '1john': '1JN', '2john': '2JN', '3john': '3JN', jude: 'JUD', rev: 'REV',
  };

  const key = bookName.toLowerCase();
  const bookId = OBIB_ABBR_TO_BOOK[key] || BIBLE_BOOKS.find(b => b.id.toLowerCase() === key)?.id;
  if (!bookId) return null;

  return {
    bookId,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    endVerse: endVerse ? parseInt(endVerse) : undefined
  };
}

function verseRefToKey(ref: VerseRef): string {
  return `${ref.bookId}.${ref.chapter}.${ref.verse}`;
}

export async function loadCrossReferences(): Promise<void> {
  if (crossRefCache.size > 0) return;

  try {
    const url = getDataUrl('cross_references.txt');
    const response = await fetch(url);
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

      const fromKey = verseRefToKey(fromRef);
      const toKey = verseRefToKey(toRef);

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