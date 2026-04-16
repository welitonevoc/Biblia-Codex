package expo.modules.kotlin.viewevent

import kotlin.reflect.KProperty

class EventDispatcher<T>(val name: String = "") {
    operator fun invoke(event: T) {}
    fun getValue(thisRef: Any, property: KProperty<*>): EventDispatcher<T> = this
}
