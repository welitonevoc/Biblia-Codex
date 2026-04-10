package com.codex.biblia

import android.app.Application
import com.codex.biblia.di.appModule
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        val app = this
        startKoin {
            androidContext(app)
            modules(appModule)
        }
    }
}
