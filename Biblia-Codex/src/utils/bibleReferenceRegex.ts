import { BIBLE_BOOKS } from '../data/bibleMetadata';

/**
 * Regex to find Bible references in text.
 * Matches formats like:
 * - Joao 3:16
 * - 1 Cronicas 4.8
 * - Gn 1:1
 * - 1Sm 2.1-5
 */
export function getBibleReferenceRegex(): RegExp {
  const bookPatterns = BIBLE_BOOKS.flatMap((book) => {
    const patterns = [book.name, book.abbreviation].filter((pattern): pattern is string => Boolean(pattern));
    if (book.abbreviation && /^\d[A-ZÀ-Ú]/.test(book.abbreviation)) {
      patterns.push(`${book.abbreviation[0]} ${book.abbreviation.substring(1)}`);
    }
    return patterns;
  })
    .sort((a, b) => b.length - a.length)
    .map((pattern) => pattern.replace('.', '\\.'));

  const bookGroup = `(${bookPatterns.join('|')})`;
  return new RegExp(`${bookGroup}\\s+(\\d+)[:.](\\d+)(?:-\\d+)?`, 'gi');
}

/**
 * Normalizes a found reference to a standard BOOK CHAPTER:VERSE format.
 */
export function normalizeReference(bookStr: string, chapter: string, verse: string): { bookId: string; chapter: number; verse: number } | null {
  const normalizedBook = bookStr.replace(/\s+/g, '').toLowerCase();
  const book = BIBLE_BOOKS.find((candidate) =>
    candidate.name.replace(/\s+/g, '').toLowerCase() === normalizedBook ||
    candidate.abbreviation?.replace(/\s+/g, '').toLowerCase() === normalizedBook ||
    candidate.id.toLowerCase() === normalizedBook
  );

  if (!book) return null;

  return {
    bookId: book.id,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
  };
}
