import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  ThemeMode, ThemeConfig, AppSettings, 
  Book, Verse, BibleModule, StudyModule, DrawerContext, DictionaryEntry 
} from './types';
import { auth, db, onAuthStateChanged, User, loginWithGoogle, logout, handleRedirectResult } from './firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { dictionaryService, createAiModule } from './services/dictionaryService';
import { scanForBibleModules } from './services/moduleScanner';
import { DEFAULT_THEME_MODE, THEME_CLASSNAMES, getThemePreset, getThemeVariables, normalizeThemeMode } from './theme/presets';

interface AppContextType {
  config: ThemeConfig;
  settings: AppSettings;
  user: User | null;
  isAuthReady: boolean;
  selectedDictionaryModule: StudyModule | null;
  selectedCommentaryModule: StudyModule | null;
  selectedXrefModule: StudyModule | null;
  availableVersions: BibleModule[];
  availableDictionaries: BibleModule[];
  currentVersion: BibleModule | null;
  selectVersion: (version: BibleModule) => void;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerContext: DrawerContext;
  setDrawerContext: (ctx: DrawerContext) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setMode: (mode: ThemeMode) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setFontFamily: (family: ThemeConfig['fontFamily']) => void;
  setHorizontalMargin: (margin: number) => void;
  setAccentColor: (color: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSetting: <T extends keyof AppSettings>(section: T, key: keyof AppSettings[T]) => void;
  toggleModule: (module: keyof AppSettings['modules']) => void;
  syncNow: () => void;
  refreshModules: () => Promise<void>;
  login: () => Promise<void>;
  handleLogout: () => Promise<void>;
  setSelectedDictionaryModule: (module: StudyModule | null) => void;
  setSelectedCommentaryModule: (module: StudyModule | null) => void;
  setSelectedXrefModule: (module: StudyModule | null) => void;
  searchDictionary: (term: string) => Promise<DictionaryEntry[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedDictionaryModule, setSelectedDictionaryModule] = useState<StudyModule | null>(() => createAiModule('dictionary'));
  const [selectedCommentaryModule, setSelectedCommentaryModule] = useState<StudyModule | null>(null);
  const [selectedXrefModule, setSelectedXrefModule] = useState<StudyModule | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });
  const [drawerContext, setDrawerContext] = useState<DrawerContext>('general');
  const [activeTab, setActiveTab] = useState('home');
  const [availableVersions, setAvailableVersions] = useState<BibleModule[]>([]);
  const [availableDictionaries, setAvailableDictionaries] = useState<BibleModule[]>([]); // Added
  const [currentVersion, setCurrentVersion] = useState<BibleModule | null>(null);



  const [config, setConfig] = useState<ThemeConfig>(() => {
    const defaultPreset = getThemePreset(DEFAULT_THEME_MODE);
    const defaults: ThemeConfig = {
      mode: DEFAULT_THEME_MODE,
      fontSize: 18,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontFamily: 'Untitled Serif',
      horizontalMargin: 32,
      accentColor: defaultPreset.colors.accent,
      contrast: 1,
    };
    const saved = localStorage.getItem('kerygma-theme');
    if (!saved) return defaults;
    try {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed, mode: normalizeThemeMode(parsed.mode) };
    } catch (e) {
      return defaults;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults: AppSettings = {
      textDisplay: {
        paragraphMode: true,
        verseNumbers: true,
        wordsOfJesusRed: true,
        chapterTitles: true,
        headlines: true,
        footnotes: true,
      },
      studyTools: {
        strongsTags: false,
        strongsLinks: false,
        morphTags: false,
        interlinearMode: false,
        originalLanguages: false,
        translatorNotes: true,
        transliteration: false,
        selectedStrongsDictionary: undefined,
        selectedCommentaryDictionary: undefined,
      },
      visualResources: {
        highlights: true,
        bookmarks: true,
        crossRefs: true,
        mergeAdjacentRefs: true,
        gradientHighlight: false,
      },
      behavior: {
        bibleLinkPopup: true,
        alwaysVisible: false,
      },
      navigation: {
        navAnimation: true,
        horizontalScroll: false,
      },
      language: 'pt-BR',
      modules: {
        commentary: true,
        dictionary: true,
        xrefs: true,
      },
      ai: {
        model: 'gemini-3-flash-latest',
        language: 'pt-BR',
        autoSuggest: true,
      },
      sync: {
        enabled: false,
        status: 'idle',
      },
    };
    const saved = localStorage.getItem('kerygma-settings');
    if (!saved) return defaults;
    try {
      return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {
      return defaults;
    }
  });

  // Auth Listener
  useEffect(() => {
    // ✅ CAPACITOR: captura o usuário que retornou do fluxo de signInWithRedirect
    handleRedirectResult().catch(err =>
      console.error('Erro no redirect de autenticação:', err)
    );

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const lastRemoteSettingsRef = useRef<string>('');

  // Sync from Cloud
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const settingsStr = JSON.stringify(data.settings);
        
        // Só atualiza se for DIFERENTE do que já temos e do que enviamos
        if (data.settings && settingsStr !== lastRemoteSettingsRef.current) {
          lastRemoteSettingsRef.current = settingsStr;
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
        
        if (data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config,
            mode: normalizeThemeMode(data.config.mode),
          }));
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Sync to Cloud
  const syncToCloud = useCallback(async (newConfig: ThemeConfig, newSettings: AppSettings) => {
    if (!user) return;

    try {
      const settingsStr = JSON.stringify(newSettings);
      // Se estamos enviando o que já é igual ao que recebemos, pula
      if (settingsStr === lastRemoteSettingsRef.current) return;
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        config: newConfig,
        settings: newSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      lastRemoteSettingsRef.current = settingsStr;
    } catch (error) {
      console.error('Sync to Cloud Error:', error);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kerygma-theme', JSON.stringify(config));
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSNAMES);
    root.classList.add(config.mode);

    Object.entries(getThemeVariables(config)).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (user) {
      syncToCloud(config, settings);
    }
  }, [config, user, syncToCloud, settings]);

  useEffect(() => {
    localStorage.setItem('kerygma-settings', JSON.stringify(settings));
    if (user) {
      syncToCloud(config, settings);
    }
  }, [settings, user, syncToCloud, config]);

  const selectVersion = useCallback((version: BibleModule) => {
    setCurrentVersion(prev => {
      if (prev?.id === version.id && prev?.path === version.path) return prev;
      return version;
    });
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    const preset = getThemePreset(mode);
    setConfig(prev => ({
      ...prev,
      mode,
      accentColor: preset.colors.accent,
    }));
  }, []);
  const setFontSize = useCallback((fontSize: number) => setConfig(prev => ({ ...prev, fontSize })), []);
  const setLineHeight = useCallback((lineHeight: number) => setConfig(prev => ({ ...prev, lineHeight })), []);
  const setLetterSpacing = useCallback((letterSpacing: number) => setConfig(prev => ({ ...prev, letterSpacing })), []);
  const setFontFamily = useCallback((fontFamily: ThemeConfig['fontFamily']) => setConfig(prev => ({ ...prev, fontFamily })), []);
  const setHorizontalMargin = useCallback((horizontalMargin: number) => setConfig(prev => ({ ...prev, horizontalMargin })), []);
  const setAccentColor = useCallback((accentColor: string) => setConfig(prev => ({ ...prev, accentColor })), []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleSetting = useCallback(<T extends keyof AppSettings>(section: T, key: keyof AppSettings[T]) => {
    setSettings(prev => {
      const sectionData = prev[section] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [key]: !sectionData[key]
        }
      };
    });
  }, []);

  const toggleModule = useCallback((module: keyof AppSettings['modules']) => {
    toggleSetting('modules', module as any);
  }, [toggleSetting]);

  const syncNow = useCallback(() => {
    if (!user) return;
    setSettings(prev => ({ ...prev, sync: { ...prev.sync, status: 'syncing' } }));
    syncToCloud(config, settings).then(() => {
      setSettings(prev => ({ 
        ...prev, 
        sync: { 
          ...prev.sync, 
          status: 'idle', 
          lastSyncedAt: Date.now() 
        } 
      }));
    });
  }, [user, syncToCloud, config, settings]);

  const login = useCallback(async () => {
    await loginWithGoogle();
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  const refreshModulesRunning = useRef(false);

  const refreshModules = useCallback(async () => {
    if (refreshModulesRunning.current) return;
    refreshModulesRunning.current = true;
    try {
      const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();
      const scanned = isNative ? [] : await scanForBibleModules();
      const installedRaw = await import('./services/moduleService').then(m => m.listInstalledModules());
      
      const allInstalled: BibleModule[] = installedRaw.map(m => ({
        id: m.id,
        name: m.name,
        abbreviation: m.abbreviation,
        type: m.category as any,
        format: m.format === 'other' ? 'mybible' : m.format as any,
        category: 'mybible',
        path: m.path,
        language: m.language,
        author: m.author,
        fileSize: m.size
      }));

      const unified = [...allInstalled];
      scanned.forEach(s => {
        if (!unified.find(u => u.id === s.id)) unified.push(s);
      });

      const bibles = unified.filter(m => m.type === 'bible');
      const dictionaries = unified.filter(m => m.type === 'dictionary');

      // Só atualiza se o conteúdo realmente mudou (evita re-renders desnecessários)
      setAvailableVersions(prev => {
        if (prev.length === bibles.length && prev.every((v, i) => v.id === bibles[i].id && v.path === bibles[i].path)) {
          return prev;
        }
        return bibles;
      });
      setAvailableDictionaries(prev => {
        if (prev.length === dictionaries.length && prev.every((d, i) => d.id === dictionaries[i].id && d.path === dictionaries[i].path)) {
          return prev;
        }
        return dictionaries;
      });

      // Seleciona versão apenas se ainda não há uma selecionada
      setCurrentVersion(prev => {
        if (prev) return prev;
        return bibles.length > 0 ? bibles[0] : null;
      });
    } catch (error) {
      console.error("Erro ao atualizar módulos:", error);
    } finally {
      refreshModulesRunning.current = false;
    }
  }, []);

  useEffect(() => {
    refreshModules();
  }, [refreshModules]);

  const handleSetSelectedDictionaryModule = useCallback((module: StudyModule | null) => {
    setSelectedDictionaryModule(module);
    if (module) {
      updateSettings({
        studyTools: {
          ...settings.studyTools,
          selectedStrongsDictionary: module.id === 'ai_assistant' ? 'ai' : module.path
        }
      });
    }
  }, [settings.studyTools, updateSettings]);

  useEffect(() => {
    if (availableDictionaries.length > 0) {
      const savedPath = settings.studyTools.selectedStrongsDictionary;
      if (savedPath && savedPath !== 'ai') {
        const found = availableDictionaries.find(d => d.path === savedPath || d.path.endsWith(savedPath));
        if (found) {
          setSelectedDictionaryModule(found as any);
        }
      }
    }
  }, [availableDictionaries, settings.studyTools.selectedStrongsDictionary]);

  const searchDictionary = useCallback(async (term: string) => {
    return dictionaryService.getEntries(term, selectedDictionaryModule);
  }, [selectedDictionaryModule]);

  const contextValue = React.useMemo(() => ({ 
    config, 
    settings, 
    user,
    isAuthReady,
    selectedDictionaryModule,
    availableVersions,
    availableDictionaries,
    currentVersion,
    selectVersion,
    setMode, 
    setFontSize, 
    setLineHeight, 
    setLetterSpacing,
    setFontFamily,
    setHorizontalMargin,
    setAccentColor,
    updateSettings,
    toggleSetting,
    toggleModule,
    syncNow,
    refreshModules,
    login,
    handleLogout,
    setSelectedDictionaryModule: handleSetSelectedDictionaryModule,
    selectedCommentaryModule,
    setSelectedCommentaryModule,
    selectedXrefModule,
    setSelectedXrefModule,
    isDrawerOpen,
    setDrawerOpen,
    drawerContext,
    setDrawerContext,
    activeTab,
    setActiveTab,
    searchDictionary
  }), [
    config, settings, user, isAuthReady, selectedDictionaryModule,
    availableVersions, availableDictionaries, currentVersion, selectVersion, setMode,
    setFontSize, setLineHeight, setLetterSpacing, setFontFamily,
    setHorizontalMargin, setAccentColor, updateSettings, toggleSetting,
    toggleModule, syncNow, refreshModules, login, handleLogout,
    handleSetSelectedDictionaryModule, selectedCommentaryModule, setSelectedCommentaryModule,
    selectedXrefModule, setSelectedXrefModule, 
    isDrawerOpen, setDrawerOpen, drawerContext, setDrawerContext,
    activeTab, setActiveTab,
    searchDictionary
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
