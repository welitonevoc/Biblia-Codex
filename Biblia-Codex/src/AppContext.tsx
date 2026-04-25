import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ThemeMode, ThemeConfig, AppSettings, AppSettingsKey, TextDisplayKey, StudyToolsKey, VisualResourcesKey, BehaviorKey, NavigationKey, AnimationKey, AiKey,
  Book, Verse, BibleModule, DrawerContext, DictionaryEntry, UIGeometry, NavigationStyle, FontPreference,
  AnimationStyle, AnimationIntensity, AnimationSpeed, LightingEffect, PageTransition, ModuleInfo, CapacitorWindow, ModuleType
} from './types';
import { auth, db, onAuthStateChanged, User, loginWithGoogle, logout, handleRedirectResult, doc, setDoc, onSnapshot, serverTimestamp } from './firebase';
import { dictionaryService, createAiModule } from './services/dictionaryService';
import { scanForBibleModules } from './services/moduleScanner';
import { listInstalledModules } from './services/moduleService';
import { DEFAULT_THEME_MODE, THEME_CLASSNAMES, getThemePreset, getThemeVariables, normalizeThemeMode } from './theme/presets';

interface AppContextType {
  config: ThemeConfig;
  settings: AppSettings;
  user: User | null;
  isAuthReady: boolean;
  selectedDictionaryModule: BibleModule | null;
  selectedCommentaryModule: BibleModule | null;
  selectedXrefModule: BibleModule | null;
  availableVersions: BibleModule[];
  availableDictionaries: BibleModule[];
  availableModules: ModuleInfo[];
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
  setUIGeometry: (geometry: UIGeometry) => void;
  setNavigationStyle: (style: NavigationStyle) => void;
  setFontPreference: (preference: FontPreference) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSetting: <T extends keyof AppSettings>(section: T, key: keyof AppSettings[T]) => void;
  toggleModule: (module: keyof AppSettings['modules']) => void;
  setAnimationStyle: (style: AnimationStyle) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  setLightingEffect: (lighting: LightingEffect) => void;
  setPageTransition: (transition: PageTransition) => void;
  toggleGlow: () => void;
  toggleParticles: () => void;
  syncNow: () => void;
  refreshModules: () => Promise<void>;
  login: () => Promise<void>;
  handleLogout: () => Promise<void>;
  setSelectedDictionaryModule: (module: BibleModule | null) => void;
  setSelectedCommentaryModule: (module: BibleModule | null) => void;
  setSelectedXrefModule: (module: BibleModule | null) => void;
  searchDictionary: (term: string) => Promise<DictionaryEntry[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VALID_GEOMETRIES: UIGeometry[] = ['sharp', 'soft', 'pill', 'minimal', 'geometric', 'premium', 'circle', 'soft-square', 'glass', 'neon', 'brutal', 'elegant', 'cyber', 'vintage'];
const VALID_NAV_STYLES: NavigationStyle[] = ['floating', 'asymmetric', 'bottom', 'sidebar', 'top', 'hybrid', 'compact', 'dock', 'minimal'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedDictionaryModule, setSelectedDictionaryModule] = useState<BibleModule | null>(() => {
    const aiModule = createAiModule('dictionary');
    return {
      ...aiModule,
      type: 'dictionary' as ModuleType,
      format: 'sqlite' as const,
      category: 'mybible' as const,
      isVirtual: true
    };
  });
  const [selectedCommentaryModule, setSelectedCommentaryModule] = useState<BibleModule | null>(null);
  const [selectedXrefModule, setSelectedXrefModule] = useState<BibleModule | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });
  const [drawerContext, setDrawerContext] = useState<DrawerContext>('general');
  const [activeTab, setActiveTab] = useState('home');
  const [availableVersions, setAvailableVersions] = useState<BibleModule[]>([]);
  const [availableDictionaries, setAvailableDictionaries] = useState<BibleModule[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleInfo[]>([]);
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
      uiGeometry: 'soft',
      navigationStyle: 'bottom',
      fontPreference: 'serif',
    };
    const saved = localStorage.getItem('codex-theme');
    if (!saved) return defaults;
    try {
      const parsed = JSON.parse(saved);
      const normalized = { ...defaults, ...parsed, mode: normalizeThemeMode(parsed.mode) };
      if (parsed.uiGeometry && !VALID_GEOMETRIES.includes(parsed.uiGeometry as UIGeometry)) {
        normalized.uiGeometry = 'soft';
      }
      if (parsed.navigationStyle && !VALID_NAV_STYLES.includes(parsed.navigationStyle as NavigationStyle)) {
        normalized.navigationStyle = 'bottom';
      }
      return normalized;
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
      animation: {
        style: 'suave',
        intensity: 'moderada',
        speed: 'normal',
        lighting: 'glow',
        pageTransition: 'fade',
        enableGlow: true,
        enableParticles: false,
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
        searchWithAI: false,
      },
      syncConfig: {
        enabled: false,
        status: 'idle',
      },
    };
    const saved = localStorage.getItem('codex-settings');
    if (!saved) return defaults;
    try {
      return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {
      return defaults;
    }
  });

  const lastRemoteSettingsRef = useRef<string>('');

  // Auth Listener
  useEffect(() => {
    handleRedirectResult().catch(err =>
      console.error('Erro no redirect de autenticação:', err)
    );

    if (!auth) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync from Cloud
  useEffect(() => {
    if (!user || !db) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const settingsStr = JSON.stringify(data.settings);

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
    if (!user || !db) return;

    try {
      const settingsStr = JSON.stringify(newSettings);
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

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('codex-theme', JSON.stringify(config));

    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSNAMES);
    root.classList.add(config.mode);

    // Apply UI geometry class
    root.classList.remove(...VALID_GEOMETRIES.map(s => `geom-${s}`));
    root.classList.add(`geom-${config.uiGeometry}`);

    // Apply navigation style class
    root.classList.remove(...VALID_NAV_STYLES.map(s => `nav-${s}`));
    root.classList.add(`nav-${config.navigationStyle}`);

    // Apply font preference class
    root.classList.remove('font-sans', 'font-serif', 'font-mono');
    root.classList.add(`font-${config.fontPreference}`);

    Object.entries(getThemeVariables(config)).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply dynamic radius based on geometry
    const radiusMap: Record<UIGeometry, string> = {
      sharp: '0px',
      soft: '22px',
      pill: '28px',
      minimal: '2px',
      geometric: '0px',
      premium: '32px',
      circle: '999px',
      'soft-square': '16px',
      glass: '28px',
      neon: '16px',
      brutal: '0px',
      elegant: '36px',
      cyber: '4px',
      vintage: '4px'
    };
    root.style.setProperty('--radius-premium', radiusMap[config.uiGeometry] || '32px');
    root.style.setProperty('--radius-compact', config.uiGeometry === 'sharp' || config.uiGeometry === 'geometric' ? '0px' : '16px');
  }, [config]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('codex-settings', JSON.stringify(settings));
  }, [settings]);

  // Debounced cloud sync
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      syncToCloud(config, settings);
    }, 2000);

    return () => clearTimeout(timer);
  }, [config, settings, user, syncToCloud]);

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
  const setUIGeometry = useCallback((uiGeometry: UIGeometry) => setConfig(prev => ({ ...prev, uiGeometry })), []);
  const setNavigationStyle = useCallback((navigationStyle: NavigationStyle) => setConfig(prev => ({ ...prev, navigationStyle })), []);
  const setFontPreference = useCallback((fontPreference: FontPreference) => setConfig(prev => ({ ...prev, fontPreference })), []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleSetting = useCallback(<T extends keyof AppSettings>(section: T, key: keyof AppSettings[T]) => {
    setSettings(prev => {
      const sectionData = prev[section] as Record<string, unknown>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [key]: !sectionData[key as string]
        }
      };
    });
  }, []);

  const toggleModule = useCallback((module: keyof AppSettings['modules']) => {
    toggleSetting('modules', module);
  }, [toggleSetting]);

  const setAnimationStyle = useCallback((style: AnimationStyle) => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, style }
    }));
  }, []);
  const setAnimationIntensity = useCallback((intensity: AnimationIntensity) => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, intensity }
    }));
  }, []);
  const setAnimationSpeed = useCallback((speed: AnimationSpeed) => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, speed }
    }));
  }, []);
  const setLightingEffect = useCallback((lighting: LightingEffect) => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, lighting }
    }));
  }, []);
  const setPageTransition = useCallback((pageTransition: PageTransition) => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, pageTransition }
    }));
  }, []);

  const toggleGlow = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, enableGlow: !prev.animation.enableGlow }
    }));
  }, []);

  const toggleParticles = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, enableParticles: !prev.animation.enableParticles }
    }));
  }, []);

  const syncNow = useCallback(() => {
    if (!user) return;
    setSettings(prev => ({ ...prev, syncConfig: { ...prev.syncConfig!, status: 'syncing' } }));
    syncToCloud(config, settings).then(() => {
      setSettings(prev => ({
        ...prev,
        syncConfig: {
          ...prev.syncConfig!,
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
      const isNative = typeof window !== 'undefined' && (window as unknown as CapacitorWindow).Capacitor?.isNativePlatform?.();
      const scanned = isNative ? [] : await scanForBibleModules();
      const installedRaw = await import('./services/moduleService').then(m => m.listInstalledModules());

      const allInstalled: BibleModule[] = installedRaw.map((m: ModuleInfo) => ({
        id: m.id,
        name: m.name,
        abbreviation: m.abbreviation,
        type: m.category as BibleModule['type'],
        format: m.format === 'other' ? 'mybible' : m.format as BibleModule['format'],
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

      setAvailableModules(installedRaw);

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

  const handleSetSelectedDictionaryModule = useCallback((module: BibleModule | null) => {
    setSelectedDictionaryModule(module);
    if (module) {
      updateSettings({
        studyTools: {
          ...settings.studyTools,
          selectedStrongsDictionary: module.id === 'ai_assistant' || module.isVirtual ? 'ai' : module.path
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
          setSelectedDictionaryModule(found);
        }
      }
    }
  }, [availableDictionaries, settings.studyTools.selectedStrongsDictionary]);

  const searchDictionary = useCallback(async (term: string) => {
    return dictionaryService.getEntries(term, selectedDictionaryModule);
  }, [selectedDictionaryModule]);

  const contextValue = useMemo(() => ({
    config,
    settings,
    user,
    isAuthReady,
    selectedDictionaryModule,
    availableVersions,
    availableDictionaries,
    availableModules,
    currentVersion,
    selectVersion,
    setMode,
    setFontSize,
    setLineHeight,
    setLetterSpacing,
    setFontFamily,
    setHorizontalMargin,
    setAccentColor,
    setUIGeometry,
    setNavigationStyle,
    setFontPreference,
    updateSettings,
    toggleSetting,
    toggleModule,
    setAnimationStyle,
    setAnimationIntensity,
    setAnimationSpeed,
    setLightingEffect,
    setPageTransition,
    toggleGlow,
    toggleParticles,
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
    availableVersions, availableDictionaries, availableModules, currentVersion, selectVersion, setMode,
    setFontSize, setLineHeight, setLetterSpacing, setFontFamily,
    setHorizontalMargin, setAccentColor, setUIGeometry, setNavigationStyle, setFontPreference,
    updateSettings, toggleSetting,
    toggleModule, setAnimationStyle, setAnimationIntensity, setAnimationSpeed,
    setLightingEffect, setPageTransition, toggleGlow, toggleParticles,
    syncNow, refreshModules, login, handleLogout,
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
