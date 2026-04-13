# ✅ Correção de Navegação - 1º e 2º Trimestre 2026

## 🐛 Problema Identificado
Ao clicar nas lições do 1º ou 2º trimestre, o app voltava para o menu principal sem mostrar o conteúdo da lição.

### Causa
O componente `LessonView` exibia conteúdo **genérico/placeholder** (João 3:16, texto padrão) ao invés do conteúdo real da lição extraído da revista digital.

---

## ✅ Solução Implementada

### Fluxo Antigo (Bugado)
```
Clica na Lição → LessonView (conteúdo genérico) → Usuário volta pro menu
```

### Fluxo Novo (Corrigido)
```
Clica na Lição → DynamicBook (revista completa) → Navega automaticamente para a página da lição
```

---

## 🔧 Alterações Realizadas

### 1. Componente `DynamicBook`
- ✅ Adicionado prop `initialPageIndex?: number`
- ✅ Após carregar HTML, navega automaticamente para a página especificada
- ✅ Usa função `showPage()` do iframe para navegação

```typescript
const DynamicBook: React.FC<{
  onBack: () => void;
  magazineUrl?: string;
  magazineHTML?: string;
  initialPageIndex?: number;  // ← NOVO
}> = ({ onBack, magazineUrl, magazineHTML, initialPageIndex }) => {
  // ... após carregar HTML:
  if (initialPageIndex) {
    setTimeout(() => {
      const win = iframe.contentWindow as any;
      const showPageFn = win.showPage;
      if (typeof showPageFn === 'function') {
        showPageFn(initialPageIndex);  // ← Navega automaticamente
      }
    }, 500);
  }
}
```

### 2. Componente `QuarterView`
- ✅ Adicionado prop `onOpenDynamicBook?: (url, pageIndex) => void`
- ✅ Ao clicar numa lição do 1º/2º trimestre, chama `onOpenDynamicBook` ao invés de `onSelectLesson`
- ✅ Calcula automaticamente o índice da página: `pageIndex = lesson.number + 2`

```typescript
onClick={() => {
  // Para 1º e 2º trimestre 2026, abrir revista completa
  if (onOpenDynamicBook && (quarter.id === '2026-q1' || quarter.id === '2026-q2')) {
    const url = quarter.id === '2026-q1' ? '/public/EBD/page.txt' : '/public/EBD/page2.txt';
    const pageIndex = lesson.number + 2;  // +2 (page 0=capa, 1=editora, 2=sumário)
    onOpenDynamicBook(url, pageIndex);
  } else {
    onSelectLesson(lesson);
  }
}}
```

### 3. Componente Principal `EBDPage`
- ✅ Adicionado estado `initialPageIndex`
- ✅ Atualizada função `clearExtractedData` para limpar o índice
- ✅ Passado `onOpenDynamicBook` para `QuarterView`
- ✅ Passado `initialPageIndex` para `DynamicBook`

```typescript
const [initialPageIndex, setInitialPageIndex] = useState<number | undefined>(undefined);

// QuarterView
onOpenDynamicBook={(url, pageIndex) => {
  setMagazineUrl(url);
  setMagazineHTML(null);
  setInitialPageIndex(pageIndex);  // ← Salva índice
  setShowDynamicBook(true);
}}

// DynamicBook
<DynamicBook
  onBack={clearExtractedData}
  magazineUrl={magazineUrl || undefined}
  magazineHTML={magazineHTML || undefined}
  initialPageIndex={initialPageIndex}  // ← Passa índice
/>
```

---

## 📊 Mapeamento de Páginas

### 1º Trimestre 2026 (`page.txt`)
| Lição | Página | Cálculo |
|-------|--------|---------|
| Capa | 0 | - |
| Palavra da Editora | 1 | - |
| Sumário | 2 | - |
| **Lição 01** | **3** | 1 + 2 |
| **Lição 02** | **4** | 2 + 2 |
| **Lição 03** | **5** | 3 + 2 |
| ... | ... | ... |
| **Lição 13** | **15** | 13 + 2 |

### 2º Trimestre 2026 (`page2.txt`)
| Lição | Página | Cálculo |
|-------|--------|---------|
| Capa | 0 | - |
| Palavra da Editora | 1 | - |
| Sumário | 2 | - |
| **Lição 01** | **3** | 1 + 2 |
| **Lição 02** | **4** | 2 + 2 |
| **Lição 03** | **5** | 3 + 2 |
| ... | ... | ... |
| **Lição 13** | **15** | 13 + 2 |

---

## ✅ Resultado Final

### Antes ❌
1. Usuário clica na "Lição 01" do 2º trimestre
2. Abre `LessonView` com conteúdo genérico (João 3:16)
3. Usuário fica confuso e volta para o menu

### Depois ✅
1. Usuário clica na "Lição 01" do 2º trimestre
2. Abre `DynamicBook` com `page2.txt`
3. Automaticamente navega para **página 3** (Lição 01)
4. Mostra conteúdo **real e completo** da lição
5. Usuário pode navegar entre páginas com botões ← →

---

## 🎯 Benefícios

✅ **Conteúdo Real**: Agora mostra o conteúdo extraído da revista digital  
✅ **Navegação Automática**: Vai direto para a página da lição clicada  
✅ **Revista Completa**: Usuário pode navegar entre todas as páginas  
✅ **Sem Quebra de Fluxo**: Trimestres antigos ainda usam `LessonView`  
✅ **TypeScript OK**: Zero erros de compilação  

---

## 📁 Arquivos Modificados

- `src/components/EBDPage.tsx`
  - Linha 53-116: Componente `DynamicBook` com `initialPageIndex`
  - Linha 159: Estado `initialPageIndex`
  - Linha 225-233: Função `clearExtractedData` atualizada
  - Linha 236: Passado `initialPageIndex` para `DynamicBook`
  - Linha 353-362: `QuarterView` com `onOpenDynamicBook`
  - Linha 513-580: Componente `QuarterView` atualizado

---

**Data:** Abril 2026  
**Status:** ✅ Implementado e testado  
**Erros TypeScript:** 0
