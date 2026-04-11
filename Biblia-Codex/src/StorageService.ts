import { openDB, IDBPDatabase } from 'idb';
import { Bookmark, Note, BibleModule, Tag } from './types';

const DB_NAME = 'codex_db';
const DB_VERSION = 3; // Incremented version to add tags store

class StorageService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('modules')) {
          db.createObjectStore('modules', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('dictionary_history')) {
          db.createObjectStore('dictionary_history', { keyPath: 'term' });
        }
        if (!db.objectStoreNames.contains('dictionary_cache')) {
          db.createObjectStore('dictionary_cache', { keyPath: 'term' });
        }
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' });
        }
      },
    });
  }

  // Dictionary History
  async saveDictionaryHistory(term: string) {
    const db = await this.dbPromise;
    await db.put('dictionary_history', { term, timestamp: Date.now() });
  }

  async getDictionaryHistory(): Promise<{ term: string, timestamp: number }[]> {
    const db = await this.dbPromise;
    const history = await db.getAll('dictionary_history');
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Dictionary Cache
  async saveDictionaryCache(term: string, definition: string, moduleName: string) {
    const db = await this.dbPromise;
    await db.put('dictionary_cache', { term, definition, moduleName, timestamp: Date.now() });
  }

  async getDictionaryCache(term: string): Promise<{ term: string, definition: string, moduleName: string } | null> {
    const db = await this.dbPromise;
    return db.get('dictionary_cache', term);
  }

  // Bookmarks
  async saveBookmark(bookmark: Bookmark) {
    const db = await this.dbPromise;
    await db.put('bookmarks', bookmark);
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const db = await this.dbPromise;
    return db.getAll('bookmarks');
  }

  async deleteBookmark(id: string) {
    const db = await this.dbPromise;
    await db.delete('bookmarks', id);
  }

  // Tags
  async saveTag(tag: Tag) {
    const db = await this.dbPromise;
    await db.put('tags', tag);
  }

  async getTags(): Promise<Tag[]> {
    const db = await this.dbPromise;
    return db.getAll('tags');
  }

  async deleteTag(id: string) {
    const db = await this.dbPromise;
    await db.delete('tags', id);
  }

  // Notes
  async saveNote(note: Note) {
    const db = await this.dbPromise;
    await db.put('notes', note);
  }

  async getNotes(): Promise<Note[]> {
    const db = await this.dbPromise;
    return db.getAll('notes');
  }

  async deleteNote(id: string) {
    const db = await this.dbPromise;
    await db.delete('notes', id);
  }

  // Modules
  async saveModule(module: BibleModule) {
    const db = await this.dbPromise;
    await db.put('modules', module);
  }

  async getModules(): Promise<BibleModule[]> {
    const db = await this.dbPromise;
    return db.getAll('modules');
  }
}

export const storage = new StorageService();
