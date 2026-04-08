package com.kerygma.biblia.di

import androidx.room.Room
import com.kerygma.biblia.data.AppDatabase
import com.kerygma.biblia.service.DictionaryService
import com.kerygma.biblia.service.GeminiAISearchService
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val appModule = module {
    single { 
        Room.databaseBuilder(androidContext(), AppDatabase::class.java, "biblia-db")
            .fallbackToDestructiveMigration()
            .build() 
    }
    
    single { get<AppDatabase>().aiStudyCacheDao() }
    single { get<AppDatabase>().dictionaryEntryDao() }
    
    // TODO: Mover API Key para local.properties ou BuildConfig
    single { GeminiAISearchService(apiKey = "YOUR_API_KEY") }
    
    single { DictionaryService(get(), get(), get()) }
}
