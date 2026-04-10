package com.codex.biblia.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "ai_study_cache",
    indices = [Index(value = ["query"])]
)
data class AIStudyCache(
    @PrimaryKey val id: String,
    val query: String,
    val explanation: String,
    val timestamp: Long
)
