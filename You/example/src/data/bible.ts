export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
}

export interface Verse {
  number: number;
  text: string;
}

export interface VerseSearchResult extends Verse {
  bookId: string;
  bookName: string;
  chapter: number;
}

const BOOKS: BibleBook[] = [
  { id: "GEN", name: "Genesis", chapters: 2 },
  { id: "PSA", name: "Psalms", chapters: 2 },
  { id: "JHN", name: "John", chapters: 2 },
];

const CHAPTERS: Record<string, string[]> = {
  "GEN-1": [
    "In the beginning God created the heavens and the earth.",
    "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.",
    "And God said, Let there be light, and there was light.",
    "God saw that the light was good, and he separated the light from the darkness.",
    "God called the light day, and the darkness he called night.",
  ],
  "GEN-2": [
    "Thus the heavens and the earth were completed in all their vast array.",
    "By the seventh day God had finished the work he had been doing.",
    "Then God blessed the seventh day and made it holy.",
    "This is the account of the heavens and the earth when they were created.",
    "The Lord God formed a man from the dust of the ground.",
  ],
  "PSA-1": [
    "Blessed is the one who does not walk in step with the wicked.",
    "But whose delight is in the law of the Lord, and who meditates on his law day and night.",
    "That person is like a tree planted by streams of water, which yields its fruit in season.",
    "Not so the wicked. They are like chaff that the wind blows away.",
    "For the Lord watches over the way of the righteous.",
  ],
  "PSA-2": [
    "Why do the nations conspire and the peoples plot in vain?",
    "The kings of the earth rise up and the rulers band together against the Lord.",
    "The One enthroned in heaven laughs; the Lord scoffs at them.",
    "I have installed my king on Zion, my holy mountain.",
    "Blessed are all who take refuge in him.",
  ],
  "JHN-1": [
    "In the beginning was the Word, and the Word was with God, and the Word was God.",
    "He was with God in the beginning.",
    "Through him all things were made; without him nothing was made that has been made.",
    "In him was life, and that life was the light of all mankind.",
    "The light shines in the darkness, and the darkness has not overcome it.",
  ],
  "JHN-2": [
    "On the third day a wedding took place at Cana in Galilee.",
    "Jesus mother was there, and Jesus and his disciples had also been invited to the wedding.",
    "When the wine was gone, Jesus mother said to him, They have no more wine.",
    "Jesus said, My hour has not yet come.",
    "His mother said to the servants, Do whatever he tells you.",
  ],
};

const ORDERED_REFERENCES: Array<{ bookId: string; chapter: number; verse: number }> =
  Object.entries(CHAPTERS).flatMap(([reference, verses]) => {
    const [bookId, chapterRaw] = reference.split("-");
    const chapter = Number(chapterRaw);
    return verses.map((_, index) => ({
      bookId,
      chapter,
      verse: index + 1,
    }));
  });

function getBookById(bookId: string): BibleBook {
  const book = BOOKS.find((candidate) => candidate.id === bookId);
  if (!book) {
    throw new Error(`Unknown book id: ${bookId}`);
  }
  return book;
}

export function getBooks(): BibleBook[] {
  return BOOKS;
}

export function getChapterVerses(bookId: string, chapter: number): Verse[] {
  const key = `${bookId}-${chapter}`;
  const texts = CHAPTERS[key] ?? [];
  return texts.map((text, index) => ({ number: index + 1, text }));
}

export function searchVerses(query: string): VerseSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return Object.entries(CHAPTERS).flatMap(([reference, verses]) => {
    const [bookId, chapterRaw] = reference.split("-");
    const chapter = Number(chapterRaw);
    const book = getBookById(bookId);

    return verses
      .map((text, index) => ({
        number: index + 1,
        text,
        bookId,
        bookName: book.name,
        chapter,
      }))
      .filter((verse) => verse.text.toLowerCase().includes(normalized));
  });
}

export function getVerseOfTheDay(date = new Date()): VerseSearchResult {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const reference = ORDERED_REFERENCES[dayIndex % ORDERED_REFERENCES.length];
  const book = getBookById(reference.bookId);
  const chapterVerses = getChapterVerses(reference.bookId, reference.chapter);
  const verse = chapterVerses[reference.verse - 1];

  return {
    number: verse.number,
    text: verse.text,
    bookId: reference.bookId,
    bookName: book.name,
    chapter: reference.chapter,
  };
}
