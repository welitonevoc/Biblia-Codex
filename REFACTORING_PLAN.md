# 📋 Plano de Refatoração - Bible-Codex

**Data de início:** 24/04/2026  
**Status:** Em andamento (Pausado)  
**Responsável:** AI Assistant

---

## ✅ O QUE JÁ FOI FEITO

### 1. TypeScript Strict Mode (CONCLUÍDO)
- ✅ `tsconfig.json` atualizado com strict mode ativado
- ✅ Adicionadas opções: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`

### 2. BibleService.ts (CONCLUÍDO)
- ✅ Arquivo reescrito completamente
- ✅ Removidos todos os `any`
- ✅ Tipos criados: `SQLiteRow`, `SQLiteSchema`, `SQLiteDatabase`, `CachedDB`, `PeopleData`, `PlacesData`, `CrossReference`, `ParseSettings`, `ModuleData`, `CapacitorWindow`
- ✅ Corrigido: `catch (error: unknown)` em vez de `catch (error: any)`
- ✅ Tipado corretamente: `as unknown as Type` pattern usado apropriadamente

### 3. AppContext.tsx (CONCLUÍDO)
- ✅ Arquivo reescrito completamente
- ✅ Removidos todos os `any`
- ✅ Interface `AppContextType` corrigida
- ✅ Adicionadas importações de tipos corretos em `./types`
- ✅ Corrigido: `toggleSetting` agora usa `Record<string, unknown>` em vez de `any`

### 4. Componentes Parcialmente Refatorados
- ✅ `StudyToolsPanel.tsx` - `useState<any>` corrigido para `useState<Record<string, unknown> | string | null>`
- ✅ `AISettingsPage.tsx` - `let data: any` corrigido com tipo apropriado
- ✅ `SettingsPage.tsx` - `onSelect: (value: any)` corrigido para `(value: string | number)`
- ✅ `MapsPage.tsx` - `useState<any[]>` corrigido para `useState<ModuleInfo[]>`
- ✅ `ui/toggle-group.tsx` - Removidos casts `(child.props as any)`

---

## ❌ O QUE FALTA FAZER

### 🔴 PRIORIDADE CRÍTICA (Bloqueando compilação)

#### 1. Corrigir erros de compilação TypeScript (Imediato)
**Arquivo:** `src/types.ts`  
**Problema:** Faltam exportar tipos necessários
```typescript
// Adicionar ao types.ts:
export type AppSettingsKey = keyof AppSettings;
export type TextDisplayKey = keyof AppSettings['textDisplay'];
export type StudyToolsKey = keyof AppSettings['studyTools'];
export type VisualResourcesKey = keyof AppSettings['visualResources'];
export type BehaviorKey = keyof AppSettings['behavior'];
export type NavigationKey = keyof AppSettings['navigation'];
export type AnimationKey = keyof AppSettings['animation'];
export type AiKey = keyof AppSettings['ai'];
export interface ModuleInfo {
  id: string;
  name: string;
  abbreviation: string;
  category: string;
  format: string;
  language?: string;
  author?: string;
  size?: number;
  path: string;
}
```

#### 2. Instalar tipos faltantes
```bash
cd C:\Users\Jose Menezes\StudioProjects\Biblia-Codex\Biblia-Codex
npm install --save-dev @types/sql.js
```

#### 3. Corrigir `BibleService.ts` - erros restantes
- **Linha 68:** `Directory.Application` não existe → Corrigir para `Directory.Documents` ou remover
- **Linhas 140, 144, 225, 507:** `db.exec()` espera 1 argumento, não 2 → Corrigir chamadas SQL
- **Linha 258:** `CrossReference` falta propriedade `id` → Adicionar `id` no mapeamento

#### 4. Corrigir `AppContext.tsx` - erros restantes
- **Linha 514:** `BibleModule` não é assignable a `StudyModule` → Criar função de conversão ou ajustar tipo

---

### 🟡 PRIORIDADE ALTA (Componentes)

#### 5. Corrigir componentes com erros TypeScript
| Arquivo | Erro | Ação |
|---------|------|------|
| `AppearanceSettings.tsx:295,299` | `PageTransition` vs `"none"` | Adicionar `"none"` ao tipo ou remover comparação |
| `Devotional.tsx:473` | `AppSettings` vs `ParseSettings` | Ajustar tipos ou criar interface compatível |
| `DevotionalPage.tsx:76` | Object possivelmente `null` | Adicionar verificação de null |
| `GenealogyTree.tsx:67,71,73` | `PeopleData` vs `Person` | Ajustar interface `Person` para aceitar `id: string` |
| `Notes.tsx:404` | `string \| null` vs `string` | Adicionar verificação de null |
| `Reader.tsx:79` | `AppSettings` vs `ParseSettings` | Mesmo problema do Devotional.tsx |
| `ReaderWithAudio.tsx:110` | Assinatura de função incompatível | Ajustar tipo da prop `onNavigate` |

#### 6. Refatorar demais componentes com `any`
Baseado na busca inicial (105 ocorrências encontradas):
- ❌ `components/SearchView.tsx` - catch (err: any)
- ❌ `components/Notes.tsx` - catch (error: any)
- ❌ `components/DictionaryView.tsx` - catch (err: any)
- ❌ `components/DevotionalPage.tsx` - catch (err: any), linha 86
- ❌ `components/PermissionScreen.tsx` - catch (err: any)
- ❌ `components/ModuleManagement.tsx` - `CATEGORY_ICONS: Record<string, any>`
- ❌ `components/BookmarksPage.tsx` - `setSortBy(s.id as any)`
- ❌ `components/ReadingPlans.tsx` - `setActiveTab(tab.id as any)`
- ❌ `components/Settings.tsx` - várias ocorrências de `as any`
- ❌ `components/PlacesView.tsx` - `processPlaces(data: any[])`
- ❌ `components/EBDPage.tsx` - `iframe.contentWindow as any`
- ❌ `components/EBD/MagazineReader.tsx` - várias ocorrências
- ❌ `components/GlobalDrawer.tsx` - `useAppContext() as any`

#### 7. Services com `any` pendentes
- ❌ `services/moduleScanner.ts` - 7 ocorrências
- ❌ `services/geminiService.ts` - 2 ocorrências
- ❌ `services/dictionaryService.ts` - 3 ocorrências
- ❌ `services/mySwordParser.ts` - 3 ocorrências
- ❌ `services/moduleService.ts` - 2 ocorrências
- ❌ `services/permissionsService.ts` - 3 ocorrências
- ❌ `services/FootnoteService.ts` - 1 ocorrência
- ❌ `hooks/usePermissions.ts` - 3 ocorrências
- ❌ `firebase.ts` - 1 ocorrência
- ❌ `scratchpad.ts` - 3 ocorrências

---

### 🟢 PRIORIDADE MÉDIA (Melhorias)

#### 8. Aplicar React Best Practices (Skills carregadas)
Baseado no guia `react-best-practices` (carregado):
- **Bundle Size Optimization:** Verificar imports do `lucide-react` (usar direitos ou optimizePackageImports)
- **Re-render Optimization:** Aplicar `React.memo()` onde apropriado
- **Rendering Performance:** Verificar `content-visibility` para listas longas
- **JavaScript Performance:** Usar `Map/Set` para lookups repetidos
- **Advanced Patterns:** Verificar `useLatest` para callbacks estáveis

#### 9. Refatorar `App.tsx` (549 linhas)
- ❌ Separar em componentes menores
- ❌ Extrair lógica de renderização
- ❌ Melhorar organização de lazy loading
- ❌ Reduzir responsabilidades

#### 10. Melhorar Stores Zustand
- ❌ Verificar se `stores/` está sendo usado corretamente
- ❌ Migrar lógica de estado do AppContext para stores onde apropriado

---

## 📊 RESUMO DE PROGRESSO

| Categoria | Status | Concluído | Total | % |
|-----------|--------|----------|-------|----|
| TypeScript Strict Mode | ✅ | 1 | 1 | 100% |
| BibleService.ts | ✅ | 1 | 1 | 100% |
| AppContext.tsx | ✅ | 1 | 1 | 100% |
| Componentes React | 🔄 | 5 | 55+ | ~9% |
| Services | ❌ | 0 | 10 | 0% |
| Hooks/Utils | ❌ | 0 | 5 | 0% |
| React Best Practices | ❌ | 0 | 1 | 0% |
| App.tsx Refatoração | ❌ | 0 | 1 | 0% |

**Progresso geral estimado:** ~25%

---

## 🚀 PRÓXIMOS PASSOS (Ao retornar)

1. **Primeiro:** Corrigir erros de compilação TypeScript (Seção CRÍTICA 1-4)
   ```bash
   cd C:\Users\Jose Menezes\StudioProjects\Biblia-Codex\Biblia-Codex
   npm install --save-dev @types/sql.js
   # Editar src/types.ts para adicionar tipos faltantes
   # Corrigir erros em BibleService.ts e AppContext.tsx
   npm run lint  # Verificar se compila
   ```

2. **Segundo:** Continuar refatoração de componentes (Seção ALTA 5-7)
   - Usar as skills `codebase-cleanup-refactor-clean` e `react-best-practices`
   - Focar em eliminar todos os `any`

3. **Terceiro:** Aplicar melhorias de performance (Seção MÉDIA 8-10)
   - Seguir o guia de React Best Practices
   - Refatorar App.tsx

---

## 📝 NOTAS IMPORTANTES

- O projeto **NÃO compila** no estado atual devido aos erros listados acima
- **Prioridade absoluta:** Fazer o projeto compilar sem erros TypeScript
- Todas as alterações foram feitas com `edit` e `write` (sem comandos destrutivos)
- O `tsconfig.json` está com `strict: true` - isso está correto, não reverter

---

**Arquivo criado em:** 24/04/2026  
**Para continuar:** Basta pedir para continuar a refatoração que seguirei do passo 1 da seção CRÍTICA.
