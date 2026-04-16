package expo.modules.kotlin.functions

object Coroutine {
    operator fun invoke(block: suspend (Any?) -> Any?): (Any?) -> Any? {
        return { block }
    }
}
