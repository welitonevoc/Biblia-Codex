import { BIBLE_BOOKS } from '../data/bibleMetadata';

/**
 * Regex to find Bible references in text.
 * Matches formats like:
 * - João 3:16
 * - 1 Crônicas 4.8
 * - Gn 1:1
 * - 1Sm 2.1-5
 */
export function getBibleReferenceRegex(): RegExp {
  const bookPatterns = BIBLE_BOOKS.flatMap(book => {
    const patterns = [book.name, book.abbreviation];
    // Add variations like "1 Cr" instead of "1Cr"
    if (/^\d[A-ZÀ-Ú]/.test(book.abbreviation)) {
       patterns.push(`${book.abbreviation[0]} ${book.abbreviation.substring(1)}`);
    }
    if (/^\d\s/.test(book.name)) {
       // already handled by book.name
    }
    return patterns;
  })
  .sort((a, b) => b.length - a.length) // Longest first to avoid partial matches
  .map(p => p.replace('.', '\\.'));

  const bookGroup = `(${bookPatterns.join('|')})`;
  // Reference: Book [space] Chapter [:.] Verse [- Verse]
  return new RegExp(`${bookGroup}\\s+(\\d+)[:.](\\d+)(?:-\\d+)?`, 'gi');
}

/**
 * Normalizes a found reference to a standard BOOK CHAPTER:VERSE format
 */
export function normalizeReference(bookStr: string, chapter: string, verse: string): { bookId: string; chapter: number; verse: number } | null {
  const normalizedBook = bookStr.replace(/\s+/g, '').toLowerCase();
  const book = BIBLE_BOOKS.find(b => 
    b.name.replace(/\s+/g, '').toLowerCase() === normalizedBook ||
    b.abbreviation.replace(/\s+/g, '').toLowerCase() === normalizedBook ||
    b.id.toLowerCase() === normalizedBook
  );

  if (!book) return null;

  return {
    bookId: book.id,
    chapter: parseInt(chapter),
    verse: parseInt(verse)
  };
}
