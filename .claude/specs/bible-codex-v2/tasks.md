# 📋 Bible Codex V2 — Plano de Tarefas

## Visão Geral

Plano de implementação em 4 fases (8 semanas) para transformar o Bible Codex em um aplicativo bíblico de classe mundial.

---

## 🎯 Fase 1: Navegação & Base (Semanas 1-2)

### 1.1 Bottom Navigation Bar
**Prioridade:** 🔥 Alta  
**Estimativa:** 3 dias  
**Dependências:** Nenhuma

- [ ] Criar componente `BottomNav.tsx`
- [ ] Implementar 5 itens: Bíblia, Buscar, Planos, Notas, Mais
- [ ] Adicionar indicador de página ativa
- [ ] Integrar com roteamento React Router
- [ ] Testar em mobile e desktop

### 1.2 Reorganização do Drawer
**Prioridade:** 🔥 Alta  
**Estimativa:** 2 dias  
**Dependências:** 1.1

- [ ] Categorizar itens do menu (Estudo, Pessoal, Ferramentas)
- [ ] Criar seções colapsáveis
- [ ] Adicionar busca no drawer
- [ ] Implementar favoritos rápidos
- [ ] Reduzir itens principais para 8-10

### 1.3 Quick Actions (FAB)
**Prioridade:** 🟡 Média  
**Estimativa:** 2 dias  
**Dependências:** 1.1

- [ ] Criar componente `QuickActionFAB.tsx`
- [ ] Implementar menu expandido
- [ ] Adicionar ações: Continuar leitura, VOTD, Marcador recente
- [ ] Posicionar no canto inferior direito
- [ ] Adicionar animação de expansão

### 1.4 Swipe entre Capítulos
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** Nenhuma

- [ ] Implementar gesture handler
- [ ] Adicionar swipe esquerda (próximo capítulo)
- [ ] Adicionar swipe direita (capítulo anterior)
- [ ] Feedback visual durante swipe
- [ ] Tratar edge cases (primeiro/último capítulo)

---

## 🎨 Fase 2: Visual & Temas (Semanas 3-4)

### 2.1 Sistema de Temas de Leitura
**Prioridade:** 🔥 Alta  
**Estimativa:** 4 dias  
**Dependências:** Nenhuma

- [ ] Criar 4 temas: Escuro, Claro, Sepia, Noturno
- [ ] Implementar seletor de temas
- [ ] Salvar preferência do usuário
- [ ] Transição suave entre temas
- [ ] Testar contraste e legibilidade

### 2.2 Configurações de Tipografia
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** 2.1

- [ ] Adicionar presets de tamanho (P, M, G, GG)
- [ ] Implementar seletor de fonte (3 opções)
- [ ] Configurar espaçamento de linhas
- [ ] Configurar espaçamento de parágrafos
- [ ] Preview em tempo real

### 2.3 Modo Foco/Leitura
**Prioridade:** 🟡 Média  
**Estimativa:** 2 dias  
**Dependências:** 2.1

- [ ] Criar modo minimalista
- [ ] Ocultar elementos desnecessários
- [ ] Adicionar progress bar no topo
- [ ] Implementar auto-scroll (opcional)
- [ ] Salvar estado do modo

### 2.4 Componentes Visuais
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** Nenhuma

- [ ] Atualizar botões com novo design system
- [ ] Criar cards de seleção de livro
- [ ] Melhorar indicadores de versículo selecionado
- [ ] Adicionar micro-animações
- [ ] Testar em diferentes tamanhos de tela

---

## 📚 Fase 3: Funcionalidades (Semanas 5-6)

### 3.1 Modo Estudo (Split View)
**Prioridade:** 🔥 Alta  
**Estimativa:** 5 dias  
**Dependências:** 2.1

- [ ] Criar layout de 2 painéis
- [ ] Implementar resize de painéis
- [ ] Sincronizar scroll entre painéis
- [ ] Adicionar painel de comentários
- [ ] Adicionar painel de notas

### 3.2 Modo Comparação
**Prioridade:** 🟡 Média  
**Estimativa:** 4 dias  
**Dependências:** 3.1

- [ ] Criar layout de 2-3 colunas
- [ ] Implementar seletor de versões
- [ ] Sincronizar scroll entre colunas
- [ ] Destacar diferenças entre versões
- [ ] Adicionar diff visual

### 3.3 Busca Avançada
**Prioridade:** 🔥 Alta  
**Estimativa:** 4 dias  
**Dependências:** Nenhuma

- [ ] Criar componente de busca proeminente
- [ ] Implementar busca em tempo real
- [ ] Adicionar filtros (livro, testamento)
- [ ] Implementar busca por referência
- [ ] Adicionar histórico de buscas

### 3.4 Onboarding Interativo
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** 2.1

- [ ] Criar tela de boas-vindas
- [ ] Implementar tutorial em 4 passos
- [ ] Adicionar dicas contextuais
- [ ] Permitir pular onboarding
- [ ] Marcar onboarding como completo

---

## ✨ Fase 4: Polish & Otimização (Semanas 7-8)

### 4.1 Micro-interações
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** Todas anteriores

- [ ] Adicionar feedback tátil (vibração)
- [ ] Implementar ripple effects
- [ ] Criar animações de loading
- [ ] Adicionar sons de feedback (opcional)
- [ ] Testar fluidez das animações

### 4.2 Performance
**Prioridade:** 🔥 Alta  
**Estimativa:** 4 dias  
**Dependências:** Todas anteriores

- [ ] Otimizar bundle size
- [ ] Implementar lazy loading de componentes
- [ ] Otimizar renderização de listas longas
- [ ] Implementar virtualização
- [ ] Testar Core Web Vitals

### 4.3 Acessibilidade
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** Todas anteriores

- [ ] Adicionar ARIA labels
- [ ] Implementar navegação por teclado
- [ ] Testar com screen readers
- [ ] Garantir contraste adequado
- [ ] Adicionar modo de alto contraste

### 4.4 Testes & Documentação
**Prioridade:** 🟡 Média  
**Estimativa:** 3 dias  
**Dependências:** Todas anteriores

- [ ] Criar testes unitários para novos componentes
- [ ] Implementar testes de integração
- [ ] Documentar componentes no Storybook
- [ ] Criar guia de uso para usuários
- [ ] Preparar release notes

---

## 📊 Métricas de Sucesso

### UX Metrics
| Métrica | Atual | Meta | Método |
|---------|-------|------|--------|
| Tempo para ler capítulo | 15s | 5s | Analytics |
| Cliques para função comum | 3-4 | 1-2 | User testing |
| Taxa de retenção (7 dias) | 40% | 60% | Analytics |
| Satisfação (NPS) | 7/10 | 9/10 | Survey |

### Technical Metrics
| Métrica | Atual | Meta | Método |
|---------|-------|------|--------|
| Lighthouse Performance | 75 | 90+ | Lighthouse |
| First Contentful Paint | 2.5s | 1.5s | Lighthouse |
| Time to Interactive | 4s | 2.5s | Lighthouse |
| Bundle Size (gzip) | 250KB | 200KB | Build |

---

## 🔧 Dependências Técnicas

### Novos Pacotes
```json
{
  "dependencies": {
    "react-spring-bottom-sheet": "^3.4.0",
    "react-use-gesture": "^9.1.3",
    "framer-motion": "^10.16.0",
    "react-virtualized": "^9.22.3"
  }
}
```

### Ferramentas
- Figma (design)
- Storybook (documentação)
- Playwright (testes E2E)
- Lighthouse (performance)

---

## 📅 Timeline

```
Semana 1-2: Navegação & Base
├── Bottom navigation
├── Drawer reorganizado
├── Quick actions
└── Swipe chapters

Semana 3-4: Visual & Temas
├── Sistema de temas
├── Tipografia
├── Modo foco
└── Componentes

Semana 5-6: Funcionalidades
├── Modo estudo
├── Modo comparação
├── Busca avançada
└── Onboarding

Semana 7-8: Polish
├── Micro-interações
├── Performance
├── Acessibilidade
└── Testes
```

---

## 🚀 Release Plan

### v2.0.0-alpha (Semana 4)
- Bottom navigation
- Temas de leitura
- Modo foco

### v2.0.0-beta (Semana 6)
- Modo estudo
- Busca avançada
- Onboarding

### v2.0.0 (Semana 8)
- Todos os recursos
- Performance otimizada
- Documentação completa

---

*"A tua palavra é lâmpada que ilumina os meus passos" — Salmos 119:105*
*Desenvolvido por Diácono Jose Menezes para a glória de Deus*
