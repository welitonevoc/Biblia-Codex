---
name: mysword-format-parser
description: Pipeline completo de 5 camadas para parsing de texto bíblico em Jetpack Compose AnnotatedString. Cobre DOIS formatos: GBF MySword (FR/FI/FO/FU/TS/WG/WH/WT/RF/RX/CM/PI/PF/Q) e tags HTML MyBible (<S><m><i><J><n><e><t><br/><pb/><f>). Implementação Kotlin completa: VerseRulesProcessor (TAB-separado, precompilado), GbfTagTokenizer (regex precompilado como object), GbfTagParser (máquina de estados completa com interlinear), MyBibleVerseParser (tags MyBible HTML), BibleAnnotatedStringBuilder com pushStringAnnotation para Strong's/notas/xrefs clicáveis, BibleColors tema, LruCache, e BibleTextStripper para FTS. Inclui checklist de validação com 20 itens. Triggers: format parser, GBF, AnnotatedString, VerseRulesProcessor, RedLetter, Strong render, interlinear, parseVerse, parseBibleText, MySwordFormatParser, tokenizer, scripture rendering, MyBible parser, <J> tag, <S> tag.
allowed-tools: Read, Glob, Grep, Bash
---

# MySword + MyBible Format Parser — Pipeline Kotlin Completo

> **Dois formatos:** MySword usa GBF tags; MyBible usa tags HTML simples.  
> **Regra:** Camadas 1–3 são Kotlin puro. Apenas camada 4 toca Compose/Material.

---

## 🏛️ Arquitetura de 5 Camadas

```
Scripture (raw String do SQLite)
    │
    ▼ [1] VerseRulesProcessor
    │     Aplica Details.VerseRules (Regex, sep por \t)
    │     ← Kotlin puro, zero Android
    │
    ▼ [2] Tokenizer (format-specific)
    │     MySword → GbfTagTokenizer
    │     MyBible → HtmlTagTokenizer
    │     ← Kotlin puro, zero Android
    │
    ▼ [3] Parser (format-specific)
    │     MySword → GbfTagParser (máquina de estados)
    │     MyBible → MyBibleTagParser
    │     → List<VerseSegment>
    │     ← Kotlin puro, zero Android
    │
    ▼ [4] BibleAnnotatedStringBuilder
    │     List<VerseSegment> → AnnotatedString
    │     ← Depende de Compose / Material3
    │
    ▼ [5] Compose Text()
```

---

## 📦 Modelos de Dados Compartilhados (Pure Kotlin)

```kotlin
data class ParseOptions(
    val showStrongsNumbers: Boolean     = false,
    val showWordsOfJesusInRed: Boolean  = true,   // <FR> MySword, <J> MyBible
    val showAddedWordsInItalic: Boolean = true,   // <FI> MySword, <i> MyBible
    val showTranslatorsNotes: Boolean   = true,   // <RF> MySword, <n> MyBible
    val showCrossReferences: Boolean    = true,   // <RX> MySword, <f> MyBible
    val showMorphologyCodes: Boolean    = false,
    val showTitles: Boolean             = true,
    val isRightToLeft: Boolean          = false,
    val isInterlinear: Boolean          = false,
    val isMySwordFormat: Boolean        = true    // false = MyBible HTML tags
)

sealed class VerseSegment {
    data class PlainText(val text: String) : VerseSegment()
    data class ItalicText(val text: String) : VerseSegment()
    data class RedLetterText(val text: String) : VerseSegment()     // <FR>/<J>
    data class OTQuoteText(val text: String) : VerseSegment()       // <FO>/<t>
    data class UnderlineText(val text: String) : VerseSegment()     // <FU>
    data class EmphasisText(val text: String) : VerseSegment()      // <e> MyBible
    data class HeadingText(val text: String, val level: Int = 1) : VerseSegment()
    object ParagraphBreak : VerseSegment()                          // <CM>/<pb/>
    object LineBreak : VerseSegment()                               // <br/> MyBible
    data class PoetryLine(val pi: Int, val pf: Int) : VerseSegment()
    data class StrongsHebrew(val number: Int) : VerseSegment()
    data class StrongsGreek(val number: Int) : VerseSegment()
    data class MorphologyCode(val code: String) : VerseSegment()
    data class TranslatorsNote(
        val noteText: String, val linkLabel: String? = null
    ) : VerseSegment()
    data class CrossReference(
        val book: Int, val chapter: Int,
        val fromVerse: Int, val toVerse: Int? = null
    ) : VerseSegment()
    data class FootnoteMarker(val marker: String) : VerseSegment()  // <f> MyBible
    data class InterlinearBlock(
        val originalText: String,
        val transliteration: String?,
        val translation: String?,
        val strongsNumber: Int?,
        val isHebrew: Boolean
    ) : VerseSegment()
}

data class ParsedVerse(
    val verseNumber: Int,
    val segments: List<VerseSegment>,
    val isChapterHeader: Boolean = false   // Verse=0 do MySword
)
```

---

## ⚙️ Camada 1: VerseRulesProcessor

```kotlin
/**
 * CRÍTICO: separador entre RegEx e Replacement é TAB (\t), NUNCA espaço!
 * Precompilar TODAS as regras na criação — nunca dentro de process()
 */
class VerseRulesProcessor(verseRulesText: String?) {

    val rules: List<Pair<Regex, String>> = verseRulesText
        ?.lines()?.filter { it.isNotBlank() }
        ?.mapNotNull { line ->
            val parts = line.split("\t")  // ← TAB obrigatório, não espaço
            if (parts.size >= 2)
                try { Regex(parts[0]) to parts[1] }
                catch (e: PatternSyntaxException) { null }
            else null
        } ?: emptyList()

    fun process(scripture: String): String =
        rules.fold(scripture) { acc, (rx, rep) -> acc.replace(rx, rep) }

    companion object { val EMPTY = VerseRulesProcessor(null) }
}
```

---

## 🔍 Camada 2a: GbfTagTokenizer (MySword)

```kotlin
sealed class GbfToken {
    data class Text(val content: String) : GbfToken()
    data class Tag(
        val rawName: String, val upperName: String,
        val isClosing: Boolean, val attributes: String
    ) : GbfToken()
}

object GbfTagTokenizer {
    // ⚠️ PRECOMPILADO como object — nunca recriar dentro de tokenize()
    private val TAG_REGEX = Regex("<(/?)([A-Za-z][A-Za-z0-9]*)([^>]*)>")

    fun tokenize(scripture: String): List<GbfToken> {
        val tokens = mutableListOf<GbfToken>(); var lastEnd = 0
        for (match in TAG_REGEX.findAll(scripture)) {
            if (match.range.first > lastEnd) {
                val t = scripture.substring(lastEnd, match.range.first)
                if (t.isNotEmpty()) tokens += GbfToken.Text(t)
            }
            tokens += GbfToken.Tag(
                rawName = match.groupValues[2],
                upperName = match.groupValues[2].uppercase(),
                isClosing = match.groupValues[1] == "/",
                attributes = match.groupValues[3].trim()
            )
            lastEnd = match.range.last + 1
        }
        if (lastEnd < scripture.length)
            scripture.substring(lastEnd).takeIf { it.isNotEmpty() }
                ?.let { tokens += GbfToken.Text(it) }
        return tokens
    }
}
```

---

## 🏗️ Camada 3a: GbfTagParser — Máquina de Estados Completa (MySword)

```kotlin
object GbfTagParser {
    // ⚠️ TODOS precompilados — nunca dentro de parse()
    private val STRONG_H   = Regex("WH(\\d+)")
    private val STRONG_G   = Regex("WG(\\d+)")
    private val MORPH      = Regex("WT(\\S+)")
    private val CROSS_REF  = Regex("RX(\\d+)\\.(\\d+)\\.(\\d+)(?:-(\\d+))?")
    private val NOTE_LINK  = Regex("q=([^\\s>]+)")
    private val PI         = Regex("PI([0-7])")
    private val PF         = Regex("PF([0-7])")
    private val TS_LEVEL   = Regex("TS([0-9]?)")

    fun parse(tokens: List<GbfToken>, opts: ParseOptions): List<VerseSegment> {
        val out = mutableListOf<VerseSegment>()
        var red = false; var italic = false; var ot = false; var ul = false
        var title = false; var titleLvl = 1
        var note = false; val noteText = StringBuilder(); var noteLbl: String? = null
        var pi = 0; var pf = 0
        // Interlinear state
        var inQ = false
        val iOrig = StringBuilder(); val iTrans = StringBuilder()
        val iXlit = StringBuilder()
        var iStrong: Int? = null; var iHebrew = false
        var inH = false; var inG = false; var inE = false; var inX = false

        for (t in tokens) when (t) {
            is GbfToken.Text -> {
                val s = t.content
                when {
                    note           -> noteText.append(s)
                    inQ && inH     -> iOrig.append(s)
                    inQ && inG     -> iOrig.append(s)
                    inQ && inX     -> iXlit.append(s)
                    inQ && inE     -> iTrans.append(s)
                    title && opts.showTitles -> out += VerseSegment.HeadingText(s, titleLvl)
                    red && opts.showWordsOfJesusInRed -> out += VerseSegment.RedLetterText(s)
                    italic && opts.showAddedWordsInItalic -> out += VerseSegment.ItalicText(s)
                    ot             -> out += VerseSegment.OTQuoteText(s)
                    ul             -> out += VerseSegment.UnderlineText(s)
                    else           -> out += VerseSegment.PlainText(s)
                }
            }
            is GbfToken.Tag -> {
                val n = t.upperName; val c = t.isClosing
                when {
                    n == "FR"             -> red    = !c
                    n == "FI"             -> italic = !c
                    n == "FO"             -> ot     = !c
                    n == "FU"             -> ul     = !c
                    TS_LEVEL.matches(n) && !c -> { title = true; titleLvl = TS_LEVEL.find(n)!!.groupValues[1].toIntOrNull() ?: 1 }
                    TS_LEVEL.matches(n) && c  -> title = false
                    n == "CM"             -> out += VerseSegment.ParagraphBreak
                    n == "CI"             -> out += VerseSegment.PlainText(" ")
                    PI.matches(n)         -> pi = PI.find(n)!!.groupValues[1].toIntOrNull() ?: 0
                    PF.matches(n)         -> { pf = PF.find(n)!!.groupValues[1].toIntOrNull() ?: 0; out += VerseSegment.PoetryLine(pi, pf) }
                    STRONG_H.matches(n) && opts.showStrongsNumbers ->
                        out += VerseSegment.StrongsHebrew(STRONG_H.find(n)!!.groupValues[1].toIntOrNull() ?: 0)
                    STRONG_G.matches(n) && opts.showStrongsNumbers ->
                        out += VerseSegment.StrongsGreek(STRONG_G.find(n)!!.groupValues[1].toIntOrNull() ?: 0)
                    MORPH.matches(n) && opts.showMorphologyCodes ->
                        out += VerseSegment.MorphologyCode(MORPH.find(n)!!.groupValues[1])
                    n == "RF" && !c && opts.showTranslatorsNotes -> {
                        note = true; noteText.clear()
                        noteLbl = NOTE_LINK.find(t.attributes)?.groupValues?.get(1)
                    }
                    n == "RF" && c -> if (note) {
                        out += VerseSegment.TranslatorsNote(noteText.toString(), noteLbl)
                        note = false; noteText.clear(); noteLbl = null
                    }
                    CROSS_REF.matches(n) && opts.showCrossReferences -> {
                        val m = CROSS_REF.find(n)!!
                        out += VerseSegment.CrossReference(m.groupValues[1].toInt(), m.groupValues[2].toInt(), m.groupValues[3].toInt(), m.groupValues[4].toIntOrNull())
                    }
                    // Interlinear
                    n == "Q" && !c && opts.isInterlinear -> {
                        inQ = true; iOrig.clear(); iTrans.clear(); iXlit.clear()
                        iStrong = null; iHebrew = false; inH = false; inG = false; inE = false; inX = false
                    }
                    n == "Q" && c && inQ -> {
                        out += VerseSegment.InterlinearBlock(iOrig.toString(), iXlit.toString().ifBlank { null }, iTrans.toString().ifBlank { null }, iStrong, iHebrew)
                        inQ = false
                    }
                    n == "H" -> { if (!c) { iHebrew = true; inH = true } else inH = false }
                    n == "G" -> { if (!c) { iHebrew = false; inG = true } else inG = false }
                    n == "X" -> { if (!c) inX = true else inX = false }
                    n == "E" || n == "T" -> { if (!c) inE = true else inE = false }
                    inQ && STRONG_H.matches(n) -> { iStrong = STRONG_H.find(n)!!.groupValues[1].toIntOrNull(); iHebrew = true }
                    inQ && STRONG_G.matches(n) -> { iStrong = STRONG_G.find(n)!!.groupValues[1].toIntOrNull(); iHebrew = false }
                }
            }
        }
        return out
    }
}
```

---

## 🏗️ Camada 3b: MyBibleTagParser (tags HTML simples)

```kotlin
/**
 * Parser para o formato MyBible. Tags: <S>, <m>, <i>, <J>, <n>, <e>, <t>, <br/>, <pb/>, <f>
 * Diferente do GBF: Strong's sem prefixo (livro determina H ou G)
 */
object MyBibleTagParser {
    // Precompilados
    private val TAG_REGEX = Regex("<(/?)(S|m|i|J|n|e|t|br|pb|f)([^>]*)/?\\s*>", RegexOption.IGNORE_CASE)
    private val STRONG_NUM = Regex("(\\d+)")

    /**
     * @param isNewTestament true → Strong's são Gregos (G); false → Hebreus (H)
     */
    fun parse(text: String, opts: ParseOptions, isNewTestament: Boolean): List<VerseSegment> {
        val out = mutableListOf<VerseSegment>()
        var lastEnd = 0
        var inJ = false; var inI = false; var inT = false; var inE = false
        var inN = false; val noteText = StringBuilder()

        fun flushText(raw: String) {
            if (raw.isEmpty()) return
            out += when {
                inJ && opts.showWordsOfJesusInRed  -> VerseSegment.RedLetterText(raw)
                inI && opts.showAddedWordsInItalic -> VerseSegment.ItalicText(raw)
                inT  -> VerseSegment.OTQuoteText(raw)
                inE  -> VerseSegment.EmphasisText(raw)
                inN  -> { noteText.append(raw); null } ?: return
                else -> VerseSegment.PlainText(raw)
            }
        }

        for (match in TAG_REGEX.findAll(text)) {
            flushText(text.substring(lastEnd, match.range.first))
            val tag = match.groupValues[2].lowercase()
            val closing = match.groupValues[1] == "/"
            val selfClose = match.value.endsWith("/>") || tag == "br" || tag == "pb"
            val content = match.groupValues[3].trim()

            when (tag) {
                "j"  -> if (closing) inJ = false else inJ = true
                "i"  -> if (closing) inI = false else inI = true
                "t"  -> if (closing) inT = false else inT = true
                "e"  -> if (closing) inE = false else inE = true
                "n"  -> {
                    if (closing && inN) {
                        if (opts.showTranslatorsNotes)
                            out += VerseSegment.TranslatorsNote(noteText.toString())
                        inN = false; noteText.clear()
                    } else inN = true
                }
                "s"  -> {
                    // Strong's sem prefixo — livro determina H ou G
                    val num = STRONG_NUM.find(content)?.groupValues?.get(1)?.toIntOrNull() ?: 0
                    if (opts.showStrongsNumbers) {
                        out += if (isNewTestament) VerseSegment.StrongsGreek(num)
                               else VerseSegment.StrongsHebrew(num)
                    }
                }
                "m"  -> if (opts.showMorphologyCodes && content.isNotBlank())
                             out += VerseSegment.MorphologyCode(content)
                "br" -> out += VerseSegment.LineBreak
                "pb" -> out += VerseSegment.ParagraphBreak
                "f"  -> {
                    if (!closing && opts.showCrossReferences)
                        out += VerseSegment.FootnoteMarker(content)
                }
            }
            lastEnd = match.range.last + 1
        }
        flushText(text.substring(lastEnd))
        return out
    }
}
```

---

## 🎨 Camada 4: BibleAnnotatedStringBuilder (Compose)

```kotlin
data class BibleColors(
    val verseNumber: Color,
    val wordsOfJesus: Color   = Color.Red,
    val otQuote: Color,
    val emphasis: Color,
    val strongsNumber: Color,
    val noteLink: Color,
    val crossRefLink: Color
)

object BibleAnnotatedStringBuilder {
    fun build(verses: List<ParsedVerse>, colors: BibleColors): AnnotatedString =
        buildAnnotatedString {
            verses.forEach { v ->
                if (v.isChapterHeader) {
                    v.segments.filterIsInstance<VerseSegment.HeadingText>().forEach {
                        append("\n")
                        withStyle(SpanStyle(fontWeight = FontWeight.Bold, fontSize = 18.sp)) { append(it.text) }
                        append("\n")
                    }
                    return@forEach
                }
                // Número do versículo
                withStyle(SpanStyle(color = colors.verseNumber, fontSize = 10.sp,
                    baselineShift = BaselineShift.Superscript, fontWeight = FontWeight.Bold)) {
                    append("${v.verseNumber} ")
                }
                v.segments.forEach { seg ->
                    when (seg) {
                        is VerseSegment.PlainText     -> append(seg.text)
                        is VerseSegment.ItalicText    -> withStyle(SpanStyle(fontStyle = FontStyle.Italic)) { append(seg.text) }
                        is VerseSegment.RedLetterText -> withStyle(SpanStyle(color = colors.wordsOfJesus)) { append(seg.text) }
                        is VerseSegment.OTQuoteText   -> withStyle(SpanStyle(color = colors.otQuote)) { append(seg.text) }
                        is VerseSegment.UnderlineText -> withStyle(SpanStyle(textDecoration = TextDecoration.Underline)) { append(seg.text) }
                        is VerseSegment.EmphasisText  -> withStyle(SpanStyle(color = colors.emphasis)) { append(seg.text) }
                        is VerseSegment.HeadingText   -> {
                            append("\n")
                            withStyle(SpanStyle(fontWeight = FontWeight.Bold,
                                fontSize = when (seg.level) { 1 -> 18.sp; 2 -> 16.sp; else -> 14.sp })) { append(seg.text) }
                            append("\n")
                        }
                        is VerseSegment.ParagraphBreak -> append("\n\n")
                        is VerseSegment.LineBreak      -> append("\n")
                        is VerseSegment.PoetryLine     -> append("\n")
                        is VerseSegment.StrongsHebrew  -> {
                            pushStringAnnotation("STRONG_H", seg.number.toString())
                            withStyle(SpanStyle(color = colors.strongsNumber, fontSize = 9.sp, baselineShift = BaselineShift.Superscript)) {
                                append("H${seg.number}")
                            }
                            pop()
                        }
                        is VerseSegment.StrongsGreek   -> {
                            pushStringAnnotation("STRONG_G", seg.number.toString())
                            withStyle(SpanStyle(color = colors.strongsNumber, fontSize = 9.sp, baselineShift = BaselineShift.Superscript)) {
                                append("G${seg.number}")
                            }
                            pop()
                        }
                        is VerseSegment.TranslatorsNote -> {
                            pushStringAnnotation("NOTE", seg.noteText)
                            withStyle(SpanStyle(color = colors.noteLink, fontSize = 9.sp)) { append("[${seg.linkLabel ?: "†"}]") }
                            pop()
                        }
                        is VerseSegment.CrossReference -> {
                            pushStringAnnotation("CROSS_REF", "${seg.book}.${seg.chapter}.${seg.fromVerse}")
                            withStyle(SpanStyle(color = colors.crossRefLink, fontSize = 9.sp)) { append("✝") }
                            pop()
                        }
                        is VerseSegment.FootnoteMarker -> {
                            pushStringAnnotation("FOOTNOTE", seg.marker)
                            withStyle(SpanStyle(color = colors.crossRefLink, fontSize = 9.sp)) { append("[${seg.marker}]") }
                            pop()
                        }
                        is VerseSegment.InterlinearBlock -> {
                            if (seg.originalText.isNotBlank()) {
                                withStyle(SpanStyle(fontSize = 12.sp)) { append(seg.originalText) }
                                seg.translation?.let { append(" ($it) ") }
                            }
                        }
                        else -> { /* MorphologyCode: ignorar se showMorphologyCodes=false */ }
                    }
                }
                append(" ")
            }
        }
}
```

---

## 🔋 Cache e Performance

```kotlin
class BibleRenderPipeline(
    private val rules: VerseRulesProcessor,
    private val opts: ParseOptions
) {
    // ~12.5% da heap para cache de capítulos
    private val cache = LruCache<String, List<ParsedVerse>>(
        maxSize = (Runtime.getRuntime().maxMemory() / 1024 / 8).toInt()
    )

    fun getOrParse(
        key: String,
        rawVerses: List<Pair<Int, String>>,
        isNewTestament: Boolean = true   // para MyBible: determina H vs G em <S>
    ): List<ParsedVerse> = cache.get(key) ?: run {
        val parsed = rawVerses.map { (n, scripture) ->
            val processed = rules.process(scripture)
            val segments = if (opts.isMySwordFormat) {
                val tokens = GbfTagTokenizer.tokenize(processed)
                GbfTagParser.parse(tokens, opts)
            } else {
                MyBibleTagParser.parse(processed, opts, isNewTestament)
            }
            ParsedVerse(verseNumber = n, segments = segments, isChapterHeader = n == 0)
        }
        cache.put(key, parsed)
        parsed
    }

    fun invalidate(key: String) = cache.remove(key)
}

// Strip para FTS — sem criar AnnotatedString
object BibleTextStripper {
    private val ALL_TAGS    = Regex("<[^>]+>")
    private val MULTI_SPACE = Regex("\\s+")

    fun strip(scripture: String): String =
        scripture.replace(ALL_TAGS, " ").replace(MULTI_SPACE, " ").trim()
}
```

---

## ✅ Checklist de Validação (20 itens)

**MySword GBF:**
- [ ] `<FR>...<Fr>` → **VERMELHO** obrigatório
- [ ] `<FI>...<Fi>` → itálico
- [ ] `<FO>...<Fo>` → estilo distinto de texto comum
- [ ] `<FU>...<Fu>` → sublinhado
- [ ] `<TS>...<Ts>`, `<TS1>...<Ts1>` → heading com tamanho maior
- [ ] `<WG>`, `<WH>` → `pushStringAnnotation` clicável
- [ ] `<RF>` e `<RF q=a>` → nota com label customizado
- [ ] `<RX43.3.16>` e `<RX43.3.16-18>` → cross-ref clicável
- [ ] `<CM>` → ParagraphBreak (não texto)
- [ ] Verse=0 → `isChapterHeader=true`
- [ ] VerseRules aplicado **antes** do tokenizer

**MyBible HTML:**
- [ ] `<J>...<J>` → vermelho (palavras de Jesus)
- [ ] `<i>...<i>` → itálico (palavras adicionadas)
- [ ] `<S>N</S>` → Strong's sem prefixo; livro ≤39 = Hebraico, ≥40 = Grego
- [ ] `<n>...<n>` → nota clicável
- [ ] `<pb/>` → ParagraphBreak
- [ ] `<br/>` → LineBreak
- [ ] `<f>marker</f>` → FootnoteMarker clicável

**Ambos:**
- [ ] Regex do tokenizer compilado como `object` (nunca inline)
- [ ] Cache invalidado ao trocar de módulo/tradução
