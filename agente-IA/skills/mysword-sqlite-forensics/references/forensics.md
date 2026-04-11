# Forensics

## Safe Inspection Checklist

- Start with read-only inspection.
- Record filename, extension, source app/version, and filesystem location.
- Dump tables and columns before trying to interpret rows.
- Sample a few rows from every non-empty table.
- Compare multiple states when a table's purpose is unclear.

## Evidence First

Use this minimal evidence block for each database:

- probable family
- tables present
- columns per table
- row counts
- interesting indexes
- whether a `Details` table exists
- one to three sample rows per important table
- confidence level for each interpretation

## Practical Heuristics

- Content modules usually expose stable book/chapter/verse or article structures and often have a `Details` table.
- Personal-data stores often reveal intent only after behavioral diffs such as "bookmark added" or "highlight removed".
- File suffixes help, but they are not enough. Trust schema and diffs more than naming.

## Current Boundary Of Verified Knowledge

- Official MySword docs clearly document content-module families and SQLite storage.
- Official docs mention settings, bookmarks, highlights, and personal notes as SQLite-backed, but do not fully specify every table layout.
- Names such as `.nm.bible` and `.ct.bible` are useful leads from ecosystem discussion, but they still require live schema inspection before coding against them.

## When To Diff

Diff two databases when:

- table names are ambiguous
- columns are opaque numeric flags
- the same app feature may store data across multiple tables
- you need to distinguish cache data from user-authored data
