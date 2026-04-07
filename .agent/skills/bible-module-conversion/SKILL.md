---
name: bible-module-conversion
description: Especialista em conversão e interoperabilidade entre formatos de módulos bíblicos — MySword (.bbl.mybible), MyBible (.SQLite3), SWORD (Crosswire), e-Sword (.bblx/.bbli), OSIS XML, USFM, e AndBible. Cobre: conversão de GBF→HTML MyBible e HTML MyBible→GBF, mapeamento de numeração de livros PalmBible+↔MySword (Genesis=10↔1, Psalms=230↔19, Matthew=470↔40), conversão de Strong's com prefixo vs sem prefixo, normalização de UTF-8 para módulos RTF e-Sword, criação de módulos MySword compatíveis a partir de fontes externas, módulo .conf para AndBible (MySwordBible/MySwordCommentary), estratégias de import/export com verificação de integridade, e migração de dados de usuário entre versões. Triggers: converter módulo, importar e-Sword, importar myBible, exportar MySword, criar módulo, OSIS, USFM, bible converter, book number conversion, GBF to HTML, HTML to GBF, strong prefix, AndBible conf, migration, interop.
allowed-tools: Read, Glob, Grep, Bash
---

# Bible Module Conversion — Interoperabilidade e Conversão

> **Regra de Ouro:** Nunca assumir que dois formatos têm o mesmo schema. Sempre mapear explicitamente.

---

## 📚 Mapa de Compatibilidade de Formatos

| De | Para | Complexidade | Perdas |
|----|------|-------------|--------|
| **MySword Bible** | **MyBible Bible** | Média | Nenhuma (GBF→HTML) |
| **MyBible Bible** | **MySword Bible** | Média | Nenhuma (HTML→GBF) |
| **e-Sword (bblx)** | **MySword** | Baixa | RTF colors → CSS classes |
| **e-Sword (bbli)** | **MySword** | Baixa | HTML direto |
| **The Word (.ont)** | **MySword** | Baixa | Font tags → CSS |
| **OSIS XML** | **MySword** | Alta | Estrutura hierárquica → verso a verso |
| **USFM** | **MySword** | Alta | Marcadores de parágrafo |
| **MySword** | **AndBible** | Baixa | Apenas criar .conf |

---

## 🔢 Conversão de Numeração de Livros (PalmBible+ ↔ MySword)

**Tabela completa com todos os 66 livros + apócrifos:**

```kotlin
object BookNumberConverter {

    // MySword (1-based) → MyBible (PalmBible+ legacy)
    private val mySwordToMyBible = mapOf(
        1 to 10,   2 to 20,   3 to 30,   4 to 40,   5 to 50,
        6 to 60,   7 to 70,   8 to 80,   9 to 90,   10 to 100,
        11 to 110, 12 to 120, 13 to 130, 14 to 140, 15 to 150,
        16 to 160, 17 to 190, 18 to 220, 19 to 230, 20 to 240,
        21 to 250, 22 to 260, 23 to 290, 24 to 300, 25 to 310,
        26 to 330, 27 to 340, 28 to 350, 29 to 360, 30 to 370,
        31 to 380, 32 to 390, 33 to 400, 34 to 410, 35 to 420,
        36 to 430, 37 to 440, 38 to 450, 39 to 460,
        40 to 470, 41 to 480, 42 to 490, 43 to 500, 44 to 510,
        45 to 520, 46 to 530, 47 to 540, 48 to 550, 49 to 560,
        50 to 570, 51 to 580, 52 to 590, 53 to 600, 54 to 610,
        55 to 620, 56 to 630, 57 to 640, 58 to 650,
        59 to 660, 60 to 670, 61 to 680, 62 to 690, 63 to 700,
        64 to 710, 65 to 720, 66 to 730
    )

    private val myBibleToMySword = mySwordToMyBible.entries.associate { it.value to it.key }

    fun mySwordToMyBible(book: Int): Int = mySwordToMyBible[book] ?: book
    fun myBibleToMySword(book: Int): Int = myBibleToMySword[book] ?: (book / 10)  // fallback aproximado

    fun isNewTestament(mySwordBook: Int): Boolean = mySwordBook in 40..66
    fun isOldTestament(mySwordBook: Int): Boolean = mySwordBook in 1..39
}
```

---

## 🏷️ Conversão de Tags: GBF MySword → HTML MyBible

```kotlin
/**
 * Converte texto com GBF tags (MySword) para HTML simples (MyBible).
 * Útil ao exportar conteúdo de MySword para MyBible.
 */
object GbfToMyBibleHtml {

    // ⚠️ Precompilados
    private val FR_OPEN  = Regex("<FR>")
    private val FR_CLOSE = Regex("<Fr>")
    private val FI_OPEN  = Regex("<FI>")
    private val FI_CLOSE = Regex("<Fi>")
    private val FO_OPEN  = Regex("<FO>")
    private val FO_CLOSE = Regex("<Fo>")
    private val FU_OPEN  = Regex("<FU>")
    private val FU_CLOSE = Regex("<Fu>")
    private val TS_OPEN  = Regex("<TS[0-9]?>")
    private val TS_CLOSE = Regex("<Ts[0-9]?>")
    private val CM       = Regex("<CM>")
    private val CI       = Regex("<CI>")
    // Strong's GBF → sem prefixo MyBible (número apenas)
    private val STRONG_H = Regex("<WH(\\d+)>")
    private val STRONG_G = Regex("<WG(\\d+)>")
    private val MORPH    = Regex("<WT(\\S+)>")
    private val RF_OPEN  = Regex("<RF(?:\\s+q=([^>]+))?>")
    private val RF_CLOSE = Regex("<Rf>")
    private val RX       = Regex("<RX(\\d+)\\.(\\d+)\\.(\\d+)(?:-(\\d+))?>")
    // Interlinear (remover — MyBible usa formato diferente)
    private val Q_BLOCK  = Regex("<Q>.*?<q>", RegexOption.DOT_MATCHES_ALL)
    private val PI_PF    = Regex("<[PpIiFf]{2}[0-7]>")

    fun convert(gbfText: String): String = gbfText
        .replace(FR_OPEN, "<J>")
        .replace(FR_CLOSE, "</J>")
        .replace(FI_OPEN, "<i>")
        .replace(FI_CLOSE, "</i>")
        .replace(FO_OPEN, "<t>")
        .replace(FO_CLOSE, "</t>")
        .replace(FU_OPEN, "<e>")
        .replace(FU_CLOSE, "</e>")
        .replace(TS_OPEN, "<br/>")   // título → quebra de linha em MyBible
        .replace(TS_CLOSE, "")
        .replace(CM, "<pb/>")
        .replace(CI, " ")
        .replace(STRONG_H) { mr -> "<S>${mr.groupValues[1]}</S>" }
        .replace(STRONG_G) { mr -> "<S>${mr.groupValues[1]}</S>" }
        .replace(MORPH)    { mr -> "<m>${mr.groupValues[1]}</m>" }
        .replace(RF_OPEN)  { mr -> "<n>" }
        .replace(RF_CLOSE, "</n>")
        .replace(RX)       { mr -> "" }  // cross-refs GBF → remover (MyBible usa tabela separada)
        .replace(PI_PF, "")  // formatação poética → remover
}
```

---

## 🔄 Conversão: HTML MyBible → GBF MySword

```kotlin
/**
 * Converte HTML MyBible (tags <S>, <J>, <i>, etc.) para GBF MySword.
 * Útil ao importar conteúdo MyBible para repositório MySword.
 */
object MyBibleHtmlToGbf {

    // Precompilados
    private val J_OPEN   = Regex("<J>")
    private val J_CLOSE  = Regex("</J>")
    private val I_OPEN   = Regex("<i>")
    private val I_CLOSE  = Regex("</i>")
    private val T_OPEN   = Regex("<t>")
    private val T_CLOSE  = Regex("</t>")
    private val N_OPEN   = Regex("<n>")
    private val N_CLOSE  = Regex("</n>")
    private val PB       = Regex("<pb/>")
    private val BR       = Regex("<br/>")

    // Strong's MyBible → GBF (precisamos saber se é OT ou NT para prefixo)
    private val STRONG_S = Regex("<S>(\\d+)</S>")
    private val MORPH_M  = Regex("<m>([^<]+)</m>")
    private val FOOTNOTE = Regex("<f>([^<]+)</f>")

    fun convert(htmlText: String, isOT: Boolean): String = htmlText
        .replace(J_OPEN, "<FR>").replace(J_CLOSE, "<Fr>")
        .replace(I_OPEN, "<FI>").replace(I_CLOSE, "<Fi>")
        .replace(T_OPEN, "<FO>").replace(T_CLOSE, "<Fo>")
        .replace(N_OPEN, "<RF>").replace(N_CLOSE, "<Rf>")
        .replace(PB, "<CM>")
        .replace(BR, " ")
        .replace(STRONG_S) { mr ->
            val num = mr.groupValues[1]
            if (isOT) "<WH$num>" else "<WG$num>"
        }
        .replace(MORPH_M) { mr -> "<WT${mr.groupValues[1]}>" }
        .replace(FOOTNOTE) { mr -> "<RF q=${mr.groupValues[1]}><Rf>" }
}
```

---

## 📦 Criar Módulo MySword Compatível a Partir de Fontes Externas

### Schema Mínimo para Criar um .bbl.mybible Válido

```kotlin
fun createMySwordBible(
    outputPath: String,
    abbreviation: String,
    title: String,
    language: String,  // ISO 3-letter: "por", "eng"
    hasOT: Boolean,
    hasNT: Boolean,
    hasStrong: Boolean = false,
    verses: List<BibleVerse>   // (book MySword 1-66, chapter, verse, scripture)
) {
    SQLiteDatabase.openOrCreateDatabase(outputPath, null).use { db ->

        // 1. Criar Details
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS Details (
                Title TEXT, Abbreviation TEXT, Language TEXT,
                OT INTEGER DEFAULT 0, NT INTEGER DEFAULT 0,
                Strong INTEGER DEFAULT 0, VersionDate TEXT
            )
        """)
        db.execSQL("""
            INSERT INTO Details (Title, Abbreviation, Language, OT, NT, Strong, VersionDate)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, arrayOf(title, abbreviation, language,
            if (hasOT) 1 else 0, if (hasNT) 1 else 0,
            if (hasStrong) 1 else 0,
            java.time.LocalDate.now().toString()))

        // 2. Criar Bible com índice obrigatório
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS Bible (
                Book INTEGER NOT NULL,
                Chapter INTEGER NOT NULL,
                Verse INTEGER NOT NULL,
                Scripture TEXT NOT NULL
            )
        """)
        db.execSQL("""
            CREATE UNIQUE INDEX IF NOT EXISTS bible_key
            ON Bible (Book ASC, Chapter ASC, Verse ASC)
        """)

        // 3. Inserir versículos em batch
        db.beginTransaction()
        try {
            val stmt = db.compileStatement(
                "INSERT OR REPLACE INTO Bible (Book, Chapter, Verse, Scripture) VALUES (?, ?, ?, ?)"
            )
            verses.forEach { v ->
                stmt.bindLong(1, v.book.toLong())
                stmt.bindLong(2, v.chapter.toLong())
                stmt.bindLong(3, v.verse.toLong())
                stmt.bindString(4, v.scripture)
                stmt.executeInsert()
                stmt.clearBindings()
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }

        // 4. Forçar WAL checkpoint e converter para DELETE mode
        db.execSQL("PRAGMA journal_mode=DELETE")
    }
}

data class BibleVerse(val book: Int, val chapter: Int, val verse: Int, val scripture: String)
```

---

## 📋 Módulo AndBible (.conf) para MySword/MyBible

Para distribuir um módulo MySword via AndBible (And Bible app):

```conf
# MySword Bible (.bbl.mybible)
[KJV-MySword]
DataPath=./modules/texts/MySword/KJV/
AndBibleMinimumVersion=678
ModDrv=MySwordBible
CompressType=ZIP
BlockType=BOOK
Encoding=UTF-8
SourceType=OSIS
Lang=en
LCSH=Bible.English
Description=King James Version (MySword format)
Versification=KJV
```

```conf
# MyBible Bible (.SQLite3)
[NVI-MyBible]
DataPath=./modules/texts/MyBible/NVI/
AndBibleMinimumVersion=640
ModDrv=MyBibleBible
CompressType=ZIP
BlockType=BOOK
Encoding=UTF-8
SourceType=OSIS
Lang=pt
Description=Nova Versão Internacional (MyBible format)
Versification=KJV
```

**Valores de `ModDrv` suportados pelo AndBible:**
- `MySwordBible` — arquivo `module.mybible`
- `MySwordCommentary` — arquivo `module.mybible`
- `MySwordDictionary` — arquivo `module.mybible`
- `MyBibleBible` — arquivo `module.SQLite3`
- `MyBibleCommentary` — arquivo `module.SQLite3`
- `MyBibleDictionary` — arquivo `module.SQLite3`

---

## ✅ Checklist de Verificação Pós-Conversão

```kotlin
fun verifyMySwordBible(filePath: String): List<String> {
    val issues = mutableListOf<String>()
    SQLiteDatabase.openDatabase(filePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->

        // 1. Verificar tabelas obrigatórias
        val tables = db.rawQuery("SELECT name FROM sqlite_master WHERE type='table'", null)
            .use { c -> buildSet { while (c.moveToNext()) add(c.getString(0)) } }
        if ("Bible" !in tables)   issues += "ERRO: Tabela Bible ausente"
        if ("Details" !in tables) issues += "ERRO: Tabela Details ausente"

        // 2. Verificar índice bible_key
        val indexes = db.rawQuery("SELECT name FROM sqlite_master WHERE type='index'", null)
            .use { c -> buildSet { while (c.moveToNext()) add(c.getString(0)) } }
        if ("bible_key" !in indexes) issues += "AVISO: Índice bible_key ausente (performance)"

        // 3. Verificar Details
        if ("Details" in tables) {
            val c = db.rawQuery("SELECT Abbreviation, Language FROM Details LIMIT 1", null)
            c.use {
                if (!it.moveToFirst()) issues += "ERRO: Tabela Details vazia"
                else {
                    if (it.getString(0).isNullOrBlank()) issues += "AVISO: Abbreviation vazio"
                    if (it.getString(0)?.contains(" ") == true) issues += "AVISO: Abbreviation contém espaços (quebra links)"
                    if (it.getString(1).isNullOrBlank()) issues += "AVISO: Language vazio"
                }
            }
        }

        // 4. Verificar versículos
        if ("Bible" in tables) {
            val count = db.rawQuery("SELECT COUNT(*) FROM Bible", null)
                .use { c -> if (c.moveToFirst()) c.getLong(0) else 0L }
            if (count == 0L) issues += "ERRO: Tabela Bible vazia"
            else if (count < 100) issues += "AVISO: Apenas $count versículos (suspeito)"

            // Verificar se há Gênesis 1:1
            val hasGen11 = db.rawQuery("SELECT 1 FROM Bible WHERE Book=1 AND Chapter=1 AND Verse=1", null)
                .use { it.count > 0 }
            if (!hasGen11) issues += "AVISO: Gênesis 1:1 ausente"
        }
    }
    return issues
}
```
