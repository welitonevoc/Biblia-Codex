---
name: mysword-user-data
description: Especialista nos 10 arquivos SQLite de dados do usuário MySword — os 9 arquivos em mydata/ (bookmarks.mybible, highlight.mybible, format.mybible, settings.mybible, tags.mybible, verselist.mybible, default.xrefs.twm, mapgeodata.mybible, peopledata.mybible) e notes/versenotes.mybible. Cobre: schemas SQLite de cada arquivo, Room entities com índices corretos, DAOs com queries otimizadas por capítulo, enum HighlightColor com as 11 cores exatas do MySword (light+dark), comportamento crítico do settings.mybible (lido 1x na inicialização, posições cacheadas em memória, escrito apenas ao sair), WAL mode (.mybible-wal e .mybible-shm), importação de backup MySword, wiki syntax do editor de notas, e DataStore para preferências do app. Triggers: bookmarks, highlights, notes, versenotes, verselist, tags, format.mybible, settings.mybible, user data, backup, sync, mydata, personal notes, highlight color, bookmark group, verse list.
allowed-tools: Read, Glob, Grep, Bash
---

# MySword User Data — Arquivos Internos do Usuário

> **Localização base:** `/storage/emulated/0/mysword/mydata/`  
> **Fonte:** mysword.info backup sync tutorial, feature docs, MySword 16.x changelog  
> **CRÍTICO:** Dados pessoais insubstituíveis. Nunca sobrescrever sem backup. Nunca escrever com MySword aberto.

---

## 📂 Mapa dos 10 Arquivos

```
mysword/
├── mydata/
│   ├── bookmarks.mybible    ← Marcadores de versículos (grupos no Deluxe)
│   ├── highlight.mybible    ← Destaques coloridos (11 cores padrão)
│   ├── format.mybible       ← Formatação inline de palavras (Deluxe exclusivo)
│   ├── settings.mybible     ← TODAS as preferências + posição de navegação atual
│   ├── tags.mybible         ← Tags com ícones (Deluxe: múltiplos ícones)
│   ├── verselist.mybible    ← Lista de versículos (bookmark avançado)
│   ├── default.xrefs.twm   ← Cross-references customizadas (Deluxe)
│   ├── mapgeodata.mybible   ← Geolocalização bíblica para mapas
│   └── peopledata.mybible   ← Relacionamentos entre pessoas bíblicas
└── notes/
    └── versenotes.mybible   ← Notas pessoais (estrutura = Commentary)
```

---

## 📌 bookmarks.mybible

```sql
CREATE TABLE Bookmarks (
    Book      INTEGER NOT NULL,
    Chapter   INTEGER NOT NULL,
    Verse     INTEGER NOT NULL,
    BibleMod  TEXT,             -- tradução associada (abreviação)
    GroupName TEXT,             -- grupo (Deluxe)
    Note      TEXT,             -- nota curta opcional
    CreatedAt INTEGER,
    PRIMARY KEY (Book, Chapter, Verse)
);
```

**Room Entity + DAO:**
```kotlin
@Entity(tableName = "bookmarks", indices = [
    Index(value = ["book", "chapter"]),
    Index(value = ["groupName"]),
    Index(value = ["createdAt"])
])
data class BookmarkEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val book: Int, val chapter: Int, val verse: Int,
    val toChapter: Int? = null, val toVerse: Int? = null,  // range opcional
    val bibleModule: String? = null,
    val groupName: String? = null,
    val note: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Dao interface BookmarkDao {
    @Query("SELECT * FROM bookmarks ORDER BY book, chapter, verse")
    fun observeAll(): Flow<List<BookmarkEntity>>

    @Query("SELECT * FROM bookmarks WHERE book=:b AND chapter=:c ORDER BY verse")
    suspend fun getForChapter(b: Int, c: Int): List<BookmarkEntity>

    // Verificação rápida para renderização (ícone por versículo)
    @Query("SELECT EXISTS(SELECT 1 FROM bookmarks WHERE book=:b AND chapter=:c AND verse=:v)")
    suspend fun hasBookmark(b: Int, c: Int, v: Int): Boolean

    @Query("SELECT DISTINCT groupName FROM bookmarks WHERE groupName IS NOT NULL ORDER BY groupName")
    fun observeGroups(): Flow<List<String>>

    @Query("SELECT * FROM bookmarks WHERE groupName=:group ORDER BY book, chapter, verse")
    fun observeByGroup(group: String): Flow<List<BookmarkEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun insert(b: BookmarkEntity): Long
    @Delete suspend fun delete(b: BookmarkEntity)
    @Query("DELETE FROM bookmarks WHERE book=:b AND chapter=:c AND verse=:v")
    suspend fun deleteForVerse(b: Int, c: Int, v: Int)
}
```

---

## 🎨 highlight.mybible — As 11 Cores Padrão do MySword

```kotlin
enum class HighlightColor(
    val cssClass: String,
    val lightBg: Color,   // para tema claro
    val darkBg: Color     // para tema escuro
) {
    RED         ("red",         Color(0x55EF5350), Color(0x55B71C1C)),
    ORANGE      ("orange",      Color(0x55FF9800), Color(0x55E65100)),
    BROWN       ("brown",       Color(0x55795548), Color(0x554E342E)),
    YELLOW_GREEN("yellowgreen", Color(0x558BC34A), Color(0x55558B2F)),
    GREEN       ("green",       Color(0x554CAF50), Color(0x552E7D32)),
    BLUE_GREEN  ("bluegreen",   Color(0x5500BCD4), Color(0x55006064)),
    BLUE        ("blue",        Color(0x552196F3), Color(0x550D47A1)),
    VIOLET      ("violet",      Color(0x559C27B0), Color(0x556A1B9A)),
    PURPLE      ("purple",      Color(0x55673AB7), Color(0x554527A0)),
    PINK        ("pink",        Color(0x55E91E63), Color(0x55880E4F)),
    GRAY        ("gray",        Color(0x559E9E9E), Color(0x55616161));

    fun forTheme(isDark: Boolean) = if (isDark) darkBg else lightBg

    companion object {
        fun fromCssClass(css: String) = values().firstOrNull { it.cssClass == css }
        // Fallback seguro se cor desconhecida
        fun fromCssClassOrDefault(css: String) = fromCssClass(css) ?: YELLOW_GREEN
    }
}
```

```sql
CREATE TABLE Highlights (
    Book      INTEGER NOT NULL,
    Chapter   INTEGER NOT NULL,
    Verse     INTEGER NOT NULL,
    ToVerse   INTEGER,          -- NULL = versículo único
    Color     TEXT NOT NULL,    -- cssClass do enum acima
    CreatedAt INTEGER,
    PRIMARY KEY (Book, Chapter, Verse)
);
```

```kotlin
@Entity(tableName = "highlights", indices = [Index(value = ["book", "chapter"])])
data class HighlightEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val book: Int, val chapter: Int, val verse: Int,
    val toVerse: Int? = null,
    val color: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Dao interface HighlightDao {
    // Uma única query por capítulo — eficiente para renderização
    @Query("SELECT verse, color FROM highlights WHERE book=:b AND chapter=:c")
    suspend fun getChapterHighlightMap(b: Int, c: Int): List<VerseColor>

    data class VerseColor(val verse: Int, val color: String)

    @Query("SELECT * FROM highlights WHERE book=:b AND chapter=:c AND verse=:v LIMIT 1")
    suspend fun getForVerse(b: Int, c: Int, v: Int): HighlightEntity?

    @Query("SELECT * FROM highlights WHERE color=:color ORDER BY book, chapter, verse")
    fun observeByColor(color: String): Flow<List<HighlightEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun insert(h: HighlightEntity): Long
    @Query("DELETE FROM highlights WHERE book=:b AND chapter=:c AND verse=:v")
    suspend fun deleteForVerse(b: Int, c: Int, v: Int)
}
```

---

## 📝 notes/versenotes.mybible — Notas Pessoais

Estrutura **idêntica** à tabela `Commentary` do MySword. Localizada em `notes/versenotes.mybible`.

```sql
CREATE TABLE Commentary (
    Book        INTEGER NOT NULL,
    Chapter     INTEGER NOT NULL,
    FromVerse   INTEGER NOT NULL,
    ToVerse     INTEGER NOT NULL,
    Data        TEXT NOT NULL   -- HTML ou wiki syntax
);
```

**Wiki Syntax do editor MySword** (aceita HTML):
```html
<b>negrito</b> <i>itálico</i> <u>sublinhado</u> <mark>destaque</mark>
<a href='b43.3.16'>João 3:16</a>
<a href='sH2617'>חֶסֶד</a>
<a href='d-Webster Grace'>Grace</a>
```

```kotlin
@Entity(tableName = "personal_notes", indices = [Index(value = ["book", "chapter"])])
data class PersonalNoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val book: Int, val chapter: Int,
    val fromVerse: Int, val toVerse: Int,
    val data: String,
    val updatedAt: Long = System.currentTimeMillis()
)

@Dao interface PersonalNoteDao {
    @Query("SELECT * FROM personal_notes WHERE book=:b AND chapter=:c ORDER BY fromVerse")
    suspend fun getForChapter(b: Int, c: Int): List<PersonalNoteEntity>

    @Query("SELECT * FROM personal_notes WHERE book=:b AND chapter=:c AND fromVerse<=:v AND toVerse>=:v LIMIT 1")
    suspend fun getForVerse(b: Int, c: Int, v: Int): PersonalNoteEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun insert(n: PersonalNoteEntity): Long
    @Query("DELETE FROM personal_notes WHERE book=:b AND chapter=:c AND fromVerse=:fv AND toVerse=:tv")
    suspend fun delete(b: Int, c: Int, fv: Int, tv: Int)
}
```

---

## 🌳 GeneaView UI — Componente de Árvore Genealógica

O Biblia Codex implementa UI visual estilo **mind map** para genealogias:

### Arquivo
`src/components/GenealogyTree.tsx`

### Features
- Círculos interativos com gradiente (masculino 🔵 azul / feminino 🔴 rosa)
- Modo tree (🌲 visual radial) e lista (📋 grid)
- Animações glow, slide-up panels
- tree_id agrupa famílias
- Exibe: birthyear, deathyear, birthplace, deathplace, verses

### Integração
```tsx
// Reader.tsx
<button onClick={() => onToolOpen(v, 'people')} title="Árvore Genealógica">
  <span>🌳</span>
</button>
```

### BibleService
```typescript
getPeopleData(bookId, chapter, verse): Person[]
getGenealogyTree(treeId): Person[]  // busca por árbol genealógica
```

---

## 👥 peopledata.mybible — Dados Genealógicos (Schema MySword)

Schema oficial do MySword com **3.085 pessoas** e **375 genealogias**:

```sql
CREATE TABLE People (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,           -- Nome da pessoa (NVI)
    gender TEXT,                   -- M = Masculino, F = Feminino
    birthyear TEXT,               -- Ano de nascimento (ex: "1358 AC")
    deathyear TEXT,               -- Ano de falecimento (ex: "1235 AC")
    birthplace TEXT,            -- Local de nascimento (ex: "Egito")
    deathplace TEXT,             -- Local de falecimento (ex: "Monte Hor")
    tree_id INTEGER,             -- ID da árvore genealógica (0 = sem família)
    verses TEXT                 -- Lista de versículos (ex: "Ex 4:14, Ex 4:27")
);
```

**Árvores Genealógicas (tree_id):**
- tree_id **1** = 833 pessoas (Árvore principal: Adão → Noé → Abraão → ...)
- tree_id **8** = 50 pessoas (Família de Eliú?)
- tree_id **7** = 42 pessoas
- tree_id **62** = 29 pessoas
- tree_id **107** = 16 pessoas
- tree_id **173** = 13 pessoas
- E muitas outras famílias

**Exemplos de dados:**
```sql
-- Arão (tree_id 1)
(1, 'Arão', 'M', '1358 AC', '1235 AC', 'Egito', 'Monte Hor', 1, 'Ex 4:14, Ex 4:27...')

-- Jesus Cristo
(1, 'Jesus Cristo', 'M', '4 AC', '30 DC', 'Belém', 'Jerusalém', 1, 'Mt 1:1, Lc 2:11...')

-- Maria
(1, 'Maria', 'F', '', '', 'Nazaré', '', 1, 'Mt 1:18, Lc 1:27...')
```

**Kotlin Entity:**
```kotlin
@Entity(tableName = "people", indices = [
    Index(value = ["name"]),
    Index(value = ["tree_id"]),
    Index(value = ["verses"])
])
data class PersonEntity(
    @PrimaryKey val id: Long,
    val name: String,
    val gender: String?,         // "M" ou "F"
    val birthyear: String?,      // "1358 AC", "4 AC"
    val deathyear: String?,     // "1235 AC", "30 DC"
    val birthplace: String?,   // "Egito", "Nazaré"
    val deathplace: String?,   // "Monte Hor", "Jerusalém"
    val treeId: Int?,         // ID da árvore genealógica
    val verses: String?        // Lista de versículos separados por vírgula
)
```

**Kotlin DAO:**
```kotlin
@Dao interface PeopleDao {
    // Buscar por versículo
    @Query("SELECT * FROM people WHERE verses LIKE '%' || :book || ' ' || :chapter || ':' || :verse || '%'")
    suspend fun getForVerse(book: String, chapter: Int, verse: Int): List<PersonEntity>

    // Buscar por nome
    @Query("SELECT * FROM people WHERE name LIKE '%' || :query || '%'")
    suspend fun searchByName(query: String): List<PersonEntity>

    // Buscar genealogia completa (tree_id)
    @Query("SELECT * FROM people WHERE treeId = :treeId ORDER BY name")
    suspend fun getGenealogyTree(treeId: Int): List<PersonEntity>

    // Contagem de pessoas por árbol
    @Query("SELECT treeId, COUNT(*) as c FROM people WHERE treeId > 0 GROUP BY treeId ORDER BY c DESC")
    suspend fun getTreeCounts(): List<Pair<Int, Int>>

    // Contagem total
    @Query("SELECT COUNT(*) FROM people")
    suspend fun getTotalCount(): Int
}
```

**Exemplo de genealogia (tree_id = 1):**
```
Adão → Caim → …
    → Abel → …
    → Sete → Enos → … → Noé → Sem → Abraão → Isaque → Jacó → José → …
                                          ↓
                                        Judá → Onri → Acabe → … → Jesus
```

---

## 📍 mapgeodata.mybible — Dados Geográficos

Schema do arquivo de lugares bíblicos:

```sql
CREATE TABLE Places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,   -- Descrição do lugar
    image TEXT          -- URL da imagem (Wikimedia Commons)
);
```

**Índice:**
```sql
CREATE INDEX idx_places_ref ON Places(book, chapter, verse);
```

**Dados de exemplo (Antigo testamento):**
```sql
-- Jardim do Éden (Gn 2:8)
('1','2','8','Jardim do Éden','Local onde Deus colocou Adão')

-- Monte Ararate (Gn 8:4)
('1','8','4','Monte Ararate','Onde a arca repousou')

-- Babel (Gn 10:10)
('1','10','10','Babel','No início do reino de Ninrode')

-- Canaã (Gn 12:5)
('1','12','5','Canaã','Terra para onde Abraão foi')

-- Sodoma (Gn 13:12)
('1','13','12','Sodoma','Cidade pecado')

-- Berseba (Gn 21:31)
('1','21','31','Berseba','Poço do juramento')
```

**Dados de exemplo (Novo testamento):**
```sql
-- Nazaré (Mt 1:5)
('40','1','5','Nazaré','Cidade de José e Maria')

-- Belém (Mt 2:1)
('40','2','1','Belém','Cidade de Davi, nasceu Jesus')

-- Cafarnaum (Mt 4:12)
('40','4','12','Cafarnaum','Cidade de Jesus na Galileia')

-- Jordão (Mt 3:13)
('40','3','13','Jordão','Rio onde Jesus foi batizado')

-- Monte das Oliveiras (Mt 24:3)
('40','24','3','Monte das Oliveiras','Jesus falou do fim')

-- Getsêmani (Mt 26:36)
('40','26','36','Getsêmani','Hortelão')

-- Gólgota (Mt 27:32)
('40','27','32','Gólgota','Lugar da caveira')
```

**Kotlin Entity:**
```kotlin
@Entity(tableName = "places", indices = [
    Index(value = ["book", "chapter", "verse"])
])
data class PlaceEntity(
    val book: Int,
    val chapter: Int,
    val verse: Int,
    val name: String,
    val description: String,
    val image: String? = null  // URL da imagem (Wikimedia Commons)
)
```

**Kotlin DAO:**
```kotlin
@Dao interface PlacesDao {
    @Query("SELECT * FROM places WHERE book=:b AND chapter=:c AND verse=:v")
    suspend fun getForVerse(b: Int, c: Int, v: Int): List<PlaceEntity>

    @Query("SELECT * FROM places WHERE name LIKE '%' || :query || '%'")
    suspend fun searchByName(query: String): List<PlaceEntity>

    @Query("SELECT * FROM places WHERE book=:b AND chapter=:c")
    suspend fun getForChapter(b: Int, c: Int): List<PlaceEntity>

    // Buscar lugar com imagem
    @Query("SELECT * FROM places WHERE image != '' AND image IS NOT NULL LIMIT :limit")
    suspend fun getPlacesWithImages(limit: Int = 20): List<PlaceEntity>
}
```

---

## 📋 verselist.mybible, tags.mybible, format.mybible

```sql
-- verselist.mybible
CREATE TABLE Verselist (
    Book      INTEGER, Chapter INTEGER, Verse INTEGER,
    ListName  TEXT DEFAULT 'Default', Note TEXT, CreatedAt INTEGER,
    PRIMARY KEY (Book, Chapter, Verse, ListName)
);

-- tags.mybible
CREATE TABLE Tags (
    Book INTEGER, Chapter INTEGER, Verse INTEGER,
    TagType TEXT NOT NULL,  -- "face-smile" (Free); múltiplos no Deluxe
    Note TEXT, CreatedAt INTEGER,
    PRIMARY KEY (Book, Chapter, Verse, TagType)
);

-- format.mybible — Formato proprietário não documentado; preservar opaco
CREATE TABLE Format (
    Book INTEGER, Chapter INTEGER, Verse INTEGER,
    FormatData TEXT NOT NULL,
    PRIMARY KEY (Book, Chapter, Verse)
);
```

---

## ⚙️ settings.mybible — Comportamento Crítico

```sql
CREATE TABLE settings (key TEXT NOT NULL PRIMARY KEY, value TEXT);
```

**Regras documentadas:**
1. Lido **uma única vez** na inicialização do MySword
2. Posições de navegação **cacheadas em memória** → salvas **ao sair** do app
3. **NUNCA escrever** com MySword aberto — será sobrescrito ao fechar

**Para o SEU app — usar DataStore (não Room, não settings.mybible):**
```kotlin
val Context.dataStore: DataStore<Preferences> by preferencesDataStore("bible_app_prefs")

object AppPrefs {
    val CURRENT_BOOK     = intPreferencesKey("current_book")
    val CURRENT_CHAPTER  = intPreferencesKey("current_chapter")
    val CURRENT_VERSE    = intPreferencesKey("current_verse")
    val FONT_SIZE        = floatPreferencesKey("font_size")
    val SHOW_STRONGS     = booleanPreferencesKey("show_strongs")
    val RED_LETTER       = booleanPreferencesKey("red_letter")
    val BIBLE_MODULE     = stringPreferencesKey("current_bible_module")
    val DARK_THEME       = booleanPreferencesKey("dark_theme")
    val PARAGRAPH_MODE   = booleanPreferencesKey("paragraph_mode")
}
```

---

## 🔁 Importação de Backup MySword

```kotlin
class MySwordImporter(
    private val bookmarkDao: BookmarkDao,
    private val highlightDao: HighlightDao,
    private val noteDao: PersonalNoteDao
) {
    suspend fun importAll(mydataDir: File, notesDir: File) = withContext(Dispatchers.IO) {
        importFrom(File(mydataDir, "bookmarks.mybible"))  { db -> importBookmarks(db) }
        importFrom(File(mydataDir, "highlight.mybible"))  { db -> importHighlights(db) }
        importFrom(File(notesDir,  "versenotes.mybible")) { db -> importNotes(db) }
    }

    private suspend fun importBookmarks(db: SQLiteDatabase) {
        if (!tableExists(db, "Bookmarks")) return
        db.rawQuery("SELECT Book, Chapter, Verse, GroupName, Note FROM Bookmarks", null)
            .use { c -> while (c.moveToNext())
                bookmarkDao.insert(BookmarkEntity(book=c.getInt(0), chapter=c.getInt(1), verse=c.getInt(2),
                    groupName=c.getStringOrNull(3), note=c.getStringOrNull(4)))
            }
    }

    private suspend fun importHighlights(db: SQLiteDatabase) {
        if (!tableExists(db, "Highlights")) return
        db.rawQuery("SELECT Book, Chapter, Verse, ToVerse, Color FROM Highlights", null)
            .use { c -> while (c.moveToNext())
                highlightDao.insert(HighlightEntity(book=c.getInt(0), chapter=c.getInt(1), verse=c.getInt(2),
                    toVerse=if (c.isNull(3)) null else c.getInt(3),
                    color=c.getString(4) ?: "yellowgreen"))
            }
    }

    private suspend fun importNotes(db: SQLiteDatabase) {
        if (!tableExists(db, "Commentary")) return
        db.rawQuery("SELECT Book, Chapter, FromVerse, ToVerse, Data FROM Commentary", null)
            .use { c -> while (c.moveToNext())
                noteDao.insert(PersonalNoteEntity(book=c.getInt(0), chapter=c.getInt(1),
                    fromVerse=c.getInt(2), toVerse=c.getInt(3), data=c.getString(4) ?: ""))
            }
    }

    private inline fun importFrom(file: File, block: (SQLiteDatabase) -> Unit) {
        if (!file.canRead()) return
        // ⚠️ Verificar WAL mode — não abrir se .mybible-wal existe e MySword está aberto
        SQLiteDatabase.openDatabase(file.absolutePath, null, SQLiteDatabase.OPEN_READONLY).use(block)
    }

    private fun tableExists(db: SQLiteDatabase, name: String): Boolean =
        db.rawQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            arrayOf(name)).use { it.count > 0 }
}
```

---

## ⚠️ Avisos Críticos

| Situação | Problema | Solução |
|----------|---------|---------|
| `.mybible-wal` presente | WAL mode ativo — dados inconsistentes | Fechar MySword antes; `PRAGMA journal_mode=DELETE` |
| Escrever com MySword aberto | Dados sobrescritos ao fechar | NUNCA! Só modificar quando MySword estiver fechado |
| Cor desconhecida em highlight | Renderização errada | Fallback: `"yellowgreen"` |
| Import sem confirmação | Perda de dados do usuário | Sempre confirmar: "Substituir dados existentes?" |
| `settings.mybible` corrompido | `no such table: settings` | MySword 16.x tem opção de reset para estado inicial |

---

## ✅ Checklist

- [ ] `hasBookmark()` chamado na renderização de cada versículo
- [ ] `getChapterHighlightMap()` — **uma query por capítulo**, não por versículo
- [ ] Destaques como `SpanStyle(background = highlightColor)` no AnnotatedString
- [ ] Notas pessoais: ícone tappable na margem do versículo
- [ ] Import confirma antes de sobrescrever
- [ ] WAL mode: verificar existência de `.mybible-wal` antes de abrir
- [ ] 11 cores mapeadas para enum `HighlightColor`
- [ ] Preferências do app em DataStore, não em Room e não em `settings.mybible`
- [ ] Timestamp `updatedAt` atualizado em cada escrita de nota
