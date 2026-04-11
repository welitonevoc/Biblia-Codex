---
name: mybible-format
description: Referência definitiva e completa do formato MyBible (.SQLite3) baseada na especificação oficial (Revision 2017-01-17). Cobre TODOS os 7 tipos de módulo com schemas completos (Bible/Dictionary/Subheadings/CrossReferences/Commentaries/ReadingPlans/Devotions), tabela INFO key-value com todos os campos de cada tipo, tags embutidas no VERSES.text (<S><m><i><J><n><e><t><br/><pb/><f>), numeração PalmBible+ completa de livros (Genesis=10, Psalms=230, Matthew=470, Revelation=730), BOOKS vs BOOKS_ALL, STORIES e INTRODUCTIONS tables, algoritmo completo de lookup de dicionários (NF1/NF2 normalization, tabelas LOOKUP_WORDS/LOOKUP_TOPICS/LOOKUP_REFERENCES/DICTIONARIES), sistema de cores com índices 0-5 e keywords %COLOR_*, hyperlinks B:/C:@/S:, detecção vs MySword, e conversão de book numbers. Use SEMPRE ao trabalhar com módulos .SQLite3 do MyBible, importação de arquivos do app ua.mybible, hyperlinks entre módulos MyBible, renderização de texto, ou qualquer diferenciação entre o formato MyBible e MySword. Triggers: mybible, MyBible, .SQLite3, INFO table, VERSES table, BOOKS table, BOOKS_ALL, STORIES, INTRODUCTIONS, COMMENTARIES, CROSS_REFERENCES, READING_PLAN, DEVOTIONS, SUBHEADINGS, dictionary lookup, NF1, NF2, font color index, %COLOR_TEXT%, PalmBible, book number 10 470 730.
allowed-tools: Read, Glob, Grep, Bash
---

# MyBible Format — Especificação Oficial Completa

> **Fonte:** MyBible Modules Format Revision 2017-01-17 © mybible.zone  
> **App:** MyBible para Android (package: ua.mybible)  
> **Diretório no dispositivo:** `/MyBible/` ou `/Android/data/ua.mybible/files/MyBible/`  
> **ATENÇÃO:** Formato completamente diferente do MySword. Nunca confundir os dois.

---

## ⚠️ DIFERENÇAS FUNDAMENTAIS: MyBible ≠ MySword

| Aspecto | MySword (.bbl.mybible) | MyBible (.SQLite3) |
|---------|----------------------|--------------------|
| Metadados | Tabela `Details` com colunas | Tabela `info` com key-value |
| Texto bíblico | Tabela `Bible` | Tabela `verses` (minúsculas!) |
| Numeração de livros | 1-based (Genesis=1) | PalmBible+ legacy (Genesis=10) |
| Tags de formatação | GBF (FR, FI, WG, WH...) | HTML com tags simples (`<S>`, `<J>`, `<i>`) |
| Abreviação do módulo | Campo `Abbreviation` no banco | Definida pelo **nome do arquivo** |
| Hyperlinks internos | `b`, `c-`, `d-`, `s`, `j-`, `k-` | `B:`, `C:@`, `S:` |
| Highlights/Notas usuário | Arquivos globais em `mydata/` | `.markup.SQLite3` por módulo |
| Cores no CSS | Classes CSS + `@darken`/`@lighten` | Índices 0–5 ou `%COLOR_TEXT%`..`%COLOR_GREY%` |

---

## 📦 Tipos de Módulo e Nomenclatura

```
<abreviação><.sufixo-de-tipo>.SQLite3
```

| Tipo | Sufixo | Exemplo |
|------|--------|---------|
| **Bible translation** | (nenhum) | `KJV+.SQLite3`, `NVI.SQLite3` |
| **Dictionary/Lexicon** | `.dictionary` | `Strong.dictionary.SQLite3` |
| **Subheadings** | `.subheadings` | `KJV-s.subheadings.SQLite3` |
| **Cross references** | `.crossreferences` | `OBX.crossreferences.SQLite3` |
| **Commentaries** | `.commentaries` | `RCAS.commentaries.SQLite3` |
| **Reading plans** | `.plan` | `AGV-p.plan.SQLite3` |
| **Daily devotions** | `.devotions` | `DCF-d.devotions.SQLite3` |

**Módulos em ZIP** (formato de download eficiente):
```
РСП.zip              ← módulo principal
  .SQLite3           ← arquivo Bible sem nome de abreviação
  .commentaries.SQLite3  ← módulo adicional bundled
```

> ⚠️ **Abreviação = nome do arquivo** (não existe campo de abreviação DENTRO do banco)

---

## 🗄️ Tabela `info` (universal em todos os módulos)

```sql
CREATE TABLE info (name TEXT, value TEXT)
```

### Campos comuns a todos os módulos

| Chave | Tipo | Descrição |
|-------|------|-----------|
| `language` | TEXT | 2-letter Java locale (`"en"`, `"pt"`, `"ru"`, `"el"`, `"iw"`) |
| `description` | TEXT | Título oficial, plain text (sem tags HTML) |
| `detailed_info` | TEXT | Info detalhada com HTML. Para `<` e `>` em XML usar `&lt;`/`&gt;` |
| `region` | TEXT | Só para idiomas pequenos: região em inglês (`"Micronesia"`) |
| `russian_numbering` | BOOL | `"true"` se usa numeração russa para Salmos/Jó/Cânticos |
| `hyperlink_languages` | TEXT | Idiomas adicionais de hyperlinks, separados por `/` (ex: `"el/iw/en"`) |
| `html_style` | TEXT | CSS inserido em `<style>…</style>` para dicionários/comentários/devocionais |

**Sistema de cores no `html_style`:**
```css
/* Keywords que MyBible substitui pelas cores do tema atual */
%COLOR_TEXT%   → cor padrão do texto
%COLOR_RED%    → cor de texto 1 (vermelho)
%COLOR_GREEN%  → cor de texto 2 (verde)
%COLOR_BLUE%   → cor de texto 3 (azul)
%COLOR_PURPLE% → cor de texto 4 (roxo)
%COLOR_GREY%   → cor de texto 5 (cinza)

/* Exemplo de html_style */
h1 { color: %COLOR_RED% }
a { text-decoration: none; }
div { margin-top: 0px; margin-bottom: 3px; }
```

### Campos específicos de Bible translation

| Chave | Descrição |
|-------|-----------|
| `chapter_string` | Palavra para "Capítulo" (use `%s` para número: `"第%s章"`) |
| `chapter_string_ot` | Override para AT (Bíblias bilíngues) |
| `chapter_string_nt` | Override para NT |
| `chapter_string_ps` | Override para Salmos |
| `introduction_string` | Palavra para "Introdução" no idioma |
| `strong_numbers` | `"true"` se tem Strong's |
| `right_to_left` | `"true"` para hebraico/árabe |
| `right_to_left_ot` / `right_to_left_nt` | Override RTL por testamento |
| `digits0-9` | Dígitos locais, exatamente 10 chars (ex: `"०१२३४५६७८९"` para hindi) |
| `font_scale` | Escala de fonte (padrão `1.0`; árabe usa `1.2`) |
| `strong_numbers_prefix` | Prefixo fixo: `"G"` para Septuaginta (AT aponta para grego) |
| `contains_accents` | `"true"` se texto tem acentos (busca deve ignorar) |
| `swaps_non_localized_words_in_mixed_language_line` | `"true"` para árabe/farsi |
| `localized_book_abbreviations` | `"true"` se abreviações de livros são RTL |

### Campos específicos de Dictionary

| Chave | Descrição |
|-------|-----------|
| `articles_language` | Idioma dos artigos (se diferente de `language`) |
| `is_strong` | Legacy: `"true"` se é lexicon Strong's |
| `is_word_forms` | Legacy: `"true"` se tem tabela WORDS |
| `type` | Tipo do dicionário: `"explanatory"`, `"translator"`, `"concordance"`, `"lexicon"`, `"strong lexicon"` |
| `standard_form_matching_type` | Como match WORDS.standard_form vs DICTIONARY.topic: `"exact"`, `"normalized form 1"`, `"normalized form 2"` (default) |
| `morphology_topic_reference` | Template para link após explicação de morfologia |
| `cognate_strong_numbers_info` | Template para números Strong's cognatos (ex: `"Cognate Strong's numbers: %s"`) |
| `informative_references_to_verses` | `"true"` para incluir nas referências inversas de versículo |

### Campos específicos de Subheadings

| Chave | Descrição |
|-------|-----------|
| `font_size` | Tamanho da fonte (absoluto ou relativo: `"+1"`, `"-2"`) |
| `font_bold` | `"true"` / `"false"` |
| `font_italic` | `"true"` / `"false"` |
| `font_color_day` | Cor modo dia: `#rrggbb` ou `#aarrggbb` |
| `font_color_night` | Cor modo noite |

---

## 🗄️ Tabela `books` (Bible translation)

```sql
CREATE TABLE books (
    book_number NUMERIC,
    book_color  TEXT,     -- #rrggbb ou #aarrggbb
    short_name  TEXT,     -- abreviação (ex: "Gen", "Mt")
    long_name   TEXT,     -- nome completo (ex: "Genesis", "Matthew")
    is_present  BOOLEAN   -- 1 se presente, 0 se ausente; campo opcional
)
```

**Tabela `books_all`** (preferida em versões 4.4.3+):
```sql
CREATE TABLE books_all (
    book_number NUMERIC,
    book_color  TEXT,
    short_name  TEXT,
    long_name   TEXT,
    is_present  BOOLEAN NOT NULL  -- sempre presente aqui
)
```

> MyBible verifica `books_all` primeiro. Só usa `books` se `books_all` não existir.

---

## 🔢 Numeração PalmBible+ Completa (MyBible book_number)

> **CRÍTICO:** Esta numeração é completamente diferente da numeração MySword (1-based).  
> A conversão é **obrigatória** ao importar módulos MyBible para o seu banco Room.

```
Cor        #  Abrev  Nome PT-BR                    MySword#
#ccccff   10  Gn     Gênesis                       1
#ccccff   20  Êx     Êxodo                         2
#ccccff   30  Lv     Levítico                      3
#ccccff   40  Nm     Números                       4
#ccccff   50  Dt     Deuteronômio                  5
#ffcc99   60  Js     Josué                         6
#ffcc99   70  Jz     Juízes                        7
#ffcc99   80  Rt     Rute                          8
#ffcc99   90  1Sm    1 Samuel                      9
#ffcc99  100  2Sm    2 Samuel                      10
#ffcc99  110  1Rs    1 Reis                        11
#ffcc99  120  2Rs    2 Reis                        12
         130  1Cr    1 Crônicas                    13
         140  2Cr    2 Crônicas                    14
         150  Ed     Esdras                        15
         160  Ne     Neemias                       16
         170  Tb     Tobias                        (apócrifo)
         180  Jt     Judite                        (apócrifo)
         190  Et     Ester                         17
         220  Jó     Jó                            18
         230  Sl     Salmos                        19
         240  Pv     Provérbios                    20
         250  Ec     Eclesiastes                   21
         260  Ct     Cânticos                      22
         270  Sb     Sabedoria                     (apócrifo)
         280  Sr     Eclesiástico/Sirácida          (apócrifo)
#ff9fb4  290  Is     Isaías                        23
#ff9fb4  300  Jr     Jeremias                      24
#ff9fb4  310  Lm     Lamentações                   25
#ff9fb4  315  Ep Jr  Epístola de Jeremias          (apócrifo)
#ff9fb4  320  Br     Baruc                         (apócrifo)
#ff9fb4  330  Ez     Ezequiel                      26
#ff9fb4  340  Dn     Daniel                        27
#ffff99  350  Os     Oséias                        28
#ffff99  360  Jl     Joel                          29
#ffff99  370  Am     Amós                          30
#ffff99  380  Ob     Obadias                       31
#ffff99  390  Jn     Jonas                         32
#ffff99  400  Mq     Miquéias                      33
#ffff99  410  Na     Naum                          34
#ffff99  420  Hc     Habacuque                     35
#ffff99  430  Sf     Sofonias                      36
#ffff99  440  Ag     Ageu                          37
#ffff99  450  Zc     Zacarias                      38
#ffff99  460  Ml     Malaquias                     39
#d3d3d3  462  1Mc    1 Macabeus                    (apócrifo)
#d3d3d3  464  2Mc    2 Macabeus                    (apócrifo)
#d3d3d3  466  3Mc    3 Macabeus                    (apócrifo)
#ff6600  470  Mt     Mateus                        40
#ff6600  480  Mc     Marcos                        41
#ff6600  490  Lc     Lucas                         42
#ff6600  500  Jo     João                          43
#00ffff  510  At     Atos                          44
#ffff00  520  Rm     Romanos                       45
#ffff00  530  1Co    1 Coríntios                   46
#ffff00  540  2Co    2 Coríntios                   47
#ffff00  550  Gl     Gálatas                       48
#ffff00  560  Ef     Efésios                       49
#ffff00  570  Fp     Filipenses                    50
#ffff00  580  Cl     Colossenses                   51
#ffff00  590  1Ts    1 Tessalonicenses             52
#ffff00  600  2Ts    2 Tessalonicenses             53
#ffff00  610  1Tm    1 Timóteo                     54
#ffff00  620  2Tm    2 Timóteo                     55
#ffff00  630  Tt     Tito                          56
#ffff00  640  Fm     Filemon                       57
#ffff00  650  Hb     Hebreus                       58
#00ff00  660  Tg     Tiago                         59
#00ff00  670  1Pe    1 Pedro                       60
#00ff00  680  2Pe    2 Pedro                       61
#00ff00  690  1Jo    1 João                        62
#00ff00  700  2Jo    2 João                        63
#00ff00  710  3Jo    3 João                        64
#00ff00  720  Jd     Judas                         65
#ff7c80  730  Ap     Apocalipse                    66
         780  Laod   Aos Laodicenses               (não canônico)
         790  Mol    Oração de Manassés            (apócrifo)
```

**Tabela de conversão Kotlin (MyBible → MySword):**
```kotlin
object MyBibleToMySword {
    val bookMap = mapOf(
        10 to 1, 20 to 2, 30 to 3, 40 to 4, 50 to 5,
        60 to 6, 70 to 7, 80 to 8, 90 to 9, 100 to 10,
        110 to 11, 120 to 12, 130 to 13, 140 to 14, 150 to 15,
        160 to 16, 190 to 17, 220 to 18, 230 to 19, 240 to 20,
        250 to 21, 260 to 22, 290 to 23, 300 to 24, 310 to 25,
        330 to 26, 340 to 27, 350 to 28, 360 to 29, 370 to 30,
        380 to 31, 390 to 32, 400 to 33, 410 to 34, 420 to 35,
        430 to 36, 440 to 37, 450 to 38, 460 to 39,
        470 to 40, 480 to 41, 490 to 42, 500 to 43, 510 to 44,
        520 to 45, 530 to 46, 540 to 47, 550 to 48, 560 to 49,
        570 to 50, 580 to 51, 590 to 52, 600 to 53, 610 to 54,
        620 to 55, 630 to 56, 640 to 57, 650 to 58,
        660 to 59, 670 to 60, 680 to 61, 690 to 62, 700 to 63,
        710 to 64, 720 to 65, 730 to 66
    )

    fun toMySword(myBibleNum: Int): Int = bookMap[myBibleNum] ?: myBibleNum
    fun toMyBible(mySwordNum: Int): Int =
        bookMap.entries.firstOrNull { it.value == mySwordNum }?.key ?: (mySwordNum * 10)
}
```

---

## 🗄️ Tabela `verses` (Bible translation)

```sql
CREATE TABLE verses (
    book_number NUMERIC,
    chapter     NUMERIC,  -- começa em 1, sem gaps
    verse       NUMERIC,  -- começa em 1; verse com texto vazio deve existir se consolidado
    text        TEXT
)
CREATE UNIQUE INDEX verses_index ON verses (book_number, chapter, verse)
```

> ⚠️ **Tabela = `verses` (minúsculas)**. MySword usa `Bible` (maiúsculas). Diferença crítica para detecção.

### Tags embutidas no campo `verses.text`

| Tag | Fecha com | Descrição | Diferença do MySword |
|-----|-----------|-----------|---------------------|
| `<S>N</S>` | `</S>` | Strong's number (sem prefixo H/G — livro determina se é grego ou hebraico) | MySword usa `<WH1234>` e `<WG5678>` |
| `<m>cod</m>` | `</m>` | Código morfológico para o Strong's anterior | MySword usa `<WTcod>` |
| `<i>texto</i>` | `</i>` | Palavras adicionadas (itálico) | MySword usa `<FI>...<Fi>` |
| `<J>texto</J>` | `</J>` | Palavras de Jesus (red letter) | MySword usa `<FR>...<Fr>` |
| `<n>texto</n>` | `</n>` | Nota/explicação no texto | MySword usa `<RF>...<Rf>` |
| `<e>texto</e>` | `</e>` | Texto enfatizado | MySword usa `<FU>...<Fu>` |
| `<t>texto</t>` | `</t>` | Texto em nova linha com indent (citação AT no NT, poesia) | MySword usa `<FO>...<Fo>` |
| `<br/>` | — | Quebra de linha | MySword não tem equivalente direto |
| `<pb/>` | — | Quebra de parágrafo (verses começam nova linha só após `<pb/>`) | MySword usa `<CM>` |
| `<f>marker</f>` | `</f>` | Marcador de rodapé (hyperlink para nota em módulo `.commentaries.SQLite3`) | MySword usa `<RF q=marker>` |

**Exemplo real de texto MyBible com Strong's:**
```
In the beginning<S>7225</S> God<S>430</S> created<S>1254</S> <S>853</S> the heaven<S>8064</S> and the earth.<S>776</S>
```

**Exemplo real com Jesus (J) e Strong's:**
```
<S>1161</S> Jesus<S>2424</S> said<S>2036</S> unto him,<S>846</S>
<J>Thou</J> <J>shalt</J> <J>love</J><S>25</S> <J>the</J>
<J>Lord</J><S>2962</S> <J>thy</J><S>4675</S> <J>God</J><S>2316</S>
```

---

## 🗄️ Tabela `introductions` (opcional — Bible)

```sql
CREATE TABLE introductions (book_number NUMERIC, introduction TEXT)
CREATE UNIQUE INDEX introductions_index ON introductions(book_number)
```

- `book_number = 0` → introdução de toda a tradução
- `introduction` → HTML sem `<html>` e `<body>`
- Hyperlinks: `B:<book_number> <chapter>:<verse>` ou `http://...`

---

## 🗄️ Tabela `stories` (opcional — subheadings embutidos na Bible)

```sql
CREATE TABLE stories (
    book_number     NUMERIC,
    chapter         NUMERIC,
    verse           NUMERIC,
    order_if_several NUMERIC,  -- ordem se há múltiplos para o mesmo verso
    title           TEXT
)
CREATE UNIQUE INDEX stories_index ON stories(book_number, chapter, verse, order_if_several)
```

> `stories` = subheadings embutidos no módulo Bible. Preferir módulos `.subheadings.SQLite3` separados.  
> Hyperlinks com `<x>480 3:5</x>` = Mar 3:5.

---

## 🗄️ Schema Completo — Módulo Dictionary

### Tabela `dictionary`

```sql
CREATE TABLE dictionary (
    topic             TEXT NOT NULL,  -- keyword ou Strong# completo ("H2617", "G5485")
    definition        TEXT NOT NULL,  -- HTML sem <html>/<body>
    short_definition  TEXT,           -- Definição curta (opcional — para Strong's lexicons)
    lexeme            TEXT,           -- Palavra original (hebraico/grego)
    transliteration   TEXT,           -- Transliteração fonética
    pronunciation     TEXT            -- Pronúncia
)
CREATE UNIQUE INDEX dictionary_topic ON dictionary(topic ASC)
```

**Sistema de cores no HTML da `definition`:**
```html
<!-- Por índice (0-5) -->
<font color='1'>vermelho</font>
<font color='0'>cor de texto padrão</font>
<font color='5'>cinza</font>

<!-- Por keyword (equivalente) -->
<font color='%COLOR_RED%'>vermelho</font>
<font color='%COLOR_TEXT%'>padrão</font>
```

**Hyperlinks internos no HTML da `definition`:**
- `S:<topic>` → link para outro tópico do dicionário (ex: `href='S:H352'`)
- `B:10 3:8` → link para Gênesis 3:8 (book_number=10)
- `B:10 3:8-12` → range Gên 3:8–12
- `B:10 3:8,12,15` → versículos específicos

### Tabela `words` (correspondência de formas)

```sql
-- Forma simples (sem localização por versículo)
CREATE TABLE words (standard_form TEXT, variation TEXT)

-- Forma completa (com localização exata)
CREATE TABLE words (
    variation      TEXT,
    standard_form  TEXT,
    book_number    NUMERIC NOT NULL DEFAULT 0,
    chapter_number NUMERIC NOT NULL DEFAULT 0,
    verse_number   NUMERIC NOT NULL DEFAULT 0
)
CREATE UNIQUE INDEX forms_index ON words(standard_form, variation[, book_number, chapter_number, verse_number])
CREATE INDEX variation_index ON words(variation ASC)
```

### Tabela `words_processing` (pré/pós-processamento de palavras)

```sql
CREATE TABLE words_processing (type TEXT, input TEXT, output TEXT)
-- type: "pre" ou "post"
```

> Não necessário para: grego, hebraico, russo, siríaco (hardcoded no MyBible por performance).

### Tabela `morphology_indications`

```sql
CREATE TABLE morphology_indications (indication TEXT, applicable_to TEXT, meaning TEXT)
CREATE UNIQUE INDEX morphology_indications_index ON morphology_indications (indication ASC, applicable_to ASC)
```

### Tabela `morphology_topics`

```sql
CREATE TABLE morphology_topics (indication TEXT, topic TEXT)
CREATE UNIQUE INDEX morphology_topics_index ON morphology_topics (indication ASC)
-- indication: ex "V-PAN", topic: ex "G5721"
```

### Tabela `cognate_strong_numbers`

```sql
CREATE TABLE cognate_strong_numbers (group_id NUMERIC, strong_number TEXT)
CREATE INDEX cognate_strong_numbers_group ON cognate_strong_numbers(group_id)
CREATE INDEX cognate_strong_numbers_number ON cognate_strong_numbers(strong_number)
```

---

## 🗄️ Schema — Módulo Subheadings

```sql
CREATE TABLE subheadings (
    book_number      NUMERIC,
    chapter          NUMERIC,
    verse            NUMERIC,        -- subheading aparece ANTES deste verso
    order_if_several NUMERIC,        -- pode ser NULL
    subheading       TEXT            -- texto; hyperlinks com <x>480 3:5</x>
)
CREATE UNIQUE INDEX subheadings_index ON subheadings(book_number, chapter, verse, order_if_several)
```

---

## 🗄️ Schema — Módulo Cross References

```sql
CREATE TABLE cross_references (
    book           NUMERIC,
    chapter        NUMERIC,
    verse          NUMERIC,
    verse_end      NUMERIC,        -- 0 ou NULL = versículo único
    book_to        NUMERIC,
    chapter_to     NUMERIC,
    verse_to_start NUMERIC,
    verse_to_end   NUMERIC,        -- 0 = versículo único
    votes          NUMERIC         -- relevância para ordenação
)
CREATE INDEX book_and_chapter    ON cross_references(book, chapter)
CREATE INDEX book_and_chapter_to ON cross_references(book_to, chapter_to)
CREATE INDEX book_chapter_verse  ON cross_references(book, chapter, verse)
```

---

## 🗄️ Schema — Módulo Commentaries

```sql
CREATE TABLE commentaries (
    book_number          NUMERIC,
    chapter_number_from  NUMERIC,  -- 0 = aplicável ao livro inteiro
    verse_number_from    NUMERIC,
    chapter_number_to    NUMERIC,  -- NULL = até o fim do capítulo inicial; ausente se is_footnotes
    verse_number_to      NUMERIC,  -- NULL = até fim do chapter_to
    marker               TEXT,     -- marcador de rodapé (só quando is_footnotes=true)
    text                 TEXT      -- HTML sem <html>/<body>
)
CREATE UNIQUE INDEX commentaries_index ON commentaries(book_number, chapter_number_from, verse_number_from)
```

**Hyperlinks no `text` de Commentary:**
- `B:10 1:1` → Gênesis 1:1
- `C:@10 3:8` → link para outro artigo de comentário (livro 10, cap 3, verso 8)
- `S:H1254` → link para Strong's hebraico
- `S:G5485` → link para Strong's grego

**INFO fields específicos de Commentary:**
- `is_footnotes = "true"` → módulo contém rodapés para uma tradução específica (mesma abreviação)

---

## 🗄️ Schema — Módulo Reading Plan

```sql
CREATE TABLE reading_plan (
    day           NUMERIC,  -- começa em 1; máximo = duração do plano em dias
    evening       NUMERIC,  -- 0 = manhã, 1 = noite (legado; usar 0 para novos)
    item          NUMERIC,  -- número do item para ordenação no mesmo dia
    book_number   NUMERIC,
    start_chapter NUMERIC,
    start_verse   NUMERIC,  -- NULL = primeiro versículo
    end_chapter   NUMERIC,  -- obrigatório; igual a start_chapter se cobre 1 capítulo
    end_verse     NUMERIC   -- NULL = último versículo do end_chapter
)
CREATE INDEX reading_plan_index ON reading_plan (day, evening, item)
```

---

## 🗄️ Schema — Módulo Devotions

```sql
CREATE TABLE devotions (
    day     NUMERIC,  -- começa em 1
    devotion TEXT     -- HTML sem <html>/<body>
)
CREATE UNIQUE INDEX devotions_index ON devotions (day ASC)
```

**Hyperlinks no `devotion`:** `B:10 3:15` (Gênesis 3:15) e `S:G1234` (Strong's)

---

## 🔍 Sistema de Lookup de Dicionários (Algoritmo Completo)

O MyBible mantém tabelas de lookup no banco de dados global de dicionários.

### Formas Normalizadas

- **NF1** = pré-processamento → lowercase → diacríticos como codepoints separados → pós-processamento
- **NF2** = pré-processamento → lowercase → **remoção completa de diacríticos**

### Tabelas de Lookup (banco global)

```sql
-- Lookup por palavras
CREATE TABLE lookup_words (
    word_nf1, word_nf2,
    topic_hash1, topic_hash2, topic_hash3,
    book_number, chapter_number, verse_number,
    source_dictionary_id, target_dictionary_id
)
CREATE INDEX lookup_words_word_nf1 ON lookup_words (word_nf1)
CREATE INDEX lookup_words_word_nf2 ON lookup_words (word_nf2)

-- Lookup por tópicos
CREATE TABLE lookup_topics (
    topic TEXT, topic_nf2 TEXT, topic_hash NUMERIC, dictionary_id NUMERIC
)
CREATE INDEX lookup_topics_topic_hash ON lookup_topics (topic_hash)
CREATE INDEX lookup_topics_topic ON lookup_topics (topic)

-- Referências de tópicos de dicionários para versículos
CREATE TABLE lookup_references (
    topic, book_number, chapter_number, verse_number, dictionary_id
)
CREATE INDEX lookup_references_index ON lookup_references (book_number, chapter_number, verse_number)
```

### Views de Lookup

```sql
-- Busca por NF1
CREATE VIEW topics_by_word1 AS
SELECT w.word_nf1 AS word_nf, t.topic, d.language, d.name AS dictionary_name, d.type AS dictionary_type,
       w.book_number, w.chapter_number, w.verse_number
FROM lookup_words w, lookup_topics t, dictionaries d
WHERE t.topic_hash IN (w.topic_hash1, w.topic_hash2, w.topic_hash3)
  AND w.target_dictionary_id IN (t.dictionary_id, 0)
  AND d.id = t.dictionary_id;
```

### Modos de Lookup

- **Strong Mode**: busca Strong's primeiro → se não encontrar, busca por palavra
- **Dictionaries Mode**: busca por palavra primeiro → se não encontrar, busca Strong's

---

## 🔧 Detecção MyBible vs MySword no Kotlin

```kotlin
enum class BibleModuleFormat { MYSWORD, MYBIBLE, UNKNOWN }

fun detectFormat(filePath: String): BibleModuleFormat {
    return try {
        SQLiteDatabase.openDatabase(filePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            val tables = db.rawQuery(
                "SELECT name FROM sqlite_master WHERE type='table'", null
            ).use { c -> buildSet { while (c.moveToNext()) add(c.getString(0).lowercase()) } }
            when {
                "bible"  in tables && "details" in tables -> BibleModuleFormat.MYSWORD
                "verses" in tables && "info"    in tables -> BibleModuleFormat.MYBIBLE
                "bible"  in tables                        -> BibleModuleFormat.MYSWORD  // fallback
                else -> BibleModuleFormat.UNKNOWN
            }
        }
    } catch (e: Exception) { BibleModuleFormat.UNKNOWN }
}

// Leitura de capítulo em módulo MyBible
fun loadChapterMyBible(db: SQLiteDatabase, mySwordBook: Int, chapter: Int): List<Pair<Int, String>> {
    val myBibleBook = MyBibleToMySword.toMyBible(mySwordBook)
    return db.rawQuery(
        "SELECT verse, text FROM verses WHERE book_number=? AND chapter=? ORDER BY verse",
        arrayOf(myBibleBook.toString(), chapter.toString())
    ).use { c -> buildList { while (c.moveToNext()) add(c.getInt(0) to c.getString(1)) } }
}

// Leitura de INFO
fun loadInfoMyBible(db: SQLiteDatabase): Map<String, String> =
    db.rawQuery("SELECT name, value FROM info", null).use { c ->
        buildMap { while (c.moveToNext()) put(c.getString(0), c.getString(1) ?: "") }
    }
```

---

## 🎨 Renderização das Tags `verses.text` no Compose

```kotlin
// Tags MyBible para VerseSegment (diferente do parser GBF MySword!)
object MyBibleVerseParser {
    private val TAG_REGEX = Regex("<(/?)(S|m|i|J|n|e|t|br|pb|f)([^>]*)>", RegexOption.IGNORE_CASE)

    fun parse(text: String, options: ParseOptions): List<VerseSegment> {
        val segments = mutableListOf<VerseSegment>()
        var inJesus = false; var inItalic = false; var inNote = false
        val noteContent = StringBuilder(); var inEmphasis = false

        for (match in TAG_REGEX.findAll(text)) { /* ... state machine ... */ }
        // Lógica similar ao GbfTagParser mas com tags MyBible
        return segments
    }
}

// Mapeamento de cores MyBible (índice → cor do tema)
fun resolveMyBibleColor(colorIndex: Int, isDark: Boolean): Color = when (colorIndex) {
    0 -> if (isDark) Color.White else Color.Black  // %COLOR_TEXT%
    1 -> Color(0xFFE53935)                          // %COLOR_RED%
    2 -> Color(0xFF43A047)                          // %COLOR_GREEN%
    3 -> Color(0xFF1E88E5)                          // %COLOR_BLUE%
    4 -> Color(0xFF8E24AA)                          // %COLOR_PURPLE%
    5 -> Color(0xFF757575)                          // %COLOR_GREY%
    else -> Color.Unspecified
}
```

---

## ✅ Checklist de Compatibilidade MyBible

- [ ] Extensão `.SQLite3` com 'S' maiúsculo detectada (não `.sqlite3`)
- [ ] Tipo detectado por tabela `verses` + `info` (não `Bible`)
- [ ] Abreviação extraída do **nome do arquivo**, não de campo interno
- [ ] `books_all` verificada antes de `books` (versões 4.4.3+)
- [ ] `book_number` convertido PalmBible+ → MySword ao persistir no Room
- [ ] `right_to_left = "true"` de INFO aplicado como RTL
- [ ] Tags `<S>` sem prefixo: livro ≤39 = hebraico (H), ≥40 = grego (G)
- [ ] `<J>` renderizado em vermelho (palavras de Jesus)
- [ ] `<pb/>` causa quebra de parágrafo
- [ ] `<f>marker</f>` cria link para footnote em `.commentaries.SQLite3` correspondente
- [ ] `html_style` com `%COLOR_*%` substituído pelas cores do tema atual
- [ ] `font color='1'` e `font color='%COLOR_RED%'` tratados como equivalentes
- [ ] Módulo `.commentaries.SQLite3` procurado junto com o Bible `.SQLite3`
- [ ] Strong's prefix: se `strong_numbers_prefix = "G"` (Septuaginta), todos os numbers são gregos
