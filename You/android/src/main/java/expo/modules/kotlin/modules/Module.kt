package expo.modules.kotlin.modules

import androidx.compose.runtime.Composable

open class Module {
    open fun definition(): ModuleDefinition = ModuleDefinition()
    val appContext: AppContextMock = AppContextMock()
}

class AppContextMock {
    val reactContext: Any? = null
}

class ModuleDefinitionData

class ModuleDefinition(val data: ModuleDefinitionData = ModuleDefinitionData())

fun ModuleDefinition(block: ModuleDefinitionBuilder.() -> Unit): ModuleDefinition = ModuleDefinition()

class ModuleDefinitionBuilder {
    fun Name(name: String) {}
    fun View(name: String, block: @Composable (props: Any) -> Unit) {}
    fun View(name: String, events: () -> Unit, block: @Composable (props: Any) -> Unit) {}
    fun View(viewType: kotlin.reflect.KClass<*>, block: ViewDefinitionBuilder.() -> Unit) {}
    fun Events(vararg names: String) {}
    fun AsyncFunction(name: String, block: suspend () -> Any) {}
    fun Function(name: String, block: () -> Any) {}
}

class ViewDefinitionBuilder {
    fun Events(vararg names: String) {}
    fun Prop(name: String, block: (view: Any, value: Any) -> Unit) {}
}
