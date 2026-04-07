# 🎨 Bible Codex V2 — Design System & Plano de Atualização

## Visão Geral

Transformar o Bible Codex em um aplicativo bíblico de classe mundial, combinando o melhor design dos apps líderes do mercado com a identidade visual premium existente.

---

## 🎨 Design System V2

### Cores

#### Paleta Principal
```css
/* Cores Base */
--bg-primary: #0A0A0A;        /* Preto profundo */
--bg-secondary: #111111;      /* Cinza muito escuro */
--bg-tertiary: #1A1A1A;       /* Cards e superfícies */
--bg-elevated: #222222;       /* Modais e popups */

/* Cores de Texto */
--text-primary: #FFFFFF;      /* Branco puro */
--text-secondary: #B0B0B0;    /* Cinza claro */
--text-tertiary: #666666;     /* Cinza médio */
--text-muted: #444444;        /* Cinza escuro */

/* Accent (Dourado) */
--accent-gold: #D4AF37;       /* Dourado principal */
--accent-gold-light: #F4E4BC; /* Dourado claro */
--accent-gold-dim: #8B7355;   /* Dourado escuro */
--accent-gold-bg: rgba(212, 175, 55, 0.1);

/* Estados */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

#### Temas de Leitura
```css
/* Tema Escuro (Padrão) */
.theme-dark {
  --reader-bg: #050505;
  --reader-text: #E0E0E0;
  --reader-accent: #D4AF37;
}

/* Tema Claro */
.theme-light {
  --reader-bg: #FFFFFF;
  --reader-text: #1A1A1A;
  --reader-accent: #8B7355;
}

/* Tema Sepia */
.theme-sepia {
  --reader-bg: #F5E6D3;
  --reader-text: #3D2B1F;
  --reader-accent: #8B4513;
}

/* Tema Noturno (OLED) */
.theme-oled {
  --reader-bg: #000000;
  --reader-text: #CCCCCC;
  --reader-accent: #D4AF37;
}
```

### Tipografia

#### Fontes
```css
/* Display (Títulos) */
--font-display: 'Inter', sans-serif;

/* Leitura (Corpo) */
--font-reading: 'Literata', serif;
--font-reading-alt: 'Source Serif 4', serif;

/* UI (Interface) */
--font-ui: 'Inter', sans-serif;

/* Monospace (Código) */
--font-mono: 'JetBrains Mono', monospace;
```

#### Tamanhos
```css
/* Títulos */
--text-7xl: 4.5rem;    /* Capítulo número */
--text-4xl: 2.25rem;   /* Título de página */
--text-2xl: 1.5rem;    /* Subtítulo */
--text-xl: 1.25rem;    /* Destaque */

/* Corpo */
--text-lg: 1.125rem;   /* Texto grande */
--text-base: 1rem;     /* Texto padrão */
--text-sm: 0.875rem;   /* Texto pequeno */
--text-xs: 0.75rem;    /* Labels */

/* Especiais */
--text-verse: 1rem;    /* Número do versículo */
--text-footnote: 0.75rem;
```

### Espaçamentos

```css
/* Grid Base (4px) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

/* Bordas */
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Sombras

```css
/* Suave */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);

/* Média */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);

/* Forte */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

/* Premium (Dourado) */
--shadow-gold: 0 0 20px rgba(212, 175, 55, 0.2);

/* Elevação */
--shadow-elevated: 0 20px 50px rgba(0, 0, 0, 0.6);
```

---

## 🧩 Componentes V2

### Bottom Navigation

```tsx
// Componente: BottomNav
// Props: activePage, onNavigate
// Itens: Bíblia, Buscar, Planos, Notas, Mais

<div className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-t border-[var(--border)] z-50">
  <div className="flex items-center justify-around h-full max-w-lg mx-auto">
    <NavItem icon={BookOpen} label="Bíblia" active />
    <NavItem icon={Search} label="Buscar" />
    <NavItem icon={Calendar} label="Planos" />
    <NavItem icon={FileText} label="Notas" />
    <NavItem icon={MoreHorizontal} label="Mais" />
  </div>
</div>
```

### Quick Actions (FAB)

```tsx
// Componente: QuickActionFAB
// Acesso rápido a ações frequentes

<motion.button
  className="fixed bottom-20 right-4 w-14 h-14 bg-[var(--accent-gold)] rounded-full shadow-gold"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  <Plus size={24} className="text-black" />
</motion.button>

// Menu expandido
- Continuar leitura
- Versículo do dia
- Marcador recente
- Nova nota
```

### Reader Modes

#### Modo Leitura
```tsx
// Interface minimalista
- Header compacto (voltar, capítulo, config)
- Texto com scroll contínuo
- Progress bar no topo
- Sem distrações
```

#### Modo Estudo
```tsx
// Split view
- Painel esquerdo: texto bíblico
- Painel direito: comentário/notas
- Toolbar fixa com ferramentas
- Strong's numbers inline
```

#### Modo Comparação
```tsx
// Versões lado a lado
- 2-3 colunas sincronizadas
- Destaque de diferenças
- Seletor de versões
```

### Chapter Selector

```tsx
// Componente: ChapterSelector
// Grid de capítulos com preview

<motion.div className="grid grid-cols-6 gap-2 p-4">
  {chapters.map(ch => (
    <button
      key={ch}
      className="aspect-square rounded-xl bg-[var(--bg-tertiary)] 
                 hover:bg-[var(--accent-gold-bg)] transition-all"
    >
      {ch}
    </button>
  ))}
</motion.div>
```

### Search Bar (Proeminente)

```tsx
// Componente: SearchBar
// Sempre visível no topo

<div className="sticky top-0 p-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl">
  <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-tertiary)] rounded-2xl">
    <Search size={20} className="text-[var(--text-tertiary)]" />
    <input 
      placeholder="Buscar versículos, palavras, referências..."
      className="flex-1 bg-transparent outline-none text-[var(--text-primary)]"
    />
    <VoiceButton />
  </div>
</div>
```

---

## 📐 Layouts

### Layout Principal (Atualizado)

```
┌─────────────────────────────────────┐
│           Header Compacto           │
├─────────────────────────────────────┤
│                                     │
│           Área de Conteúdo          │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Bíblia] [Buscar] [Planos] [Notas] [Mais] │
└─────────────────────────────────────┘
```

### Layout de Leitura

```
┌─────────────────────────────────────┐
│ ← Gênesis 1 ▼           ⚙️ 🔍    │
├─────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                     │
│  ¹ No princípio criou Deus os      │
│  céus e a terra.                   │
│                                     │
│  ² E a terra era sem forma e       │
│  vazia...                          │
│                                     │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────┤
│ [Anterior]              [Próximo]  │
└─────────────────────────────────────┘
```

### Layout de Estudo

```
┌───────────────────┬─────────────────┐
│ ← Gênesis 1 ▼    │ Comentário      │
├───────────────────┼─────────────────┤
│                   │                 │
│ ¹ No princípio... │ "No princípio"  │
│                   │ refere-se ao... │
│ ² E a terra...    │                 │
│                   │ Ver também:     │
│                   │ João 1:1        │
│                   │                 │
├───────────────────┴─────────────────┤
│ [Leitura] [Estudo] [Comparar]      │
└─────────────────────────────────────┘
```

---

## 🔄 Transições e Animações

### Page Transitions
```typescript
// Fade + Scale
const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeOut' }
};
```

### Verse Selection
```typescript
// Highlight animation
const verseHighlight = {
  initial: { backgroundColor: 'transparent' },
  animate: { backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  transition: { duration: 0.3 }
};
```

### Bottom Sheet
```typescript
// Slide up
const sheetVariants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 }
};
```

---

## 📱 Responsividade

### Breakpoints
```css
/* Mobile */
@media (max-width: 639px) {
  /* Layout single column */
  /* Bottom navigation */
  /* Touch-optimized */
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  /* Layout 2 columns (estudo) */
  /* Sidebar parcial */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Layout completo */
  /* Sidebar fixa */
  /* Multi-panel */
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Base
- [ ] Atualizar design system (cores, fontes, espaçamentos)
- [ ] Criar componentes base (Button, Card, Input)
- [ ] Implementar bottom navigation
- [ ] Adicionar quick action FAB

### Fase 2: Leitura
- [ ] Modo leitura minimalista
- [ ] Temas de leitura (4 temas)
- [ ] Configurações de tipografia
- [ ] Progress bar de leitura

### Fase 3: Navegação
- [ ] Chapter selector visual
- [ ] Swipe entre capítulos
- [ ] Book selector melhorado
- [ ] Histórico de navegação

### Fase 4: Funcionalidades
- [ ] Modo estudo (split view)
- [ ] Modo comparação
- [ ] Busca avançada proeminente
- [ ] Onboarding interativo

### Fase 5: Polish
- [ ] Micro-interações
- [ ] Performance optimization
- [ ] Testes de usabilidade
- [ ] Documentação final

---

*"A tua palavra é lâmpada que ilumina os meus passos" — Salmos 119:105*
*Desenvolvido por Diácono Jose Menezes para a glória de Deus*
