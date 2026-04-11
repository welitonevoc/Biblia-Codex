---
name: mysword-module-manager
description: Especialista em gerenciamento completo de módulos para o app Bíblia Android. Scanner assíncrono com Flow de progresso, detecção de tipo por extensão E por conteúdo de tabelas SQLite, suporte a todos os formatos (MySword, MyBible .SQLite3 com todos os 7 subtipos, e-Sword v9 .bblx/.cmtx/.dctx e v11 .bbli/.cmti/.dcti, TheWord .ont/.ot/.nt, USFM .zip), Room entity universal ModuleEntity com ModuleFormat enum, ModuleDao completo com 15+ queries, scan incremental (só novos/modificados), WorkManager para limpeza periódica, extração de metadata do MySword Details + MyBible INFO key-value, os 66 livros canônicos PT-BR com números, abreviações e capítulos. Triggers: module scanner, module manager, module install, bible scanner, installed modules, module entity, module dao, module list, scan modules, module type detection, ModuleFormat enum.
allowed-tools: Read, Glob, Grep, Bash
---

# MySword Module Manager — Gerenciamento Completo de Módulos

> **Formatos suportados:** MySword (.bbl.mybible etc.), MyBible (.SQLite3 com 7 subtipos), e-Sword v9/v11, TheWord (.ont/.ot/.nt), USFM (.zip)

---

## 📁 Diretórios Padrão de Scan

```kotlin
object MySwordDirectories {
    fun getDefaultScanDirs(context: Context): List<File> = buildList {
        // Raiz padrão MySword
        File(Environment.getExternalStorageDirectory(), "mysword").also { root ->
            if (root.exists()) {
                listOf("bibles", "commentaries", "dictionaries", "books", "journals", "journalsbig")
                    .map { File(root, it) }.filter { it.exists() }.forEach { add(it) }
            }
        }
        // Storage externo do app
        context.getExternalFilesDir(null)?.let { add(it) }
        context.getExternalFilesDirs(null).forEach { add(it) }
        // Downloads (usuários baixam pelo browser)
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)?.let { add(it) }
        // Interoperabilidade com MyBible
        File(Environment.getExternalStorageDirectory(), "MyBible").takeIf { it.exists() }?.let { add(it) }
        context.getExternalFilesDir(null)?.parentFile?.parentFile
            ?.let { File(it, "ua.mybible/files/MyBible") }
            ?.takeIf { it.exists() }?.let { add(it) }
    }.filter { it.exists() && it.isDirectory }
}
```

---

## 🔍 Detecção de Tipo

```kotlin
enum class ModuleType { BIBLE, COMMENTARY, DICTIONARY, BOOK, JOURNAL, UNKNOWN }

enum class ModuleFormat {
    MYSWORD,            // .bbl.mybible, .cmt.mybible, .dct.mybible, .bok.mybible, .jor.mybible
    MYBIBLE_BIBLE,      // .SQLite3 (sem sufixo)
    MYBIBLE_COMMENTARY, // .commentaries.SQLite3
    MYBIBLE_DICTIONARY, // .dictionary.SQLite3
    MYBIBLE_SUBHEADINGS,// .subheadings.SQLite3
    MYBIBLE_CROSSREFS,  // .crossreferences.SQLite3
    MYBIBLE_PLAN,       // .plan.SQLite3
    MYBIBLE_DEVOTIONS,  // .devotions.SQLite3
    ESWORD_LEGACY,      // .bblx, .cmtx, .dctx, .topx, .devx
    ESWORD_MODERN,      // .bbli, .cmti, .dcti, .refi, .devi
    THEWORD,            // .ont, .ot, .nt
    USFM,               // .zip com "usfm" no nome
    UNKNOWN
}

object ModuleDetector {
    fun detect(file: File): Pair<ModuleType, ModuleFormat>? {
        val lower = file.name.lowercase()
        return when {
            // MySword nativo — por extensão composta
            lower.endsWith(".bbl.mybible")     -> ModuleType.BIBLE       to ModuleFormat.MYSWORD
            lower.endsWith(".cmt.mybible")     -> ModuleType.COMMENTARY  to ModuleFormat.MYSWORD
            lower.endsWith(".dct.mybible")     -> ModuleType.DICTIONARY  to ModuleFormat.MYSWORD
            lower.endsWith(".bok.mybible")     -> ModuleType.BOOK        to ModuleFormat.MYSWORD
            lower.endsWith(".jor.mybible")     -> ModuleType.JOURNAL     to ModuleFormat.MYSWORD
            lower.endsWith(".mybible")         -> detectMyswordGeneric(file)

            // MyBible — sufixo antes de .sqlite3 (com 'S' maiúsculo na extensão real)
            // Detecção case-insensitive aqui para robustez
            lower.endsWith(".commentaries.sqlite3")  -> ModuleType.COMMENTARY  to ModuleFormat.MYBIBLE_COMMENTARY
            lower.endsWith(".dictionary.sqlite3")     -> ModuleType.DICTIONARY  to ModuleFormat.MYBIBLE_DICTIONARY
            lower.endsWith(".subheadings.sqlite3")    -> ModuleType.BIBLE       to ModuleFormat.MYBIBLE_SUBHEADINGS
            lower.endsWith(".crossreferences.sqlite3")-> ModuleType.BIBLE       to ModuleFormat.MYBIBLE_CROSSREFS
            lower.endsWith(".plan.sqlite3")           -> ModuleType.BOOK        to ModuleFormat.MYBIBLE_PLAN
            lower.endsWith(".devotions.sqlite3")      -> ModuleType.JOURNAL     to ModuleFormat.MYBIBLE_DEVOTIONS
            lower.endsWith(".sqlite3") && !lower.contains(".markup.") ->
                detectMyBibleBible(file)

            // e-Sword
            lower.endsWith(".bblx") || lower.endsWith(".bbli") -> ModuleType.BIBLE       to if (lower.endsWith("x")) ModuleFormat.ESWORD_LEGACY else ModuleFormat.ESWORD_MODERN
            lower.endsWith(".cmtx") || lower.endsWith(".cmti") -> ModuleType.COMMENTARY  to if (lower.endsWith("x")) ModuleFormat.ESWORD_LEGACY else ModuleFormat.ESWORD_MODERN
            lower.endsWith(".dctx") || lower.endsWith(".dcti") -> ModuleType.DICTIONARY  to if (lower.endsWith("x")) ModuleFormat.ESWORD_LEGACY else ModuleFormat.ESWORD_MODERN

            // The Word
            lower.endsWith(".ont") -> ModuleType.BIBLE to ModuleFormat.THEWORD
            lower.endsWith(".ot")  -> ModuleType.BIBLE to ModuleFormat.THEWORD
            lower.endsWith(".nt")  -> ModuleType.BIBLE to ModuleFormat.THEWORD

            // USFM zip
            lower.endsWith(".zip") && lower.contains("usfm") -> ModuleType.BIBLE to ModuleFormat.USFM

            else -> null
        }
    }

    private fun detectMyswordGeneric(file: File): Pair<ModuleType, ModuleFormat>? =
        detectByTables(file)?.let { it to ModuleFormat.MYSWORD }

    private fun detectMyBibleBible(file: File): Pair<ModuleType, ModuleFormat>? {
        // Verificar se é um Bible válido ou outro tipo pelo conteúdo
        val type = detectByTables(file) ?: return ModuleType.BIBLE to ModuleFormat.MYBIBLE_BIBLE
        return type to when (type) {
            ModuleType.COMMENTARY  -> ModuleFormat.MYBIBLE_COMMENTARY
            ModuleType.DICTIONARY  -> ModuleFormat.MYBIBLE_DICTIONARY
            else                   -> ModuleFormat.MYBIBLE_BIBLE
        }
    }

    fun detectByTables(file: File): ModuleType? = runCatching {
        SQLiteDatabase.openDatabase(file.absolutePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            val tables = db.rawQuery(
                "SELECT name FROM sqlite_master WHERE type='table'", null
            ).use { c -> buildSet { while (c.moveToNext()) add(c.getString(0).uppercase()) } }
            when {
                "BIBLE"      in tables -> ModuleType.BIBLE
                "VERSES"     in tables -> ModuleType.BIBLE       // MyBible
                "COMMENTARY" in tables -> ModuleType.COMMENTARY
                "COMMENTARIES" in tables -> ModuleType.COMMENTARY  // MyBible
                "DICTIONARY" in tables -> ModuleType.DICTIONARY
                "BOOKS"      in tables -> ModuleType.BOOK
                "JOURNAL"    in tables -> ModuleType.JOURNAL
                else -> null
            }
        }
    }.getOrNull()
}
```

---

## 🗄️ Room Entity Universal

```kotlin
@Entity(
    tableName = "modules",
    indices = [
        Index(value = ["type"]),
        Index(value = ["format"]),
        Index(value = ["language"]),
        Index(value = ["isEnabled"]),
        Index(value = ["abbreviation"], unique = true)
    ]
)
data class ModuleEntity(
    @PrimaryKey val filePath: String,
    val fileName: String,
    val type: ModuleType,
    val format: ModuleFormat,
    val abbreviation: String,   // ⚠️ Para MyBible: extraído do nome do arquivo
    val title: String,
    val description: String? = null,
    val language: String = "und",    // ISO 3-letter para MySword, 2-letter para MyBible
    val isRightToLeft: Boolean = false,
    val hasOT: Boolean = false,
    val hasNT: Boolean = false,
    val hasStrong: Boolean = false,
    val isInterlinear: Boolean = false,
    val versionDate: String? = null, // YYYY-MM-DD
    val customCss: String? = null,
    val verseRules: String? = null,  // ⚠️ Só MySword — MyBible não tem VerseRules
    val isEnabled: Boolean = true,
    val displayOrder: Int = 0,
    val fileSize: Long = 0L,
    val lastModified: Long = 0L,
    val installedAt: Long = System.currentTimeMillis()
)
```

---

## 🗄️ ModuleDao

```kotlin
@Dao interface ModuleDao {
    @Query("SELECT * FROM modules WHERE isEnabled=1 ORDER BY displayOrder, title")
    fun observeEnabled(): Flow<List<ModuleEntity>>

    @Query("SELECT * FROM modules WHERE type=:type AND isEnabled=1 ORDER BY displayOrder, title")
    fun observeByType(type: ModuleType): Flow<List<ModuleEntity>>

    @Query("SELECT * FROM modules WHERE type='BIBLE' AND isEnabled=1 ORDER BY displayOrder")
    fun observeEnabledBibles(): Flow<List<ModuleEntity>>

    @Query("SELECT * FROM modules WHERE filePath=:path LIMIT 1")
    suspend fun getByPath(path: String): ModuleEntity?

    @Query("SELECT * FROM modules WHERE abbreviation=:abbr LIMIT 1")
    suspend fun getByAbbreviation(abbr: String): ModuleEntity?

    @Query("SELECT * FROM modules WHERE type='DICTIONARY' AND hasStrong=1 AND language LIKE :langPfx||'%' AND isEnabled=1 LIMIT 1")
    suspend fun findStrongsDictionary(langPfx: String): ModuleEntity?

    @Query("SELECT * FROM modules WHERE abbreviation=:abbr AND versionDate<:newDate LIMIT 1")
    suspend fun findOutdated(abbr: String, newDate: String): ModuleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun upsert(m: ModuleEntity)
    @Delete suspend fun delete(m: ModuleEntity)
    @Query("DELETE FROM modules WHERE filePath=:path") suspend fun deleteByPath(path: String)
    @Query("SELECT filePath FROM modules") suspend fun getAllFilePaths(): List<String>
    @Query("UPDATE modules SET isEnabled=:e WHERE filePath=:p") suspend fun setEnabled(p: String, e: Boolean)
    @Query("UPDATE modules SET displayOrder=:o WHERE filePath=:p") suspend fun setOrder(p: String, o: Int)
    @Query("SELECT COUNT(*) FROM modules WHERE type=:type AND isEnabled=1") suspend fun countByType(type: ModuleType): Int
    @Query("SELECT SUM(fileSize) FROM modules") suspend fun totalStorageUsed(): Long?
}
```

---

## 🔄 Scanner Assíncrono

```kotlin
class ModuleScanner(private val context: Context, private val dao: ModuleDao) {

    sealed class ScanProgress {
        object Discovering : ScanProgress()
        data class Found(val count: Int) : ScanProgress()
        data class Progress(val current: Int, val total: Int, val name: String) : ScanProgress()
        data class FileError(val fileName: String, val error: String) : ScanProgress()
        data class Complete(val processed: Int, val newModules: Int) : ScanProgress()
    }

    fun scanFlow(dirs: List<File> = MySwordDirectories.getDefaultScanDirs(context)):
        Flow<ScanProgress> = flow {
        emit(ScanProgress.Discovering)
        val files = dirs.flatMap { it.walkTopDown()
            .filter { f -> f.isFile && ModuleDetector.detect(f) != null }.toList() }
        emit(ScanProgress.Found(files.size))

        val existing = dao.getAllFilePaths().toSet()
        var processed = 0; var newCount = 0

        files.forEach { file ->
            runCatching {
                val entity = extractEntity(file)
                if (entity != null) {
                    if (file.absolutePath !in existing) newCount++
                    dao.upsert(entity)
                }
            }.onFailure { emit(ScanProgress.FileError(file.name, it.message ?: "Error")) }
            emit(ScanProgress.Progress(++processed, files.size,
                file.nameWithoutExtension.take(30)))
        }

        // Remover entradas de arquivos deletados
        existing.filter { !File(it).exists() }.forEach { dao.deleteByPath(it) }
        emit(ScanProgress.Complete(processed, newCount))
    }.flowOn(Dispatchers.IO)

    fun extractEntity(file: File): ModuleEntity? {
        val (type, format) = ModuleDetector.detect(file) ?: return null
        return runCatching {
            SQLiteDatabase.openDatabase(file.absolutePath, null,
                SQLiteDatabase.OPEN_READONLY or SQLiteDatabase.NO_LOCALIZED_COLLATORS).use { db ->
                when {
                    format == ModuleFormat.MYSWORD            -> readMySwordDetails(db, file, type, format)
                    format.name.startsWith("MYBIBLE")         -> readMyBibleInfo(db, file, type, format)
                    format == ModuleFormat.ESWORD_LEGACY ||
                    format == ModuleFormat.ESWORD_MODERN      -> readESwordDetails(db, file, type, format)
                    else -> buildFallbackEntity(file, type, format)
                }
            }
        }.getOrNull()
    }

    private fun readMySwordDetails(db: SQLiteDatabase, file: File, type: ModuleType, fmt: ModuleFormat): ModuleEntity? {
        if (!tableExists(db, "Details")) return null
        val c = db.rawQuery("SELECT Abbreviation,Title,Language,OT,NT,Strong,RightToLeft,Interlinear,VersionDate,CustomCSS,VerseRules FROM Details LIMIT 1", null)
        return c.use {
            if (!it.moveToFirst()) return null
            ModuleEntity(filePath=file.absolutePath, fileName=file.name, type=type, format=fmt,
                abbreviation = it.getString(0) ?: file.nameWithoutExtension,
                title        = it.getString(1) ?: file.nameWithoutExtension,
                language     = it.getString(2) ?: "und",
                hasOT        = it.getInt(3) == 1, hasNT = it.getInt(4) == 1,
                hasStrong    = it.getInt(5) == 1, isRightToLeft = it.getInt(6) == 1,
                isInterlinear = it.getInt(7) == 1, versionDate = it.getString(8),
                customCss = it.getString(9), verseRules = it.getString(10),
                fileSize = file.length(), lastModified = file.lastModified())
        }
    }

    private fun readMyBibleInfo(db: SQLiteDatabase, file: File, type: ModuleType, fmt: ModuleFormat): ModuleEntity? {
        val tableName = listOf("info", "INFO").firstOrNull { tableExists(db, it) } ?: return null
        val info = db.rawQuery("SELECT name, value FROM $tableName", null)
            .use { c -> buildMap { while (c.moveToNext()) put(c.getString(0), c.getString(1) ?: "") } }
        // MyBible: abreviação = nome do arquivo, sem extensões de sufixo
        val abbr = file.name
            .removeSuffix(".SQLite3").removeSuffix(".sqlite3")
            .removeSuffix(".commentaries").removeSuffix(".dictionary")
            .removeSuffix(".subheadings").removeSuffix(".crossreferences")
            .removeSuffix(".plan").removeSuffix(".devotions")
        val lang2 = info["language"] ?: "und"
        // Converter 2-letter → 3-letter para normalização interna
        val lang3 = mapOf("en" to "eng", "pt" to "por", "ru" to "rus",
            "de" to "deu", "es" to "spa", "fr" to "fra",
            "el" to "grk", "iw" to "heb", "he" to "heb")[lang2] ?: lang2
        return ModuleEntity(filePath=file.absolutePath, fileName=file.name, type=type, format=fmt,
            abbreviation = abbr, title = info["description"] ?: abbr,
            language = lang3, hasOT = true, hasNT = true,
            hasStrong = info["strong_numbers"] == "true",
            isRightToLeft = info["right_to_left"] == "true",
            customCss = info["html_style"],
            fileSize = file.length(), lastModified = file.lastModified())
    }

    private fun readESwordDetails(db: SQLiteDatabase, file: File, type: ModuleType, fmt: ModuleFormat): ModuleEntity? {
        if (!tableExists(db, "Details")) return buildFallbackEntity(file, type, fmt)
        val c = db.rawQuery("SELECT Abbreviation, Description, Language, OT, NT, Strong FROM Details LIMIT 1", null)
        return c.use {
            if (!it.moveToFirst()) return buildFallbackEntity(file, type, fmt)
            ModuleEntity(filePath=file.absolutePath, fileName=file.name, type=type, format=fmt,
                abbreviation = it.getString(0) ?: file.nameWithoutExtension,
                title        = it.getString(1) ?: file.nameWithoutExtension,
                language     = it.getString(2) ?: "und",
                hasOT = it.getInt(3) == 1, hasNT = it.getInt(4) == 1,
                hasStrong = it.getInt(5) == 1,
                fileSize = file.length(), lastModified = file.lastModified())
        }
    }

    private fun buildFallbackEntity(file: File, type: ModuleType, fmt: ModuleFormat) = ModuleEntity(
        filePath = file.absolutePath, fileName = file.name, type = type, format = fmt,
        abbreviation = file.nameWithoutExtension, title = file.nameWithoutExtension,
        fileSize = file.length(), lastModified = file.lastModified()
    )

    private fun tableExists(db: SQLiteDatabase, name: String): Boolean =
        db.rawQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            arrayOf(name)).use { it.count > 0 }
}
```

---

## 📚 66 Livros Canônicos PT-BR com Numeração Completa

```kotlin
data class BookInfo(val mySword: Int, val myBible: Int, val ptName: String, val abbr: String, val chapters: Int)

object BibleBooks {
    val ALL = listOf(
        BookInfo(1,  10,  "Gênesis",            "Gn",   50),
        BookInfo(2,  20,  "Êxodo",              "Êx",   40),
        BookInfo(3,  30,  "Levítico",           "Lv",   27),
        BookInfo(4,  40,  "Números",            "Nm",   36),
        BookInfo(5,  50,  "Deuteronômio",       "Dt",   34),
        BookInfo(6,  60,  "Josué",              "Js",   24),
        BookInfo(7,  70,  "Juízes",             "Jz",   21),
        BookInfo(8,  80,  "Rute",               "Rt",    4),
        BookInfo(9,  90,  "1 Samuel",           "1Sm",  31),
        BookInfo(10, 100, "2 Samuel",           "2Sm",  24),
        BookInfo(11, 110, "1 Reis",             "1Rs",  22),
        BookInfo(12, 120, "2 Reis",             "2Rs",  25),
        BookInfo(13, 130, "1 Crônicas",         "1Cr",  29),
        BookInfo(14, 140, "2 Crônicas",         "2Cr",  36),
        BookInfo(15, 150, "Esdras",             "Ed",   10),
        BookInfo(16, 160, "Neemias",            "Ne",   13),
        BookInfo(17, 190, "Ester",              "Et",   10),
        BookInfo(18, 220, "Jó",                 "Jó",   42),
        BookInfo(19, 230, "Salmos",             "Sl",  150),
        BookInfo(20, 240, "Provérbios",         "Pv",   31),
        BookInfo(21, 250, "Eclesiastes",        "Ec",   12),
        BookInfo(22, 260, "Cânticos",           "Ct",    8),
        BookInfo(23, 290, "Isaías",             "Is",   66),
        BookInfo(24, 300, "Jeremias",           "Jr",   52),
        BookInfo(25, 310, "Lamentações",        "Lm",    5),
        BookInfo(26, 330, "Ezequiel",           "Ez",   48),
        BookInfo(27, 340, "Daniel",             "Dn",   12),
        BookInfo(28, 350, "Oséias",             "Os",   14),
        BookInfo(29, 360, "Joel",               "Jl",    3),
        BookInfo(30, 370, "Amós",               "Am",    9),
        BookInfo(31, 380, "Obadias",            "Ob",    1),
        BookInfo(32, 390, "Jonas",              "Jn",    4),
        BookInfo(33, 400, "Miquéias",           "Mq",    7),
        BookInfo(34, 410, "Naum",               "Na",    3),
        BookInfo(35, 420, "Habacuque",          "Hc",    3),
        BookInfo(36, 430, "Sofonias",           "Sf",    3),
        BookInfo(37, 440, "Ageu",               "Ag",    2),
        BookInfo(38, 450, "Zacarias",           "Zc",   14),
        BookInfo(39, 460, "Malaquias",          "Ml",    4),
        BookInfo(40, 470, "Mateus",             "Mt",   28),
        BookInfo(41, 480, "Marcos",             "Mc",   16),
        BookInfo(42, 490, "Lucas",              "Lc",   24),
        BookInfo(43, 500, "João",               "Jo",   21),
        BookInfo(44, 510, "Atos",               "At",   28),
        BookInfo(45, 520, "Romanos",            "Rm",   16),
        BookInfo(46, 530, "1 Coríntios",        "1Co",  16),
        BookInfo(47, 540, "2 Coríntios",        "2Co",  13),
        BookInfo(48, 550, "Gálatas",            "Gl",    6),
        BookInfo(49, 560, "Efésios",            "Ef",    6),
        BookInfo(50, 570, "Filipenses",         "Fp",    4),
        BookInfo(51, 580, "Colossenses",        "Cl",    4),
        BookInfo(52, 590, "1 Tessalonicenses",  "1Ts",   5),
        BookInfo(53, 600, "2 Tessalonicenses",  "2Ts",   3),
        BookInfo(54, 610, "1 Timóteo",          "1Tm",   6),
        BookInfo(55, 620, "2 Timóteo",          "2Tm",   4),
        BookInfo(56, 630, "Tito",               "Tt",    3),
        BookInfo(57, 640, "Filemon",            "Fm",    1),
        BookInfo(58, 650, "Hebreus",            "Hb",   13),
        BookInfo(59, 660, "Tiago",              "Tg",    5),
        BookInfo(60, 670, "1 Pedro",            "1Pe",   5),
        BookInfo(61, 680, "2 Pedro",            "2Pe",   3),
        BookInfo(62, 690, "1 João",             "1Jo",   5),
        BookInfo(63, 700, "2 João",             "2Jo",   1),
        BookInfo(64, 710, "3 João",             "3Jo",   1),
        BookInfo(65, 720, "Judas",              "Jd",    1),
        BookInfo(66, 730, "Apocalipse",         "Ap",   22)
    )

    private val byMySword  = ALL.associateBy { it.mySword }
    private val byMyBible  = ALL.associateBy { it.myBible }

    fun getName(mySwordNum: Int): String = byMySword[mySwordNum]?.ptName ?: "Livro $mySwordNum"
    fun getAbbr(mySwordNum: Int): String = byMySword[mySwordNum]?.abbr ?: "L$mySwordNum"
    fun getChapters(mySwordNum: Int): Int = byMySword[mySwordNum]?.chapters ?: 1
    fun myBibleToMySword(myBibleNum: Int): Int = byMyBible[myBibleNum]?.mySword ?: myBibleNum
    fun mySwordToMyBible(mySwordNum: Int): Int = byMySword[mySwordNum]?.myBible ?: (mySwordNum * 10)
    fun isNewTestament(mySwordNum: Int): Boolean = mySwordNum >= 40
}
```

---

## ✅ Checklist

- [ ] `.bbl.mybible`, `.cmt.mybible`, `.dct.mybible`, `.bok.mybible`, `.jor.mybible` por extensão
- [ ] `.SQLite3` MyBible detectado por tabela `verses` + `info`
- [ ] `.commentaries.SQLite3`, `.dictionary.SQLite3` etc. por sufixo no nome
- [ ] `.mybible` genérico detectado por tabelas (Commentary = notas pessoais)
- [ ] `.bblx`/`.bbli` = e-Sword legacy/modern
- [ ] `.ont`/`.ot`/`.nt` = The Word
- [ ] `.zip` com "usfm" = USFM
- [ ] MyBible: abreviação do **nome do arquivo**, não de campo interno
- [ ] MyBible: `book_number` convertido via `BibleBooks.myBibleToMySword()` ao persistir
- [ ] Scan em `Dispatchers.IO` com `Flow` de progresso
- [ ] Scan incremental: só reprocessa arquivos novos ou com `lastModified` diferente
- [ ] Limpeza de módulos deletados implementada
- [ ] `uniqueIndex` em `abbreviation` previne duplicatas
- [ ] `isNewTestament` passado ao `MyBibleTagParser.parse()` para Strong's H vs G
