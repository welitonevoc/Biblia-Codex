---
name: mysword-bible-engine
description: Referência definitiva do formato MySword — schema SQLite oficial de TODOS os 5 tipos de módulo de conteúdo (Bible/.bbl.mybible, Commentary/.cmt.mybible, Dictionary/.dct.mybible, Book/.bok.mybible, Journal/.jor.mybible), tabela Details com todos os 13 campos, a query SQLite exata que MySword usa internamente (SELECT verse, scripture, rowid FROM bible WHERE book=? AND chapter=? ORDER BY verse), índice bible_key obrigatório, GBF Bible Tags completos (todos os 30+ tags com exemplos reais HiSB/ABP), sistema VerseRules com Regex separado por TAB, sistema de hyperlinks (b/c-/d-/s/k-/j-/n/r), cores CSS adaptativas (@darken/@lighten/@adjust), FTS com Porter Stemmer e FTS Exact (Deluxe), suporte a módulos terceiros (e-Sword v9-11, MyBible, TheWord, USFM), mapa completo de diretórios, e todos os bugs/armadilhas documentados. Triggers: mysword, mybible, .bbl.mybible, .cmt.mybible, .dct.mybible, GBF tag, bible engine, verse rules, strong numbers, interlinear, SimpleFileOfflineBibleEngine, bible_key index, SELECT verse scripture rowid.
allowed-tools: Read, Glob, Grep, Bash
---

# MySword Bible Engine — Referência Definitiva

> **Fonte:** https://mysword.info/modules-format © Riversoft Systems 2011–2026  
> **App atual:** MySword 16.9 (fev/2026) — Versão Web: 2.2  
> **Confirmado por:** BibleSupport forum (query real interna), AndBible wiki, migration tools docs

---

## 📁 Estrutura de Diretórios Completa

```
mysword/                   ← base configurável (padrão: /storage/emulated/0/mysword/)
├── bibles/                → *.bbl.mybible
├── commentaries/          → *.cmt.mybible
├── dictionaries/          → *.dct.mybible
├── books/                 → *.bok.mybible
├── journals/              → *.jor.mybible
├── journalsbig/           → *.jor.mybible  (>10MB — sync semanal)
├── mydata/                → DADOS DO USUÁRIO (ver skill mysword-user-data)
│   ├── bookmarks.mybible
│   ├── highlight.mybible
│   ├── format.mybible
│   ├── settings.mybible
│   ├── tags.mybible
│   ├── verselist.mybible
│   ├── default.xrefs.twm
│   ├── mapgeodata.mybible
│   └── peopledata.mybible
└── notes/
    └── versenotes.mybible
```

---

## 📦 Tipos de Módulo e Extensões

### Módulos Nativos MySword

| Tipo | Extensão | Tabela principal | Formato do conteúdo |
|------|---------|-----------------|---------------------|
| **Bible** | `.bbl.mybible` | `Bible` | GBF tags |
| **Commentary** | `.cmt.mybible` | `Commentary` | HTML puro |
| **Dictionary** | `.dct.mybible` | `Dictionary` | HTML puro |
| **Book** | `.bok.mybible` | `Books` | HTML puro (read-only sempre) |
| **Journal/Devotional** | `.jor.mybible` | `Journal` | HTML / wiki |
| **Personal Notes** | `.mybible` (sem prefixo) | `Commentary`-like | HTML / wiki |

### Módulos de Terceiros Suportados

| Origem | Extensões | Notas |
|--------|---------|-------|
| **e-Sword v9–10** | `.bblx`, `.cmtx`, `.dctx`, `.topx`, `.devx` | RTF — MySword tem interpretador RTF nativo |
| **e-Sword v11+** | `.bbli`, `.cmti`, `.dcti`, `.refi`, `.devi` | HTML — suporte direto |
| **MyBible** | `.SQLite3` (S maiúsculo!) | Schema diferente — ver skill `mybible-format` |
| **MyBible Commentary** | `.commentaries.SQLite3` | Bundled com Bible |
| **The Word** | `.ont`, `.ot`, `.nt` | Convertido/deletado após import |
| **USFM** | `.zip` com "usfm" no nome | Convertido do zip |

---

## 🗄️ Schema Completo — Tabela `Details` (1 registro em TODOS os módulos)

```sql
CREATE TABLE Details (
    Title           TEXT,
    Abbreviation    TEXT NOT NULL,  -- SEM ESPAÇOS (espaço = delimitador em links)
                                    -- Usar _ ou - (ex: "KJV-Strong", não "KJV Strong")
    Description     TEXT,
    publisher       TEXT,
    author          TEXT,
    creator         TEXT,
    source          TEXT,
    Language        TEXT,           -- ISO 3-letter: "por", "eng", "heb", "grk"
    RightToLeft     INTEGER DEFAULT 0,  -- 0=LTR, 1=RTL
    VersionDate     TEXT,           -- YYYY-MM-DD
    OT              INTEGER DEFAULT 0,
    NT              INTEGER DEFAULT 0,
    Apocrypha       INTEGER DEFAULT 0,
    Strong          INTEGER DEFAULT 0,   -- Bible: tem Strong's | Dict: é dicionário Strong's
    Interlinear     INTEGER DEFAULT 0,   -- 1 = é Bíblia interlinear
    paragraphindent INTEGER DEFAULT 1,   -- 1=com indent em modo parágrafo
    VerseRules      TEXT,    -- Regex de transformação, campos separados por TAB (\t)
    wordnanc        TEXT,    -- campo sem acentos para busca (dict)
    relativeorder   TEXT,    -- ordem alternativa de entradas (dict)
    CustomCSS       TEXT,    -- CSS injetado em todo o conteúdo
    readOnly        INTEGER DEFAULT 0    -- 1=somente leitura
);
```

---

## 🗄️ Schema — Tabela `Bible` com Índice Real

```sql
CREATE TABLE Bible (
    Book      INTEGER NOT NULL,  -- 1=Gênesis … 66=Apocalipse (67+ apócrifos)
    Chapter   INTEGER NOT NULL,  -- 1-based
    Verse     INTEGER NOT NULL,  -- 1-based; Verse=0 = título de capítulo
    Scripture TEXT    NOT NULL   -- texto com GBF tags
);

-- ÍNDICE OBRIGATÓRIO — usado internamente pelo MySword
CREATE INDEX "bible_key" ON "Bible" ("Book" ASC, "Chapter" ASC, "Verse" ASC);

-- FTS (módulos Premium)
CREATE VIRTUAL TABLE Bible_FTS USING fts4(Scripture, content=Bible, tokenize=porter);
```

### ⚡ A Query Exata que MySword Usa Internamente

```sql
-- Confirmado no BibleSupport forum (query real do app)
SELECT verse, scripture, rowid FROM bible WHERE book=? AND chapter=? ORDER BY verse
```

> Inclui `rowid` para JOIN com FTS. Sua engine deve fazer o mesmo para compatibilidade.

---

## 🗄️ Schema — Tabela `Commentary`

```sql
CREATE TABLE Commentary (
    Book        INTEGER NOT NULL,
    Chapter     INTEGER NOT NULL,
    FromVerse   INTEGER NOT NULL,
    ToVerse     INTEGER NOT NULL,
    Data        TEXT NOT NULL      -- HTML puro
);
```

**Query correta:**
```sql
-- ⚠️ Usar range, não igualdade!
SELECT Data FROM Commentary
WHERE Book=? AND Chapter=? AND FromVerse<=? AND ToVerse>=?
ORDER BY FromVerse ASC
```

---

## 🗄️ Schema — Tabela `Dictionary`

```sql
CREATE TABLE Dictionary (
    Word TEXT NOT NULL PRIMARY KEY,  -- ex: "H2617", "G5485"
    Data TEXT NOT NULL               -- HTML puro
);
```

---

## 🗄️ Schema — Tabela `Books` e Tabela `Journal`

```sql
CREATE TABLE Books (
    BookName    TEXT NOT NULL,
    ChapterName TEXT,
    Data        TEXT NOT NULL
);

CREATE TABLE Journal (
    Topic TEXT NOT NULL PRIMARY KEY,
    Note  TEXT NOT NULL
);
```

---

## 🏷️ GBF Bible Tags — Todos os 30+ Tags Oficiais

Usado **exclusivamente** na coluna `Scripture` da tabela `Bible`.  
**Convenção:** abertura = MAIÚSCULAS; fechamento = Primeira+minúsculas.

### Formatação de Texto

| Abre | Fecha | Nome | Renderização |
|------|-------|------|-------------|
| `<FR>` | `<Fr>` | **Palavras de Jesus** | `Color.Red` — NUNCA omitir |
| `<FI>` | `<Fi>` | Itálico (palavras adicionadas) | `FontStyle.Italic` |
| `<FO>` | `<Fo>` | Citação do AT no NT | estilo específico via CustomCSS |
| `<FU>` | `<Fu>` | Sublinhado | `TextDecoration.Underline` |

### Estrutura e Títulos

| Tag | Fecha | Descrição |
|-----|-------|-----------|
| `<TS>` / `<TS1>` / `<TS2>` / `<TS3>` | `<Ts>` etc | Títulos de seção |
| `<CM>` | — | Fim de parágrafo (**nunca usar `<p>` HTML**) |
| `<CI>` | — | Separador inline (espaço) |

### Formatação Poética

```
<PI#>   = indent do parágrafo (0–7)
<PF#>   = indent da primeira linha (0–7)

<PI1><PF1>  → indentação completa
<PI1><PF0>  → hanging indent
<PI0><PF1>  → parágrafo normal
```

### Strong's e Morfologia (auto-fechados)

| Tag | Exemplo | Descrição |
|-----|---------|-----------|
| `<WG`N`>` | `<WG5485>` | Strong's Grego |
| `<WH`N`>` | `<WH2617>` | Strong's Hebraico |
| `<WT`code`>` | `<WTN-NSF>` | Código morfológico |

### Notas e Cross-References

| Abre | Fecha | Exemplo | Descrição |
|------|-------|---------|-----------|
| `<RF>` | `<Rf>` | `<RF>nota<Rf>` | Nota simples |
| `<RF q=X>` | `<Rf>` | `<RF q=a>nota<Rf>` | Nota com link customizado |
| `<RX`ref`>` | — | `<RX43.3.16>` | Cross-reference (book.cap.verso) |
| `<RX`ref`>` | — | `<RX43.3.16-18>` | Cross-reference com range |

### Tags Interlineares (módulos com `Details.Interlinear=1`)

| Tag | Fecha | Descrição |
|-----|-------|-----------|
| `<Q>` | `<q>` | Bloco de 1 palavra (original + tradução) |
| `<E>` ou `<T>` | `<e>`/`<t>` | Tradução |
| `<X>` | `<x>` | Transliteração |
| `<H>` | `<h>` | Texto hebraico |
| `<G>` | `<g>` | Texto grego |
| `<D>`, `<wh>`, `<wg>`, `<wt>` | — | Ignorados |

**Exemplo real HiSB Gênesis 1:1:**
```
<Q><H><wh>בְּ<D>רֵאשִׁ֖ית<WH7225><h><X>be·re·Shit<x><T>In the beginning<t><q>
<Q><H><wh>בָּרָ֣א<WH1254><h><X>ba·Ra<x><T>created<t><q>
```

---

## ⚙️ VerseRules (campo `Details.VerseRules`)

Aplicado **antes** de qualquer parse GBF. Separador = **TAB `\t`** (não espaço!).

```
<RegEx>\t<Replacement>[\t<AlternativeReplacement>\t<ToggleName>]
```

**Exemplos reais (do módulo Byzantine 2005++):**
```
<font color=(blue|red)>(.*?)</font>\t<span class='$1'>$2</span>
<O>(.*?)<o>\t<span class='orange'>$1</span>
<K>(.*?)( )?<k>\t<span class='red' dir='rtl'>[</span>$1<span class='red' dir='rtl'>]</span>$2
```

> ⚠️ **ARMADILHA:** Separador = TAB. `rule.split("\t")` não `rule.split(" ")`.  
> ⚠️ **ORDEM:** VerseRules → Tokenizer → Parser. Inverter quebra tudo.

---

## 🔗 Sistema de Hyperlinks (módulos non-Bible)

| Prefixo | Exemplo | Destino |
|---------|---------|---------|
| `b` | `b43.3.16` | Bíblia numérica |
| `b` | `bJoh 3:16` | Bíblia textual |
| `b...` | `b43.3.16-18` | Range |
| `b.../ABBR` | `bJoh 3:16/NET` | Tradução específica |
| `b...&w=1` | `b43.3.16&w=1` | Capítulo inteiro (popup) |
| `c` | `c43.3.16` | Comentário ativo (só numérico) |
| `c-ABBR ref` | `c-TSK Joh 3:16` | Comentário específico |
| `n` | `n43.3.16` | Notas pessoais |
| `d` | `dGrace` | Dicionário ativo |
| `d-ABBR word` | `d-Webster Grace` | Dicionário específico |
| `s` | `sH2617` / `sG5485` | Strong's |
| `m` | `mN-NSF` | Código morfológico |
| `k-ABBR topic` | `k-Atlas 001 - The Ancient Near East` | Book |
| `j-ABBR topic` | `j-Todo Homework` | Journal |
| `r` | `rTexto popup` | Nota popup inline |

---

## 🎨 Sistema de Cores CSS

```
Classes: red  orange  brown  yellowgreen  green  bluegreen  blue  violet  purple  pink  gray
```

```css
/* CustomCSS com funções dinâmicas */
.color1 { color: @orange; }
.color2 { color: @darken(@red, 20%); }
.ot     { color: @lighten(@blue, 10%); font-style: italic; }
.color3 { color: @adjust(@red, 15, 20%, -20%); }
/* @body = cor atual do corpo */
```

---

## 🔍 FTS — Tipos de Busca

| Tipo | Suporte | Descrição |
|------|---------|-----------|
| **Default** | Free | `LIKE '%palavra%'` — sem índice, lento |
| **FTS Porter** | Premium | `Bible_FTS MATCH 'amor'` — encontra variações do radical |
| **FTS Exact** | Deluxe | Busca exata, sem stemming, sem acentos; suporta `OR`, `NEAR` |
| **Highlight Search** | Todos | Busca versículos por cor de destaque |

---

## 🔧 Engine de Leitura — Implementação Kotlin

```kotlin
// ✅ Abrir read-only + NO_LOCALIZED_COLLATORS
val db = SQLiteDatabase.openDatabase(
    filePath, null,
    SQLiteDatabase.OPEN_READONLY or SQLiteDatabase.NO_LOCALIZED_COLLATORS
)

// ✅ Índice obrigatório (criar se ausente — compatibilidade com módulos externos)
fun ensureBibleIndex(db: SQLiteDatabase) {
    try {
        db.execSQL("""CREATE INDEX IF NOT EXISTS "bible_key" ON "Bible" ("Book" ASC, "Chapter" ASC, "Verse" ASC)""")
    } catch (e: SQLiteException) { /* Já existe ou read-only — ignorar */ }
}

// ✅ A query exata do MySword (inclui rowid para FTS JOIN)
fun loadChapter(db: SQLiteDatabase, book: Int, chapter: Int): List<Triple<Int, String, Long>> =
    db.rawQuery(
        "SELECT verse, scripture, rowid FROM bible WHERE book=? AND chapter=? ORDER BY verse",
        arrayOf(book.toString(), chapter.toString())
    ).use { c ->
        buildList {
            while (c.moveToNext()) add(Triple(c.getInt(0), c.getString(1), c.getLong(2)))
        }
    }

// ✅ Verificar e detectar tipo
fun detectModuleType(db: SQLiteDatabase): ModuleType {
    val tables = db.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='table'", null
    ).use { c -> buildSet { while (c.moveToNext()) add(c.getString(0).uppercase()) } }
    return when {
        "BIBLE"      in tables -> ModuleType.BIBLE
        "VERSES"     in tables -> ModuleType.BIBLE      // MyBible!
        "COMMENTARY" in tables -> ModuleType.COMMENTARY
        "DICTIONARY" in tables -> ModuleType.DICTIONARY
        "BOOKS"      in tables -> ModuleType.BOOK
        "JOURNAL"    in tables -> ModuleType.JOURNAL
        else -> ModuleType.UNKNOWN
    }
}
```

---

## 🐛 Bugs e Armadilhas Documentados

| Problema | Sintoma | Causa | Fix |
|----------|---------|-------|-----|
| `<CM>` visível | texto literal `<CM>` | tag não mapeado | mapear para `ParagraphBreak` |
| `<FR>` sem vermelho | Palavras de Jesus em preto | parser ignorando | implementar `RedLetterText` |
| Verse=0 crash | erro SQLite | tratar como erro | `if (verse == 0) isHeader = true` |
| VerseRules falha | tags customizados visíveis | split por espaço | `rule.split("\t")` |
| Commentary vazia | zero resultados | `WHERE Verse=?` | `WHERE FromVerse<=? AND ToVerse>=?` |
| RTL invertido | árabe/hebraico LTR | `RightToLeft=1` ignorado | `LayoutDirection.Rtl` |
| Encoding garbled | `ã`,`ç`,`ḥ` viram `?` | sem UTF-8 | `PRAGMA encoding = "UTF-8"` |
| Strong's sem tap | número visível não clicável | sem `pushStringAnnotation` | adicionar anotação |
| `bible_key` ausente | crash ou lentidão extrema | módulo criado sem índice | `CREATE INDEX IF NOT EXISTS` |
| `.mybible-wal` | arquivo inconsistente | WAL mode ativo | fechar MySword antes de ler |
| `no such column: verse` | crash na query | tabela com nome errado | checar case: `bible` vs `Bible` |
| Módulo e-Sword RTF | tags RTF visíveis | interpretador RTF não aplicado | MySword tem RTF nativo — não aplicar manualmente |
