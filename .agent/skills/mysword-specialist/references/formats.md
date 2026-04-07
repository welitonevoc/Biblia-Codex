# Formats

## Module Families

Official MySword documentation identifies these content families:

- `bbl` = Bible
- `bok` = Book
- `cmt` = Commentary
- `dct` = Dictionary
- `jor` = Journal

The official article also states:

- Personal notes are SQLite-backed
- Personal notes are structurally similar to Commentary
- Bookmarks, highlights, and settings are also stored in SQLite-backed app data
- Full documentation for those personal-data stores is not provided

## `Details` Table

Inspect `Details` first. Important fields explicitly called out by the official article:

- `Abbreviation`
- `VersionDate`
- `Language`
- `RightToLeft`
- `OT`
- `NT`
- `Strong`
- `paragraphindent`
- `VerseRules`
- `wordnanc`
- `relativeorder`
- `CustomCSS`
- `readOnly`

Do not hardcode only these columns. Real modules may carry more fields. Probe the actual schema.

## GBF Tags

Official MySword GBF tags confirmed by the format page:

- `<CM>` paragraph end marker
- `<FI>...</Fi>` italic
- `<FO>...</Fo>` OT quote
- `<FR>...</Fr>` words of Jesus in red
- `<FU>...</Fu>` underline
- `<WG####>` Strong Greek
- `<WH####>` Strong Hebrew
- `<WT...>` morphology
- `<RF>...</Rf>` translator note
- `<RX...>` cross-reference
- `<TS>...</Ts>` title
- `<PF#>` first-line indent
- `<PI#>` indent

### Rendering Guidance

- Preserve source GBF in storage.
- Convert GBF to either:
  - structured tokens for Compose/native rendering
  - HTML for WebView-like rendering
- Keep Strong, morphology, note targets, and cross references as metadata, not only as rendered markup.

## Link Shapes

From local repo notes plus official docs:

- Bible references:
  - `b43.3.16`
  - `b43.3.16-18`
- Popup notes:
  - `rNotes`
- Dictionary, commentary, Strong, and morphology links are app-specific strings that should be normalized after parsing, not before.

When parsing `href`, remember:

- MySword may strip a leading `#`
- The href payload must remain valid HTML-escaped text

## Custom Styling

The official format page documents:

- `CustomCSS` in `Details`
- named color classes such as `red`, `orange`, `brown`, `green`, `blue`, `violet`, `purple`, `pink`, `gray`
- theme-relative color helpers such as:
  - `@darken(...)`
  - `@lighten(...)`
  - `@adjust(...)`
  - `@body`

For Android native rendering:

- parse style metadata separately from text
- map theme-relative colors to runtime theme tokens
- avoid flattening custom CSS too early

## MySword vs MyBible vs AndBible Packaging

### Officially verified

- AndBible MyBible integration expects `module.SQLite3`
- AndBible MySword integration expects `module.mybible`
- `ModDrv` in `mods.d/*.conf` selects backend family and type

### Practical rule

Keep three layers distinct:

1. Source module file naming
2. Source SQLite schema
3. Wrapper/package naming for target app

Do not assume that a file extension alone tells you the complete runtime semantics. Always inspect:

- filename
- `Details`
- table names
- sample rows

## Undocumented Personal Data

For bookmarks, highlights, notes, and journals:

- assume SQLite, but do not assume stable schema
- inspect with `scripts/module_probe.py`
- export row samples before writing migrators
- isolate user-generated content migration from scripture/commentary import logic
