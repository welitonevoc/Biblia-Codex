# Plano de Redesign Premium da Bíblia Codex

## Contexto

Solicitação: refazer o design e o layout da Bíblia Codex sem alterar funcionalidades, unificando a experiência visual em um único modelo premium inspirado em apps como YouVersion, Dwell, Olive Tree, Logos e Hallow.

Referências internas consideradas:
- `.agent/AGENTE_AUTONOMO.md`
- `.agent/agents/mobile-developer.md`
- `.agent/skills/mobile-design/mobile-color-system.md`
- `.agent/skills/mobile-design/mobile-design-thinking.md`
- `.agent/skills/mobile-design/touch-psychology.md`
- `.agent/skills/mobile-design/platform-android.md`

## Checkpoint de Mobile

Plataforma: Android + app web encapsulado com Capacitor  
Framework: React 19 + Vite + Tailwind CSS 4  
Princípios aplicados:
1. Priorizar leitura, toque confortável e hierarquia clara.
2. Unificar tokens visuais para toda a aplicação.
3. Criar temas intencionais com contraste e atmosfera premium.

Anti-padrões evitados:
1. Misturar várias linguagens visuais entre telas.
2. Usar contraste fraco ou superfícies sem profundidade.

## Objetivos

1. Criar um design system central com tokens globais de cor, superfície, tipografia, borda e sombra.
2. Deixar a leitura bíblica mais contemplativa, elegante e responsiva.
3. Unificar Home, Leitor, Navegação, Menus, Painéis e Configurações sob a mesma linguagem.
4. Adicionar 12 temas visuais acessíveis via menus/configurações.
5. Manter intactos os fluxos atuais de navegação, estudo, módulos e leitura.

## Não Objetivos

1. Não alterar regras de negócio.
2. Não mudar parsers, serviços, storage, sync ou integrações.
3. Não introduzir novas features funcionais além da seleção de temas visuais.

## Fases

### Fase 1. Fundação Visual
- Expandir `ThemeMode` para 12 temas.
- Criar presets de tema com metadados e variáveis derivadas.
- Aplicar os tokens no `AppContext` para refletir no `:root`.
- Refatorar `index.css` para usar superfícies premium, gradientes e utilitários globais.

### Fase 2. Shell Unificado
- Atualizar `App.tsx` com uma moldura visual consistente.
- Redesenhar `TopBar`, `HamburgerMenu` e `Navigation`.
- Melhorar a coerência entre header, overlays e painéis laterais.

### Fase 3. Leitura Premium
- Reestruturar o `Reader` para um canvas de leitura mais limpo e focado.
- Destacar cabeçalhos, seleção de versículos e ações flutuantes.
- Preservar completamente os handlers de estudo, destaque e navegação.

### Fase 4. Páginas-Chave
- Atualizar `Home` com hero, cartões, métricas e módulos alinhados ao novo sistema.
- Atualizar `Settings` e `SettingsPage` para suportar os 12 temas e o novo grid visual.
- Harmonizar `ModuleManagement`, `VersionSelector` e `StudyToolsPanel`.

### Fase 5. Verificação
- Rodar `npm run lint`.
- Corrigir erros de tipagem ou regressões diretas do redesign.
- Validar consistência de contraste, toque e hierarquia.

## Entregáveis

1. Sistema visual premium centralizado.
2. Doze temas acessíveis no menu de configurações.
3. Leitor e telas principais com layout unificado.
4. Plano documentado para manutenção futura.

## Checklist de Verificação

- [ ] Nenhuma funcionalidade principal foi removida.
- [ ] Leitura, navegação e estudo continuam operando.
- [ ] Todos os temas aplicam variáveis corretamente.
- [ ] Home, Reader e Settings compartilham a mesma linguagem visual.
- [ ] Lint passa sem erros novos introduzidos pelo redesign.
