package expo.modules.instahelptruecaller

import expo.modules.kotlin.Promise
import java.util.concurrent.atomic.AtomicReference

internal object TruecallerOAuthBridge {
  private val pending = AtomicReference<Promise?>(null)

  fun attach(promise: Promise): Boolean {
    return pending.compareAndSet(null, promise)
  }

  fun deliverSuccess(authorizationCode: String, codeVerifier: String, state: String) {
    val promise = pending.getAndSet(null) ?: return
    promise.resolve(
      mapOf(
        "kind" to "success",
        "authorizationCode" to authorizationCode,
        "codeVerifier" to codeVerifier,
        "state" to state,
      ),
    )
  }

  fun deliverUnavailable(reason: String) {
    val promise = pending.getAndSet(null) ?: return
    promise.resolve(
      mapOf(
        "kind" to "unavailable",
        "reason" to reason,
      ),
    )
  }

  fun deliverFailure(errorCode: String, message: String) {
    val promise = pending.getAndSet(null) ?: return
    promise.resolve(
      mapOf(
        "kind" to "failure",
        "errorCode" to errorCode,
        "message" to message,
      ),
    )
  }

  /** If the OAuth activity is dismissed without resolving the bridge yet. */
  fun cancelIfNeeded(message: String) {
    deliverFailure("CANCELLED", message)
  }
}
