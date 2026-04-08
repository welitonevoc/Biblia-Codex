package com.codex.biblia.data

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = arrayOf(AIStudyCache::class, DictionaryEntry::class),
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun aiStudyCacheDao(): AIStudyCacheDao
    abstract fun dictionaryEntryDao(): DictionaryEntryDao
}
