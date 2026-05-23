export function mapFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string"
      ? (error as { code: string }).code
      : "";

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: string }).message === "string"
      ? (error as { message: string }).message
      : "";

  const lowerMsg = message.toLowerCase();

  switch (code) {
    case "auth/billing-not-enabled":
      return "Firebase Phone Auth needs billing: link a Cloud Billing account to this Firebase project (Blaze plan). SMS stays within free quotas for testing.";
    case "auth/invalid-phone-number":
      return "Invalid mobile number. Check and try again.";
    case "auth/missing-phone-number":
      return "Enter your mobile number.";
    case "auth/invalid-verification-code":
      return "Incorrect OTP. Please try again.";
    case "auth/code-expired":
      return "OTP expired. Tap Resend to get a new code.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and retry.";
    case "auth/captcha-check-failed":
    case "auth/missing-verification-code":
      return "Verification failed. Please request OTP again.";
    case "auth/session-expired":
      return "Session expired. Request a new OTP.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/operation-not-allowed":
      return "Phone sign-in is not enabled for this project.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded. Try again later.";
    default:
      if (
        lowerMsg.includes("billing_not_enabled") ||
        lowerMsg.includes("billing not enabled")
      ) {
        return "Firebase Phone Auth needs billing: link a Cloud Billing account in Firebase/Google Cloud Console (upgrade to Blaze). You only pay beyond free SMS quotas.";
      }
      if (message.includes("timeout") || message.includes("Timeout")) {
        return "Request timed out. Please try again.";
      }
      return message || "Something went wrong. Please try again.";
  }
}
