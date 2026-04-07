package com.kerygma.biblia.data

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [AIStudyCache::class, DictionaryEntry::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun aiStudyCacheDao(): AIStudyCacheDao
    abstract fun dictionaryEntryDao(): DictionaryEntryDao
}
