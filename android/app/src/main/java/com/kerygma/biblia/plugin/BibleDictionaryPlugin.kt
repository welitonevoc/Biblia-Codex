package com.kerygma.biblia.plugin

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.kerygma.biblia.service.DictionaryService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

@CapacitorPlugin(name = "BibleDictionary")
class BibleDictionaryPlugin : Plugin(), KoinComponent {
    private val dictionaryService: DictionaryService by inject()

    @PluginMethod
    fun getDefinition(call: PluginCall) {
        val query = call.getString("query")
        val useAI = call.getBoolean("useAI", false) ?: false

        if (query == null) {
            call.reject("Must provide query")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = dictionaryService.getDefinition(query, useAI)
                val ret = JSObject()
                ret.put("definition", result)
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject(e.localizedMessage)
            }
        }
    }
}
