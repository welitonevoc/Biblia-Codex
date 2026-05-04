# AI Features - Biblia Codex

## Visão Geral

Este módulo contém todas as funcionalidades de Inteligência Artificial do Biblia Codex, refatoradas usando as melhores práticas de engenharia de IA e as skills do projeto agente-IA.

## Arquitetura

```
src/features/ai/
├── AIService.ts          # Serviço principal unificado
├── AIRagService.ts      # Sistema RAG (Retrieval-Augmented Generation)
├── AIAgents.ts          # Agentes IA especializados
├── AICacheService.ts    # Cache inteligente com Dexie.js
├── components/          # Componentes React para UI
│   └── AIExplorationPanel.tsx
├── index.ts             # Exports centralizados e hooks React
└── README.md           # Esta documentação
```

## Principais Funcionalidades

### 1. AIService (Serviço Principal)

**Localização:** `AIService.ts`

Serviço unificado que consolida as funcionalidades dos antigos `geminiService.ts` e `aiStudyService.ts`.

**Recursos:**
- Suporte a múltiplos provedores: Google Gemini, OpenRouter, OpenCode, Groq, HuggingFace
- Perfis teológicos: Assembleiano Clássico, Reformado, Católico Romano
- Cache automático de respostas (Firebase Firestore)
- Tratamento de erros e quotas de API
- Funções especializadas:
  - `explainTerm()` - Explicação de termos teológicos
  - `explainVerses()` - Explicação de versículos
  - `generateReadingPlan()` - Geração de planos de leitura
  - `compareTranslations()` - Comparação de traduções

**Exemplo de uso:**
```typescript
import { aiService } from './AIService';

const response = await aiService.explainTerm('graça', 'assembleiano');
console.log(response.content);
```

### 2. AIRagService (Sistema RAG)

**Localização:** `AIRagService.ts`

Implementa RAG (Retrieval-Augmented Generation) para busca semântica nos textos bíblicos.

**Recursos:**
- Geração de embeddings para textos (usando Gemini Embeddings API)
- Busca semântica por similaridade de cosseno
- Recuperação de contexto relevante para consultas
- Fallback com TF-IDF para quando APIs não estão disponíveis
- Suporte a múltiplos testamentos e livros

**Exemplo de uso:**
```typescript
import { aiRagService } from './AIRagService';

const context = await aiRagService.retrieveContext('Deus é amor', {
  maxVerses: 5,
  testament: 'new'
});

const response = await aiRagService.generateRAGResponse('O que a Bíblia diz sobre amor?', context);
```

### 3. AIAgents (Agentes Especializados)

**Localização:** `AIAgents.ts`

Sistema multi-agente com especialidades distintas para estudo bíblico.

**Tipos de Agentes:**
- `theologian` - Teólogo Sistemático (foco em doutrina)
- `historian` - Historiador Bíblico (contexto histórico)
- `devotional` - Assistente Devocional (aplicação pessoal)
- `apologist` - Apologista Cristão (defesa da fé)
- `preacher` - Pregador Expositivo (preparação de sermões)
- `counselor` - Conselheiro Bíblico (aconsehamento cristão)

**Funcionalidades:**
- Consulta individual de agentes
- Consulta múltipla com síntese automática
- Estudo bíblico profundo (multiple agents)
- Preparação de sermões assistida
- Aconselhamento bíblico
- Respostas apologéticas

**Exemplo de uso:**
```typescript
import { aiAgents } from './AIAgents';

// Estudo profundo com múltiplos agentes
const study = await aiAgents.deepBibleStudy('Salvação', verses);

// Preparação de sermão
const sermon = await aiAgents.prepareSermon('João 3:16', verses);
```

### 4. AICacheService (Cache Inteligente)

**Localização:** `AICacheService.ts`

Sistema de cache multi-camada usando Dexie.js (IndexedDB) para respostas da IA.

**Recursos:**
- Armazenamento persistente no navegador
- Expiração automática de entradas (TTL configurável)
- Estatísticas de uso (hit rate, mais acessados)
- Limpeza automática quando excede limite
- Busca por chave e perfil teológico
- Pré-aquecimento de consultas comuns

**Exemplo de uso:**
```typescript
import { aiCacheService } from './AICacheService';

// Buscar no cache
const cached = await aiCacheService.get('term:amor:assembleiano');

// Salvar no cache
await aiCacheService.set('term:amor:assembleiano', 'Explique amor...', 'Deus é amor...', {
  provider: 'google',
  model: 'gemini-2.0-flash',
  theologicalProfile: 'assembleiano'
});

// Estatísticas
const stats = await aiCacheService.getStats();
```

## Hooks React

### useAI()

Hook para usar o serviço principal de IA.

```typescript
import { useAI } from './index';

function MyComponent() {
  const { isLoading, error, explainTerm, diagnose } = useAI();
  
  const handleExplain = async () => {
    const response = await explainTerm('graça');
  };
  
  return (/* JSX */);
}
```

### useAIAgents()

Hook para usar os agentes IA especializados.

```typescript
import { useAIAgents } from './index';

function MyComponent() {
  const { isLoading, queryMultipleAgents, deepBibleStudy } = useAIAgents();
  
  return (/* JSX */);
}
```

## Perfis Teológicos

O sistema suporta múltiplos perfis teológicos que modificam o comportamento da IA:

1. **Assembleiano Clássico** (`assembleiano`)
   - Baseado na CGADB
   - Autores: Antonio Gilberto, Eurico Bergstén, Elienai Cabral
   - Foco: Pentecostalismo histórico, batismo no Espírito Santo

2. **Reformado** (`reformado`)
   - Baseado nos 5 Solas
   - Autores: Calvino, João Knox, R.C. Sproul, John Piper
   - Foco: Soberania de Deus, eleição incondicional

3. **Católico Romano** (`catolico`)
   - Baseado no Magistério da Igreja Católica
   - Autores: Santos da Igreja, Papa Francisco, Scott Hahn
   - Foco: Tradição Apostólica, Sacramento, Autoridade papal

## Integração com o Banco de Dados

O schema do Dexie.js (`src/data/local/schema.ts`) foi atualizado para incluir a tabela `aiCache`:

```typescript
export class BibleDatabase extends Dexie {
  // ... outras tabelas
  aiCache!: Table<AICacheEntry, number>;
  
  constructor() {
    super('BibliaCodexDB');
    
    this.version(2).stores({
      // ... tabelas existentes
      aiCache: '++id, cacheKey, provider, theologicalProfile, timestamp, lastAccessed',
    });
  }
}
```

## Skills Utilizadas do Agente-IA

A refatoração utilizou as seguintes skills do projeto `agente-IA`:

1. **prompt-engineering** - Para melhorar os prompts da IA
2. **rag-implementation** - Para implementar o sistema RAG
3. **ai-agent-development** - Para criar os agentes especializados
4. **embedding-strategies** - Para estratégias de embeddings
5. **multi-agent-patterns** - Para padrões de multi-agentes

## Próximos Passos

- [ ] Implementar busca semântica real com banco vetorial (Pinecone/Weaviate)
- [ ] Integrar embeddings reais do Gemini (quando disponível na API)
- [ ] Criar mais componentes de UI para cada funcionalidade
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar RAG com textos completos da Bíblia indexados
- [ ] Adicionar suporte a mais perfis teológicos

## Migração

Para migrar do código antigo (`geminiService.ts` e `aiStudyService.ts`) para o novo:

```typescript
// Antes
import { getGeminiExplanation } from '../../services/geminiService';
const response = await getGeminiExplanation(term);

// Depois
import { aiService } from '../features/ai/AIService';
const response = await aiService.explainTerm(term);
```

## Contribuição

Ao adicionar novas funcionalidades de IA:

1. Mantenha o código organizado por responsabilidade (AIService, AIRagService, etc.)
2. Use o sistema de cache para evitar chamadas desnecessárias à API
3. Documente novos agentes no AIAgents.ts
4. Atualize o index.ts com os novos exports
5. Crie componentes React reutilizáveis na pasta `components/`
