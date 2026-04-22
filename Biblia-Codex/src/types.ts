export interface Book {
  id: string;
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  numericId: number;
  abbreviation?: string;
}

export interface Verse {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  isChapterHeader?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;      // dot
  background: string; // bg
  textColor: string;  // tc
  createdAt: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  label?: string;
  color?: string;
  tags: string[]; // IDs of Tags
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML or Markdown
  updatedAt: number;
  tags: string[];
  createdAt?: number;
  pinned?: boolean;
  theme?: 'light' | 'dark';
  fontFamily?: string;
  fontSize?: number;
  googleDocId?: string;
  googleDocUrl?: string;
  googleDocExportedAt?: number;
}

export interface CrossReference {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  text?: string;
  rank: number; // Relevance score
}

export interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  moduleName: string;
  source: 'local' | 'ai';
  isAiGenerated?: boolean;
}

export interface StudyModule {
  id: string;
  name: string;
  type: 'commentary' | 'dictionary';
  abbreviation: string;
  isVirtual: boolean;
  path: string; // Changed from file
}

export type FootnoteType = 
  | 'textual'      // Variantes textuais, traduções alternativas
  | 'historical'   // Contexto histórico
  | 'geographic'  // Localizações, mapas
  | 'theological' // Doutrinas, conceitos
  | 'chronological' // Datas, períodos
  | 'application'; // Aplicação prática

export interface Footnote {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  type: FootnoteType;
  content: string;
  references?: string[];
  strongsNumber?: string;
  author?: string;
  source?: string;
  language: 'pt' | 'en' | 'he' | 'gr';
  createdAt: number;
  updatedAt: number;
}

export interface FootnoteReference {
  id: string;
  footnoteId: string;
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface StrongsEntry {
  number: string;
  language: 'hebrew' | 'greek';
  word: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
  etymology?: string;
  compounds?: string[];
  derivatives?: string[];
}

export interface Morphology {
  strongsNumber: string;
  language: 'hebrew' | 'greek';
  partOfSpeech: string;
  gender?: string;
  number?: string;
  person?: string;
  tense?: string;
  voice?: string;
  mood?: string;
  case?: string;
  dialect?: string;
}

export interface CrossReferenceGroup {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  references: {
    bookId: string;
    chapter: number;
    verse: number;
    text?: string;
    rank: number;
  }[];
}

export type ModuleType = 'bible' | 'commentary' | 'dictionary' | 'xrefs' | 'book' | 'map' | 'devotional' | 'plan';

export type DrawerContext = 'general' | 'bible' | 'search' | 'study';

export interface BibleModule {
  id: string;
  name: string;
  abbreviation: string;
  type: ModuleType;
  format: 'mybible' | 'mysword' | 'sword' | 'epub' | 'sqlite';
  category: 'mybible' | 'mysword' | 'sword' | 'epub';
  path: string;
  language: string;
  author?: string;
  fileSize?: number;
}

export type ThemeMode =
  | 'day'
  | 'dusk'
  | 'ocean'
  | 'forest'
  | 'rose'
  | 'violet'
  | 'night'
  | 'ember'
  | 'abyss'
  | 'emerald'
  | 'neon'
  | 'frost';

export type UIGeometry = 'sharp' | 'soft' | 'pill' | 'minimal' | 'geometric' | 'premium' | 'circle' | 'soft-square' | 'glass' | 'neon' | 'brutal' | 'elegant' | 'cyber' | 'vintage';
export type NavigationStyle = 'floating' | 'asymmetric' | 'bottom' | 'sidebar' | 'top' | 'hybrid' | 'compact' | 'dock' | 'minimal';
export type FontPreference = 'sans' | 'serif' | 'mono';

export interface ThemeConfig {
  mode: ThemeMode;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: 'Untitled Serif' | 'Serif' | 'Sans Serif' | 'Monospace';
  horizontalMargin: number;
  accentColor: string;
  contrast: number;
  uiGeometry: UIGeometry;
  navigationStyle: NavigationStyle;
  fontPreference: FontPreference;
}

export type AnimationStyle = 'suave' | 'elastica' | 'fade' | 'slide' | 'scale' | 'glow' | 'neon' | 'fluid';
export type AnimationIntensity = 'leve' | 'moderada' | 'intensa';
export type AnimationSpeed = 'lento' | 'normal' | 'rapido';
export type LightingEffect = 'brilho' | 'glow' | 'shadow' | 'particles' | 'aurora' | 'none';
export type PageTransition = 'fade' | 'slide' | 'flip' | 'cube' | 'cover' | 'zoom';

export interface AppSettings {
  textDisplay: {
    paragraphMode: boolean;
    verseNumbers: boolean;
    wordsOfJesusRed: boolean;
    chapterTitles: boolean;
    headlines: boolean;
    footnotes: boolean;
  };
  studyTools: {
    strongsTags: boolean;
    strongsLinks: boolean;
    morphTags: boolean;
    interlinearMode: boolean;
    originalLanguages: boolean;
    translatorNotes: boolean;
    transliteration: boolean;
    selectedStrongsDictionary?: string;
    selectedCommentaryDictionary?: string;
  };
  visualResources: {
    highlights: boolean;
    bookmarks: boolean;
    crossRefs: boolean;
    mergeAdjacentRefs: boolean;
    gradientHighlight: boolean;
  };
  behavior: {
    bibleLinkPopup: boolean;
    alwaysVisible: boolean;
  };
  apiKeys?: {
    gemini?: string;
  };
  navigation: {
    navAnimation: boolean;
    horizontalScroll: boolean;
  };
  animation: {
    style: AnimationStyle;
    intensity: AnimationIntensity;
    speed: AnimationSpeed;
    lighting: LightingEffect;
    pageTransition: PageTransition;
    enableGlow: boolean;
    enableParticles: boolean;
  };
  language: 'pt-BR' | 'en';
  modules: {
    commentary: boolean;
    dictionary: boolean;
    xrefs: boolean;
  };
  ai: {
    model: string;
    language: string;
    autoSuggest: boolean;
    searchWithAI?: boolean;
    verseExplanation?: boolean;
    termDefinition?: boolean;
    crossReferences?: boolean;
    strongAnalysis?: boolean;
    commentary?: boolean;
    theologicalProfile?: string;
  };
  accentColor?: string;
  fontSize?: number;
  glowEnabled?: boolean;
  particlesEnabled?: boolean;
  lightingEffect?: LightingEffect;
  animationStyle?: AnimationStyle;
  animationIntensity?: AnimationIntensity;
  animationSpeed?: AnimationSpeed;
  sync?: boolean;
  syncConfig?: {
    enabled: boolean;
    status: string;
  };
}
