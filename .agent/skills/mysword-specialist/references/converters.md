# Converters And Repo Mining

## Best Repositories Found In This Sweep

### BibleMultiConverter

Repo:
- https://github.com/schierlm/BibleMultiConverter

Why it matters:

- Explicit support for MyBible.Zone import/export
- Explicit support for MySword import/export
- Explicit support for SWORD-related formats
- Explicit support for Obsidian export
- Useful as a format bridge between OSIS/USFM/Paratext/MyBible/MySword/e-Sword

Use it when:

- You need conversion logic rather than UI behavior
- You need versification-aware transforms
- You need a baseline for schema expectations and cross-format mapping

### AndBible wiki

Pages:

- https://github.com/AndBible/and-bible/wiki/MySword-module-support
- https://github.com/AndBible/and-bible/wiki/MyBible-module-support

Why it matters:

- Shows how a modern Android Bible app wraps MySword/MyBible into a SWORD-like packaging model
- Gives canonical file names and `ModDrv` values

### UniqueBible

Repo:
- https://github.com/eliranwong/UniqueBible

Why it matters:

- Broad cross-platform offline Bible app
- Good reference for feature surface, resource handling, and interoperability goals

### My Bible Obsidian plugin

Repo:
- https://github.com/GsLogiMaker/my-bible-obsidian-plugin

Why it matters:

- Useful for markdown-centric scripture note workflows
- Good reference for chapter-note generation, verse linking, and vault integration

## Search Strategy

When GitHub search results are noisy, use exact queries like:

```text
site:github.com "MySword" sqlite converter
site:github.com "MyBible" sqlite parser
site:github.com "MySword" bookmark sqlite
site:github.com "MySword" journal sqlite
site:github.com "module.SQLite3" "MyBibleBible"
site:github.com "module.mybible" "MySwordBible"
```

Also check topic pages:

- https://github.com/topics/mybible
- https://github.com/topics/sword

## What To Extract From Converter Repos

Mine these areas first:

- filename and extension handling
- versification mapping
- SQLite schema creation
- `Details` read/write logic
- Bible text storage layout
- commentary and dictionary row layout
- note/bookmark export assumptions
- HTML and formatting normalization

## Practical Guidance

- Prefer maintained converter repos over abandoned one-off scripts.
- If exact repo names from user prompts are not found, document that and switch to broader maintained converters.
- When a repo is an application instead of a library, mine:
  - importers
  - schema probes
  - parser utilities
  - migration scripts
  - test fixtures
