import Dexie, { Table } from 'dexie';

export interface BibleModuleEntity {
  id?: number;
  moduleKey: string;
  name: string;
  abbreviation: string;
  language: string;
  version: string;
  description: string;
  lastUsed?: number;
  installedAt: number;
}

export interface VerseEntity {
  id?: number;
  moduleId: number;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  normalizedText?: string;
}

export interface BookmarkEntity {
  id: string;
  moduleId: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  text?: string;
  label?: string;
  color?: string;
  tags: string[];
  createdAt: number;
}

export interface NoteEntity {
  id: string;
  moduleId: string;
  bookNumber: number;
  chapter: number;
  verses: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingPlanEntity {
  id?: number;
  name: string;
  description: string;
  days: number;
  progress: number;
  startedAt: number;
  lastReadAt?: number;
}

export interface RecentSearchEntity {
  id?: number;
  query: string;
  results: number;
  searchedAt: number;
}

export interface SyncQueueItem {
  id?: number;
  type: 'bookmark' | 'note' | 'readingPlan';
  action: 'create' | 'update' | 'delete';
  data: string;
  createdAt: number;
  attempts: number;
}

export class BibleDatabase extends Dexie {
  bibleModules!: Table<BibleModuleEntity>;
  verses!: Table<VerseEntity>;
  bookmarks!: Table<BookmarkEntity>;
  notes!: Table<NoteEntity>;
  readingPlans!: Table<ReadingPlanEntity>;
  recentSearches!: Table<RecentSearchEntity>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('BibliaCodexDB');
    this.version(1).stores({
      bibleModules: '++id, &moduleKey, name, abbreviation, lastUsed',
      verses: '++id, moduleId, [moduleId+bookNumber+chapter+verse]',
      bookmarks: '++id, moduleId, [moduleId+bookNumber+chapter+verse], createdAt',
      notes: '++id, moduleId, [moduleId+bookNumber+chapter], createdAt',
      readingPlans: '++id, name, progress',
      recentSearches: '++id, query, searchedAt',
      syncQueue: '++id, type, createdAt',
    });
  }
}

export const db = new BibleDatabase();