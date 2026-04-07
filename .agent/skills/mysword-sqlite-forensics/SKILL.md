---
name: mysword-sqlite-forensics
description: Especialista em engenharia reversa de arquivos SQLite desconhecidos do ecossistema MySword/MyBible — quando o schema não está documentado ou o arquivo tem estrutura inesperada. Cobre: técnicas de inspeção de tabelas e índices (sqlite_master), identificação de tipo por assinatura de tabelas, leitura segura de campos desconhecidos, parsing defensivo de dados sem schema garantido, detecção de WAL mode e recovery, diagnóstico de arquivos corrompidos, análise dos arquivos mydata/ (bookmarks.mybible, highlight.mybible, format.mybible, settings.mybible, tags.mybible, verselist.mybible, default.xrefs.twm), e estratégias de fallback para módulos de terceiros com schema não-padrão. Use quando o schema é desconhecido, quando há crash ao abrir um módulo, ou quando dados inesperados aparecem. Triggers: schema desconhecido, unknown schema, arquivo corrompido, crash ao abrir módulo, tabela não encontrada, no such table, colunas inesperadas, mydata forensics, bookmark schema, highlight schema, settings schema, format.mybible opaque, xrefs.twm, WAL recovery, sqlite_master inspect.
allowed-tools: Read, Glob, Grep, Bash
---

# MySword SQLite Forensics — Engenharia Reversa de Arquivos

> **Use quando:** O schema do arquivo é desconhecido, incompleto, ou diferente do esperado.  
> **Princípio:** Nunca assumir. Sempre inspecionar `sqlite_master` primeiro.

---

## 🔬 Passo 1 — Inspeção Completa de Qualquer Arquivo SQLite

```kotlin
/**
 * Ponto de entrada para qualquer arquivo .mybible ou .SQLite3 desconhecido.
 * Executa ANTES de qualquer query de dados.
 */
fun inspectSQLiteFile(filePath: String): SQLiteInspectionResult {
    return SQLiteDatabase.openDatabase(filePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->

        // 1. Listar TODAS as tabelas
        val tables = db.rawQuery(
            "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name", null
        ).use { c -> buildList { while (c.moveToNext()) add(c.getString(0) to c.getString(1)) } }

        // 2. Listar TODOS os índices
        val indexes = db.rawQuery(
            "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' ORDER BY tbl_name", null
        ).use { c -> buildList { while (c.moveToNext()) add(Triple(c.getString(0), c.getString(1), c.getString(2))) } }

        // 3. Para cada tabela, listar colunas
        val schemas = tables.associate { (tableName, _) ->
            tableName to db.rawQuery("PRAGMA table_info('$tableName')", null).use { c ->
                buildList {
                    while (c.moveToNext()) {
                        add(ColumnInfo(
                            cid = c.getInt(0),
                            name = c.getString(1),
                            type = c.getString(2),
                            notNull = c.getInt(3) == 1,
                            defaultValue = c.getStringOrNull(4),
                            isPrimaryKey = c.getInt(5) == 1
                        ))
                    }
                }
            }
        }

        // 4. Contar registros por tabela
        val rowCounts = tables.associate { (tableName, _) ->
            tableName to db.rawQuery("SELECT COUNT(*) FROM '$tableName'", null)
                .use { c -> if (c.moveToFirst()) c.getLong(0) else 0L }
        }

        // 5. Verificar modo de journal
        val journalMode = db.rawQuery("PRAGMA journal_mode", null)
            .use { c -> if (c.moveToFirst()) c.getString(0) else "unknown" }

        // 6. Verificar encoding
        val encoding = db.rawQuery("PRAGMA encoding", null)
            .use { c -> if (c.moveToFirst()) c.getString(0) else "unknown" }

        SQLiteInspectionResult(tables, indexes, schemas, rowCounts, journalMode, encoding)
    }
}

data class ColumnInfo(
    val cid: Int, val name: String, val type: String,
    val notNull: Boolean, val defaultValue: String?, val isPrimaryKey: Boolean
)

data class SQLiteInspectionResult(
    val tables: List<Pair<String, String>>,    // (name, type)
    val indexes: List<Triple<String, String, String?>>,
    val schemas: Map<String, List<ColumnInfo>>,
    val rowCounts: Map<String, Long>,
    val journalMode: String,
    val encoding: String
) {
    fun summary(): String = buildString {
        appendLine("=== SQLite Inspection ===")
        appendLine("Journal mode: $journalMode  |  Encoding: $encoding")
        appendLine("Tables (${tables.size}):")
        tables.forEach { (name, type) ->
            val cols = schemas[name]?.joinToString(", ") { it.name } ?: "?"
            val rows = rowCounts[name] ?: 0
            appendLine("  $name [$type] ($rows rows) — columns: $cols")
        }
    }
}
```

---

## 🔍 Passo 2 — Identificação de Tipo por Assinatura de Tabelas

```kotlin
object SQLiteModuleIdentifier {

    data class ModuleSignature(
        val requiredTables: Set<String>,
        val optionalTables: Set<String> = emptySet(),
        val identifyingColumns: Map<String, Set<String>> = emptyMap()
    )

    // Assinaturas conhecidas
    val SIGNATURES = mapOf(
        "MySword Bible" to ModuleSignature(
            requiredTables = setOf("Bible", "Details"),
            identifyingColumns = mapOf("Bible" to setOf("Book", "Chapter", "Verse", "Scripture"))
        ),
        "MySword Commentary" to ModuleSignature(
            requiredTables = setOf("Commentary", "Details"),
            identifyingColumns = mapOf("Commentary" to setOf("Book", "Chapter", "FromVerse", "ToVerse", "Data"))
        ),
        "MySword Dictionary" to ModuleSignature(
            requiredTables = setOf("Dictionary", "Details"),
            identifyingColumns = mapOf("Dictionary" to setOf("Word", "Data"))
        ),
        "MySword Journal/Notes" to ModuleSignature(
            requiredTables = setOf("Commentary"),
            optionalTables = setOf("Details")
            // Commentary sem Details = notes pessoais
        ),
        "MyBible Bible" to ModuleSignature(
            requiredTables = setOf("verses", "info"),  // minúsculas!
            identifyingColumns = mapOf("verses" to setOf("book_number", "chapter", "verse", "text"))
        ),
        "MyBible Commentary" to ModuleSignature(
            requiredTables = setOf("commentaries", "info"),
            identifyingColumns = mapOf("commentaries" to setOf("book_number", "chapter_number_from", "verse_number_from", "text"))
        ),
        "MyBible Dictionary" to ModuleSignature(
            requiredTables = setOf("dictionary", "info"),
            identifyingColumns = mapOf("dictionary" to setOf("topic", "definition"))
        ),
        "MySword Bookmarks" to ModuleSignature(
            requiredTables = setOf("Bookmarks")
        ),
        "MySword Highlights" to ModuleSignature(
            requiredTables = setOf("Highlights")
        ),
        "MySword Settings" to ModuleSignature(
            requiredTables = setOf("settings"),
            identifyingColumns = mapOf("settings" to setOf("key", "value"))
        ),
        "MySword Verselist" to ModuleSignature(
            requiredTables = setOf("Verselist")
        ),
        "MySword Tags" to ModuleSignature(
            requiredTables = setOf("Tags")
        )
    )

    fun identify(result: SQLiteInspectionResult): String {
        val tableNames = result.tables.map { it.first }.toSet()
        val tableNamesLower = tableNames.map { it.lowercase() }.toSet()

        return SIGNATURES.entries.firstOrNull { (_, sig) ->
            val required = sig.requiredTables
            val matchedTables = required.filter { req ->
                req in tableNames || req.lowercase() in tableNamesLower
            }
            if (matchedTables.size != required.size) return@firstOrNull false

            // Verificar colunas identificadoras
            sig.identifyingColumns.all { (tableName, expectedCols) ->
                val actualTable = tableNames.firstOrNull { it.equals(tableName, ignoreCase = true) }
                    ?: return@all false
                val actualCols = result.schemas[actualTable]?.map { it.name.lowercase() }?.toSet() ?: return@all false
                expectedCols.all { col -> col.lowercase() in actualCols }
            }
        }?.key ?: "Tipo desconhecido — tabelas: ${tableNames.joinToString()}"
    }
}
```

---

## 🛡️ Passo 3 — Leitura Defensiva (Schema Parcialmente Conhecido)

```kotlin
/**
 * Leitura defensiva: funciona mesmo que colunas opcionais estejam ausentes.
 * Sempre verificar PRAGMA table_info antes de SELECT de colunas desconhecidas.
 */
fun readTableDefensively(db: SQLiteDatabase, tableName: String): List<Map<String, Any?>> {
    // Verificar quais colunas realmente existem
    val existingColumns = db.rawQuery("PRAGMA table_info('$tableName')", null).use { c ->
        buildSet { while (c.moveToNext()) add(c.getString(1)) }  // coluna 'name'
    }

    if (existingColumns.isEmpty()) return emptyList()

    // Construir SELECT apenas com colunas existentes
    val selectCols = existingColumns.joinToString(", ") { "\"$it\"" }
    return db.rawQuery("SELECT $selectCols FROM \"$tableName\"", null).use { cursor ->
        buildList {
            while (cursor.moveToNext()) {
                val row = mutableMapOf<String, Any?>()
                existingColumns.forEachIndexed { idx, colName ->
                    row[colName] = when (cursor.getType(idx)) {
                        Cursor.FIELD_TYPE_INTEGER -> cursor.getLong(idx)
                        Cursor.FIELD_TYPE_FLOAT   -> cursor.getDouble(idx)
                        Cursor.FIELD_TYPE_STRING  -> cursor.getString(idx)
                        Cursor.FIELD_TYPE_BLOB    -> cursor.getBlob(idx)
                        else -> null  // FIELD_TYPE_NULL
                    }
                }
                add(row)
            }
        }
    }
}

// Extensão para leitura segura de coluna opcional
fun Cursor.getStringOrNull(columnName: String): String? {
    val idx = getColumnIndex(columnName)
    return if (idx >= 0 && !isNull(idx)) getString(idx) else null
}

fun Cursor.getIntOrDefault(columnName: String, default: Int = 0): Int {
    val idx = getColumnIndex(columnName)
    return if (idx >= 0 && !isNull(idx)) getInt(idx) else default
}
```

---

## 💊 Passo 4 — Diagnóstico e Recovery de WAL Mode

```kotlin
/**
 * O MySword usa WAL (Write-Ahead Log) mode. Arquivos com .mybible-wal e .mybible-shm
 * podem estar em estado inconsistente se o app estava aberto quando o arquivo foi copiado.
 */
object WALDiagnostics {

    fun checkWALState(filePath: String): WALState {
        val walFile = File("$filePath-wal")
        val shmFile = File("$filePath-shm")
        return when {
            walFile.exists() && walFile.length() > 0 -> WALState.WAL_ACTIVE
            walFile.exists() && walFile.length() == 0L -> WALState.WAL_EMPTY
            shmFile.exists() -> WALState.SHM_ONLY
            else -> WALState.CLEAN
        }
    }

    /**
     * Forçar checkpoint do WAL (compactar WAL de volta para o arquivo principal).
     * Chamar SOMENTE se o arquivo não estiver sendo usado por outro processo.
     */
    fun forceWALCheckpoint(filePath: String): Boolean = runCatching {
        SQLiteDatabase.openDatabase(
            filePath, null,
            SQLiteDatabase.OPEN_READWRITE  // precisa de escrita para checkpoint
        ).use { db ->
            db.rawQuery("PRAGMA wal_checkpoint(FULL)", null).use { c ->
                c.moveToFirst()
                val busy = c.getInt(0)     // 0 = não busy
                val checkpointed = c.getInt(2)
                busy == 0 && checkpointed >= 0
            }
        }
    }.getOrDefault(false)

    /**
     * Converter de WAL para DELETE journal (mais seguro para arquivos read-only).
     * Use SOMENTE se você tem permissão de escrita e o arquivo não está em uso.
     */
    fun convertToDeleteMode(filePath: String): Boolean = runCatching {
        SQLiteDatabase.openDatabase(filePath, null, SQLiteDatabase.OPEN_READWRITE).use { db ->
            db.execSQL("PRAGMA journal_mode=DELETE")
            true
        }
    }.getOrDefault(false)

    enum class WALState { CLEAN, WAL_ACTIVE, WAL_EMPTY, SHM_ONLY }
}
```

---

## 🗃️ Guia dos Arquivos mydata/ com Schemas Inferidos

### bookmarks.mybible
```sql
-- Assinatura para identificação
-- Tabela obrigatória: Bookmarks
-- Colunas esperadas: Book, Chapter, Verse
-- Colunas opcionais: BibleMod, GroupName, Note, CreatedAt
SELECT name FROM sqlite_master WHERE name='Bookmarks'
```

### highlight.mybible
```sql
-- Tabela obrigatória: Highlights
-- Colunas esperadas: Book, Chapter, Verse, Color
-- Colunas opcionais: ToVerse, CreatedAt
-- Valores de Color: red, orange, brown, yellowgreen, green, bluegreen,
--                  blue, violet, purple, pink, gray
```

### settings.mybible
```sql
-- Estrutura key-value genérica
-- Tabela: settings
-- Colunas: key (TEXT PK), value (TEXT)
-- Atualizado frequentemente — não confiável para leitura durante uso do MySword
SELECT key, value FROM settings WHERE key LIKE '%current%' OR key LIKE '%bible%'
```

### format.mybible
```sql
-- Estrutura desconhecida — preservar opaco
-- NÃO tentar parsear FormatData — formato proprietário não documentado
-- Estratégia: copiar bytes sem interpretação ao fazer backup/restore
SELECT COUNT(*) FROM Format  -- apenas para verificar se tem dados
```

### default.xrefs.twm
```sql
-- Cross-references customizadas do usuário
-- Extensão .twm incomum mas internamente é SQLite
-- Assinatura provável: tabela de cross-references com book/chapter/verse
SELECT name FROM sqlite_master WHERE type='table'
```

---

## 🚨 Erros Comuns e Diagnóstico

| Erro | Causa provável | Diagnóstico |
|------|---------------|-------------|
| `no such table: Bible` | MySword com tabela minúscula | Verificar case: `bible` vs `Bible` |
| `no such column: scripture` | Coluna com nome diferente | `PRAGMA table_info('bible')` |
| `database disk image is malformed` | Arquivo corrompido ou WAL inconsistente | `PRAGMA integrity_check` |
| `attempt to write a readonly database` | Aberto como read-only para escrita | Mudar flags para `OPEN_READWRITE` |
| `unable to open database file` | Caminho errado ou sem permissão | Verificar `file.canRead()` antes |
| Dados vazios em todos os campos | Encoding UTF-16 vs UTF-8 | `PRAGMA encoding` |
| Números estranhos no `Book` | Módulo MyBible com PalmBible+ numbers | Converter via `MyBibleToMySword.bookMap` |
| `SQLiteFullException` | Disco cheio ao fazer checkpoint WAL | Liberar espaço, tentar checkpoint novamente |

---

## 🧪 Toolkit de Diagnóstico Rápido

```kotlin
// Uso: DumpSQLiteFile.dump(context, filePath) para diagnóstico completo em log
object DumpSQLiteFile {
    fun dump(filePath: String) {
        val walState = WALDiagnostics.checkWALState(filePath)
        android.util.Log.d("SQLiteForensics", "WAL state: $walState")

        val result = inspectSQLiteFile(filePath)
        android.util.Log.d("SQLiteForensics", result.summary())

        val moduleType = SQLiteModuleIdentifier.identify(result)
        android.util.Log.d("SQLiteForensics", "Identified as: $moduleType")

        // Amostra das primeiras 3 linhas de cada tabela
        SQLiteDatabase.openDatabase(filePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            result.tables.forEach { (tableName, _) ->
                val sample = db.rawQuery("SELECT * FROM '$tableName' LIMIT 3", null)
                android.util.Log.d("SQLiteForensics", "  $tableName sample: ${sample.count} cols, first row: ${if (sample.moveToFirst()) (0 until sample.columnCount).map { sample.getString(it) } else "empty"}")
                sample.close()
            }
        }
    }
}
```
