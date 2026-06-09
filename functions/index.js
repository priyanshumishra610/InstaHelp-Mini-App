const { onCall, HttpsError } = require("firebase-functions/v2/https");

/**
 * Placeholder to keep Firebase Functions deploys healthy.
 * Add real callables/triggers here when needed.
 */
exports.health = onCall(async () => {
  throw new HttpsError("unimplemented", "No Firebase Functions are configured for this project.");
});

