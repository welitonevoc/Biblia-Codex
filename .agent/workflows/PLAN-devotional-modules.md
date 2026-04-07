# Plano: Integração de Módulos Devocionais MyBible

## Contexto

O app Biblia Kerygma já possui:
- Sistema de módulos com importação via `ModuleManagement.tsx`
- Detecção automática de categoria `.devot.` → `devotional` em `moduleService.ts`
- Leitura de SQLite via `sql.js` (WASM) em `BibleService.ts`
- Componente `Devotional.tsx` com 6 planos de leitura hardcoded
- **Falta**: Ler devocionais dos arquivos `.devotions.SQLite3` importados

### Arquivos MyBible Devocionais Analisados

| Arquivo | Autor | Dias | Formato HTML |
|---------|-------|------|--------------|
| `Bom dia.devotions.SQLite3` | Max Lucado | 366 | `<h2>.capitulos`, `<p>.cap1`, `<hr>.marker`, `<p>.texto` |
| `GCPA.devotions.SQLite3` | Hernandes Dias Lopes | 366 | `<div>.hr-middle` com imagem base64, texto estruturado |
| `JPAV365.devotions.SQLite3` | Alejandro Bullón | 365 | `<div>.box`, `<p>.data`, `<p>.titulo`, `<p>.versiculo`, `<p>.texto-capitular`, `<p>.texto` |
| `JPAV366.devotions.SQLite3` | Alejandro Bullón | 366 | Mesmo formato JPAV365 |
| `Spurgeon.devotions.SQLite3` | C.H. Spurgeon | 366 | `<h1>manhã/noite`, texto livre com links bíblicos `B:NNN N:N` |
| `WC-pt.devotions.SQLite3` | World Challenge (David Wilkerson, etc.) | 315 | `<h1>.page-header`, `<div>.region`, `<p>` texto corrido |

### Schema SQLite Comum
```sql
-- Todas as 6 tabelas seguem o mesmo schema:
info(name TEXT, value TEXT)           -- description, language, russian_numbering
content_fragments(id TEXT, fragment TEXT) -- CSS, imagens base64, autores
devotions(day INTEGER, devotion TEXT)    -- HTML do devocional do dia (1-366)
```

---

## Plano de Implementação

### Fase 1: DevotionalModuleService (Core)

**Arquivo**: `src/services/devotionalModuleService.ts`

Responsável por:
1. Inicializar `sql.js` (reutilizar padrão do `BibleService.ts`)
2. Ler o binário do módulo via `readModuleBinary()`
3. Abrir o SQLite e consultar `devotions`, `info`, `content_fragments`
4. Parsear o HTML de cada devocional para extrair:
   - `title`: título do devocional
   - `date`: data formatada (ex: "1 de janeiro")
   - `verseRef`: referência bíblica (ex: "Sl 147:5")
   - `verseText`: texto do versículo
   - `body`: corpo do devocional (HTML limpo)
   - `author`: autor (de `info.description` ou `content_fragments`)
5. Retornar `DevotionalEntry[]` tipado

```typescript
interface DevotionalModule {
  id: string;
  name: string;
  description: string;
  language: string;
  author: string;
  totalDays: number;
  entries: Map<number, DevotionalEntry>; // day → entry
}

interface DevotionalEntry {
  day: number;
  date?: string;        // "1 de janeiro"
  title: string;        // "GRANDE É O SENHOR"
  verseRef?: string;    // "Sl 147:5"
  verseText?: string;   // texto do versículo
  body: string;         // HTML limpo do devocional
  morningText?: string; // Spurgeon: texto da manhã
  eveningText?: string; // Spurgeon: texto da noite
  authorAvatar?: string; // base64 image de content_fragments
}
```

### Fase 2: Parser HTML Multi-Formato

**Arquivo**: `src/services/devotionalParser.ts`

Detectar automaticamente o formato do HTML e extrair campos:

```
detectFormat(html): 'bullon' | 'lucado' | 'hernandes' | 'spurgeon' | 'worldchallenge' | 'generic'

parseBullon(html): { date, title, verseRef, verseText, body }
parseLucado(html): { date, title, body }
parseHernandes(html): { body }
parseSpurgeon(html): { morningText, eveningText, verseRef }
parseWorldChallenge(html): { title, body, author }
parseGeneric(html): { title, body }
```

### Fase 3: Integração com Devotional.tsx

Modificar `Devotional.tsx` para:
1. Adicionar seção "Devocionais dos Módulos" acima dos planos de leitura
2. Listar módulos devocionais importados (via `listInstalledModules` filtrando `category === 'devotional'`)
3. Permitir selecionar um módulo devocional
4. Mostrar o devocional do dia (baseado no dia do ano: `dayOfYear`)
5. Renderizar o HTML do devocional com estilos do tema atual
6. Navegação: dia anterior/próximo dentro do módulo
7. Links bíblicos no devocional (ex: `B:60 5:12` → abrir Josué 5:12)

### Fase 4: Tipos e Estado

Atualizar `types.ts` com os novos tipos de devocional.

Adicionar ao `AppContext.tsx`:
- `selectedDevotionalModule: string | null`
- `devotionalModules: DevotionalModule[]`
- `loadDevotionalModule(modulePath): Promise<DevotionalModule>`

### Fase 5: Leitura Bíblica Integrada

No devocional, quando o texto contém referências bíblicas:
- Detectar padrões: `(Sl 147:5)`, `(Mt 16:26)`, links `B:NNN N:N`
- Converter para referência legível
- Tornar clicável para navegar no leitor bíblico via `onNavigate()`

---

## Arquivos a Criar/Modificar

| Ação | Arquivo | Descrição |
|------|---------|-----------|
| CRIAR | `src/services/devotionalModuleService.ts` | Leitura SQLite + cache |
| CRIAR | `src/services/devotionalParser.ts` | Parser HTML multi-formato |
| MODIFICAR | `src/types.ts` | Novos tipos `DevotionalModule`, `DevotionalEntry` |
| MODIFICAR | `src/AppContext.tsx` | Estado dos módulos devocionais |
| MODIFICAR | `src/components/Devotional.tsx` | UI para ler devocionais de módulos |
| MODIFICAR | `src/components/HamburgerMenu.tsx` | Badge/indicador de devocionais disponíveis |

## Verificação

1. Importar `Bom dia.devotions.SQLite3` via ModuleManagement
2. Abrir aba Devocional
3. Ver devocional do dia de Max Lucado
4. Navegar entre dias
5. Clicar em referência bíblica e navegar para o capítulo
6. Testar com `Spurgeon.devotions.SQLite3` (formato diferente)
7. Testar com `WC-pt.devotions.SQLite3`
8. Verificar que tema (dark/sepia/light) se aplica ao conteúdo HTML

## Dependências

- `sql.js` já instalado e configurado (`/sql-wasm.wasm` em `public/`)
- `readModuleBinary()` já existe em `moduleService.ts`
- `listInstalledModules()` já detecta `.devot.` como categoria `devotional`
- `ModuleManagement.tsx` já suporta importação de arquivos `.devotions.SQLite3`

Nenhuma dependência nova necessária.
