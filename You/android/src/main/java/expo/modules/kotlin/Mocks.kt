package expo.modules.kotlin.modules

import androidx.compose.runtime.Composable

open class Module {
    open fun definition(): ModuleDefinition = ModuleDefinition()
    val appContext: Any = Any()
}

class ModuleDefinitionData

class ModuleDefinition(val data: ModuleDefinitionData = ModuleDefinitionData())

fun ModuleDefinition(block: ModuleDefinitionBuilder.() -> Unit): ModuleDefinition = ModuleDefinition()

class ModuleDefinitionBuilder {
    fun Name(name: String) {}
    fun View(name: String, block: (props: Any) -> Unit) {}
    fun View(name: String, events: () -> Unit, block: (props: Any) -> Unit) {}
    fun View(viewType: kotlin.reflect.KClass<*>, block: ViewDefinitionBuilder.() -> Unit) {}
    fun Events(vararg names: String) {}
    fun AsyncFunction(name: String, block: suspend () -> Any) {}
    fun Function(name: String, block: () -> Any) {}
}

class ViewDefinitionBuilder {
    fun Events(vararg names: String) {}
    fun Prop(name: String, block: (view: Any, value: Any) -> Unit) {}
}

package expo.modules.kotlin.viewevent

import kotlin.reflect.KProperty

class EventDispatcher<T>(val name: String = "") {
    operator fun invoke(event: T) {}
    operator fun getValue(thisRef: Any, property: KProperty<*>): EventDispatcher<T> = this
}

package expo.modules.kotlin.records

interface Record

annotation class Field
