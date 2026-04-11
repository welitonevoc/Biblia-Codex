---
name: android-bible-architecture
description: Architecture patterns, layer rules, and project conventions for the Bible Android app. Use when adding new features, refactoring, designing new screens, or making architectural decisions. Covers Koin DI patterns, ViewModel conventions, Room schema rules, Gradle Kotlin DSL with version catalogs, and Compose navigation. Triggers on architecture, new feature, koin module, viewmodel, navigation, bible screen, bible module, module scanner.
allowed-tools: Read, Glob, Grep, Bash
---

# Android Bible App — Architecture Guide

> **Stack:** Kotlin · Jetpack Compose · Room · Koin · Coroutines/Flow · Gradle Kotlin DSL (Compile SDK 35)

---

## 🏗️ Layer Architecture

```
┌─────────────────────────────────────────────────┐
│          UI Layer (Jetpack Compose)              │
│  BibleScreen.kt, ModulePickerScreen.kt, etc.    │
│  State: collectAsStateWithLifecycle()           │
└────────────────────┬────────────────────────────┘
                     │ UiState (sealed/data class)
┌────────────────────▼────────────────────────────┐
│         ViewModel Layer                          │
│  BibleViewModel, ModuleViewModel, etc.          │
│  viewModelScope + StateFlow                     │
└────────────────────┬────────────────────────────┘
                     │ Domain Models (pure data)
┌────────────────────▼────────────────────────────┐
│         Repository Layer                         │
│  BibleRepository, ModuleRepository             │
│  Coordinates Room ↔ Engine                     │
└──────────┬──────────────────────┬───────────────┘
           │                      │
┌──────────▼──────────┐ ┌────────▼──────────────┐
│  Room (Installed    │ │  Engine Layer          │
│  Modules, Notes,   │ │  SimpleFileOffline     │
│  Bookmarks)        │ │  BibleEngine.kt        │
│  ModuleDao.kt      │ │  MySwordFormatParser   │
└─────────────────────┘ └───────────────────────┘
```

**Hard Rules:**
- No DAO calls directly in a `@Composable` — always via ViewModel
- No `Context` in ViewModel (use `AndroidViewModel` only if truly needed)
- No Compose imports in Repository or Engine
- Engine parsers have zero Android framework dependencies

---

## 📁 Project Structure Convention

```
app/
├── src/main/
│   ├── java/com/yourpackage/bible/
│   │   ├── data/
│   │   │   ├── db/
│   │   │   │   ├── AppDatabase.kt         Room database
│   │   │   │   ├── dao/ModuleDao.kt       DAO interfaces
│   │   │   │   └── entity/ModuleEntity.kt Entities
│   │   │   ├── engine/
│   │   │   │   ├── SimpleFileOfflineBibleEngine.kt
│   │   │   │   └── MySwordFormatParser.kt
│   │   │   └── repository/
│   │   │       ├── BibleRepository.kt
│   │   │       └── ModuleRepository.kt
│   │   ├── di/
│   │   │   └── PlatformSwordKoinModule.kt  All Koin modules
│   │   ├── ui/
│   │   │   ├── bible/
│   │   │   │   ├── BibleScreen.kt         Composable
│   │   │   │   └── BibleViewModel.kt      ViewModel
│   │   │   ├── modules/
│   │   │   │   ├── ModulePickerScreen.kt
│   │   │   │   └── ModuleViewModel.kt
│   │   │   └── theme/
│   │   │       ├── Color.kt
│   │   │       ├── Theme.kt
│   │   │       └── Type.kt
│   │   └── MainActivity.kt
│   └── res/
│       └── values/strings.xml             PT-BR strings
├── build.gradle.kts
└── ...

gradle/
└── libs.versions.toml                     ← Version catalog (single source of truth)
```

---

## 🔧 Koin DI Convention (PlatformSwordKoinModule.kt)

### Structure Rules:
```kotlin
// PlatformSwordKoinModule.kt
val databaseModule = module {
    single {
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "bible_app.db")
            .fallbackToDestructiveMigrationOnDowngrade()
            .build()
    }
    single { get<AppDatabase>().moduleDao() }
    single { get<AppDatabase>().bookmarkDao() }
}

val engineModule = module {
    // Engine is a factory — each call gets a fresh instance for a specific file
    factory { (filePath: String) -> SimpleFileOfflineBibleEngine(filePath) }
    // Parser is stateless — single instance is fine
    single { MySwordFormatParser() }
}

val repositoryModule = module {
    single { BibleRepository(get(), get()) }
    single { ModuleRepository(get(), get()) }
}

val viewModelModule = module {
    viewModel { BibleViewModel(get(), get()) }
    viewModel { (filePath: String) -> ModuleViewModel(get(), filePath) }
}

// Application.kt startKoin
startKoin {
    androidContext(this@App)
    modules(databaseModule, engineModule, repositoryModule, viewModelModule)
}
```

### Scope Decision Guide:
| Use `single { }` | Use `factory { }` | Use `viewModel { }` |
|-----------------|-------------------|---------------------|
| Room database | Per-file engine | Screen ViewModels |
| DAOs | Per-request objects | Scoped to nav entry |
| Repositories | Test fakes | |
| Format parser | | |

---

## 📊 Room Schema Rules

### Migrations (MANDATORY for production)
```kotlin
// AppDatabase.kt
@Database(
    entities = [ModuleEntity::class, BookmarkEntity::class, NoteEntity::class],
    version = 2,                          // Increment on schema change
    exportSchema = true                   // Required! Exports to /schemas/
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun moduleDao(): ModuleDao
}

// Companion object
companion object {
    val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(database: SupportSQLiteDatabase) {
            database.execSQL("ALTER TABLE modules ADD COLUMN language TEXT NOT NULL DEFAULT 'pt'")
        }
    }
}
```

**Schema export config in `build.gradle.kts`:**
```kotlin
ksp {
    arg("room.schemaLocation", "$projectDir/schemas")
}
```

---

## 🎨 Compose UI Conventions

### UiState Pattern (MANDATORY)
```kotlin
// For each screen, define a sealed class
sealed class BibleUiState {
    object Loading : BibleUiState()
    data class Success(
        val currentModule: ModuleEntity,
        val verses: List<ParsedVerse>,
        val currentBook: Int,
        val currentChapter: Int,
        val availableModules: List<ModuleEntity>
    ) : BibleUiState()
    data class Error(val message: String) : BibleUiState()
    object NoModulesInstalled : BibleUiState()
}
```

### Screen Anatomy (Standard Structure)
```kotlin
@Composable
fun BibleScreen(
    viewModel: BibleViewModel = koinViewModel(),
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is BibleUiState.Loading -> BibleLoadingContent()
        is BibleUiState.Success -> BibleContent(state, viewModel::onAction, modifier)
        is BibleUiState.Error -> BibleErrorContent(state.message)
        is BibleUiState.NoModulesInstalled -> NoModulesContent()
    }
}
```

### Bible Text Rendering
```kotlin
// Use AnnotatedString for rich text — avoid WebView
@Composable
fun VerseText(verse: ParsedVerse, fontSize: TextUnit = 16.sp) {
    val annotatedString = remember(verse) {
        buildAnnotatedString {
            verse.segments.forEach { segment ->
                when (segment) {
                    is TextSegment.Plain -> append(segment.text)
                    is TextSegment.Bold -> withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
                        append(segment.text)
                    }
                    is TextSegment.RedLetter -> withStyle(SpanStyle(color = Color.Red)) {
                        append(segment.text)
                    }
                    // ... etc
                }
            }
        }
    }
    Text(text = annotatedString, fontSize = fontSize)
}
```

---

## 📦 Gradle Version Catalog (libs.versions.toml)

### How to Add a New Library:
```toml
# Step 1: Add version in [versions]
[versions]
room = "2.6.1"
koin = "3.5.3"
compose-bom = "2024.02.00"

# Step 2: Add library in [libraries]
[libraries]
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-ksp = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
koin-android = { group = "io.insert-koin", name = "koin-android", version.ref = "koin" }
koin-compose = { group = "io.insert-koin", name = "koin-androidx-compose", version.ref = "koin" }

# Step 3: Reference in build.gradle.kts
[plugins]
ksp = { id = "com.google.devtools.ksp", version = "1.9.22-1.0.17" }
```

```kotlin
// build.gradle.kts (app)
dependencies {
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.ksp)
    implementation(libs.koin.android)
    implementation(libs.koin.compose)
}
```

**Rule:** Never use a version string directly in `build.gradle.kts`. Always add to catalog first.

---

## 🔗 Compose Navigation Setup

```kotlin
// NavGraph.kt
@Composable
fun BibleNavGraph(navController: NavHostController) {
    NavHost(navController, startDestination = "bible") {
        composable("bible") {
            BibleScreen()
        }
        composable(
            route = "modules",
            enterTransition = { slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Up) },
            exitTransition = { slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Down) }
        ) {
            ModulePickerScreen(onModuleSelected = { navController.popBackStack() })
        }
        composable("search") { SearchScreen() }
    }
}
```

---

## ✅ Feature Addition Checklist

When adding a new feature (e.g., Bookmarks, Notes, Daily Verse):

- [ ] **Entity**: New `@Entity` class with `@PrimaryKey`
- [ ] **DAO**: Interface with `Flow<>` for observations, `suspend` for writes
- [ ] **Database**: Register entity in `@Database(entities = [...])`, increment version, add `Migration`
- [ ] **Repository**: New repository class, inject DAO via Koin
- [ ] **Koin Module**: Register in appropriate Koin module (single/factory/viewModel)
- [ ] **ViewModel**: New ViewModel with `StateFlow<UiState>`, use `viewModelScope`
- [ ] **UiState**: Sealed class covering Loading/Success/Error
- [ ] **Screen**: `@Composable` using `collectAsStateWithLifecycle()`
- [ ] **Navigation**: Route added to `NavGraph`
- [ ] **Strings**: PT-BR strings in `strings.xml` (no hardcoded text)
- [ ] **Build**: `./gradlew assembleDebug` passes
