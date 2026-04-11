---
name: codex-module-parser
description: Web/JS module parsing rules for the Codex app. Loading SQLite blobs via sql.js, mapping GBF/HTML tags, Strongs and Morphology parsing. Triggers on read bible, import module, Parse verse tags, sql.js blobs, mySwordParser. 
---

# Biblia Codex - Module Parser

The Codex web app parses and visualizes theological modules (MySword, MyBible, and Devotionals) in standard HTML/React. Because it executes entirely in the JavaScript environment, special rules apply to how strings and binaries are handled.

## 🛠 Parsing Architecture

1. **Database Access with `sql.js` (WebAssembly)**
   - Modules are `.sqlite3` or `.mybible` binaries loaded as JSON/ArrayBuffers.
   - You must structure the loading using `sql.js` keeping in mind its entirely synchronous, memory-bound API. (Queries evaluate synchronously once initialized).
   - Blobs fetched via Capacitor APIs (`@capacitor/filesystem`) should be properly converted into `Uint8Array` before providing them to `SQL.Database()`.

2. **MySword Parser Configuration (`mySwordParser.ts`)**
   - **Performance:** JS Regular Expressions (`RegExp`) must be highly optimized since they run over thousands of verses.
   - **Text Filtering:** 
     - Basic styling: Replace `<FI>...<Fi>`, `<FU>...<Fu>` to standard HTML.
     - Words of Jesus: Replace `<FR>...<Fr>` / `<J>...<J>` according to user text display settings.
     - Strong's: `<WG...>` and `<WH...>` tags must be wrapped in `<a>` tags with classes `strongs-link`, allowing clicks to route properly internally.
     - Morphology & Interlinear: `<WT...>`, `<E>`, `<T>`, `<X>`, `<H>`, `<G>` tags should output spans utilizing custom Tailwind/CSS classes.
   - Settings Dependency: Before displaying verse tags, check visibility toggles from the client's `settings` objects (`showStrongs`, `morphTags`, `interlinearMode`).

3. **Storage & Serialization**
   - Persist massive parsed data into `idb` instead of `localStorage`.
   - Ensure you compress or serialize objects carefully (React markdown nodes or simple HTML strings).

## 🤝 Best Practices & Common Errors

- **Regex Undefined Replacements:** When substituting tags, ensure capture groups `$1` strictly exist. Handle MySword/MyBible variations separately (e.g. `<i>...</i>` vs `<FI>...<Fi>`) instead of catching them under one messy regex group.
- **Safety:** Always sanitize HTML when using React `dangerouslySetInnerHTML`. Ensure `mySwordParser` only returns safe native elements without malicious `<script>` tags, especially when importing third party modules.
