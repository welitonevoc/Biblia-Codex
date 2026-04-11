# 🔍 ANÁLISE COMPLETA - BÍBLIA CODEX

**Data:** 11 de abril de 2026  
**Projeto:** Biblia-Codex (React + TypeScript + Capacitor + Firebase + IA)

---

## 📊 RESUMO EXECUTIVO

| Categoria | Problemas Críticos | Problemas Médios | Melhorias Sugeridas |
|-----------|-------------------|------------------|---------------------|
| **Segurança** | 🔴 2 | 🟡 2 | 4 ações imediatas |
| **Performance** | 🔴 0 | 🟡 4 | 6 otimizações |
| **Arquitetura** | 🔴 0 | 🟡 3 | 8 melhorias estruturais |
| **Código** | 🟡 3 | 🟡 5 | 10 refactorings |
| **Acessibilidade** | 🔴 1 | 🟡 4 | 7 conformidades WCAG |
| **Testes** | 🔴 1 | 🟡 0 | 5 suites necessárias |
| **i18n** | 🟡 1 | 🟡 2 | 5 passos de migração |

**Total: 8 problemas críticos, 20 médios, 40 melhorias sugeridas**

---

## 🚨 PROBLEMAS CRÍTICOS (Resolver IMEDIATAMENTE)

### 1. Firebase API Key Exposta no Repositório
**Local:** `firebase-applet-config.json` linha 4  
**Risco:** **CRÍTICO** - Qualquer pessoa pode acessar seu projeto Firebase  
**Ação:**
```bash
# 1. Rotacionar key no Google Cloud Console IMEDIATAMENTE
# 2. Mover para .env.local
VITE_FIREBASE_API_KEY=nova_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# 3. Adicionar ao .gitignore
firebase-applet-config.json
.env.local

# 4. Atualizar src/firebase.ts para usar import.meta.env
```

### 2. XSS via `dangerouslySetInnerHTML` sem Sanitização
**Locais:** 10 ocorrências em:
- `Reader.tsx` (linhas 490, 500, 525)
- `Devotional.tsx` (linhas 678, 706, 719)
- `DictionaryView.tsx` (linha 196)
- `DictionaryBottomSheet.tsx` (linha 174)
- `StudyToolsPanel.tsx` (linhas 222, 246)

**Ação:**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
// Antes (PERIGOSO):
dangerouslySetInnerHTML={{ __html: verse.html }}

// Depois (SEGURO):
import DOMPurify from 'dompurify';
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(verse.html) }}
```

### 3. Zero Cobertura de Testes
**Risco:** Regressões em produção, bugs silenciosos  
**Ação:**
```bash
# Instalar Vitest + Testing Library
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Criar vite.config.test.ts ou adicionar ao vite.config.ts
import { defineConfig } from 'vite';
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

**Arquivos prioritários para testes:**
1. `BookNumberConverter.ts` (funções puras - mais fácil)
2. `StorageService.ts` (CRUD IndexedDB)
3. `BibleService.getVerses()` (leitura SQLite)
4. `AppContext.tsx` (sync Firestore)
5. `moduleService.ts` (importação módulos)

### 4. Gemini API Key no Client-Side
**Locais:** 
- `BibleService.ts` linha 8
- `aiStudyService.ts` linhas 29, 60
- `StudyPanel.tsx` linha 32

**Problema:** `process.env.GEMINI_API_KEY` não funciona no browser (Vite) e exporia a key no bundle.

**Ação:**
```typescript
// Errado (não funciona no browser):
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Correto (usando Vite):
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Melhor ainda (padrão do geminiService):
// Passar via settings do usuário
const geminiService = new GeminiService(settings.apiKeys?.gemini);
```

### 5. Google Token em localStorage
**Local:** `firebase.ts` linhas 24-27

**Risco:** Vulnerável a XSS - qualquer script malicioso lê o token

**Ação:**
```typescript
// Em vez de localStorage:
let currentAccessToken: string | null = null; // Memória only

// Ou usar cookies httpOnly (requer backend)
```

---

## ⚡ PROBLEMAS DE PERFORMANCE

### 1. Contexto Monolítico Causando Re-renders em Cascata
**Local:** `AppContext.tsx` linhas 487-516  
**Problema:** `useMemo` com ~35-45 dependências recria o objeto inteiro a cada mudança.

**Ação (Solução Gradual):**
```typescript
// OPÇÃO 1: Separar em múltiplos contexts
export const ThemeContext = createContext<ThemeConfig>(defaultTheme);
export const SettingsContext = createContext<AppSettings>(defaultSettings);
export const AuthContext = createContext<UserProfile | null>(null);
export const ModuleContext = createContext<ModuleState>(defaultModules);

// OPÇÃO 2: Migrar para Zustand (recomendado)
npm install zustand

import { create } from 'zustand';
const useStore = create((set) => ({
  config: defaultConfig,
  settings: defaultSettings,
  activeTab: 'home',
  updateConfig: (newConfig) => set({ config: newConfig }),
  updateSettings: (newSettings) => set({ settings: newSettings }),
}));

// Uso - só re-renderiza quando config muda:
const config = useStore(state => state.config);
```

### 2. Cache `dbCache` sem Limite (Memory Leak)
**Local:** `BibleService.ts` linha 13

**Ação:**
```typescript
import LRU from 'lru-cache';

// Cache com limite de 50 entradas e TTL de 30min
const dbCache = new LRU<string, any>({
  max: 50,
  ttl: 1000 * 60 * 30,
});

// Ou implementação simples manual:
class LimitedCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  constructor(private maxSize: number, private ttl: number) {}
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }
  
  set(key: K, value: V) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + this.ttl });
  }
}
```

### 3. Falta de Virtualização para Listas Longas
**Local:** `Reader.tsx` (Salmo 119 = 176 versículos renderizados de uma vez)

**Ação:**
```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: verses.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => 80, // altura estimada por versículo
});

return verses.map((verse, index) => {
  const virtualItem = virtualizer.getVirtualItems()[index];
  if (!virtualItem) return null;
  return <VerseCard key={verse.id} style={{ ... }} />;
});
```

### 4. `splitVerseHtml` Chamada em Todo Render sem Memoização
**Local:** `Reader.tsx` linha 477

**Ação:**
```typescript
// Criar componente memoizado
const VerseLine = React.memo(({ verse }: { verse: Verse }) => {
  const htmlParts = useMemo(() => splitVerseHtml(verse), [verse.text]);
  return <div dangerouslySetInnerHTML={{ __html: htmlParts }} />;
});
```

### 5. Double Write no Firestore
**Local:** `AppContext.tsx` linhas 260-310

**Problema:** Dois `useEffect` separados ambos chamam `syncToCloud()` quando `config` ou `settings` mudam.

**Ação:**
```typescript
// Combinar em um único effect com debounce
useEffect(() => {
  const timer = setTimeout(() => {
    if (user) {
      syncToCloud(config, settings).catch(console.error);
    }
  }, 2000); // Debounce de 2 segundos
  
  return () => clearTimeout(timer);
}, [config, settings, user]); // Um único effect
```

---

## 🏗️ MELHORIAS ARQUITETURAIS

### 1. Adicionar Roteamento Declarativo
**Problema:** Navegação via estado `activeTab` impede deep linking e histórico.

**Ação:**
```bash
npm install react-router-dom @types/react-router-dom
```

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/read/:book/:chapter" element={<ReaderWithAudio />} />
    <Route path="/search" element={<SearchView />} />
    <Route path="/notes" element={<Notes />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</BrowserRouter>
```

### 2. Decompor Componentes Gigantes

| Componente | Linhas Atuais | Componentes Sugeridos |
|------------|---------------|----------------------|
| `Notes.tsx` | ~942 | `NoteList`, `NoteEditor`, `NoteTagsPanel`, `NoteExportMenu`, `NoteSidebar` |
| `Reader.tsx` | ~834 | `VerseList`, `VerseCard`, `ChapterNavigation`, `BookmarkBar`, `DictionarySheet` |
| `App.tsx` | ~430 | `AppShell`, `TabRouter`, `AudioController`, `OnboardingGuard` |
| `AppContext.tsx` | ~602 | `ThemeProvider`, `SettingsProvider`, `AuthProvider`, `ModuleProvider` |

### 3. Mover `BibleService.ts` para `src/services/`
**Inconsistência:** Único serviço fora da pasta `services/`.

### 4. Unificar Lógica de Carregamento Binário
**Problema:** `readModuleBinaryFromPublic` e `readModuleBinaryFromAssets` duplicadas em múltiplos métodos.

**Ação:** Criar `ModuleLoaderService.ts` com função utilitária:
```typescript
export async function loadModuleBinary(modulePath: string, isWeb: boolean): Promise<ArrayBuffer> {
  if (isWeb) {
    return readModuleBinaryFromPublic(modulePath);
  }
  return readModuleBinaryFromAssets(modulePath);
}
```

### 5. Criar `src/utils/` para Funções Compartilhadas
**Problema:** `cn()` duplicado em 5+ arquivos.

**Ação:**
```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## ♿ ACESSIBILIDADE (WCAG 2.1 AA)

### Problemas Críticos
1. **Apenas 5 atributos `aria-*` em todo o projeto**
2. **Sem navegação por teclado** (Escape em modals, Tab trapping)
3. **Sem `prefers-reduced-motion`** para animações
4. **Sem skip links** para leitores de tela
5. **`focus:outline-none` sem alternativa visual**

### Ações Imediatas

```typescript
// 1. Adicionar roles semânticas
<nav role="navigation" aria-label="Menu principal">
<main role="main">
<aside role="complementary">
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// 2. Adicionar aria-label em todos os botões com ícones
<button aria-label="Abrir configurações" onClick={...}>
  <SettingsIcon />
</button>

// 3. Respeitar prefers-reduced-motion
import { useReducedMotion } from 'framer-motion';
const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? false : { opacity: 1 }}
  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
>

// 4. Substituir focus:outline-none
// Em vez de:
className="focus:outline-none"
// Usar:
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"

// 5. Adicionar skip link
// No topo do App.tsx:
<a href="#main-content" className="sr-only focus:not-sr-only">
  Pular para conteúdo principal
</a>
```

**Skill recomendada:** `accessibility-compliance-accessibility-audit` do agente-IA

---

## 🌍 I18N - INTERNACIONALIZAÇÃO

### Problema Atual
- `AppSettings.language` suporta `'pt-BR' | 'en'` mas **não há implementação**
- Centenas de strings hardcoded em português
- Prompts de IA hardcoded com `"Responda em Português do Brasil"`

### Plano de Migração (5 passos)

```bash
# 1. Instalar i18next
npm install i18next react-i18next

# 2. Criar estrutura de locales
mkdir -p src/locales/pt-BR src/locales/en

# 3. Criar arquivos de tradução
# src/locales/pt-BR/translation.json
{
  "home": {
    "title": "Bíblia Codex",
    "subtitle": "Estudo bíblico com IA",
    "search": "Buscar versículos...",
    "readingPlan": "Plano de Leitura",
    "verseOfDay": "Versículo do Dia"
  },
  "reader": {
    "book": "Livro",
    "chapter": "Capítulo",
    "verse": "Versículo",
    "bookmark": "Salvar Marcador",
    "addNote": "Adicionar Nota",
    "highlight": "Destacar"
  }
  // ... extrair todas as strings
}

# 4. Configurar i18next
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR/translation.json';
import en from './locales/en/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
  },
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
});

export default i18n;

# 5. Usar no código
// Antes:
<h1>Bíblia Codex</h1>

// Depois:
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<h1>{t('home.title')}</h1>
```

---

## 📱 PWA & MOBILE

### Configuração Atual
- ✅ Capacitor 6.0.0 configurado
- ✅ Keyboard plugin configurado
- ❌ Sem `manifest.json`
- ❌ Sem Service Worker
- ❌ Sem plugin PWA do Capacitor

### Ações Necessárias

```bash
# 1. Instalar vite-plugin-pwa
npm install -D vite-plugin-pwa workbox-window

# 2. Adicionar ao vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bíblia Codex',
        short_name: 'Bíblia',
        description: 'Estudo bíblico com IA',
        theme_color: '#1e3a5f',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
});

# 3. Adicionar plugin PWA do Capacitor
npm install @capacitor/pwa
npx cap sync

# 4. Recriar projeto Android
npx cap add android
npm run cap:sync
```

---

## 🤖 FEATURES DE IA RECOMENDADAS

### Baseado em Análise de Apps Líderes (YouVersion, Logos, Olive Tree)

| Feature | YouVersion | Logos | Bible Codex (Atual) | Prioridade |
|---------|-----------|-------|---------------------|------------|
| Planos de leitura | ✅ | ✅ | ✅ | Mantido |
| Highlights/Notas | ✅ | ✅ | ✅ | Mantido |
| Busca avançada | Básica | ✅ | ⚠️ Básica | 🔴 Melhorar |
| Multi-traduções | ✅ | ✅ | ✅ | Mantido |
| Áudio Bíblia | ✅ | ✅ | ⚠️ Parcial | 🟡 Completar |
| Comentários | Limitado | ✅ | ⚠️ IA only | 🟡 RAG |
| Dicionário/Concordância | ❌ | ✅ | ✅ | Mantido |
| Social/Comunidade | ✅ | ⚠️ | ❌ | 🟢 Futuro |
| Offline | ✅ | Parcial | ✅ | Mantido |
| Original languages | ❌ | ✅ | ✅ **Diferencial** | 💎 Manter |
| Cross-references | ❌ | ✅ | ⚠️ Dados only | 🟡 Visualizar |
| Study plans | ✅ | ✅ | ❌ | 🔴 **Implementar** |
| Verse comparison | ❌ | ✅ | ❌ | 🟡 **Implementar** |
| Semantic search | ❌ | ⚠️ | ❌ | 🔴 **Diferencial IA** |

### Features Recomendadas com IA

#### 1. **Busca Semântica de Versículos** (Diferencial Único)
```typescript
// Usando embeddings para busca por tema
const searchResults = await bibleService.semanticSearch(
  "versículos sobre ansiedade e paz",
  { topK: 10 }
);
// Retorna: Filipenses 4:6-7, Mateus 6:25-34, João 14:27, etc.
```

#### 2. **Plano de Leitura Personalizado com IA**
```typescript
// IA gera plano baseado em histórico e interesses
const plan = await aiService.generateReadingPlan({
  days: 30,
  theme: 'Fé e Confiança',
  difficulty: 'iniciante',
  userHistory: lastReadings,
});
```

#### 3. **Explicação de Passagens com Contexto Histórico**
```typescript
const explanation = await aiService.explainPassage({
  verse: 'João 3:16',
  includeContext: true, // contexto histórico-cultural
  includeOriginalLanguages: true, // grego/hebraico
  includeCrossReferences: true, // referências cruzadas
});
```

#### 4. **Chat de Estudo Bíblico (RAG Pipeline)**
```typescript
// RAG com comentários, dicionários e referências
const chatResponse = await aiService.chatQuery({
  question: "O que significa 'graça' em Efésios 2:8?",
  context: ['dictionary:charis', 'commentary:matthew-henry:ef2', 'cross-refs:ef2:8'],
});
```

---

## 🛠️ SKILLS RECOMENDADAS DO AGENTE-IA

### Prioridade Alta (Usar AGORA)

| Skill | Categoria | Por que usar |
|-------|-----------|--------------|
| `react-best-practices` | Performance | 45 regras para otimizar renders, bundle, lazy loading |
| `accessibility-compliance-accessibility-audit` | A11y | Auditoria WCAG 2.1 AA completa |
| `007` | Segurança | Threat modeling STRIDE/PASTA, OWASP Top 10 |
| `test-driven-development` | Testing | Garantir código testado desde início |
| `react-component-performance` | Performance | Diagnosticar re-renders com DevTools Profiler |

### Prioridade Média (Usar EM BREVE)

| Skill | Categoria | Por que usar |
|-------|-----------|--------------|
| `react-ui-patterns` | UI/UX | Loading/Erro/Empty states consistentes |
| `mobile-design` | Mobile | Design system mobile-first |
| `ai-engineering-toolkit` | IA | RAG pipeline, prompt evaluator |
| `algolia-search` | Busca | Busca instantânea com facets e synonyms |
| `android-bible-architecture` | Arquitetura | Patterns de apps bíblicos (mesmo para React) |

---

## 📋 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Correções Críticas (Semana 1)
- [ ] **1.** Rotacionar Firebase API key e mover para `.env`
- [ ] **2.** Adicionar DOMPurify em todos os `dangerouslySetInnerHTML`
- [ ] **3.** Corrigir `process.env.GEMINI_API_KEY` para `import.meta.env`
- [ ] **4.** Mover Google token de localStorage para memória
- [ ] **5.** Adicionar `.gitignore` para `firebase-applet-config.json`

### Fase 2: Performance Básica (Semana 2)
- [ ] **6.** Instalar e configurar Zustand
- [ ] **7.** Adicionar LRU cache ao `dbCache`
- [ ] **8.** Combinar double-write do Firestore com debounce
- [ ] **9.** Memoizar `splitVerseHtml` com `React.memo`
- [ ] **10.** Corrigir keys de lista no `Reader.tsx`

### Fase 3: Qualidade de Código (Semana 3-4)
- [ ] **11.** Instalar Vitest + Testing Library
- [ ] **12.** Criar testes para `BookNumberConverter` e `StorageService`
- [ ] **13.** Adicionar ESLint + Prettier
- [ ] **14.** Mover `cn()` para `src/utils/cn.ts`
- [ ] **15.** Mover `BibleService.ts` para `src/services/`

### Fase 4: Acessibilidade (Semana 5)
- [ ] **16.** Adicionar roles ARIA semânticas
- [ ] **17.** Implementar focus trap em modals
- [ ] **18.** Respeitar `prefers-reduced-motion`
- [ ] **19.** Adicionar skip links
- [ ] **20.** Substituir `focus:outline-none` por `focus-visible:ring-2`

### Fase 5: PWA & Mobile (Semana 6)
- [ ] **21.** Adicionar `manifest.json`
- [ ] **22.** Configurar vite-plugin-pwa
- [ ] **23.** Instalar @capacitor/pwa
- [ ] **24.** Recriar projeto Android com `npx cap add android`
- [ ] **25.** Testar build em dispositivo real

### Fase 6: i18n (Semana 7-8)
- [ ] **26.** Instalar i18next + react-i18next
- [ ] **27.** Extrair strings para `pt-BR/translation.json`
- [ ] **28.** Criar `en/translation.json`
- [ ] **29.** Substituir strings hardcoded por `t('key')`
- [ ] **30.** Testar com idioma inglês

### Fase 7: Features de IA (Semana 9-12)
- [ ] **31.** Implementar busca semântica com embeddings
- [ ] **32.** Criar plano de leitura personalizado com IA
- [ ] **33.** Adicionar explicação de passagens com contexto
- [ ] **34.** Implementar chat de estudo bíblico (RAG)
- [ ] **35.** Adicionar visualização de referências cruzadas

### Fase 8: Refatoração Arquitetural (Semana 13-16)
- [ ] **36.** Adicionar React Router
- [ ] **37.** Decompor `Notes.tsx` em 5 componentes
- [ ] **38.** Decompor `Reader.tsx` em 5 componentes
- [ ] **39.** Separar `AppContext.tsx` em 4 providers
- [ ] **40.** Criar virtualização com @tanstack/react-virtual

---

## 📊 MÉTRICAS ATUAIS vs TARGET

| Métrica | Atual | Target | Como Medir |
|---------|-------|--------|------------|
| **Linhas de código** | ~15.000 | ~18.000 (com testes) | `wc -l src/**/*.{ts,tsx}` |
| **Componentes > 500 linhas** | 4 (Notes, Reader, MapsPage, ModuleManagement) | 0 | Script de análise |
| **Cobertura de testes** | 0% | 80% | `npm run test -- --coverage` |
| **Score Lighthouse (Performance)** | N/A | > 90 | Lighthouse CI |
| **Score Lighthouse (Acessibilidade)** | ~30 | > 95 | Lighthouse CI |
| **Bundle size (gzip)** | N/A | < 200KB | `npm run build` |
| **Time to Interactive** | N/A | < 3s | Lighthouse |
| **Re-renders desnecessários** | ~35 por interação | < 5 | React DevTools Profiler |

---

## 🔧 FERRAMENTAS RECOMENDADAS

### Para Instalar AGORA
```bash
# Segurança
npm install dompurify

# Performance
npm install zustand lru-cache @tanstack/react-virtual

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Qualidade de código
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-react-hooks

# PWA
npm install -D vite-plugin-pwa workbox-window
npm install @capacitor/pwa

# i18n
npm install i18next react-i18next

# Roteamento
npm install react-router-dom
npm install -D @types/react-router-dom

# Utils
npm install clsx tailwind-merge
```

### Scripts para Adicionar ao `package.json`
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,css,json}",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "analyze": "npx vite-bundle-visualizer",
    "lighthouse": "npx lighthouse http://localhost:5173 --view"
  }
}
```

---

## 📚 REFERÊNCIAS E SKILLS DO AGENTE-IA

### Skills para Usar IMEDIATAMENTE
```bash
# No diretório do agente-IA:
/agent-ia usar react-best-practices
/agent-ia usar accessibility-compliance-accessibility-audit
/agent-ia usar 007
/agent-ia usar test-driven-development
```

### Skills para Usar EM BREVE
```bash
/agent-ia usar react-component-performance
/agent-ia usar react-ui-patterns
/agent-ia usar mobile-design
/agent-ia usar ai-engineering-toolkit
/agent-ia usar algolia-search
/agent-ia usar android-bible-architecture
```

---

## ✅ CHECKLIST DE PRODUÇÃO

### Antes de Publicar na Play Store
- [ ] Rotacionar todas as API keys
- [ ] Remover `console.log` de produção
- [ ] Adicionar DOMPurify em TODO `dangerouslySetInnerHTML`
- [ ] Testar em 3+ dispositivos Android diferentes
- [ ] Testar offline (sem internet)
- [ ] Testar com tela pequena (320px)
- [ ] Testar com fonte grande (acessibilidade)
- [ ] Rodar Lighthouse e garantir score > 90
- [ ] Rodar testes com cobertura > 80%
- [ ] Configurar Application Check no Firebase
- [ ] Adicionar política de privacidade
- [ ] Adicionar termos de uso
- [ ] Configurar monitoramento de erros (Sentry, Crashlytics)
- [ ] Testar importação de módulos `.mybible` de fontes externas
- [ ] Validar regras de segurança do Firestore
- [ ] Gerar APK assinado com `npm run cap:run`

---

## 🎯 CONCLUSÃO

O **Bíblia Codex** tem uma base sólida com features únicas (Strong's numbers, dicionários, IA integrada, módulos MySword), mas precisa de:

1. **Correções de segurança URGENTES** (API keys expostas, XSS)
2. **Otimizações de performance** (context splitting, cache com limite, virtualização)
3. **Testes automatizados** (zero cobertura atual)
4. **Acessibilidade** (apenas 5 aria-labels em todo o app)
5. **Internacionalização** (strings hardcoded em português)

Com as melhorias sugeridas, o app pode competir com YouVersion, Logos e Olive Tree em termos de qualidade, especialmente com o **diferencial único de IA + línguas originais (Strong's)**.

**Tempo estimado de refatoração:** 16 semanas (4 meses) com 1-2 desenvolvedores  
**Impacto esperado:** 
- Performance: 3-5x mais rápido
- Acessibilidade: 30 → 95+ no Lighthouse
- Confiabilidade: 0% → 80%+ cobertura de testes
- Alcance: Português → Português + Inglês

---

**Relatório gerado em:** 11 de abril de 2026  
**Analisado por:** Agentes de IA especializados + revisão manual  
**Próximos passos:** Iniciar Fase 1 (Correções Críticas) imediatamente
