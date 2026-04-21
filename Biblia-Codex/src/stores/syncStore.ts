import { create } from 'zustand';
import { syncQueueRepo } from '../data/local/repository';

interface SyncState {
  pendingItems: number;
  isSyncing: boolean;
  lastSyncAt: number | null;
  error: string | null;
  syncInProgress: string | null;
  loadPending: () => Promise<void>;
  addToQueue: (item: { type: 'bookmark' | 'note' | 'readingPlan'; action: 'create' | 'update' | 'delete'; data: string }) => Promise<void>;
  syncAll: () => Promise<void>;
  clearError: () => void;
}

export const useSyncStore = create<SyncState>()((set, get) => ({
  pendingItems: 0,
  isSyncing: false,
  lastSyncAt: null,
  error: null,
  syncInProgress: null,

  loadPending: async () => {
    const items = await syncQueueRepo.getPending();
    set({ pendingItems: items.length });
  },

  addToQueue: async (item) => {
    await syncQueueRepo.add({
      ...item,
      createdAt: Date.now(),
      attempts: 0,
    });
    await get().loadPending();
  },

  syncAll: async () => {
    const items = await syncQueueRepo.getPending();
    if (items.length === 0) return;

    set({ isSyncing: true, error: null });

    for (const item of items) {
      set({ syncInProgress: item.type });
      try {
        switch (item.type) {
          case 'bookmark':
            // await syncBookmark(JSON.parse(item.data));
            break;
          case 'note':
            // await syncNote(JSON.parse(item.data));
            break;
          case 'readingPlan':
            // await syncReadingPlan(JSON.parse(item.data));
            break;
        }
        await syncQueueRepo.markSynced(item.id!);
      } catch (error) {
        await syncQueueRepo.incrementAttempts(item.id!);
        set({ error: (error as Error).message });
      }
    }

    set({
      isSyncing: false,
      lastSyncAt: Date.now(),
      syncInProgress: null,
    });
    await get().loadPending();
  },

  clearError: () => set({ error: null }),
}));