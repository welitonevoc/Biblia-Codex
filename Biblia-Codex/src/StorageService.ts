import { openDB, IDBPDatabase } from 'idb';
import { Bookmark, Note, BibleModule, Tag, Footnote, FootnoteReference, StrongsEntry, CrossReferenceGroup } from './types';

const DB_NAME = 'codex_db';
const DB_VERSION = 4; // Incremented version for footnotes system

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
        // Footnotes system - Version 4
        if (!db.objectStoreNames.contains('footnotes')) {
          db.createObjectStore('footnotes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('footnote_references')) {
          db.createObjectStore('footnote_references', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('strongs_hebrew')) {
          db.createObjectStore('strongs_hebrew', { keyPath: 'number' });
        }
        if (!db.objectStoreNames.contains('strongs_greek')) {
          db.createObjectStore('strongs_greek', { keyPath: 'number' });
        }
        if (!db.objectStoreNames.contains('cross_references')) {
          db.createObjectStore('cross_references', { keyPath: 'id' });
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

  // Footnotes
  async saveFootnote(footnote: Footnote) {
    const db = await this.dbPromise;
    await db.put('footnotes', footnote);
  }

  async saveFootnotes(footnotes: Footnote[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('footnotes', 'readwrite');
    await Promise.all(footnotes.map(f => tx.store.put(f)));
    await tx.done;
  }

  async getFootnotes(): Promise<Footnote[]> {
    const db = await this.dbPromise;
    return db.getAll('footnotes');
  }

  async getFootnotesByReference(bookId: string, chapter: number, verse: number): Promise<Footnote[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('footnotes');
    return all.filter(f => f.bookId === bookId && f.chapter === chapter && f.verse === verse);
  }

  async getFootnotesByBook(bookId: string): Promise<Footnote[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('footnotes');
    return all.filter(f => f.bookId === bookId);
  }

  async getFootnotesByType(type: string): Promise<Footnote[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('footnotes');
    return all.filter(f => f.type === type);
  }

  async deleteFootnote(id: string) {
    const db = await this.dbPromise;
    await db.delete('footnotes', id);
  }

  async clearFootnotes() {
    const db = await this.dbPromise;
    await db.clear('footnotes');
  }

  // Footnote References (one-to-many)
  async saveFootnoteReference(ref: FootnoteReference) {
    const db = await this.dbPromise;
    await db.put('footnote_references', ref);
  }

  async getFootnoteReferences(footnoteId: string): Promise<FootnoteReference[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('footnote_references');
    return all.filter(r => r.footnoteId === footnoteId);
  }

  // Strongs Hebrew
  async saveStrongsHebrew(entry: StrongsEntry) {
    const db = await this.dbPromise;
    await db.put('strongs_hebrew', entry);
  }

  async saveStrongsHebrewBatch(entries: StrongsEntry[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('strongs_hebrew', 'readwrite');
    await Promise.all(entries.map(e => tx.store.put(e)));
    await tx.done;
  }

  async getStrongsHebrew(number: string): Promise<StrongsEntry | undefined> {
    const db = await this.dbPromise;
    return db.get('strongs_hebrew', number);
  }

  async getAllStrongsHebrew(): Promise<StrongsEntry[]> {
    const db = await this.dbPromise;
    return db.getAll('strongs_hebrew');
  }

  // Strongs Greek
  async saveStrongsGreek(entry: StrongsEntry) {
    const db = await this.dbPromise;
    await db.put('strongs_greek', entry);
  }

  async saveStrongsGreekBatch(entries: StrongsEntry[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('strongs_greek', 'readwrite');
    await Promise.all(entries.map(e => tx.store.put(e)));
    await tx.done;
  }

  async getStrongsGreek(number: string): Promise<StrongsEntry | undefined> {
    const db = await this.dbPromise;
    return db.get('strongs_greek', number);
  }

  async getAllStrongsGreek(): Promise<StrongsEntry[]> {
    const db = await this.dbPromise;
    return db.getAll('strongs_greek');
  }

  // Cross References
  async saveCrossReferences(crossRef: CrossReferenceGroup) {
    const db = await this.dbPromise;
    await db.put('cross_references', crossRef);
  }

  async saveCrossReferencesBatch(crossRefs: CrossReferenceGroup[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('cross_references', 'readwrite');
    await Promise.all(crossRefs.map(c => tx.store.put(c)));
    await tx.done;
  }

  async getCrossReferences(bookId: string, chapter: number, verse: number): Promise<CrossReferenceGroup | undefined> {
    const db = await this.dbPromise;
    const all = await db.getAll('cross_references');
    return all.find(c => c.bookId === bookId && c.chapter === chapter && c.verse === verse);
  }

  async getAllCrossReferences(): Promise<CrossReferenceGroup[]> {
    const db = await this.dbPromise;
    return db.getAll('cross_references');
  }

  // Search across all content
  async searchFootnotes(query: string): Promise<Footnote[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('footnotes');
    const lowerQuery = query.toLowerCase();
    return all.filter(f => 
      f.content.toLowerCase().includes(lowerQuery) ||
      f.strongsNumber?.toLowerCase().includes(lowerQuery)
    );
  }

  async searchNotes(query: string): Promise<Note[]> {
    const db = await this.dbPromise;
    const all = await db.getAll('notes');
    const lowerQuery = query.toLowerCase();
    return all.filter(n => 
      n.content.toLowerCase().includes(lowerQuery) || 
      (n.title && n.title.toLowerCase().includes(lowerQuery))
    );
  }
}

export const storage = new StorageService();
