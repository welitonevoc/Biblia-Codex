package com.kerygma.biblia.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface AIStudyCacheDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(cache: AIStudyCache)

    @Query("SELECT * FROM ai_study_cache ORDER BY timestamp ASC LIMIT 1")
    suspend fun getOldest(): AIStudyCache?

    @Query("DELETE FROM ai_study_cache WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("SELECT COUNT(*) FROM ai_study_cache")
    suspend fun getCount(): Int

    @Query("SELECT * FROM ai_study_cache WHERE `query` = :query")
    suspend fun getByQuery(query: String): AIStudyCache?
}
