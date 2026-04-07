package com.kerygma.biblia.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "dictionary_entries",
    indices = [Index(value = ["title"])]
)
data class DictionaryEntry(
    @PrimaryKey val id: String,
    val title: String,
    val definition: String,
    val source: String
)
