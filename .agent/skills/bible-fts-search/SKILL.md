# bible-fts-search

## Overview
Full-text search capability for Bible applications with advanced features like Porter stemming, relevance ranking, and search result highlighting. Integrates with SQLite FTS5 for high-performance text search across Bible verses, notes, bookmarks, and user data.

## Core Features

### Search Engine Implementation
- **SQLite FTS5 Integration**: Virtual tables for Bible text, notes, bookmarks
- **Porter Stemmer**: English language stemming for better search results
- **Relevance Ranking**: BM25 algorithm for scoring search results
- **Search Highlighting**: Highlight matched terms in results
- **Multi-language Support**: UTF-8 encoding for international Bibles

### Search Types
- **Verse Search**: Full-text search within Bible verses
- **Cross-reference Search**: Search in reference data
- **Notes Search**: Full-text search in user notes
- **Bookmarks Search**: Search within bookmark labels and notes
- **Combined Search**: Unified search across all content types

### Advanced Features
- **Wildcard Search**: * and ? wildcards support
- **Phrase Search**: Exact phrase matching with quotes
- **Boolean Operators**: AND, OR, NOT logic
- **Proximity Search**: NEAR operator for word proximity
- **Case-insensitive Search**: Automatic case folding

## Implementation Guide

### Database Schema
```sql
-- Bible text FTS table
CREATE VIRTUAL TABLE bible_fts USING fts5(
    book_id, chapter, verse, text,
    content=bible_verses,
    content_rowid=rowid
);

-- Notes FTS table
CREATE VIRTUAL TABLE notes_fts USING fts5(
    verse_reference, note_text,
    content=notes,
    content_rowid=rowid
);

-- Bookmarks FTS table
CREATE VIRTUAL TABLE bookmarks_fts USING fts5(
    verse_reference, label, color,
    content=bookmarks,
    content_rowid=rowid
);
```

### Room Integration
```kotlin
@Dao
interface BibleSearchDao {
    @Query("""
        SELECT b.*, highlight(bible_fts, 3, '<mark>', '</mark>') as highlighted_text,
               bm25(bible_fts) as relevance_score
        FROM bible_fts
        WHERE bible_fts MATCH :query
        ORDER BY relevance_score
        LIMIT :limit
    """)
    fun searchVerses(query: String, limit: Int): List<SearchResult>

    @Query("SELECT * FROM bible_fts WHERE rowid = :rowid")
    fun getVerseByRowId(rowid: Long): VerseEntity
}
```

### Search Query Processing
```kotlin
class BibleSearchEngine(private val dao: BibleSearchDao) {

    fun search(query: String, limit: Int = 50): List<SearchResult> {
        val processedQuery = processSearchQuery(query)
        return dao.searchVerses(processedQuery, limit)
    }

    private fun processSearchQuery(rawQuery: String): String {
        return rawQuery
            .lowercase()
            .trim()
            .replace(Regex("\\s+"), " ") // normalize spaces
            .let { if (it.contains(" ")) "\"$it\"" else it } // phrase search
    }
}
```

### Performance Optimization
- **Index Maintenance**: Regular FTS index rebuilding
- **Query Caching**: LRU cache for frequent searches
- **Pagination**: Implement cursor-based pagination
- **Background Indexing**: Async index updates for new content

### UI Integration
- **Search Suggestions**: Autocomplete based on popular searches
- **Search History**: Persistent search history with recent/clear options
- **Filter Options**: Filter by book, testament, or content type
- **Result Previews**: Truncated text with highlighted matches

## Dependencies
- SQLite FTS5 extension
- Room database library
- Kotlin coroutines for async search

## Testing
- Unit tests for query processing
- Integration tests with Room database
- Performance tests with large Bible datasets
- UI tests for search interface
