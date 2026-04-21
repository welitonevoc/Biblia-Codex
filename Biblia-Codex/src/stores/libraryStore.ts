import { create } from 'zustand';

export interface LibraryModule {
  key: string;
  name: string;
  abbreviation: string;
  language: string;
  version?: string;
  description?: string;
  hasAudio: boolean;
}

interface LibraryState {
  installedModules: LibraryModule[];
  selectedModuleKey: string | null;
  currentBook: number;
  currentChapter: number;
  isLoading: boolean;
  error: string | null;
  setInstalledModules: (modules: LibraryModule[]) => void;
  setSelectedModule: (key: string | null) => void;
  setCurrentLocation: (book: number, chapter: number) => void;
  addModule: (module: LibraryModule) => void;
  removeModule: (key: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  installedModules: [],
  selectedModuleKey: null,
  currentBook: 1,
  currentChapter: 1,
  isLoading: false,
  error: null,

  setInstalledModules: (installedModules) => set({ installedModules }),
  setSelectedModule: (selectedModuleKey) => set({ selectedModuleKey }),
  setCurrentLocation: (currentBook, currentChapter) =>
    set({ currentBook, currentChapter }),
  addModule: (module_) =>
    set((s) => ({
      installedModules: [...s.installedModules, module_],
    })),
  removeModule: (key) =>
    set((s) => ({
      installedModules: s.installedModules.filter((m) => m.key !== key),
      selectedModuleKey: s.selectedModuleKey === key ? null : s.selectedModuleKey,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Selector for current module only
export const useCurrentModule = () =>
  useLibraryStore((s) => s.installedModules.find((m) => m.key === s.selectedModuleKey));