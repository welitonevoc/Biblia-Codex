---
name: mysword-specialist
description: Especialista de alto nível em todo o ecossistema MySword/MyBible para Android — orquestra o uso correto das skills granulares (mysword-bible-engine, mybible-format, mysword-format-parser, mysword-user-data, mysword-module-manager). Cobre: fluxo completo de descoberta de módulo até renderização na tela, decisões de arquitetura entre MySword nativo vs MyBible .SQLite3 vs e-Sword, integração com Jetpack Compose (BibleScreen, VerseText, ChapterLazyColumn), cache de capítulos com LruCache, prefetch de capítulos adjacentes para navegação fluida, padrões de ViewModel para leitura bíblica, estratégia de repositório (BibleRepository coordenando Room + Engine), e debugging de problemas comuns de produção. Use como ponto de entrada quando a tarefa envolve múltiplos formatos ou múltiplas camadas simultaneamente. Triggers: bible screen, verse rendering, chapter navigation, bible reader, bible repository, BibleViewModel, ChapterViewModel, renderizar versículo, navegar capítulo, selecionar tradução, múltiplas traduções, comparar bíblias, parallel view.
allowed-tools: Read, Glob, Grep, Bash
---

# MySword Specialist — Visão de Alto Nível e Orquestração

> **Este skill coordena:** `mysword-bible-engine`, `mybible-format`, `mysword-format-parser`,  
> `mysword-user-data`, `mysword-module-manager`, `android-bible-architecture`  
> **Use quando:** a tarefa cruza múltiplos formatos, múltiplas camadas, ou precisa de decisão arquitetural.

---

## 🗺️ Fluxo Completo: Arquivo no Storage → Verso na Tela

```
1. ModuleScanner (Dispatchers.IO)
   └── Detecta tipo e formato do arquivo
   └── Lê metadata (Details/INFO)
   └── Persiste ModuleEntity no Room

2. BibleRepository
   └── Recebe (filePath, book, chapter)
   └── Abre SQLiteDatabase read-only
   └── Query: SELECT verse, scripture, rowid FROM bible WHERE book=? AND chapter=? ORDER BY verse
   └── Fecha conexão imediatamente

3. BibleRenderPipeline (Dispatchers.Default — CPU-bound)
   └── VerseRulesProcessor.process() → scripture transformado
   └── GbfTagTokenizer.tokenize() → List<GbfToken>
   └── GbfTagParser.parse() → List<VerseSegment>
   └── Cache em LruCache<String, List<ParsedVerse>>

4. BibleAnnotatedStringBuilder (UI thread ou Dispatchers.Default)
   └── List<ParsedVerse> → AnnotatedString
   └── pushStringAnnotation para Strong's/notas/xrefs clicáveis

5. BibleScreen (Compose)
   └── LazyColumn com verseItems
   └── clickable AnnotatedString para popup de Strong's
   └── HighlightEntity sobreposto via SpanStyle(background)
   └── BookmarkEntity como ícone na margem
```

---

## ⚡ Padrão de ViewModel para Leitura Bíblica

```kotlin
class BibleReaderViewModel(
    private val repository: BibleRepository,
    private val highlightDao: HighlightDao,
    private val bookmarkDao: BookmarkDao,
    private val prefs: DataStore<Preferences>
) : ViewModel() {

    private val _uiState = MutableStateFlow<BibleReaderUiState>(BibleReaderUiState.Loading)
    val uiState: StateFlow<BibleReaderUiState> = _uiState.asStateFlow()

    // Pipeline de renderização — criado uma vez, reutilizado
    private var pipeline: BibleRenderPipeline? = null

    fun loadChapter(module: ModuleEntity, book: Int, chapter: Int) {
        viewModelScope.launch {
            _uiState.value = BibleReaderUiState.Loading
            try {
                val verses = withContext(Dispatchers.IO) {
                    repository.loadChapter(module.filePath, book, chapter)
                }
                val highlights = withContext(Dispatchers.IO) {
                    highlightDao.getChapterHighlightMap(book, chapter)
                }
                val bookmarks = withContext(Dispatchers.IO) {
                    bookmarkDao.getForChapter(book, chapter)
                }

                // Parsing em Dispatchers.Default (CPU, não IO)
                val parsed = withContext(Dispatchers.Default) {
                    val cacheKey = "${module.filePath}:$book:$chapter"
                    getPipeline(module).getOrParse(cacheKey, verses,
                        isNewTestament = book >= 40)
                }

                _uiState.value = BibleReaderUiState.Success(
                    module = module,
                    book = book, chapter = chapter,
                    verses = parsed,
                    highlights = highlights.associate { it.verse to it.color },
                    bookmarks = bookmarks.map { it.verse }.toSet()
                )

                // Prefetch adjacentes em background (não bloqueia nada)
                prefetchAdjacent(module, book, chapter)

            } catch (e: Exception) {
                if (e is CancellationException) throw e
                _uiState.value = BibleReaderUiState.Error(e.message ?: "Erro ao carregar capítulo")
            }
        }
    }

    private fun prefetchAdjacent(module: ModuleEntity, book: Int, chapter: Int) {
        viewModelScope.launch(Dispatchers.IO) {
            // Prefetch capítulo anterior e próximo em background
            val maxChapter = BibleBooks.getChapters(book)
            if (chapter > 1) {
                val key = "${module.filePath}:$book:${chapter - 1}"
                val verses = repository.loadChapter(module.filePath, book, chapter - 1)
                getPipeline(module).getOrParse(key, verses, book >= 40)
            }
            if (chapter < maxChapter) {
                val key = "${module.filePath}:$book:${chapter + 1}"
                val verses = repository.loadChapter(module.filePath, book, chapter + 1)
                getPipeline(module).getOrParse(key, verses, book >= 40)
            }
        }
    }

    private fun getPipeline(module: ModuleEntity): BibleRenderPipeline {
        return pipeline?.takeIf { it.moduleFilePath == module.filePath }
            ?: BibleRenderPipeline(
                moduleFilePath = module.filePath,
                rules = VerseRulesProcessor(module.verseRules),
                options = ParseOptions(
                    isMySwordFormat = module.format == ModuleFormat.MYSWORD,
                    isRightToLeft = module.isRightToLeft,
                    isInterlinear = module.isInterlinear
                )
            ).also { pipeline = it }
    }
}

sealed class BibleReaderUiState {
    object Loading : BibleReaderUiState()
    data class Success(
        val module: ModuleEntity,
        val book: Int, val chapter: Int,
        val verses: List<ParsedVerse>,
        val highlights: Map<Int, String>,  // verse → cssClass
        val bookmarks: Set<Int>            // verse numbers com bookmark
    ) : BibleReaderUiState()
    data class Error(val message: String) : BibleReaderUiState()
    object NoModulesInstalled : BibleReaderUiState()
}
```

---

## 🖼️ Padrão de BibleScreen (Compose)

```kotlin
@Composable
fun BibleScreen(
    viewModel: BibleReaderViewModel = koinViewModel(),
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is BibleReaderUiState.Loading          -> BibleLoadingContent()
        is BibleReaderUiState.Error            -> BibleErrorContent(state.message)
        is BibleReaderUiState.NoModulesInstalled -> NoModulesContent()
        is BibleReaderUiState.Success          -> BibleContent(
            state = state,
            onStrongsClick = viewModel::onStrongsClick,
            onVerseClick   = viewModel::onVerseClick,
            onHighlight    = viewModel::onHighlight,
            modifier       = modifier
        )
    }
}

@Composable
private fun BibleContent(
    state: BibleReaderUiState.Success,
    onStrongsClick: (Int, Boolean) -> Unit,  // (number, isHebrew)
    onVerseClick: (Int) -> Unit,
    onHighlight: (Int, HighlightColor?) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LocalBibleColors.current  // CompositionLocal com cores do tema

    LazyColumn(modifier = modifier) {
        items(
            items = state.verses,
            key = { it.verseNumber },
            contentType = { if (it.isChapterHeader) "header" else "verse" }
        ) { verse ->
            VerseItem(
                verse = verse,
                highlightColor = state.highlights[verse.verseNumber]
                    ?.let { HighlightColor.fromCssClassOrDefault(it) },
                hasBookmark = verse.verseNumber in state.bookmarks,
                annotatedString = remember(verse, colors) {
                    BibleAnnotatedStringBuilder.build(listOf(verse), colors)
                },
                onStrongsClick = onStrongsClick,
                onVerseClick   = { onVerseClick(verse.verseNumber) },
                onHighlight    = { color -> onHighlight(verse.verseNumber, color) }
            )
        }
    }
}
```

---

## 🔀 Decisão: MySword vs MyBible — Quando Usar Qual Engine

| Situação | Decisão | Razão |
|----------|---------|-------|
| Arquivo `.bbl.mybible` | MySword engine | Tabela `Bible`, GBF tags |
| Arquivo `.SQLite3` sem sufixo | MyBible engine | Tabela `verses`, tags HTML simples |
| Arquivo `.commentaries.SQLite3` | MyBible commentary engine | Tabela `commentaries` com `chapter_number_from` |
| Arquivo `.bblx` / `.bbli` | e-Sword adapter | Verificar Details; conteúdo pode ser RTF ou HTML |
| Arquivo `.cmt.mybible` | MySword Commentary engine | Tabela `Commentary` com `FromVerse`/`ToVerse` |

```kotlin
class BibleEngineFactory {
    fun create(module: ModuleEntity): BibleEngine = when (module.format) {
        ModuleFormat.MYSWORD              -> MyswordBibleEngine(module.filePath, module.verseRules)
        ModuleFormat.MYBIBLE_BIBLE        -> MyBibleBibleEngine(module.filePath)
        ModuleFormat.MYBIBLE_COMMENTARY   -> MyBibleCommentaryEngine(module.filePath)
        ModuleFormat.ESWORD_LEGACY,
        ModuleFormat.ESWORD_MODERN        -> ESwordBibleEngine(module.filePath, module.format)
        ModuleFormat.THEWORD              -> TheWordBibleEngine(module.filePath)
        else -> throw UnsupportedOperationException("Format ${module.format} not supported as Bible engine")
    }
}
```

---

## 🧩 Koin Module Completo (PlatformSwordKoinModule.kt)

```kotlin
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "bible_app.db")
            .addMigrations(MIGRATION_1_2, MIGRATION_2_3)
            .build()
    }
    single { get<AppDatabase>().moduleDao() }
    single { get<AppDatabase>().bookmarkDao() }
    single { get<AppDatabase>().highlightDao() }
    single { get<AppDatabase>().personalNoteDao() }
    single { get<AppDatabase>().verseListDao() }
}

val engineModule = module {
    single { BibleEngineFactory() }
    single { VerseRulesProcessorCache() }  // cache de VerseRulesProcessor por filePath
}

val repositoryModule = module {
    single { BibleRepository(get(), get()) }
    single { ModuleRepository(get(), get()) }
    single { UserDataRepository(get(), get(), get()) }
}

val scannerModule = module {
    single { ModuleScanner(androidContext(), get()) }
}

val viewModelModule = module {
    viewModel { BibleReaderViewModel(get(), get(), get(), get()) }
    viewModel { ModuleManagerViewModel(get()) }
    viewModel { StrongsViewModel(get()) }
    viewModel { SearchViewModel(get()) }
}
```

---

## 🐛 Problemas Comuns de Produção e Diagnóstico

| Problema | Diagnóstico | Solução |
|----------|------------|---------|
| Texto do versículo vazio | Módulo e-Sword RTF não interpretado | Verificar `module.format == ESWORD_LEGACY` |
| Strong's sem popup | `pushStringAnnotation` ausente ou `collectAnnotationsAt` errado | Conferir offset do tap no `PointerInputScope` |
| Capítulo lento (>300ms) | Regex compilado dentro de loop ou sem cache | Verificar `VerseRulesProcessor` e `LruCache` |
| Texto árabe invertido | `isRightToLeft` não propagado para `BasicText` | Passar `textDirection = TextDirection.Rtl` |
| Highlights não aparecem | `getChapterHighlightMap` retorna vazio | Verificar conversão de book_number se MyBible |
| Módulo MyBible sem Strong's | `strong_numbers_prefix` ignorado | Se Septuaginta: todos os `<S>` são Gregos |
| Crash ao trocar tradução | Pipeline não invalidado | `pipeline = null` ao mudar `module.filePath` |
| `settings.mybible` sobrescrito | Import feito com MySword aberto | Verificar se processo `com.riversoft.android.mysword` está ativo |
