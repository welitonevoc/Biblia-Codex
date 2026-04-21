import { db, BookmarkEntity, NoteEntity, ReadingPlanEntity, RecentSearchEntity, SyncQueueItem } from './schema';

export const bookmarksRepo = {
  async getAll(): Promise<BookmarkEntity[]> {
    return db.bookmarks.toArray();
  },

  async getByModule(moduleId: string): Promise<BookmarkEntity[]> {
    return db.bookmarks.where('moduleId').equals(moduleId).toArray();
  },

  async add(bookmark: BookmarkEntity): Promise<string> {
    return db.bookmarks.add(bookmark) as Promise<string>;
  },

  async update(id: string, updates: Partial<BookmarkEntity>): Promise<void> {
    return db.bookmarks.update(id, updates) as Promise<void>;
  },

  async delete(id: string): Promise<void> {
    return db.bookmarks.delete(id);
  },

  async getByLocation(bookNumber: number, chapter: number, verse: number): Promise<BookmarkEntity[]> {
    return db.bookmarks
      .where('[bookNumber+chapter+verse]')
      .equals([bookNumber, chapter, verse])
      .toArray();
  },
};

export const notesRepo = {
  async getAll(): Promise<NoteEntity[]> {
    return db.notes.toArray();
  },

  async getByModuleChapter(moduleId: string, bookNumber: number, chapter: number): Promise<NoteEntity[]> {
    return db.notes
      .where('[moduleId+bookNumber+chapter]')
      .equals([moduleId, bookNumber, chapter])
      .toArray();
  },

  async add(note: NoteEntity): Promise<string> {
    return db.notes.add(note) as Promise<string>;
  },

  async update(id: string, updates: Partial<NoteEntity>): Promise<void> {
    return db.notes.update(id, updates) as Promise<void>;
  },

  async delete(id: string): Promise<void> {
    return db.notes.delete(id);
  },
};

export const readingPlansRepo = {
  async getAll(): Promise<ReadingPlanEntity[]> {
    return db.readingPlans.toArray();
  },

  async getById(id: number): Promise<ReadingPlanEntity | undefined> {
    return db.readingPlans.get(id);
  },

  async add(plan: ReadingPlanEntity): Promise<number> {
    return db.readingPlans.add(plan) as Promise<number>;
  },

  async update(id: number, updates: Partial<ReadingPlanEntity>): Promise<void> {
    return db.readingPlans.update(id, updates);
  },

  async delete(id: number): Promise<void> {
    return db.readingPlans.delete(id);
  },
};

export const searchRepo = {
  async getRecent(limit = 20): Promise<RecentSearchEntity[]> {
    return db.recentSearches
      .orderBy('searchedAt')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async add(query: string, results: number): Promise<number> {
    return db.recentSearches.add({
      query,
      results,
      searchedAt: Date.now(),
    }) as Promise<number>;
  },

  async clear(): Promise<void> {
    return db.recentSearches.clear();
  },

  async deleteOldThan(timestamp: number): Promise<void> {
    const old = await db.recentSearches
      .where('searchedAt')
      .below(timestamp)
      .primaryKeys();
    await db.recentSearches.bulkDelete(old);
  },
};

export const syncQueueRepo = {
  async getPending(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('attempts').below(3).toArray();
  },

  async getAll(): Promise<SyncQueueItem[]> {
    return db.syncQueue.toArray();
  },

  async add(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
    return db.syncQueue.add(item) as Promise<number>;
  },

  async markSynced(id: number): Promise<void> {
    return db.syncQueue.delete(id);
  },

  async incrementAttempts(id: number): Promise<void> {
    const item = await db.syncQueue.get(id);
    if (item) {
      return db.syncQueue.update(id, { attempts: item.attempts + 1 });
    }
  },

  async clear(): Promise<void> {
    return db.syncQueue.clear();
  },
};