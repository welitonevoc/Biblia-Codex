# 🌌 Antigravity Awesome Skills: 1.397+ Habilidades Agênticas para Claude Code, Gemini CLI, Cursor, Copilot e Mais

> **Biblioteca instalável no GitHub com 1.397+ habilidades agênticas para Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity e outros assistentes de codificação com IA.**

Antigravity Awesome Skills é uma biblioteca GitHub instalável e um instalador npm de playbooks `SKILL.md` reutilizáveis. Foi projetado para Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity, Kiro, OpenCode, GitHub Copilot e outros assistentes de codificação com IA que se beneficiam de instruções operacionais estruturadas. Em vez de coletar snippets de prompt descartáveis, este repositório oferece um catálogo pesquisável e instalável de habilidades, pacotes, fluxos de trabalho, distribuições compatíveis com plugins e documentação prática que ajudam agentes a realizar tarefas recorrentes com melhor contexto, restrições mais fortes e saídas mais claras.

Você pode usar este repositório para instalar uma ampla biblioteca de habilidades multiuso, começar com pacotes baseados em funções ou acessar fluxos de trabalho orientados à execução para planejamento, codificação, depuração, testes, revisão de segurança, infraestrutura, trabalho de produto e tarefas de crescimento. O README principal é intencionalmente uma página de aterrisagem de alto sinal: entenda o que é o projeto, instale rapidamente, escolha a ferramenta certa e siga para documentação mais profunda apenas quando precisar.

**Comece aqui:** [Dê uma estrela no repositório](https://github.com/sickn33/antigravity-awesome-skills/stargazers) · [Instale em 1 minuto](#instalação) · [Escolha sua ferramenta](#escolha-sua-ferramenta) · [Melhores habilidades por ferramenta](#melhores-habilidades-por-ferramenta) · [📚 Navegue por 1.397+ Habilidades](#navegue-por-1397-habilidades) · [Pacotes](docs/users/bundles.md) · [Fluxos de Trabalho](docs/users/workflows.md) · [Plugins para Claude Code e Codex](docs/users/plugins.md)

[![Estrelas no GitHub](https://img.shields.io/badge/⭐%2032%2C000%2B%20Estrelas-gold?style=for-the-badge)](https://github.com/sickn33/antigravity-awesome-skills/stargazers)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Anthropic-purple)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-AI%20IDE-orange)](https://cursor.sh)
[![Codex CLI](https://img.shields.io/badge/Codex%20CLI-OpenAI-green)](https://github.com/openai/codex)
[![Gemini CLI](https://img.shields.io/badge/Gemini%20CLI-Google-blue)](https://github.com/google-gemini/gemini-cli)
[![Última Versão](https://img.shields.io/github/v/release/sickn33/antigravity-awesome-skills?display_name=tag&style=for-the-badge)](https://github.com/sickn33/antigravity-awesome-skills/releases/latest)
[![Instalar com NPX](https://img.shields.io/badge/Instalar-npx%20antigravity--awesome--skills-black?style=for-the-badge&logo=npm)](#instalação)
[![Kiro](https://img.shields.io/badge/Kiro-AWS-orange?style=for-the-badge)](https://kiro.dev)
[![Copilot](https://img.shields.io/badge/Copilot-GitHub-lightblue?style=for-the-badge)](https://github.com/features/copilot)
[![OpenCode](https://img.shields.io/badge/OpenCode-CLI-gray?style=for-the-badge)](https://github.com/opencode-ai/opencode)
[![Antigravity](https://img.shields.io/badge/Antigravity-AI%20IDE-red?style=for-the-badge)](https://github.com/sickn33/antigravity-awesome-skills)

**Versão atual: V9.11.0.** Confiado por mais de 32 mil estrelas no GitHub, este repositório combina coleções oficiais e da comunidade de habilidades com pacotes, fluxos de trabalho, caminhos de instalação e documentação que ajudam você a ir da primeira instalação ao uso diário rapidamente.

## Por Que Este Repositório

- **Instalável, não apenas inspiracional**: use `npx antigravity-awesome-skills` para colocar as habilidades onde sua ferramenta espera.
- **Construído para os principais fluxos de trabalho de agentes**: Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity, Kiro, OpenCode, Copilot e mais.
- **Cobertura ampla com utilidade real**: 1.397+ habilidades em desenvolvimento, testes, segurança, infraestrutura, produto e marketing.
- **Integração mais rápida**: pacotes e fluxos de trabalho reduzem o tempo de "encontrei este repositório" para "usei minha primeira habilidade".
- **Útil seja para amplitude ou curadoria**: navegue pelo catálogo completo, comece com os melhores pacotes ou compare alternativas antes de instalar.

## Índice

- [Por Que Este Repositório](#por-que-este-repositório)
- [Instalação](#instalação)
- [Escolha Sua Ferramenta](#escolha-sua-ferramenta)
- [FAQ Rápido](#faq-rápido)
- [Melhores Habilidades por Ferramenta](#melhores-habilidades-por-ferramenta)
- [Pacotes e Fluxos de Trabalho](#pacotes-e-fluxos-de-trabalho)
- [Navegue por 1.340+ Habilidades](#navegue-por-1340-habilidades)
- [Solução de Problemas](#solução-de-problemas)
- [Apoie o Projeto](#apoie-o-projeto)
- [Contribuindo](#contribuindo)
- [Comunidade](#comunidade)
- [Créditos e Fontes](#créditos-e-fontes)
- [Contribuidores do Repositório](#contribuidores-do-repositório)
- [Histórico de Estrelas](#histórico-de-estrelas)
- [Licença](#licença)

## Instalação

A maioria dos usuários deve começar com a instalação da biblioteca completa e usar pacotes ou fluxos de trabalho para reduzir o que tentar primeiro.

### Instalação da biblioteca completa

```bash
# Padrão: ~/.gemini/antigravity/skills (Antigravity global). Use --path para outros locais.
npx antigravity-awesome-skills
```

O instalador npm usa um clone raso por padrão para que as instalações de primeira execução permaneçam mais leves do que uma verificação de histórico completa do repositório.

### Verificar a instalação

```bash
test -d ~/.gemini/antigravity/skills && echo "Habilidades instaladas em ~/.gemini/antigravity/skills"
```

### Execute sua primeira habilidade

```text
Use @brainstorming para planejar um MVP de SaaS.
```

### Prefere plugins para Claude Code ou Codex?

- Use a instalação da biblioteca completa quando quiser o catálogo mais amplo e controle direto sobre seu diretório de habilidades instalado.
- Use o caminho de plugins quando quiser uma distribuição estilo marketplace compatível com plugins para Claude Code ou Codex.
- Leia [Plugins para Claude Code e Codex](docs/users/plugins.md) para uma explicação completa da instalação da biblioteca completa vs instalação de plugin vs plugins de pacote.

## Escolha Sua Ferramenta

Use o mesmo repositório, mas instale ou invoque-o da forma que seu host espera.

| Ferramenta       | Instalação                                                           | Primeiro Uso                                              |
| ---------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| Claude Code      | `npx antigravity-awesome-skills --claude` ou marketplace de plugins Claude | `>> /brainstorming me ajude a planejar um recurso`      |
| Cursor           | `npx antigravity-awesome-skills --cursor`                            | `@brainstorming me ajude a planejar um recurso`         |
| Gemini CLI       | `npx antigravity-awesome-skills --gemini`                            | `Use brainstorming para planejar um recurso`            |
| Codex CLI        | `npx antigravity-awesome-skills --codex`                             | `Use brainstorming para planejar um recurso`            |
| Antigravity      | `npx antigravity-awesome-skills --antigravity`                       | `Use @brainstorming para planejar um recurso`           |
| Kiro CLI         | `npx antigravity-awesome-skills --kiro`                              | `Use brainstorming para planejar um recurso`            |
| Kiro IDE         | `npx antigravity-awesome-skills --path ~/.kiro/skills`               | `Use @brainstorming para planejar um recurso`           |
| GitHub Copilot   | _Sem instalador — cole habilidades ou regras manualmente_            | `Peça ao Copilot para usar brainstorming para planejar um recurso` |
| OpenCode         | `npx antigravity-awesome-skills --path .agents/skills --category development,backend --risk safe,none` | `opencode run @brainstorming me ajude a planejar um recurso` |
| AdaL CLI         | `npx antigravity-awesome-skills --path .adal/skills`                 | `Use brainstorming para planejar um recurso`            |
| Caminho personalizado | `npx antigravity-awesome-skills --path ./my-skills`             | Depende da sua ferramenta                                 |

Para detalhes de caminho, exemplos de prompt e configurações específicas por host, acesse:

- [Habilidades Claude Code](docs/users/claude-code-skills.md)
- [Habilidades Cursor](docs/users/cursor-skills.md)
- [Habilidades Codex CLI](docs/users/codex-cli-skills.md)
- [Habilidades Gemini CLI](docs/users/gemini-cli-skills.md)
- [Guia de habilidades de agente de IA](docs/users/ai-agent-skills.md)

## FAQ Rápido

### O que é Antigravity Awesome Skills?

É uma biblioteca GitHub instalável de playbooks `SKILL.md` reutilizáveis para Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity e assistentes de codificação com IA relacionados. O repositório empacota essas habilidades com um instalador CLI, pacotes, fluxos de trabalho, catálogos gerados e documentação para que você possa ir da descoberta ao uso diário rapidamente.

### Como instalo?

Execute `npx antigravity-awesome-skills` para a instalação completa padrão da biblioteca, ou use uma flag específica da ferramenta como `--codex`, `--cursor`, `--gemini`, `--claude` ou `--antigravity` quando quiser que o instalador direcione para um diretório de habilidades conhecido diretamente.

### Devo usar a biblioteca completa ou um plugin?

Use a biblioteca completa se quiser o maior catálogo e controle direto do sistema de arquivos. Use plugins quando quiser uma distribuição estilo marketplace compatível com plugins para Claude Code ou Codex. A explicação completa está em [Plugins para Claude Code e Codex](docs/users/plugins.md).

### Onde navego por pacotes, fluxos de trabalho e o catálogo completo?

Comece com [Pacotes](docs/users/bundles.md) para recomendações baseadas em funções, [Fluxos de Trabalho](docs/users/workflows.md) para playbooks de execução ordenada, [CATALOG.md](CATALOG.md) para o registro completo e o [catálogo hospedado no GitHub Pages](https://sickn33.github.io/antigravity-awesome-skills/) quando quiser uma interface web navegável.

## Melhores Habilidades por Ferramenta

Se você quer uma resposta mais rápida do que "navegar por todas as 1.397+ habilidades", comece com um guia específico da ferramenta:

- **[Habilidades Claude Code](docs/users/claude-code-skills.md)**: caminhos de instalação, habilidades iniciais, exemplos de prompt e fluxo de marketplace de plugins.
- **[Habilidades Cursor](docs/users/cursor-skills.md)**: melhores habilidades iniciais para `.cursor/skills/`, trabalho intensivo de UI e fluxos de programação em par.
- **[Habilidades Codex CLI](docs/users/codex-cli-skills.md)**: habilidades de planejamento, implementação, depuração e revisão para loops de codificação local.
- **[Habilidades Gemini CLI](docs/users/gemini-cli-skills.md)**: stack inicial para pesquisa, sistemas de agentes, integrações e fluxos de trabalho de engenharia.
- **[Guia de habilidades de agente de IA](docs/users/ai-agent-skills.md)**: como avaliar bibliotecas de habilidades, escolher amplitude vs curadoria e selecionar o ponto de partida certo.

### Habilidades iniciais universais

- `@brainstorming` para planejamento antes da implementação.
- `@test-driven-development` para trabalho orientado a TDD.
- `@debugging-strategies` para solução de problemas sistemática.
- `@lint-and-validate` para verificações de qualidade leves.
- `@security-auditor` para revisões focadas em segurança.
- `@frontend-design` para qualidade de UI e interação.
- `@api-design-principles` para forma e consistência de API.
- `@create-pr` para empacotar trabalho em um pull request limpo.

### Exemplos reais de prompts

```text
Use @brainstorming para transformar esta ideia de produto em um plano de MVP concreto.
```

```text
Use @security-auditor para revisar este endpoint de API quanto a riscos de autenticação e validação.
```

## Pacotes e Fluxos de Trabalho

Pacotes ajudam você a escolher por onde começar. Fluxos de trabalho ajudam a executar habilidades na ordem certa.

### Comece com pacotes

Pacotes são grupos recomendados de habilidades para uma função ou objetivo como `Web Wizard`, `Security Engineer` ou `OSS Maintainer`.

- Pacotes são recomendações, não instalações separadas.
- Instale o repositório uma vez, depois use [docs/users/bundles.md](docs/users/bundles.md) para escolher um conjunto inicial.
- Boas combinações iniciais:
  - MVP SaaS: `Essentials` + `Full-Stack Developer` + `QA & Testing`
  - Endurecimento de produção: `Security Developer` + `DevOps & Cloud` + `Observability & Monitoring`
  - Envio OSS: `Essentials` + `OSS Maintainer`

### Use fluxos de trabalho para execução orientada a resultados

- Leia [docs/users/workflows.md](docs/users/workflows.md) para playbooks legíveis por humanos.
- Use [data/workflows.json](data/workflows.json) para metadados de fluxo de trabalho legíveis por máquina.
- Fluxos de trabalho iniciais incluem envio de MVP SaaS, auditorias de segurança, sistemas de agentes de IA, automação de navegador/QA e trabalho de design orientado a DDD.

### Precisa de menos habilidades ativas em tempo de execução?

Se o Antigravity começar a atingir limites de contexto com muitas habilidades ativas, a orientação de ativação em [docs/users/agent-overload-recovery.md](docs/users/agent-overload-recovery.md) pode materializar apenas os pacotes ou IDs de habilidades desejados no diretório Antigravity ativo.

Se você usa OpenCode ou outro host `.agents/skills`, prefira uma instalação reduzida de início em vez de copiar a biblioteca completa para um runtime sensível ao contexto. O instalador agora suporta `--risk`, `--category` e `--tags` para que você possa manter o conjunto instalado estreito.

## Navegue por 1.397+ Habilidades

Use o repositório raiz como página de aterrisagem, depois pule para a superfície mais profunda que corresponde à sua intenção.

### O que você recebe neste repositório

- **Biblioteca de habilidades** em [`skills/`](skills/)
- **Instalador CLI** alimentado pelo pacote npm em [`package.json`](package.json)
- **Catálogo gerado e metadados** em [`CATALOG.md`](CATALOG.md), `skills_index.json` e [`data/`](data/)
- **Aplicativo web hospedado e local** em [`apps/web-app`](apps/web-app) e no [GitHub Pages](https://sickn33.github.io/antigravity-awesome-skills/)
- **Pacotes baseados em funções** em [docs/users/bundles.md](docs/users/bundles.md)
- **Fluxos de trabalho de execução** em [docs/users/workflows.md](docs/users/workflows.md)
- **Documentação de usuário, contribuidor e mantenedor** em [`docs/`](docs/)

### Melhores formas de explorar

- Leia o catálogo completo em [`CATALOG.md`](CATALOG.md).
- Navegue pelo catálogo hospedado em [https://sickn33.github.io/antigravity-awesome-skills/](https://sickn33.github.io/antigravity-awesome-skills/).
- Comece com [Primeiros Passos](docs/users/getting-started.md) e [Uso](docs/users/usage.md) se for novo após a instalação.
- Use [Pacotes](docs/users/bundles.md) para descoberta baseada em funções e [Fluxos de Trabalho](docs/users/workflows.md) para execução passo a passo.
- Use [Plugins para Claude Code e Codex](docs/users/plugins.md) quando se preocupar com distribuição compatível com marketplace.

### Compare alternativas

- **[Antigravity Awesome Skills vs Awesome Claude Skills](docs/users/antigravity-awesome-skills-vs-awesome-claude-skills.md)** para compensações de amplitude vs lista curada.
- **[Melhores habilidades Claude Code no GitHub](docs/users/best-claude-code-skills-github.md)** para uma lista curta de alta intenção.
- **[Melhores habilidades Cursor no GitHub](docs/users/best-cursor-skills-github.md)** para opções compatíveis com Cursor e critérios de seleção.

## Solução de Problemas

Mantenha o README principal curto; use documentações dedicadas para recuperação e orientação específica de plataforma.

- Se estiver confuso após a instalação, comece com o [Guia de Uso](docs/users/usage.md).
- Para truncamento no Windows ou loops de crash de contexto, use [docs/users/windows-truncation-recovery.md](docs/users/windows-truncation-recovery.md).
- Para sobrecarga no Linux/macOS ou ativação seletiva, use [docs/users/agent-overload-recovery.md](docs/users/agent-overload-recovery.md).
- Para instalações OpenCode ou outras `.agents/skills`, prefira uma instalação reduzida como `npx antigravity-awesome-skills --path .agents/skills --category development,backend --risk safe,none`.
- Para detalhes de instalação de plugin, compatibilidade de host e distribuição segura de marketplace, use [docs/users/plugins.md](docs/users/plugins.md).
- Para expectativas e salvaguardas de contribuidores, use [CONTRIBUTING.md](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) e [`SECURITY.md`](SECURITY.md).

## Apoie o Projeto

O apoio é opcional. O projeto permanece gratuito e de código aberto para todos.

- [Compre um livro para mim no Buy Me a Coffee](https://buymeacoffee.com/sickn33)
- Dê uma estrela no repositório
- Abra problemas reproduzíveis
- Contribua com documentação, correções e habilidades

---

## Contribuindo

- Adicione novas habilidades em `skills/<skill-name>/SKILL.md`.
- Siga o guia do contribuidor em [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Use o modelo em [`docs/contributors/skill-template.md`](docs/contributors/skill-template.md).
- Valide com `npm run validate` antes de abrir um PR.
- Mantenha PRs da comunidade apenas com código-fonte: não commite artefatos de registro gerados como `CATALOG.md`, `skills_index.json` ou `data/*.json`.
- Se seu PR alterar `SKILL.md`, espere a verificação automatizada `skill-review` no GitHub além da validação usual e verificações de segurança.
- Se seu PR alterar habilidades ou orientação de risco, revisão manual de lógica ainda é necessária mesmo quando as verificações automatizadas estiverem verdes.

## Comunidade

- [Discussões](https://github.com/sickn33/antigravity-awesome-skills/discussions) para perguntas, ideias, posts de demonstração e feedback da comunidade.
- [Problemas](https://github.com/sickn33/antigravity-awesome-skills/issues) para bugs reproduzíveis e solicitações de melhoria concretas e acionáveis.
- [Siga @sickn33 no X](https://x.com/sickn33) para atualizações do projeto e lançamentos.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) para expectativas da comunidade e padrões de moderação.
- [`SECURITY.md`](SECURITY.md) para relatórios de segurança.

## Créditos e Fontes

Estamos ombros com gigantes.

👉 **[Veja o Livro de Atribuição Completo](docs/sources/sources.md)**

Principais contribuidores e fontes incluem:

- **HackTricks**
- **OWASP**
- **Anthropic / OpenAI / Google**
- **A Comunidade de Código Aberto**

Esta coleção não seria possível sem o trabalho incrível da comunidade Claude Code e fontes oficiais:

### Fontes Oficiais

- **[anthropics/skills](https://github.com/anthropics/skills)**: Repositório oficial de habilidades Anthropic - Manipulação de documentos (DOCX, PDF, PPTX, XLSX), Diretrizes de Marca, Comunicações Internas.
- **[anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks)**: Notebooks e receitas oficiais para construir com Claude.
- **[remotion-dev/skills](https://github.com/remotion-dev/skills)**: Habilidades oficiais Remotion - Criação de vídeo em React com 28 regras modulares.
- **[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)**: Habilidades oficiais Vercel Labs - Melhores Práticas React, Diretrizes de Web Design.
- **[openai/skills](https://github.com/openai/skills)**: Catálogo de habilidades OpenAI Codex - Habilidades de agente, Criador de Habilidades, Planejamento Conciso.
- **[supabase/agent-skills](https://github.com/supabase/agent-skills)**: Habilidades oficiais Supabase - Melhores Práticas Postgres.
- **[microsoft/skills](https://github.com/microsoft/skills)**: Habilidades oficiais Microsoft - Serviços de nuvem Azure, Bot Framework, Serviços Cognitivos e padrões de desenvolvimento corporativo em .NET, Python, TypeScript, Go, Rust e Java.
- **[google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills)**: Habilidades oficiais Gemini - API Gemini, interações com SDK e modelos.
- **[apify/agent-skills](https://github.com/apify/agent-skills)**: Habilidades oficiais Apify - Web scraping, extração de dados e automação.
- **[expo/skills](https://github.com/expo/skills)**: Habilidades oficiais Expo - Fluxos de trabalho de projeto Expo e orientação de Serviços de Aplicação Expo.
- **[huggingface/skills](https://github.com/huggingface/skills)**: Habilidades oficiais Hugging Face - Modelos, Spaces, datasets, inferência e fluxos de trabalho do ecossistema Hugging Face.
- **[neondatabase/agent-skills](https://github.com/neondatabase/agent-skills)**: Habilidades oficiais Neon - Fluxos de trabalho Postgres serverless e orientação da plataforma Neon.
- **[scopeblind/scopeblind-gateway](https://github.com/scopeblind/scopeblind-gateway)**: Toolkit de governança MCP Scopeblind - Autorização de política Cedar, rollout de shadow para enforce e verificação de recibos assinados para chamadas de ferramentas de agente.

### Contribuidores da Comunidade

- **[monte-carlo-data/mc-agent-toolkit](https://github.com/monte-carlo-data/mc-agent-toolkit)**: Habilidades de observabilidade de dados Monte Carlo — verificações de saúde de tabelas, avaliação de impacto de mudanças, criação de monitores, ingestão push e notebooks de validação SQL para mudanças dbt.
- **[umutbozdag/agent-skills-manager](https://github.com/umutbozdag/agent-skills-manager)**: Fonte para a habilidade `manage-skills` — fluxos de trabalho de descoberta, criação, edição, alternância, cópia, movimentação e exclusão de habilidades entre ferramentas de codificação com agente.
- **[pumanitro/global-chat](https://github.com/pumanitro/global-chat)**: Fonte para a habilidade Global Chat Agent Discovery - descoberta cross-protocol de servidores MCP e agentes de IA entre múltiplos registros.
- **[bitjaru/styleseed](https://github.com/bitjaru/styleseed)**: Coleção de habilidades StyleSeed Toss UI e UX - assistente de configuração, geração de páginas e padrões, gerenciamento de tokens de design, revisão de acessibilidade, auditorias de UX, estados de feedback e orientação de microcopy para UI profissional mobile-first.
- **[milkomida77/guardian-agent-prompts](https://github.com/milkomida77/guardian-agent-prompts)**: Fonte para a habilidade Multi-Agent Task Orchestrator - padrões de delegação testados em produção, anti-duplicação e portões de qualidade para trabalho coordenado de agentes.
- **[Elkidogz/technical-change-skill](https://github.com/Elkidogz/technical-change-skill)**: Fonte para a habilidade Technical Change Tracker - registros JSON estruturados de mudanças, handoff de sessão e dashboards HTML acessíveis para continuidade de codificação.
- **[rmyndharis/antigravity-skills](https://github.com/rmyndharis/antigravity-skills)**: Pela contribuição massiva de 300+ habilidades corporativas e a lógica de geração de catálogo.
- **[amartelr/antigravity-workspace-manager](https://github.com/amartelr/antigravity-workspace-manager)**: Workspace Manager CLI companion para provisionar dinamicamente subconjuntos de habilidades entre ambientes de desenvolvimento locais.
- **[obra/superpowers](https://github.com/obra/superpowers)**: O "Superpowers" original de Jesse Vincent.
- **[guanyang/antigravity-skills](https://github.com/guanyang/antigravity-skills)**: Extensões principais do Antigravity.
- **[diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)**: Diretrizes de Infraestrutura e Backend/Frontend.
- **[ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)**: Padrões de UI React e Design Systems.
- **[travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)**: Modo Loki e integração Playwright.
- **[Dimillian/Skills](https://github.com/Dimillian/Skills)**: Habilidades Codex curadas focadas em plataformas Apple, fluxos de trabalho GitHub, refatoração e desempenho (MIT).
- **[zebbern/claude-code-guide](https://github.com/zebbern/claude-code-guide)**: Suíte e Guia de Segurança Abrangente (Fonte para ~60 novas habilidades).
- **[alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)**: Toolkit de Engenharia Sênior e PM.
- **[karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills)**: Uma lista massiva de habilidades verificadas para Claude Code.
- **[VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)**: Coleção curada de 1000+ habilidades de agentes oficiais e da comunidade de principais equipes de desenvolvimento (MIT).
- **[zircote/.claude](https://github.com/zircote/.claude)**: Repositório de dotfiles/config do Claude Code arquivado com referência de habilidade de desenvolvimento Shopify.
- **[vibeforge1111/vibeship-spawner-skills](https://github.com/vibeforge1111/vibeship-spawner-skills)**: Modelos de agentes de IA, integrações, ferramentas maker e outros pacotes de habilidades de qualidade de produção.
- **[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)**: Habilidades de marketing para CRO, redação publicitária, SEO, anúncios pagos e crescimento (23 habilidades, MIT).
- **[AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo)**: Coleção de fluxos de trabalho SEO cobrindo SEO técnico, hreflang, sitemap, geo, schema e padrões de SEO programático.
- **[mrprewsh/seo-aeo-engine](https://github.com/mrprewsh/seo-aeo-engine)**: Sistema de crescimento de conteúdo SEO/AEO cobrindo pesquisa de palavras-chave, agrupamento de conteúdo, landing pages, estrutura de blog, schema, linking interno e fluxos de auditoria.
- **[jonathimer/devmarketing-skills](https://github.com/jonathimer/devmarketing-skills)**: Habilidades de marketing para desenvolvedores — estratégia HN, tutoriais técnicos, docs-como-marketing, engajamento Reddit, onboarding de desenvolvedores e mais (33 habilidades, MIT).
- **[kepano/obsidian-skills](https://github.com/kepano/obsidian-skills)**: Habilidades focadas em Obsidian para markdown, Bases, JSON Canvas, fluxos de trabalho CLI e limpeza de conteúdo.
- **[Silverov/yandex-direct-skill](https://github.com/Silverov/yandex-direct-skill)**: Habilidade de auditoria de publicidade Yandex Direct (API v5) — 55 verificações automatizadas, pontuação A-F, análise de campanha/anúncio/palavra-chave para o mercado PPC russo (MIT).
- **[vudovn/antigravity-kit](https://github.com/vudovn/antigravity-kit)**: Modelos de Agentes de IA com Habilidades, Agentes e Fluxos de Trabalho (33 habilidades, MIT).
- **[affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)**: Grande coleção de configuração e fluxo de trabalho Claude Code de um vencedor de hackathon Anthropic (MIT).
- **[whatiskadudoing/fp-ts-skills](https://github.com/whatiskadudoing/fp-ts-skills)**: Habilidades práticas fp-ts para TypeScript – fp-ts-pragmatic, fp-ts-react, fp-ts-errors (v4.4.0).
- **[warmskull/idea-darwin](https://github.com/warmskull/idea-darwin)**: Fluxo de trabalho de evolução de ideia darwiniana para rodadas de ideação estruturada, mutação, cruzamento, crítica e rastreamento de linhagem.
- **[webzler/agentMemory](https://github.com/webzler/agentMemory)**: Fonte para a habilidade agent-memory-mcp.
- **[rafsilva85/credit-optimizer-v5](https://github.com/rafsilva85/credit-optimizer-v5)**: Habilidade de otimização de créditos Manus AI — roteamento inteligente de modelos, compressão de contexto e testes inteligentes. Economiza 30-75% em créditos sem perda de qualidade. Auditado em 53 cenários.
- **[Wittlesus/cursorrules-pro](https://github.com/Wittlesus/cursorrules-pro)**: Configurações profissionais .cursorrules para 8 frameworks - Next.js, React, Python, Go, Rust e mais. Funciona com Cursor, Claude Code e Windsurf.
- **[nedcodes-ok/rule-porter](https://github.com/nedcodes-ok/rule-porter)**: Conversor bidirecional de regras entre Cursor (.mdc), Claude Code (CLAUDE.md), GitHub Copilot, Windsurf e formatos legados .cursorrules. Zero dependências.
- **[SSOJet/skills](https://github.com/ssojet/skills)**: Habilidades e guias de integração SSOJet prontos para produção para frameworks e plataformas populares — Node.js, Next.js, React, Java, .NET Core, Go, iOS, Android e mais. Funciona perfeitamente com fluxos SSO SAML, OIDC e corporativos SSOJet. Funciona com Cursor, Antigravity, Claude Code e Windsurf.
- **[MojoAuth/skills](https://github.com/MojoAuth/skills)**: Guias e exemplos MojoAuth prontos para produção para frameworks populares como Node.js, Next.js, React, Java, .NET Core, Go, iOS e Android.
- **[Xquik-dev/x-twitter-scraper](https://github.com/Xquik-dev/x-twitter-scraper)**: Plataforma de dados X (Twitter) — busca de tweets, pesquisa de usuários, extração de seguidores, métricas de engajamento, sorteios de giveaway, monitoramento, webhooks, 19 ferramentas de extração, servidor MCP.
- **[shmlkv/dna-claude-analysis](https://github.com/shmlkv/dna-claude-analysis)**: Toolkit de análise de genoma pessoal — scripts Python analisando dados brutos de DNA em 17 categorias (riscos de saúde, ancestralidade, farmacogenômica, nutrição, psicologia, etc.) com visualização HTML de página única estilo terminal.
- **[AlmogBaku/debug-skill](https://github.com/AlmogBaku/debug-skill)**: Habilidade de depurador interativo para agentes de IA — breakpoints, stepping, inspeção de variáveis e stack traces via CLI `dap`. Suporta Python, Go, Node.js/TypeScript, Rust e C/C++.
- **[uberSKILLS](https://github.com/uberskillsdev/uberSKILLS)**: Projete, teste e implante Skills de Agente Claude Code através de um workflow visual assistido por IA.
- **[christopherlhammer11-ai/tool-use-guardian](https://github.com/christopherlhammer11-ai/tool-use-guardian)**: Fonte para a habilidade Tool Use Guardian — wrapper de confiabilidade de chamadas de ferramenta com retentativas, recuperação e classificação de falhas.
- **[christopherlhammer11-ai/recallmax](https://github.com/christopherlhammer11-ai/recallmax)**: Fonte para a habilidade RecallMax — memória de contexto longo, sumarização e compressão de conversa para agentes.
- **[tsilverberg/webapp-uat](https://github.com/tsilverberg/webapp-uat)**: Habilidade completa de UAT de navegador — testes Playwright com captura de erros de console/rede, verificações de acessibilidade WCAG 2.2 AA, validação i18n, testes responsivos e triagem de bugs P0-P3. Somente leitura por padrão, funciona com React, Vue, Angular, Ionic, Next.js.
- **[Wolfe-Jam/faf-skills](https://github.com/Wolfe-Jam/faf-skills)**: Habilidades de contexto de IA e DNA de projeto — gerenciamento de formato .faf, pontuação de prontidão para IA, bi-sync, construção de servidor MCP e testes de nível campeonato (17 habilidades, MIT).
- **[fullstackcrew-alpha/privacy-mask](https://github.com/fullstackcrew-alpha/privacy-mask)**: Mascaramento de privacidade de imagem local para agentes de codificação com IA. Detecta e redige PII, chaves de API e segredos em capturas de tela via OCR + 47 regras regex. Integração com hook Claude Code para mascaramento automático. Suporta Tesseract e RapidOCR. 100% offline (MIT).
- **[AvdLee/SwiftUI-Agent-Skill](https://github.com/AvdLee/SwiftUI-Agent-Skill)**: Habilidade de melhores práticas SwiftUI para fluxos de trabalho de agente (MIT).
- **[CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills)**: Coleção de habilidades focadas em Three.js para trabalho web 3D assistido por agente.
- **[K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills)**: Conjunto de habilidades científicas, de pesquisa, engenharia, finanças e escrita (MIT).
- **[NotMyself/claude-win11-speckit-update-skill](https://github.com/NotMyself/claude-win11-speckit-update-skill)**: Habilidade de atualização Speckit arquivada para Claude Code (MIT).
- **[SHADOWPR0/beautiful_prose](https://github.com/SHADOWPR0/beautiful_prose)**: Habilidade de qualidade de escrita para melhorar prosa e reduzir saída genérica.
- **[SHADOWPR0/security-bluebook-builder](https://github.com/SHADOWPR0/security-bluebook-builder)**: Habilidade de documentação/construção de segurança para fluxos de trabalho de agente.
- **[SeanZoR/claude-speed-reader](https://github.com/SeanZoR/claude-speed-reader)**: Auxiliar de leitura rápida estilo RSVP para respostas Claude (MIT).
- **[Shpigford/skills](https://github.com/Shpigford/skills)**: Habilidades de agente de uso geral para tarefas comuns de desenvolvimento (MIT).
- **[ZhangHanDong/makepad-skills](https://github.com/ZhangHanDong/makepad-skills)**: Habilidades e referências de desenvolvimento de aplicativos Makepad (MIT).
- **[czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)**: Habilidades de construção de fluxos de trabalho n8n para Claude Code (MIT).
- **[frmoretto/clarity-gate](https://github.com/frmoretto/clarity-gate)**: Protocolo de verificação para marcar incerteza e reduzir certeza alucinada em documentos voltados para LLM.
- **[gokapso/agent-skills](https://github.com/gokapso/agent-skills)**: Habilidades de agente orientadas a Kapso/WhatsApp.
- **[huifer/WellAlly-health](https://github.com/huifer/WellAlly-health)**: Projeto de assistente de saúde citado no histórico de lançamentos como fonte para capacidades de agente focadas em saúde (MIT).
- **[ibelick/ui-skills](https://github.com/ibelick/ui-skills)**: Habilidades de polimento de UI para melhorar interfaces construídas por agentes (MIT).
- **[jackjin1997/ClawForge](https://github.com/jackjin1997/ClawForge)**: Hub de recursos de habilidades, servidores MCP e ferramentas de agente para OpenClaw.
- **[jthack/ffuf_claude_skill](https://github.com/jthack/ffuf_claude_skill)**: Habilidade FFUF para fluxos de trabalho de fuzzing web em Claude.
- **[MetcalfSolutions/Satori](https://github.com/MetcalfSolutions/Satori)**: Companheiro de sabedoria clinicamente informado misturando frameworks de psicologia e tradições de sabedoria em um parceiro reflexivo estruturado.
- **[muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)**: Coleção de habilidades de engenharia de contexto, multi-agente e sistemas de agentes de produção (MIT).
- **[robzolkos/skill-rails-upgrade](https://github.com/robzolkos/skill-rails-upgrade)**: Habilidade de upgrade Rails para migrações assistidas por agente.
- **[sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills)**: Coleção de habilidades de agente licenciadas Apache para assistentes de codificação com IA.
- **[scarletkc/vexor](https://github.com/scarletkc/vexor)**: Mecanismo de busca semântica para arquivos e código, referenciado no histórico de lançamentos.
- **[sstklen/infinite-gratitude](https://github.com/sstklen/infinite-gratitude)**: Habilidade de pesquisa multi-agente da série AI Dojo (MIT).
- **[wrsmith108/linear-claude-skill](https://github.com/wrsmith108/linear-claude-skill)**: Habilidade de gerenciamento de issues/projetos/equipes Linear com fluxos de trabalho MCP e GraphQL (MIT).
- **[wrsmith108/varlock-claude-skill](https://github.com/wrsmith108/varlock-claude-skill)**: Habilidade segura de gerenciamento de variáveis de ambiente para Claude Code (MIT).
- **[zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)**: Habilidades de criação de slides frontend para apresentações baseadas em web (MIT).
- **[zxkane/aws-skills](https://github.com/zxkane/aws-skills)**: Habilidades de agente Claude focadas em AWS (MIT).
- **[UrRhb/agentflow](https://github.com/UrRhb/agentflow)**: Pipeline de desenvolvimento de IA orientado por Kanban para orquestrar fluxos de trabalho multiworker Claude Code com portões de qualidade determinísticos, revisão adversária, rastreamento de custos e execução à prova de crash (MIT).
- **[AgentPhone-AI/skills](https://github.com/AgentPhone-AI/skills)**: Plugin AgentPhone para Claude Code — fluxos de trabalho de telefonia baseados em API para agentes de IA, incluindo chamadas telefônicas, SMS, gerenciamento de números de telefone, configuração de agente de voz, webhooks de streaming e padrões de chamada de ferramenta.
- **[uxuiprinciples/agent-skills](https://github.com/uxuiprinciples/agent-skills)**: Habilidades de UX/UI baseadas em pesquisa para auditar interfaces contra 168 princípios, detectar antipadrões e injetar contexto de UX em sessões de codificação com IA.
- **[voidborne-d/humanize-chinese](https://github.com/voidborne-d/humanize-chinese)**: Toolkit de detecção e humanização de texto AI chinês para pontuação, reescrita, redução de AIGC acadêmico e fluxos de trabalho de conversão de estilo.

### Inspirações

- **[f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)**: Inspiração para a Biblioteca de Prompts.
- **[leonardomso/33-js-concepts](https://github.com/leonardomso/33-js-concepts)**: Inspiração para JavaScript Mastery.

### Fontes Adicionais

- **[agent-cards/skill](https://github.com/agent-cards/skill)**: Gerencie cartões Visa virtuais pré-pagos para agentes de IA. Crie cartões, verifique saldos, visualize credenciais, feche cartões e obtenha suporte via ferramentas MCP.

## Contribuidores do Repositório

<a href="https://github.com/sickn33/antigravity-awesome-skills/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sickn33/antigravity-awesome-skills" alt="Contribuidores do repositório" />
</a>

Feito com [contrib.rocks](https://contrib.rocks). *(A imagem pode estar em cache; [veja contribuidores ao vivo](https://github.com/sickn33/antigravity-awesome-skills/graphs/contributors) no GitHub.)*

Agradecemos oficialmente aos seguintes contribuidores por sua ajuda para tornar este repositório incrível!

- [@sck000](https://github.com/sck000)
- [@github-actions[bot]](https://github.com/apps/github-actions)
- [@sickn33](https://github.com/sickn33)
- [@munir-abbasi](https://github.com/munir-abbasi)
- [@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer)
- [@zinzied](https://github.com/zinzied)
- [@ssumanbiswas](https://github.com/ssumanbiswas)
- [@Champbreed](https://github.com/Champbreed)
- [@Dokhacgiakhoa](https://github.com/Dokhacgiakhoa)
- [@sx4im](https://github.com/sx4im)
- [@maxdml](https://github.com/maxdml)
- [@IanJ332](https://github.com/IanJ332)
- [@skyruh](https://github.com/skyruh)
- [@ar27111994](https://github.com/ar27111994)
- [@chauey](https://github.com/chauey)
- [@itsmeares](https://github.com/itsmeares)
- [@suhaibjanjua](https://github.com/suhaibjanjua)
- [@GuppyTheCat](https://github.com/GuppyTheCat)
- [@Copilot](https://github.com/apps/copilot-swe-agent)
- [@8hrsk](https://github.com/8hrsk)
- [@fernandorych](https://github.com/fernandorych)
- [@nikolasdehor](https://github.com/nikolasdehor)
- [@SnakeEye-sudo](https://github.com/SnakeEye-sudo)
- [@talesperito](https://github.com/talesperito)
- [@zebbern](https://github.com/zebbern)
- [@sstklen](https://github.com/sstklen)
- [@0xrohitgarg](https://github.com/0xrohitgarg)
- [@tejasashinde](https://github.com/tejasashinde)
- [@jackjin1997](https://github.com/jackjin1997)
- [@HuynhNhatKhanh](https://github.com/HuynhNhatKhanh)
- [@taksrules](https://github.com/taksrules)
- [@liyin2015](https://github.com/liyin2015)
- [@fullstackcrew-alpha](https://github.com/fullstackcrew-alpha)
- [@dz3ai](https://github.com/dz3ai)
- [@fernandezbaptiste](https://github.com/fernandezbaptiste)
- [@Gizzant](https://github.com/Gizzant)
- [@JayeHarrill](https://github.com/JayeHarrill)
- [@AssassinMaeve](https://github.com/AssassinMaeve)
- [@Musayrlsms](https://github.com/Musayrlsms)
- [@arathiesh](https://github.com/arathiesh)
- [@RamonRiosJr](https://github.com/RamonRiosJr)
- [@Tiger-Foxx](https://github.com/Tiger-Foxx)
- [@TomGranot](https://github.com/TomGranot)
- [@truongnmt](https://github.com/truongnmt)
- [@UrRhb](https://github.com/UrRhb)
- [@uriva](https://github.com/uriva)
- [@babysor](https://github.com/babysor)
- [@SenSei2121](https://github.com/SenSei2121)
- [@code-vj](https://github.com/code-vj)
- [@viktor-ferenczi](https://github.com/viktor-ferenczi)
- [@vprudnikoff](https://github.com/vprudnikoff)
- [@Vonfry](https://github.com/Vonfry)
- [@wahidzzz](https://github.com/wahidzzz)
- [@vuth-dogo](https://github.com/vuth-dogo)
- [@terryspitz](https://github.com/terryspitz)
- [@Onsraa](https://github.com/Onsraa)
- [@SebConejo](https://github.com/SebConejo)
- [@SuperJMN](https://github.com/SuperJMN)
- [@Enreign](https://github.com/Enreign)
- [@sohamganatra](https://github.com/sohamganatra)
- [@Silverov](https://github.com/Silverov)
- [@conspirafi](https://github.com/conspirafi)
- [@shubhamdevx](https://github.com/shubhamdevx)
- [@ronanguilloux](https://github.com/ronanguilloux)
- [@sraphaz](https://github.com/sraphaz)
- [@ProgramadorBrasil](https://github.com/ProgramadorBrasil)
- [@prewsh](https://github.com/prewsh)
- [@PabloASMD](https://github.com/PabloASMD)
- [@yubing744](https://github.com/yubing744)
- [@hazemezz123](https://github.com/hazemezz123)
- [@yang1002378395-cmyk](https://github.com/yang1002378395-cmyk)
- [@viliawang-pm](https://github.com/viliawang-pm)
- [@uucz](https://github.com/uucz)
- [@tsilverberg](https://github.com/tsilverberg)
- [@thuanlm215](https://github.com/thuanlm215)
- [@shmlkv](https://github.com/shmlkv)
- [@rafsilva85](https://github.com/rafsilva85)
- [@nocodemf](https://github.com/nocodemf)
- [@marsiandeployer](https://github.com/marsiandeployer)
- [@ksgisang](https://github.com/ksgisang)
- [@KrisnaSantosa15](https://github.com/KrisnaSantosa15)
- [@kostakost2](https://github.com/kostakost2)
- [@junited31](https://github.com/junited31)
- [@fbientrigo](https://github.com/fbientrigo)
- [@developer-victor](https://github.com/developer-victor)
- [@ckdwns9121](https://github.com/ckdwns9121)
- [@dependabot[bot]](https://github.com/apps/dependabot)
- [@christopherlhammer11-ai](https://github.com/christopherlhammer11-ai)
- [@c1c3ru](https://github.com/c1c3ru)
- [@buzzbysolcex](https://github.com/buzzbysolcex)
- [@BenZinaDaze](https://github.com/BenZinaDaze)
- [@avimak](https://github.com/avimak)
- [@antbotlab](https://github.com/antbotlab)
- [@amalsam](https://github.com/amalsam)
- [@ziuus](https://github.com/ziuus)
- [@Wolfe-Jam](https://github.com/Wolfe-Jam)
- [@jamescha-earley](https://github.com/jamescha-earley)
- [@ivankoriako](https://github.com/ivankoriako)
- [@rcigor](https://github.com/rcigor)
- [@hvasconcelos](https://github.com/hvasconcelos)
- [@Guilherme-ruy](https://github.com/Guilherme-ruy)
- [@FrancyJGLisboa](https://github.com/FrancyJGLisboa)
- [@framunoz](https://github.com/framunoz)
- [@Digidai](https://github.com/Digidai)
- [@dbhat93](https://github.com/dbhat93)
- [@decentraliser](https://github.com/decentraliser)
- [@MAIOStudio](https://github.com/MAIOStudio)
- [@wd041216-bit](https://github.com/wd041216-bit)
- [@conorbronsdon](https://github.com/conorbronsdon)
- [@RoundTable02](https://github.com/RoundTable02)
- [@ChaosRealmsAI](https://github.com/ChaosRealmsAI)
- [@kriptoburak](https://github.com/kriptoburak)
- [@BenedictKing](https://github.com/BenedictKing)
- [@acbhatt12](https://github.com/acbhatt12)
- [@Andruia](https://github.com/Andruia)
- [@AlmogBaku](https://github.com/AlmogBaku)
- [@Allen930311](https://github.com/Allen930311)
- [@alexmvie](https://github.com/alexmvie)
- [@Sayeem3051](https://github.com/Sayeem3051)
- [@Abdulrahmansoliman](https://github.com/Abdulrahmansoliman)
- [@ALEKGG1](https://github.com/ALEKGG1)
- [@8144225309](https://github.com/8144225309)
- [@1bcMax](https://github.com/1bcMax)
- [@sharmanilay](https://github.com/sharmanilay)
- [@KhaiTrang1995](https://github.com/KhaiTrang1995)
- [@LocNguyenSGU](https://github.com/LocNguyenSGU)
- [@nedcodes-ok](https://github.com/nedcodes-ok)
- [@MMEHDI0606](https://github.com/MMEHDI0606)
- [@iftikharg786](https://github.com/iftikharg786)
- [@halith-smh](https://github.com/halith-smh)
- [@mertbaskurt](https://github.com/mertbaskurt)
- [@modi2meet](https://github.com/modi2meet)
- [@MatheusCampagnolo](https://github.com/MatheusCampagnolo)
- [@donbagger](https://github.com/donbagger)
- [@Marvin19700118](https://github.com/Marvin19700118)
- [@djmahe4](https://github.com/djmahe4)
- [@MArbeeGit](https://github.com/MArbeeGit)
- [@majorelalexis-stack](https://github.com/majorelalexis-stack)
- [@Svobikl](https://github.com/Svobikl)
- [@kromahlusenii-ops](https://github.com/kromahlusenii-ops)
- [@Krishna-Modi12](https://github.com/Krishna-Modi12)
- [@k-kolomeitsev](https://github.com/k-kolomeitsev)
- [@kennyzheng-builds](https://github.com/kennyzheng-builds)
- [@keyserfaty](https://github.com/keyserfaty)
- [@kage-art](https://github.com/kage-art)
- [@whatiskadudoing](https://github.com/whatiskadudoing)
- [@joselhurtado](https://github.com/joselhurtado)
- [@jonathimer](https://github.com/jonathimer)
- [@Jonohobs](https://github.com/Jonohobs)
- [@JaskiratAnand](https://github.com/JaskiratAnand)
- [@Al-Garadi](https://github.com/Al-Garadi)
- [@olgasafonova](https://github.com/olgasafonova)
- [@Elkidogz](https://github.com/Elkidogz)
- [@qcwssss](https://github.com/qcwssss)
- [@spideyashith](https://github.com/spideyashith)
- [@tomjwxf](https://github.com/tomjwxf)
- [@Cerdore](https://github.com/Cerdore)
- [@MetcalfSolutions](https://github.com/MetcalfSolutions)
- [@warmskull](https://github.com/warmskull)
- [@Wittlesus](https://github.com/Wittlesus)
- [@digitamaz](https://github.com/digitamaz)
- [@cryptoque](https://github.com/cryptoque)
- [@umutbozdag](https://github.com/umutbozdag)

## Histórico de Estrelas

[![sickn33/antigravity-awesome-skills - Gráfico de Histórico de Estrelas](https://api.star-history.com/image?repos=sickn33/antigravity-awesome-skills&style=landscape1)](https://star-history.com/sickn33/antigravity-awesome-skills)

[![Gráfico de Histórico de Estrelas](https://api.star-history.com/svg?repos=sickn33/antigravity-awesome-skills&type=date&legend=top-left)](https://www.star-history.com/#sickn33/antigravity-awesome-skills&type=date&legend=top-left)

Se Antigravity Awesome Skills foi útil para você, considere ⭐ dar uma estrela no repositório!

<!-- Tópicos do GitHub (para mantenedores): claude-code, gemini-cli, codex-cli, antigravity, cursor, github-copilot, opencode, agentic-skills, ai-coding, llm-tools, ai-agents, autonomous-coding, mcp, ai-developer-tools, ai-pair-programming, vibe-coding, skill, skills, SKILL.md, rules.md, CLAUDE.md, GEMINI.md, CURSOR.md -->

## Licença

Código original e ferramentas são licenciados sob a Licença MIT. Veja [LICENSE](LICENSE).

Documentação original e outro conteúdo escrito não-código são licenciados sob [CC BY 4.0](LICENSE-CONTENT), salvo aviso upstream mais específico. Veja [docs/sources/sources.md](docs/sources/sources.md) para atribuições e detalhes de licenças de terceiros.
