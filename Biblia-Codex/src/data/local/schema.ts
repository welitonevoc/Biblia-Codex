/**
 * schema.ts - Schema Dexie.js para Biblia Codex
 * Define todas as tabelas do banco IndexedDB local
 */

import Dexie, { Table } from 'dexie';

// ==================== TIPOS ====================

export interface BibleModule {
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

export interface Verse {
  id?: number;
  moduleId: number;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  normalizedText: string;
}

export interface Bookmark {
  id?: number;
  moduleId: number;
  bookNumber: number;
  chapter: number;
  verse: number;
  note?: string;
  createdAt: number;
  syncedAt?: number;
}

export interface Note {
  id?: number;
  moduleId: number;
  bookNumber: number;
  chapter: number;
  verses: string; // "1-5,10"
  content: string;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
}

export interface ReadingPlan {
  id?: number;
  name: string;
  description: string;
  days: number;
  progress: number;
  startedAt: number;
  lastReadAt?: number;
}

export interface RecentSearch {
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

export interface AICacheEntry {
  id?: number;
  cacheKey: string;
  prompt: string;
  response: string;
  provider: string;
  model: string;
  theologicalProfile?: string;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  tokenCount?: number;
  expiresAt?: number;
}

// ==================== BANCO DE DADOS ====================

export class BibleDatabase extends Dexie {
  bibleModules!: Table<BibleModule, number>;
  verses!: Table<Verse, number>;
  bookmarks!: Table<Bookmark, number>;
  notes!: Table<Note, number>;
  readingPlans!: Table<ReadingPlan, number>;
  recentSearches!: Table<RecentSearch, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  aiCache!: Table<AICacheEntry, number>;

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

    // Versão 2: adiciona tabela aiCache
    this.version(2).stores({
      bibleModules: '++id, &moduleKey, name, abbreviation, lastUsed',
      verses: '++id, moduleId, [moduleId+bookNumber+chapter+verse]',
      bookmarks: '++id, moduleId, [moduleId+bookNumber+chapter+verse], createdAt',
      notes: '++id, moduleId, [moduleId+bookNumber+chapter], createdAt',
      readingPlans: '++id, name, progress',
      recentSearches: '++id, query, searchedAt',
      syncQueue: '++id, type, createdAt',
      aiCache: '++id, cacheKey, provider, theologicalProfile, timestamp, lastAccessed',
    });
  }
}

// ==================== INSTÂNCIA ====================

export const db = new BibleDatabase();

// ==================== UTILITÁRIOS ====================

/**
 * Limpa todo o banco (úsalo com cuidado!)
 */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.bibleModules.clear(),
    db.verses.clear(),
    db.bookmarks.clear(),
    db.notes.clear(),
    db.readingPlans.clear(),
    db.recentSearches.clear(),
    db.syncQueue.clear(),
    db.aiCache.clear(),
  ]);
}

/**
 * Obtém estatísticas do banco
 */
export async function getDatabaseStats(): Promise<{
  modules: number;
  verses: number;
  bookmarks: number;
  notes: number;
  readingPlans: number;
  recentSearches: number;
  syncQueue: number;
  aiCache: number;
}> {
  const [
    modules,
    verses,
    bookmarks,
    notes,
    readingPlans,
    recentSearches,
    syncQueue,
    aiCache,
  ] = await Promise.all([
    db.bibleModules.count(),
    db.verses.count(),
    db.bookmarks.count(),
    db.notes.count(),
    db.readingPlans.count(),
    db.recentSearches.count(),
    db.syncQueue.count(),
    db.aiCache.count(),
  ]);

  return {
    modules,
    verses,
    bookmarks,
    notes,
    readingPlans,
    recentSearches,
    syncQueue,
    aiCache,
  };
}

/**
 * Fecha a conexão com o banco
 */
export function closeDatabase(): void {
  db.close();
}

/**
 * Deleta todo o banco (úsalo para reset completo)
 */
export async function deleteDatabase(): Promise<void> {
  await db.delete();
}
