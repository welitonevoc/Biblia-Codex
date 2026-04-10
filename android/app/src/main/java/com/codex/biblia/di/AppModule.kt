package com.codex.biblia.di

import android.content.Context
import androidx.room.Room
import com.codex.biblia.data.AppDatabase
import com.codex.biblia.service.DictionaryService
import com.codex.biblia.service.GeminiAISearchService
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val appModule = module {
    // Usando função auxiliar para evitar bug de análise do compilador K2
    single { provideDatabase(androidContext()) }
    
    single { get<AppDatabase>().aiStudyCacheDao() }
    single { get<AppDatabase>().dictionaryEntryDao() }
    
    // TODO: Mover API Key para local.properties ou BuildConfig
    single { GeminiAISearchService(apiKey = "YOUR_API_KEY") }
    
    single { DictionaryService(get(), get(), get()) }
}

fun provideDatabase(context: Context): AppDatabase {
    return Room.databaseBuilder(context, AppDatabase::class.java, "biblia-db")
        .fallbackToDestructiveMigration(dropAllTables = true)
        .build()
}
