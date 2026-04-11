# Personal Data Stores

## What Is Officially Confirmed

The official MySword format article states that SQLite is also used for:

- settings
- bookmarks
- highlights
- personal notes

It explicitly says personal notes are structurally similar to Commentary, but also says the complete structures are not documented.

## Working Rule

Treat personal-data files as a separate family from content modules.

Do not reuse Bible/commentary import code blindly for:

- bookmarks
- highlights
- notes
- journals

## Recommended Process

1. Probe the SQLite file with `scripts/module_probe.py`.
2. Export:
   - table list
   - column list
   - row counts
   - first 3 sample rows per table
3. Identify:
   - reference keys
   - grouping keys
   - ordering columns
   - text payload columns
   - timestamps
4. Build a migration map before writing any Kotlin importer.

## Compatibility Caution

The user mentioned extensions and families such as:

- `.nm.bible`
- `.ct.bible`

These were not verified in the current official-source sweep. Treat them as candidate filenames that require live schema inspection, not as guaranteed canonical formats.

## Safe Design Pattern

- Read original personal-data SQLite into internal models
- Normalize references and timestamps
- Persist into app-owned Room entities
- Preserve source file untouched for re-import/debugging
