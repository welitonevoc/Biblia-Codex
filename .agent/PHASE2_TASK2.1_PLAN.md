# 🚀 PHASE 2 - TASK 2.1: Add Memoization to Components

**Status:** IN PROGRESS  
**Estimado:** 3 horas  
**Prioridade:** HIGH

---

## Estratégia

Adicionar React.memo aos seguintes componentes em ordem de impacto:

### Tier 1 - Componentes Puros (Maior Impacto)
1. ✅ **VerseItem** (renderiza para cada versículo, muitos re-renders)
2. ✅ **FootnoteItem** (dentro de lista de notas de rodapé)
3. ✅ **HighlightMarker** (renderiza para cada destaques)
4. ✅ **SearchResult** (dentro de lista de busca)
5. ✅ **TagCard** (dentro de tag system)

### Tier 2 - Componentes Contextuais
6. ✅ **BookmarkList** (renderiza lista de bookmarks)
7. ✅ **SettingsSection** (renderiza seções de settings)
8. ✅ **ThemeSelector** (renderiza seletor de tema)
9. ✅ **PopupContainer** (reusa container para popups)

### Tier 3 - Componentes Opcionais
10. ✅ **BookshelfCard** (renderiza grid de livros)

---

## Implementação Por Componente

### 1. Identificar Componentes Candidatos

**Critérios:**
- ✓ Componentes funcionais puros (não dependem de contexto externo)
- ✓ Renderizam muitas vezes com mesmas props
- ✓ Não usam hooks com side effects frequentes
- ✓ Props estáveis (ou podem ser estabilizadas)

### 2. Adicionar React.memo

**Pattern Básico:**
```tsx
export const VerseItem = React.memo(({ verse, highlight, onClick }: Props) => {
  return <div>...</div>;
});

// Custom comparison (se necessário)
export const VerseItem = React.memo(
  ({ verse, highlight, onClick }: Props) => {
    return <div>...</div>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.verse.id === nextProps.verse.id &&
      prevProps.highlight === nextProps.highlight
    );
  }
);
```

### 3. Próximo Passo: useMemo & useCallback

Em Task 2.2, iremos estabilizar props passadas para components com React.memo.

---

## Checklist de Implementação

### Phase 2.1A - Remover console.log (PRIORITY)

- [ ] Identificar todos console.log em BibleReader.tsx
- [ ] Remover ou usar logger service
- [ ] Verificar com grep

### Phase 2.1B - Adicionar React.memo (MAIN)

- [ ] [ ] Criar lista de 10+ componentes candidatos
- [ ] [ ] Medir current render count (React Devtools Profiler)
- [ ] [ ] Add React.memo wrapping
- [ ] [ ] Re-medir render count
- [ ] [ ] Documentar improvement %

### Phase 2.1C - Benchmark

- [ ] [ ] Profile rendering com React Devtools
- [ ] [ ] Medir LCP (Largest Contentful Paint)
- [ ] [ ] Documentar baseline vs otimizado

---

## Próximas Ações

**Hoje:**
1. Remover console.log do BibleReader
2. Identificar e wrappear 5-10 componentes com React.memo
3. Medir impacto

**Tomorrow:**
1. Adicionar useMemo/useCallback (Task 2.2)
2. Lazy load dados grandes (Task 2.3)
3. Otimizar stores (Task 2.4)

---

**Começar:** Agora
**ETA:** 2-3 horas
