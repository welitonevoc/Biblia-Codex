package com.codex.biblia.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface DictionaryEntryDao {
    @Query("SELECT * FROM dictionary_entries WHERE title LIKE :query LIMIT 1")
    suspend fun findByTitle(query: String): DictionaryEntry?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: DictionaryEntry)

    @Query("SELECT COUNT(*) FROM dictionary_entries")
    suspend fun getCount(): Int
}
