package expo.modules.instahelptruecaller

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class InstahelpTruecallerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("InstahelpTruecaller")

    AsyncFunction("authorize") { promise: Promise ->
      val owner = appContext.currentActivity as? AppCompatActivity
      if (owner == null) {
        promise.resolve(
          mapOf(
            "kind" to "unavailable",
            "reason" to "no_activity",
          ),
        )
        return@AsyncFunction
      }

      if (!TruecallerOAuthBridge.attach(promise)) {
        promise.resolve(
          mapOf(
            "kind" to "failure",
            "errorCode" to "BUSY",
            "message" to "Truecaller OAuth is already in progress.",
          ),
        )
        return@AsyncFunction
      }

      val intent =
        Intent(owner, TruecallerOAuthHostActivity::class.java).apply {
          addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
        }

      owner.startActivity(intent)
    }
  }
}
