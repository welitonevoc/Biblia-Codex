import { describe, it, expect, vi, afterEach } from 'vitest';
import { storage } from './StorageService';

vi.mock('idb', () => {
  const mockDB = {
    getAll: vi.fn(() => Promise.resolve([])),
    get: vi.fn(() => Promise.resolve(null)),
    put: vi.fn(() => Promise.resolve(undefined)),
    delete: vi.fn(() => Promise.resolve(undefined)),
    objectStoreNames: { contains: vi.fn(() => false) },
  };
  return {
    openDB: vi.fn(() => Promise.resolve(mockDB)),
  };
});

describe('StorageService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getBookmarks', () => {
    it('should return array of bookmarks', async () => {
      const bookmarks = await storage.getBookmarks();
      expect(Array.isArray(bookmarks)).toBe(true);
    });
  });

  describe('getTags', () => {
    it('should return array of tags', async () => {
      const tags = await storage.getTags();
      expect(Array.isArray(tags)).toBe(true);
    });
  });

  describe('getNotes', () => {
    it('should return array of notes', async () => {
      const notes = await storage.getNotes();
      expect(Array.isArray(notes)).toBe(true);
    });
  });

  describe('getModules', () => {
    it('should return array of modules', async () => {
      const modules = await storage.getModules();
      expect(Array.isArray(modules)).toBe(true);
    });
  });

  describe('getDictionaryHistory', () => {
    it('should return array of history', async () => {
      const history = await storage.getDictionaryHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getDictionaryCache', () => {
    it('should return null for non-cached term', async () => {
      const cache = await storage.getDictionaryCache('teste');
      expect(cache).toBeNull();
    });
  });
});