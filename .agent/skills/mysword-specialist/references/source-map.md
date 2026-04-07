# Source Map

## Primary Sources

- Official MySword format article:
  - https://www.mysword.info/modules-format
- AndBible experimental MySword support:
  - https://github.com/AndBible/and-bible/wiki/MySword-module-support
- AndBible experimental MyBible support:
  - https://github.com/AndBible/and-bible/wiki/MyBible-module-support
- MyBible module catalog:
  - https://mybible.zone/
- MySword main site:
  - https://mysword.info/

## Ecosystem Repositories

- BibleMultiConverter:
  - https://github.com/schierlm/BibleMultiConverter
- UniqueBible:
  - https://github.com/eliranwong/UniqueBible
- My Bible Obsidian plugin:
  - https://github.com/GsLogiMaker/my-bible-obsidian-plugin
- GitHub topic: `mybible`
  - https://github.com/topics/mybible
- GitHub topic: `sword`
  - https://github.com/topics/sword

## Verified Findings

### MySword official format page

- MySword uses SQLite-backed modules.
- Content module families are identified by the three-letter segment before the final module extension:
  - `bbl`
  - `bok`
  - `cmt`
  - `dct`
  - `jor`
- Personal notes are also SQLite-backed; the official article says they are structurally similar to Commentary, but not fully documented.
- `Details` is the core metadata table and is the first place to inspect for module identity.
- Verse content is HTML plus MySword-specific GBF tags.

### AndBible compatibility pages

- AndBible treats both MySword and MyBible support as experimental.
- MyBible support starts from build `4.0.640`; MySword support starts from `4.0.678`.
- For "Sword-like" packaged modules, AndBible expects:
  - a config in `mods.d/*.conf`
  - `ModDrv` values like `MyBibleBible`, `MyBibleCommentary`, `MyBibleDictionary`
  - or `MySwordBible`, `MySwordCommentary`, `MySwordDictionary`
  - a canonical file name such as `module.SQLite3` or `module.mybible` inside the module folder

### Converter/tooling landscape

- `BibleMultiConverter` is the most useful maintained converter repo found in this sweep.
- Its README explicitly lists:
  - MyBible.Zone import/export
  - MySword import/export
  - SWORD-related formats
  - Obsidian export
  - e-Sword export
- The `mybible` and `sword` topic pages surface useful adjacent repos, but most are consumer apps, not low-level format libraries.

### Adjacent apps worth mining

- `UniqueBible` is useful for feature parity and UX ideas across offline Bible workflows.
- `my-bible-obsidian-plugin` is useful for note graphing, chapter note generation, and markdown integration patterns.

## Important Inference

The exact GitHub repo names requested by the user:

- `mysword-tools`
- `biblical-data-conversion`
- `python-mysword-parser`

did not surface as obvious maintained repositories in this scan. Use broader ecosystem repos and topic pages instead, especially `BibleMultiConverter`, the AndBible wiki, and targeted GitHub searches around `MySword`, `MyBible`, `SQLite`, `converter`, `parser`, `bookmark`, and `journal`.
