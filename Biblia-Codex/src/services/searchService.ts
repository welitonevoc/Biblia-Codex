import { db } from '../data/local/schema';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'codex_search_index';
const STORE_NAME = 'search_index';

interface SearchIndexEntry {
  id: string;
  moduleId: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  normalizedText: string;
}

let searchDB: IDBPDatabase | null = null;

async function getSearchDB(): Promise<IDBPDatabase> {
  if (!searchDB) {
    searchDB = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('moduleId', 'moduleId', { unique: false });
          store.createIndex('normalizedText', 'normalizedText', { unique: false });
          store.createIndex('moduleBookChapter', ['moduleId', 'bookNumber', 'chapter'], { unique: false });
        }
      },
    });
  }
  return searchDB;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function indexChapter(
  moduleId: string,
  bookNumber: number,
  chapter: number,
  verses: { verse: number; text: string }[]
): Promise<void> {
  const database = await getSearchDB();
  const tx = database.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const v of verses) {
    const id = `${moduleId}_${bookNumber}_${chapter}_${v.verse}`;
    await store.put({
      id,
      moduleId,
      bookNumber,
      chapter,
      verse: v.verse,
      text: v.text,
      normalizedText: normalizeText(v.text),
    });
  }

  await tx.done;
}

export async function searchVerses(
  query: string,
  options?: {
    moduleId?: string;
    bookNumber?: number;
    limit?: number;
  }
): Promise<SearchIndexEntry[]> {
  const database = await getSearchDB();
  const normalized = normalizeText(query);

  if (!normalized) return [];

  let index = STORE_NAME;
  let results: SearchIndexEntry[] = [];

  const allEntries = await database.getAll(index);
  const searchTerms = normalized.split(' ').filter(Boolean);

  for (const entry of allEntries) {
    const matchScore = searchTerms.filter(term =>
      entry.normalizedText.includes(term)
    ).length;

    if (matchScore > 0) {
      results.push({ ...entry, text: `score:${matchScore}` } as SearchIndexEntry);
    }
  }

  results = results
    .sort((a, b) => {
      const scoreA = parseInt(a.text.split(':')[1]) || 0;
      const scoreB = parseInt(b.text.split(':')[1]) || 0;
      return scoreB - scoreA;
    })
    .map(({ text, ...rest }) => rest as SearchIndexEntry);

  if (options?.moduleId) {
    results = results.filter(r => r.moduleId === options.moduleId);
  }

  if (options?.bookNumber) {
    results = results.filter(r => r.bookNumber === options.bookNumber);
  }

  const limit = options?.limit || 50;
  return results.slice(0, limit);
}

export async function clearSearchIndex(): Promise<void> {
  const database = await getSearchDB();
  await database.clear(STORE_NAME);
}

export async function getIndexedChapters(moduleId: string): Promise<number[]> {
  const database = await getSearchDB();
  const all = await database.getAll(STORE_NAME);

  const chapters = new Set<number>();
  for (const entry of all) {
    if (entry.moduleId === moduleId) {
      chapters.add(entry.chapter);
    }
  }

  return Array.from(chapters).sort((a, b) => a - b);
}

export function isSearchIndexReady(): Promise<boolean> {
  return getSearchDB()
    .then(db => db.count(STORE_NAME))
    .then(count => count > 0)
    .catch(() => false);
}