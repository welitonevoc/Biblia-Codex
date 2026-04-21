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
  availableOnline: LibraryModule[];
  isLoading: boolean;
  downloadProgress: Record<string, number>;
  setInstalledModules: (modules: LibraryModule[]) => void;
  setSelectedModule: (key: string | null) => void;
  setAvailableOnline: (modules: LibraryModule[]) => void;
  addModule: (module: LibraryModule) => void;
  removeModule: (key: string) => void;
  setDownloadProgress: (key: string, progress: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  installedModules: [],
  selectedModuleKey: null,
  availableOnline: [],
  isLoading: false,
  downloadProgress: {},

  setInstalledModules: (installedModules) => set({ installedModules }),

  setSelectedModule: (selectedModuleKey) => set({ selectedModuleKey }),

  setAvailableOnline: (availableOnline) => set({ availableOnline }),

  addModule: (module) =>
    set((state) => ({
      installedModules: [...state.installedModules, module],
    })),

  removeModule: (key) =>
    set((state) => ({
      installedModules: state.installedModules.filter((m) => m.key !== key),
    })),

  setDownloadProgress: (key, progress) =>
    set((state) => ({
      downloadProgress: {
        ...state.downloadProgress,
        [key]: progress,
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));