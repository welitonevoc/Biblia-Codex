---
name: biblia-codex-assistant
description: "Agente autônomo especializado no projeto Biblia-Codex - aplicativo de Bíblia digital para Android e web. Stack: React 19, Vite 8, Tailwind v4, TypeScript, Capacitor 6, Zustand, Vitest."
risk: safe
source: personal
date_added: "2026-04-20"
---

# Biblia Codex Assistant

Agente autônomo especializado no projeto Biblia-Codex. Desenvolva melhorias, corrija bugs e mantenha a qualidade do código seguindo as melhores práticas.

## Quando Usar

Use `@biblia-codex-assistant` para:
- ✅ Desenvolver novas funcionalidades React
- ✅ Corrigir bugs e problemas
- ✅ Implementar otimizações de performance
- ✅ Configurar build para Android (Capacitor)
- ✅ Escrever e executar testes
- ✅ Fazer deploy na Vercel
- ✅ Trabalhar com módulos bíblicos (.mybible)
- ✅ Integrar Firebase

## Estrutura do Projeto

```
Biblia-Codex/
├── src/
│   ├── components/        # Componentes React
│   ├── services/         # BibleParser, Audio, Firebase
│   ├── hooks/           # Hooks customizados
│   ├── data/            # Bible metadata
│   ├── theme/           # Tailwind theme
│   └── test/            # Setup de testes
├── public/
│   ├── *.bbl.mybible   # Módulos de texto bíblico
│   └── *.dct.mybible    # Dicionários Strong
├── android/             # Projeto Android nativo
├── vite.config.ts      # ⚠️ CRÍTICO: usar postcss, não lightningcss
├── vitest.config.ts     # Configuração testes
└── capacitor.config.json
```

## Stack Técnica

- **Frontend**: React 19, TypeScript 5.8, Tailwind v4
- **Build**: Vite 8
- **Mobile**: Capacitor 6 (Android)
- **Testes**: Vitest 4 + jsdom
- **State**: Zustand 5
- **Deploy**: Vercel

---

# REGRAS FUNDAMENTAIS

## ⚠️ REGRA 1: Tailwind v4 (NÃO é Tailwind v3!)

Este projeto usa **Tailwind CSS v4**. É DIFERENTE da v3!

```css
/* ✅ CORRETO - @theme directive (no index.css) */
@theme {
  --color-primary: #1a1a2e;
  --color-secondary: #16213e;
  --font-sans: 'Inter', system-ui, sans-serif;
}

/* ❌ ERRADO - tailwind.config.js NÃO funciona igual */
module.exports = {
  theme: { extend: {} }
}
```

```typescript
// vite.config.ts - configuração CORRETA
export default defineConfig({
  css: {
    transformer: 'postcss',  // ✅ USE postcss
    // ❌ NÃO use: transformer: 'lightningcss'
  },
  build: {
    cssMinify: false,  // ✅ Evita erros com Tailwind v4
  }
})
```

## ⚠️ REGRA 2: Capacitor Base Path

Para Android WebView, SEMPRE usar caminho relativo:

```typescript
// vite.config.ts
base: './',  // ✅ Necessário para WebView Android
```

## ⚠️ REGRA 3: Firebase Excluído de Otimização

```typescript
// vite.config.ts
optimizeDeps: {
  include: ['lucide-react', '@google/genai', 'sql.js'],
  exclude: ['firebase'],  // ✅ Evita problemas SSR
}
```

---

# Desenvolvimento React

## Padrão de Componentes

```tsx
// ✅ BOM - Componente funcional com TypeScript
interface Props {
  bookId: string
  chapter: number
  onVerseSelect?: (verse: Verse) => void
}

export function BibleReader({ bookId, chapter, onVerseSelect }: Props) {
  const { verses, loading } = useBibleChapter(bookId, chapter)

  if (loading) return <Skeleton />

  return (
    <div>
      {verses.map(verse => (
        <VerseComponent
          key={verse.id}
          verse={verse}
          onSelect={onVerseSelect}
        />
      ))}
    </div>
  )
}

// ❌ Evitar - Objetos como dependência de useEffect
useEffect(() => {
  fetchData(params)  // params é objeto - causa re-runs desnecessários
}, [params])

// ✅ CORRETO - Primitivos como dependência
useEffect(() => {
  fetchData(params.id)
}, [params.id])
```

## State com Zustand

O projeto usa Zustand para gerenciamento de estado:

```tsx
// ✅ Criar store com subscribeWithSelector
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface BibleState {
  currentBook: string | null
  currentChapter: number
  setChapter: (book: string, chapter: number) => void
}

export const useBibleStore = create<BibleState>()(
  subscribeWithSelector((set, get) => ({
    currentBook: null,
    currentChapter: 1,
    setChapter: (book, chapter) => set({ currentBook: book, currentChapter: chapter })
  }))
)

// ✅ Usar selectors individuais
const currentBook = useBibleStore((state) => state.currentBook)

// ❌ Evitar - selector completo causa re-renders desnecessários
const { currentBook, currentChapter } = useBibleStore()
```

---

# Performance React

Siga as regras de `@react-best-practices`:

### Prioridade CRITICAL (Waterfalls & Bundle)

1. **async-defer-await** - Move await para onde realmente usado
```tsx
async function handleRequest(skip: boolean) {
  if (skip) return { skipped: true }  // ✅ Retorna sem esperar
  const data = await fetchData()     // Só espera se necessário
  return processData(data)
}
```

2. **async-parallel** - Promise.all() para operações independentes
```tsx
// ❌ Errado - sequencial (3 round trips)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ Correto - paralelo (1 round trip)
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

3. **bundle-barrel-imports** - Importar diretamente, evitar barrel files
```tsx
// ❌ Erra - importa biblioteca inteira (~1MB)
import { Button, TextField } from '@mui/material'

// ✅ Correto - importa só o necessário (~10KB)
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
```

### Prioridade HIGH (Server & Re-render)

4. **server-cache-react** - Usar React.cache() para deduplicação
5. **rerender-memo** - Usar memo/memoization corretamente

---

# Testes (Vitest)

## Configuração

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',  // Simula navegador
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  }
})
```

## Padrão TDD

Siga `@test-driven-development`:

```
RED → Escreva teste que falha
GREEN → Código mínimo para passar
REFACTOR → Limpe o código
```

```tsx
// 1. RED - Write failing test
describe('BibleReader', () => {
  it('should display verses', () => {
    render(<BibleReader bookId="John" chapter={3} />)
    expect(screen.getByText('verse 1')).toBeInTheDocument()
  })
})

// 2. GREEN - Minimal code to pass
export function BibleReader({ bookId, chapter }) {
  return <div>verse 1</div>
}

// 3. REFACTOR - Clean up
export function BibleReader({ bookId, chapter }: Props) {
  const { verses, loading } = useBibleChapter(bookId, chapter)
  if (loading) return <Skeleton />
  return <div>{verses.map(v => <Verse key={v.id} verse={v} />)}</div>
}
```

## Executar Testes

```bash
npm run test              # Rodar todos os testes
npm run test -- src/components/BibleReader.test.ts  # Teste específico
npm run test:coverage    # Com cobertura
```

---

# Permissões Android

Para permissões (armazenamento, áudio):

```typescript
// services/permissionsService.ts
import { Permissions } from '@capacitor/permissions'

async function requestStoragePermission() {
  const result = await Permissions.ask({
    name: 'storage'
  })
  return result.state === 'granted'
}
```

---

# Build Android

```bash
npm run build              # Build web
npm run cap:sync          # Sync para Android
npm run cap:open         # Abrir Android Studio
npm run cap:run          # Build + run no device
```

APK gerado em: `android/app/build/outputs/apk/debug/`

---

# Deploy Vercel

Deploy automático em https://biblia-codex.vercel.app

Se mudanças não aparecerem:
```bash
git commit --allow-empty -m "chore: force new deployment"
git push origin main
```

---

# Comandos do Projeto

```bash
# Desenvolvimento
npm run dev              # Modo development
npm run build            # Build produção
npm run lint             # tsc --noEmit

# Testes
npm run test             # Vitest
npm run test:coverage   # Cobertura

# Android
npm run cap:sync        # Build + sync Android
npm run cap:open       # Abrir Android Studio
npm run cap:run        # Build + run no device
```

---

# Roadmap de Modernização

## Fase 0: Estabilização ✅
- [x] typecheck sem erros (`npm run lint`)
- [x] Mapeamento localStorage
- [x] Mapeamento IndexedDB

## Fase 1: Offline-First ✅
- [x] Service worker existente (`public/sw.js`)
- [x] Estratégias: CacheFirst, NetworkFirst, StaleWhileRevalidate
- [x] Módulos bíblicos offline

## Fase 2: Zustand ✅
- [x] `src/stores/readerStore.ts`
- [x] `src/stores/settingsStore.ts`
- [x] `src/stores/libraryStore.ts`
- [x] `src/stores/notesStore.ts`
- [x] Seletores pequenos

## Fase 3: Acessibilidade WCAG ✅
- [x] `src/components/Common/AccessibleButton.tsx`
- [x] `src/hooks/useKeyboardNavigation.ts`
- [x] `src/hooks/useA11y.ts`

## Fase 4: i18n ✅
- [x] `npm install i18next react-i18next`
- [x] `src/i18n/index.ts`
- [x] `src/i18n/locales/`

---

# Referências

- Stack: React 19, Vite 8, Tailwind v4, TypeScript 5.8
- Mobile: Capacitor 6
- Testes: Vitest 4
- State: Zustand 5
- i18n: i18next
- Ícones: lucide-react
- Animações: motion
- Markdown: react-markdown