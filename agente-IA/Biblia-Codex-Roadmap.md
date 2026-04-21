# Biblia Codex - Roadmap de Implementação

Plano evolutivo de modernização do appBible Codex com focus em offline-first, state management e UX inclusiva.

---

## Visão Geral

**Stack atual:**
- React 19 + Vite 8 + Tailwind v4 + TypeScript
- Capacitor 6 (Android)
- IndexedDB via StorageService.ts + idb
- localStorage disperso em AppContext.tsx
- Zustand já instalado
- PWA básica (manifest.json + sw.js)

**Abordagem:** Evolutiva, não reescrever tudo. Incremental por fases.

---

## Definição de Dados

### Matriz de Dados

| Dado | Atualmente | Recomendado | Offline | Cacheável | Online Only |
|------|-----------|-----------|----------|----------|-----------|
|Bible modules (texto) | .mybible em public/ | .mybible em public/ | ✅ | ✅ | ❌ |
|Bookmarks | localStorage | Dexie.js | ✅ | ✅ | Opcional |
|Notes | localStorage | Dexie.js | ✅ | ✅ | Sync |
|Reading plans | localStorage | Dexie.js | ✅ | ✅ | Sync |
|Recent searches | localStorage | Dexie.js | ✅ | N/A | ❌ |
|Settings (UI) | localStorage | Zustand persist | ✅ | N/A | ❌ |
|Authentication | ? | ? | ❌ | ❌ | ✅ |
|IA responses | ? | Cache local | ✅ | ✅ | ❌ |
|Dictionary cache | ? |Dexie.js | ✅ | ✅ | ❌ |
|Sync queue | ❌ | Dexie.js | ✅ | ❌ | ✅ |

### Métricas-Alvo

- **Tempo de abrir capítulo:** < 200ms (offline)
- **Tempo de busca:** < 100ms para resultados
- **Bundle size:** < 500KB inicial
- **LCP:** < 2.5s
- **INP:** < 200ms
- **Memória:** < 100MB em Salmos 119

---

## Fase 0: Estabilização e Diagnóstico

### Tarefas

1. **Corrigir typecheck baseline**
   ```bash
   npm run lint
   # Corrigir todos os erros TypeScript antes de-prosseguir
   ```

2. **Mapear localStorage atual**
   - Listar todos os `localStorage.getItem/setItem` no código
   - Identificar chaves e estruturas de dados

3. **Mapear IndexedDB atual**
   - Review `StorageService.ts` e `idb` usage
   - Documentar schema atual

4. **Mapear dependências de rede**
   - Identificar chamadas API (Firebase, IA, dados remotos)
   - Classificar como opcional ou crítico

### Checklist

- [ ] `npm run lint` sem erros
- [ ] Lista completa de chaves localStorage
- [ ] Schema atual do IndexedDB documentado
- [ ] Mapa de dependências de rede classificadas

### Entregáveis

- `docs/localStorage-mapping.md` - Mapa de chaves localStorage
- `docs/data-architecture.md` - Schema e classificação de dados

---

## Fase 1: Offline-First e Dados Locais

### 1.1 Service Worker com Serwist

**Instalar:**
```bash
npm install serwist @vite-pwa/serwist
```

**Criar `src/offline/sw.ts`:**
```typescript
import { defaultCache } from 'serwist'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'

export default defaultCache({
  precacheManifest: [
    // Módulos bíblicos empacotados
    { url: '/modules/*.bbl.mybible' },
    // Assets estáticos
    { url: '/icon-192.png' },
    { url: '/icon-512.png' },
  ],
  runtimeCaching: [
    // Cache First: fontes, ícones, assets
    {
      urlPattern: /^https:\/\/fonts\./,
      handler: 'CacheFirst',
    },
    {
      urlPattern: /^https:\/\/cdn.*icon/,
      handler: 'CacheFirst',
    },
    // Stale While Revalidate: conteúdo não crítico
    {
      urlPattern: /^https:\/\/api.*devotional/,
      handler: 'StaleWhileRevalidate',
    },
    // Network First: IA e sync
    {
      urlPattern: /^https:\/\/generativelanguage/,
      handler: 'NetworkFirst',
    },
    {
      urlPattern: /^https:\/\/firebase.*functions/,
      handler: 'NetworkFirst',
    },
  ],
})
```

### 1.2 Camada Dexie.js

**Instalar:**
```bash
npm install dexie react-router-dom
npm install -D @types/dexie
```

**Criar `src/data/local/schema.ts`:**
```typescript
import Dexie, { Table } from 'dexie'

export interface BibleModule {
  id?: number
  moduleKey: string
  name: string
  abbreviation: string
  language: string
  version: string
  description: string
  lastUsed?: number
  installedAt: number
}

export interface Verse {
  moduleId: number
  bookNumber: number
  chapter: number
  verse: number
  text: string
  normalizedText: string
}

export interface Bookmark {
  id?: number
  moduleId: number
  bookNumber: number
  chapter: number
  verse: number
  note?: string
  createdAt: number
  syncedAt?: number
}

export interface Note {
  id?: number
  moduleId: number
  bookNumber: number
  chapter: number
  verses: string // "1-5,10"
  content: string
  createdAt: number
  updatedAt: number
  syncedAt?: number
}

export interface ReadingPlan {
  id?: number
  name: string
  description: string
  days: number
  progress: number
  startedAt: number
  lastReadAt?: number
}

export interface RecentSearch {
  id?: number
  query: string
  results: number
  searchedAt: number
}

export interface SyncQueueItem {
  id?: number
  type: 'bookmark' | 'note' | 'readingPlan'
  action: 'create' | 'update' | 'delete'
  data: string
  createdAt: number
  attempts: number
}

export class BibleDatabase extends Dexie {
  bibleModules!: Table<BibleModule>
  verses!: Table<Verse>
  bookmarks!: Table<Bookmark>
  notes!: Table<Note>
  readingPlans!: Table<ReadingPlan>
  recentSearches!: Table<RecentSearch>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('BibliaCodexDB')
    this.version(1).stores({
      bibleModules: '++id, &moduleKey, name, abbreviation, lastUsed',
      verses: '++id, moduleId, [moduleId+bookNumber+chapter+verse]',
      bookmarks: '++id, moduleId, [moduleId+bookNumber+chapter+verse], createdAt',
      notes: '++id, moduleId, [moduleId+bookNumber+chapter], createdAt',
      readingPlans: '++id, name, progress',
      recentSearches: '++id, query, searchedAt',
      syncQueue: '++id, type, createdAt',
    })
  }
}

export const db = new BibleDatabase()
```

**Criar `src/data/local/repository.ts`:**
```typescript
import { db, Bookmark, Note, ReadingPlan, RecentSearch } from './schema'

// Bookmarks
export const bookmarksRepo = {
  getAll: () => db.bookmarks.toArray(),
  getByModule: (moduleId: number) => 
    db.bookmarks.where('moduleId').equals(moduleId).toArray(),
  add: (bookmark: Omit<Bookmark, 'id'>) => db.bookmarks.add(bookmark),
  delete: (id: number) => db.bookmarks.delete(id),
}

// Notes
export const notesRepo = {
  getAll: () => db.notes.toArray(),
  getByModuleChapter: (moduleId: number, bookNumber: number, chapter: number) =>
    db.notes.where('[moduleId+bookNumber+chapter]')
      .equals([moduleId, bookNumber, chapter])
      .toArray(),
  add: (note: Omit<Note, 'id'>) => db.notes.add(note),
  update: (id: number, updates: Partial<Note>) => db.notes.update(id, updates),
  delete: (id: number) => db.notes.delete(id),
}

// Recent Searches
export const searchRepo = {
  getRecent: (limit = 20) => 
    db.recentSearches.orderBy('searchedAt').reverse().limit(limit).toArray(),
  add: (query: string, results: number) => 
    db.recentSearches.add({ query, results, searchedAt: Date.now() }),
  clear: () => db.recentSearches.clear(),
}

// Sync Queue
export const syncQueueRepo = {
  getPending: () => db.syncQueue.where('attempts').below(3).toArray(),
  add: (item: Omit<SyncQueueItem, 'id'>) => db.syncQueue.add(item),
  markSynced: (id: number) => db.syncQueue.delete(id),
  incrementAttempts: (id: number) => 
    db.syncQueue.update(id, { attempts: (await db.syncQueue.get(id))!.attempts + 1 }),
}
```

### 1.3 Busca Offline

**Criar `src/services/searchService.ts`:**
```typescript
import { db } from '../data/local/schema'

interface SearchResult {
  bookNumber: number
  chapter: number
  verse: number
  text: string
  moduleName: string
}

export async function searchBible(
  query: string,
  moduleIds?: number[]
): Promise<SearchResult[]> {
  const normalizedQuery = query.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  let moduleQuery = db.bibleModules.toCollection()
  if (moduleIds?.length) {
    moduleQuery = db.bibleModules.where('id').anyOf(moduleIds)
  }

  const modules = await moduleQuery.toArray()
  const results: SearchResult[] = []

  for (const mod of modules) {
    const verses = await db.verses
      .where('moduleId')
      .equals(mod.id!)
      .filter(v => 
        v.normalizedText?.includes(normalizedQuery) ||
        v.text.toLowerCase().includes(normalizedQuery)
      )
      .limit(100)
      .toArray()

    results.push(...verses.map(v => ({
      bookNumber: v.bookNumber,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      moduleName: mod.name,
    })))
  }

  return results.sort((a, b) => {
    if (a.bookNumber !== b.bookNumber) 
      return a.bookNumber - b.bookNumber
    if (a.chapter !== b.chapter) 
      return a.chapter - b.chapter
    return a.verse - b.verse
  }).slice(0, 50)
}

// Pré-processar texto na indexação
export function normalizeVerseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, ' ') // Keep spaces
    .replace(/\s+/g, ' ')
    .trim()
}
```

### 1.4 Estrutura de Arquivos - Fase 1

```
src/
├── offline/
│   └── sw.ts           # Service worker
├── data/
│   └── local/
│       ├── schema.ts  # Dexie schema
│       ├── repository.ts # Data access
│       └── migration.ts # idb -> Dexie migration
├── services/
│   └── searchService.ts # Busca offline
└── test/
    └── offline.test.ts # Testes offline
```

### Checklist Fase 1

- [ ] Serwist configurado e funcionando
- [ ] Estratatégias de cache definidas
- [ ] Dexie.js instalado e schema criado
- [ ] Repositório de dados implementado
- [ ] Busca offline funcionando
- [ ] Sync queue implementado
- [ ] Leitura bíblica offline
- [ ] Busca sem internet

### Meta Fase 1

- ✅ Abrir capítulo já visitado sem internet
- ✅ Busca bíblica offline
- ✅ Service worker com cache adequado

---

## Fase 2: Estado Global com Zustand

### 2.1 Estrutura de Stores

**Criar stores separados por domínio:**

```
src/
└── stores/
    ├── readerStore.ts
    ├── settingsStore.ts
    ├── libraryStore.ts
    ├── notesStore.ts
    └── syncStore.ts
```

**`src/stores/readerStore.ts`:**
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { persist as persistSync } from './syncStorage'

interface ReaderState {
  currentModule: string | null
  currentBook: number
  currentChapter: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  setCurrentModule: (module: string) => void
  setCurrentChapter: (book: number, chapter: number) => void
  setFontSize: (size: number) => void
  setSettings: (settings: Partial<Omit<ReaderState, 'setCurrentModule' | 'setCurrentChapter' | 'setFontSize'>>) => void
}

export const useReaderStore = create<ReaderState>()(
  persistSync(
    (set) => ({
      currentModule: null,
      currentBook: 1,
      currentChapter: 1,
      fontSize: 18,
      fontFamily: 'system-ui',
      lineHeight: 1.6,
      setCurrentModule: (module) => set({ currentModule: module }),
      setCurrentChapter: (book, chapter) => 
        set({ currentBook: book, currentChapter: chapter }),
      setFontSize: (size) => set({ fontSize: size }),
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'biblia-reader',
    }
  )
)
```

**`src/stores/settingsStore.ts`:**
```typescript
import { create } from 'zustand'
import { persistSync } from './syncStorage'

type Theme = 'light' | 'dark' | 'system'
type Contrast = 'normal' | 'high'

interface SettingsState {
  theme: Theme
  contrast: Contrast
  showRedLetters: boolean
  showHeadings: boolean
  nightModeSchedule: { start: string; end: string } | null
  gestures: { swipeToNavigate: boolean; doubleTapToCopy: boolean }
  setTheme: (theme: Theme) => void
  setContrast: (contrast: Contrast) => void
  toggleRedLetters: () => void
  toggleHeadings: () => void
  setNightModeSchedule: (schedule: { start: string; end: string } | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persistSync(
    (set) => ({
      theme: 'system',
      contrast: 'normal',
      showRedLetters: true,
      showHeadings: true,
      nightModeSchedule: null,
      gestures: {
        swipeToNavigate: true,
        doubleTapToCopy: false,
      },
      setTheme: (theme) => set({ theme }),
      setContrast: (contrast) => set({ contrast }),
      toggleRedLetters: () => 
        set((s) => ({ showRedLetters: !s.showRedLetters })),
      toggleHeadings: () => 
        set((s) => ({ showHeadings: !s.showHeadings })),
      setNightModeSchedule: (schedule) => set({ nightModeSchedule: schedule }),
    }),
    { name: 'biblia-settings' }
  )
)
```

**`src/stores/libraryStore.ts`:**
```typescript
import { create } from 'zustand'

interface ModuleInfo {
  key: string
  name: string
  abbreviation: string
  language: string
  hasAudio: boolean
}

interface LibraryState {
  installedModules: ModuleInfo[]
  availableOnline: ModuleInfo[]
  isLoading: boolean
  downloadProgress: Record<string, number>
  
  setInstalledModules: (modules: ModuleInfo[]) => void
  setAvailableOnline: (modules: ModuleInfo[]) => void
  addModule: (module: ModuleInfo) => void
  removeModule: (key: string) => void
  setDownloadProgress: (key: string, progress: number) => void
  setLoading: (loading: boolean) => void
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  installedModules: [],
  availableOnline: [],
  isLoading: false,
  downloadProgress: {},
  
  setInstalledModules: (modules) => set({ installedModules: modules }),
  setAvailableOnline: (modules) => set({ availableOnline: modules }),
  addModule: (module) => 
    set((s) => ({ installedModules: [...s.installedModules, module] })),
  removeModule: (key) => 
    set((s) => ({ 
      installedModules: s.installedModules.filter(m => m.key !== key) 
    })),
  setDownloadProgress: (key, progress) => 
    set((s) => ({ downloadProgress: { ...s.downloadProgress, [key]: progress } })),
  setLoading: (loading) => set({ isLoading: loading }),
}))
```

**`src/stores/notesStore.ts`:**
```typescript
import { create } from 'zustand'
import { notesRepo } from '../data/local/repository'

interface NotesState {
  notes: Note[]
  selectedNote: Note | null
  isLoading: boolean
  
  loadNotes: () => Promise<void>
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateNote: (id: number, content: string) => Promise<void>
  deleteNote: (id: number) => Promise<void>
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  selectedNote: null,
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true })
    const notes = await notesRepo.getAll()
    set({ notes, isLoading: false })
  },

  createNote: async (noteData) => {
    const note = await notesRepo.add({
      ...noteData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    set((s) => ({ notes: [...s.notes, note] }))
  },

  updateNote: async (id, content) => {
    await notesRepo.update(id, { content, updatedAt: Date.now() })
    const notes = await notesRepo.getAll()
    set({ notes })
  },

  deleteNote: async (id) => {
    await notesRepo.delete(id)
    set((s) => ({ notes: s.notes.filter(n => n.id !== id) }))
  },
}))
```

**`src/stores/syncStore.ts`:**
```typescript
import { create } from 'zustand'
import { syncQueueRepo } from '../data/local/repository'

interface SyncState {
  pendingItems: number
  isSyncing: boolean
  lastSyncAt: number | null
  error: string | null
  
  loadPending: () => Promise<void>
  syncItem: (id: number) => Promise<void>
  syncAll: () => Promise<void>
}

export const useSyncStore = create<SyncState>()((set, get) => ({
  pendingItems: 0,
  isSyncing: false,
  lastSyncAt: null,
  error: null,

  loadPending: async () => {
    const items = await syncQueueRepo.getPending()
    set({ pendingItems: items.length })
  },

  syncItem: async (id) => {
    // Implementar sincronização
    await syncQueueRepo.markSynced(id)
    await get().loadPending()
  },

  syncAll: async () => {
    set({ isSyncing: true, error: null })
    try {
      const items = await syncQueueRepo.getPending()
      for (const item of items) {
        await get().syncItem(item.id!)
      }
      set({ lastSyncAt: Date.now() })
    } catch (e) {
      set({ error: (e as Error).message })
    } finally {
      set({ isSyncing: false })
    }
  },
}))
```

### 2.2 Seletores Pequenos

```typescript
// Em vez de:
const { currentBook, currentChapter, fontSize, theme } = useReaderStore()

// Usar seletores:
const currentChapter = useReaderStore(s => s.currentChapter)
const fontSize = useReaderStore(s => s.fontSize)
const theme = useSettingsStore(s => s.theme)
```

### 2.3 Remover AppContext

Migrar progressivamente do `AppContext.tsx` para as stores.

### Checklist Fase 2

- [ ] useReaderStore implementado
- [ ] useSettingsStore implementado
- [ ] useLibraryStore implementado
- [ ] useNotesStore implementado
- [ ] useSyncStore implementado
- [ ] Seletores pequenos usados
- [ ] AppContext refatorado/removido

### Meta Fase 2

- ✅ Navegação sem cascata de rerender
- ✅ Preferências persistidas
- ✅ Notes e bookmarks funcionando

---

## Fase 3: Acessibilidade WCAG

### 3.1 Auditoria

**Telas para auditar:**
- [ ] Leitura (BibleReader)
- [ ] Navegação de livro/capítulo
- [ ] Busca
- [ ] Configurações
- [ ] Notes/Bookmarks

**Checklist WCAG por tela:**

| Item | WCAG | Implementar |
|------|-----|-------------|
|aria-label em botões | 4.1.2 | ✅ |
|aria-expanded em accordions | 4.1.2 | ✅ |
|foco visível | 2.4.7 | ✅ |
|navegação por teclado | 2.1 | ✅ |
|contraste 4.5:1 | 1.4.3 | ✅ |
|alvos > 44px | 2.5.5 | ✅ |

### 3.2 Implementação

**Componente acessível:**
```tsx
interface AccessibleButtonProps {
  onClick: () => void
  children: React.ReactNode
  label: string // aria-label
  shortcut?: string // aria-keyshortcuts
}

function AccessibleButton({ 
  onClick, 
  children, 
  label,
  shortcut 
}: AccessibleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
    </button>
  )
}
```

### 3.3 Controles de Leitura

```tsx
interface ReadingControlsProps {
  fontSize: number
  onFontSizeChange: (size: number) => void
  contrast: 'normal' | 'high'
  onContrastChange: (contrast: 'normal' | 'high') => void
}

function ReadingControls({ 
  fontSize, 
  onFontSizeChange,
  contrast,
  onContrastChange 
}: ReadingControlsProps) {
  return (
    <div role="group" aria-label="Controles de leitura">
      <button
        onClick={() => onFontSizeChange(fontSize - 2)}
        aria-label="Diminuir fonte"
      >
        A-
      </button>
      <button
        onClick={() => onFontSizeChange(fontSize + 2)}
        aria-label="Aumentar fonte"
      >
        A+
      </button>
      <button
        onClick={() => onContrastChange(contrast === 'normal' ? 'high' : 'normal')}
        aria-pressed={contrast === 'high'}
        aria-label="Alto contraste"
      >
        Alto Contraste
      </button>
    </div>
  )
}
```

### Checklist Fase 3

- [ ] aria-label em todas as ações
- [ ] foco visível em todos os elementos
- [ ] navegação por teclado funcionando
- [ ] contraste adequado
- [ ] alvos > 44px
- [ ] leitor de tela funcionando

### Meta Fase 3

- ✅ WCAG AA compliance
- ✅ Leitor de tela funcional
- ✅ Navegação por teclado

---

## Fase 4: Internacionalização (i18n)

### 4.1 Setup i18next

**Instalar:**
```bash
npm install i18next react-i18next
```

**Criar `src/i18n/index.ts`:**
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import common from './locales/common.json'
import reader from './locales/reader.json'
import settings from './locales/settings.json'
import search from './locales/search.json'
import notes from './locales/notes.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { common, reader, settings, search, notes },
      en: { 
        common: common.en,
        reader: reader.en,
        settings: settings.en,
        search: search.en,
        notes: notes.en,
      },
    },
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
```

### 4.2 Estrutura de Locales

```
src/
└─�� i18n/
    ├── index.ts
    └── locales/
        ├── common.json
        ├── reader.json
        ├── settings.json
        ├── search.json
        └── notes.json
```

**`src/i18n/locales/common.json`:**
```json
{
  "pt": {
    "loading": "Carregando...",
    "error": "Ocorreu um erro",
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "edit": "Editar",
    "back": "Voltar",
    "search": "Buscar",
    "offline": "Você está offline",
    "retry": "Tentar novamente"
  },
  "en": {
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "search": "Search",
    "offline": "You are offline",
    "retry": "Retry"
  }
}
```

### 4.3 Uso nos Componentes

```tsx
import { useTranslation } from 'react-i18next'

function BibleReader() {
  const { t } = useTranslation('reader')
  
  return (
    <div>
      <h1>{t('chapter')} {chapter}</h1>
      <button aria-label={t('previousChapter')}>
        {t('previous')}
      </button>
    </div>
  )
}
```

### Checklist Fase 4

- [ ] i18next instalado
- [ ] Estrutura de namespaces criada
- [ ] pt-BR completo
- [ ] en parcialmente
- [ ] Componentes usando t()
- [ ]troca de idioma funcionando

### Meta Fase 4

- ✅ Interface traduzível
- ✅ App multilíngue

---

## Fase 5: Performance e Core Web Vitals

### 5.1 Lazy Loading

**Rotas pesadas com lazy loading:**
```tsx
import { lazy, Suspense } from 'react'

const DevotionalPage = lazy(() => import('./pages/DevotionalPage'))
const MapsPage = lazy(() => import('./pages/MapsPage'))
const XRefsPage = lazy(() => import('./pages/XRefsPage'))
const DictionaryView = lazy(() => import('./pages/DictionaryView'))
const EBDPage = lazy(() => import('./pages/EBDPage'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/devotional" element={<DevotionalPage />} />
        <Route path="/maps" element={<MapsPage />} />
      </Routes>
    </Suspense>
  )
}
```

### 5.2 Virtualização

**Instalar:**
```bash
npm install @tanstack/react-virtual
```

**Para listas grandes:**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function ChapterView({ verses }: { verses: Verse[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: verses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,
            }}
          >
            <Verse verse={verses[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.3 Otimização de Busca

- Pré-processar texto normalizado na indexação
- Usar índice por livro/capítulo
- Limitar resultados com limite()

### Checklist Fase 5

- [ ] Lazy loading em rotas pesadas
- [ ] Virtualização em listas grandes
- [ ] Memoização de parsing
- [ ] Teste em Salmos 119

### Meta Fase 5

- ✅ LCP < 2.5s
- ✅ INP < 200ms
- ✅ Sem travamento em capítulos longos

---

## Ordem de Sprints

### Sprint 1: Fase 0 + Início Fase 1
- [ ] Corrigir typecheck baseline
- [ ] Mapear localStorage
- [ ] Mapear IndexedDB atual
- [ ] Configurar Serwist

### Sprint 2: Offline-first completo
- [ ] Dexie.js schema
- [ ] Repositórios
- [ ] Busca offline
- [ ] Sync queue

### Sprint 3: Zustand
- [ ] Criar stores por domínio
- [ ] Migrar do AppContext
- [ ] Seletores pequenos

### Sprint 4: Acessibilidade
- [ ] Auditoria WCAG
- [ ] aria-labels
- [ ] Navegação por teclado
- [ ] Controles de leitura

### Sprint 5: i18n
- [ ] Setup i18next
- [ ] namespaces
- [ ] pt-BR + en

### Sprint 6: Performance
- [ ] Lazy loading
- [ ] Virtualização
- [ ] Otimização
- [ ] Testes em dispositivos reais

---

## Critérios de Aceite

- [ ] Abrir capítulo sem internet ✓
- [ ] Busca bíblica offline ✓
- [ ] Reabrir app mantendo estado ✓
- [ ] Sem travamento em capítulos longos ✓
- [ ] Leitor de tela functional ✓
- [ ] UI traduzível ✓

---

## BacklogTécnnico

- [ ] `src/data/local/` - Camada Dexie
- [ ] `src/stores/` - Stores Zustand
- [ ] `src/i18n/` - Internacionalização
- [ ] `src/offline/` - Service worker e políticas
- [ ] Testes de leitura offline
- [ ] Testes de inicialização sem rede

---

## Referências

- **Dexie.js:** https://dexie.org
- **Serwist:** https://serwist.pages.dev
- **Zustand:** https://zustand-demo.pmnd.rs
- **i18next:** https://www.i18next.com
- **TanStack Virtual:** https://tanstack.com/virtual
- **WCAG:** https://www.w3.org/WAI/WCAG21/quickref/