package expo.modules.instahelptruecaller

import android.content.Intent
import android.os.Bundle
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.truecaller.android.sdk.oAuth.CodeVerifierUtil
import com.truecaller.android.sdk.oAuth.TcOAuthCallback
import com.truecaller.android.sdk.oAuth.TcOAuthData
import com.truecaller.android.sdk.oAuth.TcOAuthError
import com.truecaller.android.sdk.oAuth.TcSdk
import com.truecaller.android.sdk.oAuth.TcSdkOptions
import java.util.UUID

/**
 * Hidden activity that initializes the official Truecaller OAuth SDK exactly as documented,
 * drives [ActivityResultLauncher] wiring, then hands the authorizationCode + verifier back to JS.
 *
 * Visible UI is rendered only by the Truecaller SDK (consent sheet), not InstaHelp.
 */
class TruecallerOAuthHostActivity : AppCompatActivity() {
  private lateinit var authorizationLauncher: ActivityResultLauncher<Intent>
  private lateinit var codeVerifier: String
  private lateinit var oauthStateRequested: String
  private var endedWithResult = false

  private val tcOAuthCallback: TcOAuthCallback =
    object : TcOAuthCallback {
      override fun onSuccess(oAuthData: TcOAuthData) {
        val authCode = oAuthData.authorizationCode?.trim().orEmpty()
        if (authCode.isEmpty()) {
          endOnceAndFinish(
            finalize = { TruecallerOAuthBridge.deliverFailure("INVALID_CODE", "Missing authorization code") },
          )
          return
        }
        endOnceAndFinish(
          finalize = {
            TruecallerOAuthBridge.deliverSuccess(
              authCode,
              codeVerifier,
              oAuthData.state?.trim().orEmpty(),
            )
          },
        )
      }

      override fun onFailure(oAuthError: TcOAuthError) {
        val code = runCatching { oAuthError.errorCode.toString() }.getOrDefault("UNKNOWN_ERROR")
        val message = runCatching { oAuthError.errorMessage }.getOrNull().orEmpty().ifBlank { "Truecaller OAuth failed" }
        endOnceAndFinish(
          finalize = { TruecallerOAuthBridge.deliverFailure(code, message) },
        )
      }

      override fun onVerificationRequired(tcOAuthError: TcOAuthError?) {
        // Truecaller not available or user chose non-TC path — fall back to sheet phone sign-in in JS.
        endOnceAndFinish(
          finalize = { TruecallerOAuthBridge.deliverUnavailable("verification_required") },
        )
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    authorizationLauncher =
      registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        try {
          TcSdk.getInstance().onActivityResultObtained(this, result.resultCode, result.data)
        } catch (_: Throwable) {
          endOnceAndFinish(finalize = { TruecallerOAuthBridge.deliverFailure("ACTIVITY_RESULT", "Unable to process Truecaller result") })
        }
      }

    Thread {
      try {
        TcSdk.clear()
        val options =
          TcSdkOptions.Builder(this@TruecallerOAuthHostActivity, tcOAuthCallback)
            .sdkOptions(TcSdkOptions.OPTION_VERIFY_ONLY_TC_USERS)
            .build()
        TcSdk.init(options)
        runOnUiThread { openOfficialConsentOrFinish() }
      } catch (e: Exception) {
        runOnUiThread {
          endOnceAndFinish(
            finalize = { TruecallerOAuthBridge.deliverFailure("INIT_EXCEPTION", e.message ?: "TcSdk.init failed") },
          )
        }
      }
    }.start()
  }

  private fun openOfficialConsentOrFinish() {
    try {
      if (!TcSdk.getInstance().isOAuthFlowUsable) {
        endOnceAndFinish(finalize = { TruecallerOAuthBridge.deliverUnavailable("oauth_not_usable") })
        return
      }

      codeVerifier = CodeVerifierUtil.generateRandomCodeVerifier()
      val challenge = CodeVerifierUtil.getCodeChallenge(codeVerifier)

      if (challenge.isNullOrEmpty()) {
        endOnceAndFinish(finalize = { TruecallerOAuthBridge.deliverUnavailable("code_challenge_null") })
        return
      }

      oauthStateRequested = UUID.randomUUID().toString()
      val tc = TcSdk.getInstance()

      tc.setOAuthState(oauthStateRequested)

      tc.setOAuthScopes(arrayOf("profile", "phone", "openid", "email"))
      tc.setCodeChallenge(challenge)

      tc.getAuthorizationCode(this, authorizationLauncher)
    } catch (e: Exception) {
      endOnceAndFinish(
        finalize = { TruecallerOAuthBridge.deliverFailure("LAUNCH_EXCEPTION", e.message ?: "Unable to launch Truecaller") },
      )
    }
  }

  private fun endOnceAndFinish(finalize: () -> Unit) {
    if (endedWithResult) {
      finish()
      return
    }
    endedWithResult = true
    finalize()
    finish()
    overridePendingTransition(0, 0)
  }

  override fun onDestroy() {
    super.onDestroy()
    if (!endedWithResult) {
      endOnceAndFinish(
        finalize = { TruecallerOAuthBridge.cancelIfNeeded("Host closed before completion") },
      )
    }
  }
}
