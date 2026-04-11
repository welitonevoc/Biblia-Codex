# Android Stack Integration

## Your Current Stack

This repo is a modern Android modular codebase built around:

- Gradle Kotlin DSL (`build.gradle.kts`, `libs.versions.toml`)
- Kotlin
- Coroutines and Flow
- Koin
- Jetpack Compose
- Room and SQLite
- modular structure:
  - `platform-core`
  - `platform-sword`
  - `platform-reader`
  - `platform-ui`

## Recommended Placement

### `platform-sword`

Put here:

- external module file detection
- SQLite schema probes
- MySword/MyBible importers
- raw SQLite readers
- GBF parsers
- link parsers
- metadata extraction
- versification adapters

### `platform-core`

Put here:

- shared models like `OfflinePassageToken`
- repository interfaces
- common storage abstractions
- DTOs for module metadata
- app-owned database entities and DAOs

### `platform-reader`

Put here:

- rendering adapters
- HTML/token to Compose presentation
- reader state and navigation
- note/highlight/bookmark interactions

### `platform-ui`

Put here:

- generic composables only
- no MySword parsing logic

## Implementation Defaults

- Use raw `android.database.sqlite` or `SQLiteDatabase` for third-party SQLite files.
- Use Room only for your own persisted indexes, imports, caches, and catalogs.
- Keep importers stateless where possible; inject collaborators through Koin.
- Run all module scans and SQL reads on `Dispatchers.IO`.
- Expose scan/import progress as `StateFlow`.

## Parser Strategy

Prefer a staged parser:

1. Tokenize tags and text
2. Maintain formatting state
3. Attach Strong/morph/link metadata
4. Produce either:
   - `OfflinePassageToken`
   - HTML fragments
   - richer AST if the rendering logic grows

Avoid one-shot regex replacements for everything. Use them only for well-bounded tag extraction.

## Test Strategy

Maintain a fixture corpus covering:

- plain Bible verse
- verse with nested formatting
- verse with Strong and morphology tags
- verse with note and cross-reference tags
- commentary entry
- dictionary entry
- journal/note sample
- RTL language sample

Test layers separately:

- schema detection
- metadata extraction
- GBF tokenization
- HTML rendering
- importer registration into app catalogs

## Architecture Boundary Rule

Do not let `platform-reader` talk directly to raw SQLite module files. Route through `platform-sword` and repository interfaces in `platform-core`.
