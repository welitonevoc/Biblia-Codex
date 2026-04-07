# Conversion Matrix

## Common Source And Target Families

- MySword SQLite modules
- MyBible SQLite modules
- SWORD modules packaged for AndBible
- App-specific exports or intermediate JSON/CSV/TSV
- Obsidian-oriented markdown exports

## Verified Compatibility Signals

- MySword and MyBible both use SQLite-backed module storage for core content families.
- AndBible support for MySword/MyBible is package-oriented and driven by `mods.d/*.conf` metadata with format-specific `ModDrv` values.
- Converter projects in the ecosystem often use a neutral internal model before emitting target-specific packages.

## Preserve First

- module identity and language
- testament/book/chapter/verse or article coordinates
- formatting semantics
- Strong numbers and morphology tags
- cross references and footnotes
- publisher/source metadata

## Typical Loss Zones

- app-specific CSS or rendering quirks
- undocumented personal-data tables
- target-specific navigation metadata
- exact styling fidelity when moving between GBF, HTML, and markdown-like targets

## Repo Mining Priorities

- `schierlm/BibleMultiConverter` for explicit format coverage and conversion patterns
- `AndBible/and-bible` wiki pages for package expectations
- `GsLogiMaker/my-bible-obsidian-plugin` for MyBible-focused extraction ideas
- `eliranwong/UniqueBible` for ecosystem behavior and module usage patterns

## Recommended Conversion Strategy

1. Probe the source module.
2. Build a canonical content model.
3. Keep metadata separate from rendered output.
4. Generate the target file and target packaging metadata.
5. Validate in the target app or with golden fixtures.
