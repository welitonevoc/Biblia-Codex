# 🎯 Como Requisitar Skills - Guia Prático

> **Aprenda a usar skills de forma eficiente em diferentes contextos**

---

## 📚 ÍNDICE

1. [Sintaxe Básica](#sintaxe-basica)
2. [Padrões de Requisição](#padroes-de-requisição)
3. [Exemplos por Categoria](#exemplos-por-categoria)
4. [Combinação de Skills](#combinação-de-skills)
5. [Contextos Específicos](#contextos-específicos)
6. [Gatilhos Automáticos](#gatilhos-automáticos)

---

## 🎯 SINTAXE BÁSICA

### Formato Padrão

```
"Use @nome-da-skill para [tarefa específica]"
```

### Exemplos

```
✅ "Use @brainstorming para planejar esta feature"
✅ "Execute @vulnerability-scanner no código"
✅ "Aplique @clean-code neste módulo"
✅ "Revise com @code-review-checklist"
```

### Sintaxes Alternativas

```
✅ "@brainstorming: ajude-me a planejar..."
✅ "Execute: vulnerability-scanner"
✅ "Habilite o modo: clean-code"
✅ "Skill: mysword-format-parser"
```

---

## 📖 PADRÕES DE REQUISIÇÃO

### 1️⃣ **Padrão: Ação Direta**

```
"Use @skill para fazer X"
```

**Exemplos:**
```
"Use @brainstorming para definir os requisitos do módulo"
"Use @vulnerability-scanner para auditar o código"
"Use @mysword-format-parser para converter o módulo"
```

---

### 2️⃣ **Padrão: Contexto + Skill**

```
"Contexto: [descrição]. Use @skill"
```

**Exemplos:**
```
"Contexto: Estou criando um módulo MySword. Use @mysword-bible-engine"
"Contexto: Refatoração de código legado. Use @clean-code"
"Contexto: Deploy em produção. Use @deployment-procedures"
```

---

### 3️⃣ **Padrão: Sequência de Skills**

```
"Primeiro use @skill1, depois @skill2, finalmente @skill3"
```

**Exemplos:**
```
"Primeiro use @brainstorming para planejar, depois @plan-writing para documentar, finalmente @architecture para revisar"
"Use @mysword-format-parser para parsear, depois @mysword-bible-engine para validar o schema"
```

---

### 4️⃣ **Padrão: Skill com Parâmetros**

```
"Use @skill com [parâmetro/opção específica]"
```

**Exemplos:**
```
"Use @lint-and-validate com verificação estrita"
"Use @vulnerability-scanner focado em OWASP Top 10"
"Use @testing-patterns com cobertura mínima de 80%"
```

---

### 5️⃣ **Padrão: Pergunta + Skill**

```
"Como [fazer X]? Use @skill"
```

**Exemplos:**
```
"Como estruturar este módulo? Use @architecture"
"Como testar esta feature? Use @tdd-workflow"
"Como otimizar este componente? Use @performance-profiling"
```

---

## 🎯 EXEMPLOS POR CATEGORIA

### 🧠 Planejamento & Arquitetura

| Tarefa | Comando de Requisição |
|--------|----------------------|
| Planejar feature complexa | `"Use @brainstorming para explorar requisitos"` |
| Criar plano detalhado | `"Use @plan-writing para criar docs/PLAN.md"` |
| Decidir arquitetura | `"Use @architecture para comparar abordagens"` |
| Questionar requisitos | `"Aplique o método socrático do @brainstorming"` |

**Exemplo Completo:**
```
Contexto: Quero criar uma feature de importação de módulos MySword.

"Use @brainstorming para me ajudar a planejar. Faça perguntas sobre:
- Tipos de módulos suportados
- Tratamento de erros
- Progresso da importação
- Validação pós-importação"
```

---

### 💻 Desenvolvimento Frontend

| Tarefa | Comando de Requisição |
|--------|----------------------|
| Criar componente | `"Use @frontend-design para criar componente acessível"` |
| Aplicar Tailwind | `"Use @tailwind-patterns para estilizar"` |
| Otimizar React | `"Use @nextjs-react-expert para otimizar renderização"` |
| Auditar UX | `"Use @web-design-guidelines para auditar"` |

**Exemplo Completo:**
```
"Use @frontend-design + @tailwind-patterns para criar um componente de
leitura bíblica com:
- Modo claro/escuro
- Tamanhos de fonte ajustáveis
- Cores de destaque personalizáveis
Siga as regras de acessibilidade do @web-design-guidelines"
```

---

### ⚙️ Desenvolvimento Backend

| Tarefa | Comando de Requisição |
|--------|----------------------|
| Design de API | `"Use @api-patterns para definir endpoints REST"` |
| Código Node.js | `"Use @nodejs-best-practices para implementar"` |
| Modelagem de dados | `"Use @database-design para criar schema"` |
| Python/FastAPI | `"Use @python-patterns para criar API"` |

**Exemplo Completo:**
```
"Use @api-patterns + @database-design para criar uma API de gestão de módulos:
- GET /modules - Listar módulos
- POST /modules/import - Importar módulo
- GET /modules/:id/validate - Validar módulo
Defina o schema do banco com @database-design"
```

---

### 📱 Mobile Android/Kotlin

| Tarefa | Comando de Requisição |
|--------|----------------------|
| App Android | `"Use @android-kotlin-specialist para implementar"` |
| Arquitetura Bíblia | `"Siga @android-bible-architecture"` |
| MySword Engine | `"Use @mysword-bible-engine para schema SQLite"` |
| Parser GBF | `"Use @mysword-format-parser para converter"` |

**Exemplo Completo:**
```
"Use @android-kotlin-specialist + @mysword-bible-engine para criar:
1. Room Database com schema oficial MySword (5 tipos)
2. Repository pattern para módulos
3. Scanner assíncrono com Flow
4. Parser GBF com máquina de estados

Siga a arquitetura em camadas do @android-bible-architecture"
```

---

### 🔒 Segurança & Testing

| Tarefa | Comando de Requisição |
|--------|----------------------|
| Security scan | `"Execute @vulnerability-scanner com script security_scan.py"` |
| Code review | `"Use @code-review-checklist para revisar PR"` |
| Testes unitários | `"Use @testing-patterns para criar testes"` |
| E2E tests | `"Execute @webapp-testing com playwright_runner.py"` |
| TDD | `"Use @tdd-workflow para desenvolver"` |
| Linting | `"Execute @lint-and-validate com lint_runner.py"` |

**Exemplo Completo:**
```
"Antes do deploy, execute:
1. @vulnerability-scanner → python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
2. @lint-and-validate → python .agent/skills/lint-and-validate/scripts/lint_runner.py .
3. @webapp-testing → python .agent/skills/webapp-testing/scripts/playwright_runner.py

Relate todos os issues encontrados"
```

---

### 🚀 DevOps & Deploy

| Tarefa | Comando de Requisição |
|--------|----------------------|
| CI/CD pipeline | `"Use @deployment-procedures para configurar"` |
| Kubernetes | `"Use @k8s-manifest-generator para criar manifests"` |
| Docker | `"Use @docker-expert para criar Dockerfile"` |
| Helm charts | `"Use @helm-chart-scaffolding para criar chart"` |

**Exemplo Completo:**
```
"Use @deployment-procedures + @docker-expert para:
1. Criar Dockerfile multi-stage
2. Configurar GitHub Actions CI/CD
3. Definir pipeline: lint → test → build → deploy
4. Criar manifests Kubernetes com @k8s-manifest-generator"
```

---

### 📝 Documentação

| Tarefa | Comando de Requisição |
|--------|----------------------|
| README | `"Use @documentation-templates para criar README.md"` |
| API docs | `"Use @documentation-templates para documentar API"` |
| ADRs | `"Use @architecture-decision-records para documentar decisão"` |

**Exemplo Completo:**
```
"Use @documentation-templates para criar:
1. README.md com badges, instalação, uso
2. docs/ARCHITECTURE.md com diagramas
3. docs/ADR-001.md para decisão de arquitetura"
```

---

## 🔗 COMBINAÇÃO DE SKILLS

### Combinação em Sequência

```
"Execute em sequência:
1. @brainstorming → planejar
2. @plan-writing → documentar plano
3. @architecture → revisar arquitetura
4. @vulnerability-scanner → auditar segurança
5. @testing-patterns → criar testes"
```

### Combinação em Paralelo

```
"Use em paralelo:
- @frontend-specialist para componentes UI
- @backend-specialist para API
- @database-architect para schema
Depois sintetize os resultados"
```

### Combinação por Domínio

```
"Para esta feature de importação MySword:
- Domínio Parser: @mysword-format-parser
- Domínio Engine: @mysword-bible-engine
- Domínio Mobile: @android-kotlin-specialist
- Domínio Testing: @testing-patterns"
```

---

## 🎯 CONTEXTOS ESPECÍFICOS

### Contexto: Projeto Bíblia Android

```
"Contexto: Projeto BibleReaderAndroid (Kotlin, Compose, Room, Koin)

Skills relevantes:
- @android-kotlin-specialist → Desenvolvimento Android
- @android-bible-architecture → Arquitetura específica
- @mysword-bible-engine → Schema SQLite
- @mysword-format-parser → Parser GBF
- @mysword-module-manager → Scanner de módulos

Use estas skills para implementar leitor de módulos MySword"
```

### Contexto: Web App Full-Stack

```
"Contexto: Next.js 14, TypeScript, Prisma, PostgreSQL

Skills relevantes:
- @nextjs-react-expert → Frontend
- @react-best-practices → 57 regras Vercel
- @api-patterns → API design
- @prisma-expert → Database
- @tailwind-patterns → Estilização

Use estas skills para criar dashboard analytics"
```

### Contexto: Security Audit

```
"Contexto: Auditoria de segurança completa

Skills relevantes:
- @vulnerability-scanner → Script security_scan.py
- @red-team-tactics → Táticas ofensivas
- @api-security-testing → Teste de APIs
- @code-review-checklist → Revisão de código

Execute todas em sequência e gere relatório"
```

---

## ⚡ GATILHOS AUTOMÁTICOS

### Gatilhos por Palavra-Chave

O agente pode detectar automaticamente quando usar skills:

| Palavra-Chave | Skill Acionada |
|---------------|----------------|
| "planejar", "planejamento" | `@brainstorming`, `@plan-writing` |
| "arquitetura", "design" | `@architecture` |
| "segurança", "vulnerabilidade" | `@vulnerability-scanner` |
| "teste", "testar" | `@testing-patterns`, `@tdd-workflow` |
| "MySword", "módulo Bíblia" | `@mysword-bible-engine`, `@mysword-format-parser` |
| "Android", "Kotlin" | `@android-kotlin-specialist` |
| "deploy", "CI/CD" | `@deployment-procedures` |
| "otimizar", "performance" | `@performance-profiling` |
| "revisar", "review" | `@code-review-checklist` |
| "documentar", "docs" | `@documentation-templates` |

### Configurar Gatilhos Automáticos

**Arquivo:** `.agent/auto_skills.json`

```json
{
  "triggers": [
    {
      "keywords": ["planejar", "planejamento", "estruturar"],
      "skill": "brainstorming",
      "action": "suggest"
    },
    {
      "keywords": ["segurança", "vulnerabilidade", "OWASP"],
      "skill": "vulnerability-scanner",
      "action": "auto-execute"
    },
    {
      "keywords": ["MySword", "GBF", "módulo Bíblia"],
      "skill": "mysword-format-parser",
      "action": "suggest"
    }
  ]
}
```

---

## 🎭 MODOS DE OPERAÇÃO

### Modo: Socrático (Brainstorming)

```
"Ative modo socrático com @brainstorming.
Faça perguntas antes de implementar.
Não comece a codificar sem esclarecer requisitos."
```

### Modo: Execução Direta

```
"Modo execução direta.
Use @clean-code + @lint-and-validate.
Implemente sem perguntas, apenas execute."
```

### Modo: Revisão Crítica

```
"Ative modo de revisão crítica com @code-review-checklist.
Seja rigoroso, aponte todos os issues.
Não elogie, apenas critique construtivamente."
```

### Modo: Ensino

```
"Ative modo de ensino com @documentation-templates.
Explique cada passo, justifique decisões.
Crie documentação educativa."
```

---

## 📊 MATRIZ DE REQUISIÇÃO RÁPIDA

### Tarefas Comuns

| Tarefa | Skill | Exemplo de Requisição |
|--------|-------|----------------------|
| **UX Research** | `ux-researcher` | `"Ative @ux-researcher para analisar personas"` |
| **Arquitetura Info** | `information-architect` | `"Use @information-architect para wireframes"` |
| **Design Visual** | `ui-designer` | `"Crie visuais com @ui-designer"` |
| **Microinterações** | `motion-designer` | `"Anime com @motion-designer"` |
| **Acessibilidade** | `platform-accessibility-specialist` | `"Valide com @platform-accessibility-specialist"` |
| **Brainstorm** | `brainstorming` | `"Use @brainstorming para explorar ideias"` |
| **Planejar** | `plan-writing` | `"Crie plano com @plan-writing"` |
| **Arquitetura** | `architecture` | `"Revise arquitetura com @architecture"` |
| **Code Review** | `code-review-checklist` | `"Revise com @code-review-checklist"` |
| **Security Scan** | `vulnerability-scanner` | `"Escaneie com @vulnerability-scanner"` |
| **Testes** | `testing-patterns` | `"Crie testes com @testing-patterns"` |
| **Deploy** | `deployment-procedures` | `"Configure deploy com @deployment-procedures"` |
| **Docs** | `documentation-templates` | `"Documente com @documentation-templates"` |
| **Parser MySword** | `mysword-format-parser` | `"Parse com @mysword-format-parser"` |
| **Engine Bíblia** | `mysword-bible-engine` | `"Valide com @mysword-bible-engine"` |

---

## 🎯 EXEMPLOS COMPLETOS

### Exemplo 1: Feature Completa

```
"Quero implementar importação de módulos MySword.

Use as skills em sequência:
1. @brainstorming → Faça perguntas sobre requisitos
2. @mysword-bible-engine → Defina schema SQLite
3. @mysword-format-parser → Implemente parser GBF
4. @android-kotlin-specialist → Crie código Kotlin
5. @testing-patterns → Crie testes unitários
6. @vulnerability-scanner → Audite segurança

Gere relatório após cada etapa"
```

### Exemplo 2: Code Review Completo

```
"Revise este PR com múltiplas perspectivas:

1. @code-review-checklist → Checklist geral
2. @clean-code → Qualidade do código
3. @vulnerability-scanner → Segurança
4. @performance-profiling → Performance
5. @testing-patterns → Cobertura de testes

Sintetize todos os feedbacks em um relatório"
```

### Exemplo 3: Migração de Arquitetura

```
"Estamos migrando para arquitetura em camadas.

Use:
1. @android-bible-architecture → Defina nova arquitetura
2. @architecture → Compare com padrões
3. @plan-writing → Crie plano de migração
4. @brainstorming → Identifique riscos

Crie docs/MIGRATION_PLAN.md"
```

---

## 🔄 FLUXO DE TRABALHO RECOMENDADO

### Para Features Novas

```
1. @brainstorming → Entender requisitos
2. @plan-writing → Criar plano
3. @architecture → Revisar arquitetura
4. [Implementação] → Usar skills específicas
5. @testing-patterns → Criar testes
6. @vulnerability-scanner → Auditar
7. @documentation-templates → Documentar
```

### Para Bug Fixes

```
1. @systematic-debugging → Identificar causa raiz
2. @testing-patterns → Criar teste que falha
3. [Correção] → Implementar fix
4. @lint-and-validate → Validar
5. @testing-patterns → Rodar testes
```

### Para Code Reviews

```
1. @code-review-checklist → Checklist
2. @clean-code → Qualidade
3. @vulnerability-scanner → Segurança
4. @performance-profiling → Performance
5. [Relatório] → Sintetizar feedback
```

---

## 📖 PRÓXIMOS PASSOS

1. ✅ **Inventário**: Ver `SKILLS_INVENTORY.md`
2. ✅ **Instalação**: Ver `INSTALACAO_GLOBAL.md`
3. ✅ **Como Requisitar**: Concluído (esta seção)
4. 🤖 **Agente Autônomo**: Ver `AGENTE_AUTONOMO.md`

---

## 📚 REFERÊNCIAS

- [SKILLS_INVENTORY.md](SKILLS_INVENTORY.md) - Inventário completo
- [INSTALACAO_GLOBAL.md](INSTALACAO_GLOBAL.md) - Instalação global
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura
