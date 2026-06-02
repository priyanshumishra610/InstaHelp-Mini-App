const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

if (!admin.apps.length) {
  admin.initializeApp();
}

const FUNCTIONS_REGION =
  process.env.FUNCTION_REGION ||
  process.env.FIREBASE_FUNCTIONS_REGION ||
  "us-central1";

const TOKEN_URL = "https://oauth-account-noneu.truecaller.com/v1/token";
const USERINFO_URL = "https://oauth-account-noneu.truecaller.com/v1/userinfo";

function randomReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function coerceString(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return null;
}

function normalizeIndiaE164(input) {
  const raw = coerceString(input);
  if (!raw) {
    return null;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (raw.startsWith("+") && digits.length >= 10) {
    return `+${digits}`;
  }
  return null;
}

function buildDisplayName(record) {
  const given = coerceString(record.given_name);
  const family = coerceString(record.family_name);
  const combined = [given, family].filter(Boolean).join(" ").trim();
  if (combined) {
    return combined;
  }
  return coerceString(record.name) ?? "";
}

/**
 * Exchanges the SDK authorization code (PKCE) for an access token, then fetches userinfo.
 * Finally creates/updates Firebase Auth + Firestore using the verified phone number.
 */
exports.truecallerFinalize = onCall(
  { region: FUNCTIONS_REGION },
  async (request) => {
  const clientId = process.env.TRUECALLER_CLIENT_ID;
  if (!clientId) {
    throw new HttpsError(
      "failed-precondition",
      "Server missing TRUECALLER_CLIENT_ID. Set it as a Cloud Functions environment variable.",
    );
  }

  const authorizationCode = coerceString(request.data?.authorizationCode);
  const codeVerifier = coerceString(request.data?.codeVerifier);

  if (!authorizationCode || !codeVerifier) {
    throw new HttpsError("invalid-argument", "authorizationCode and codeVerifier are required");
  }

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: authorizationCode,
    code_verifier: codeVerifier,
  });

  const tokenResponse = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    throw new HttpsError(
      "unauthenticated",
      `Truecaller token exchange failed (${tokenResponse.status}): ${text}`,
    );
  }

  const tokenJson = await tokenResponse.json();
  const accessToken = coerceString(tokenJson.access_token);
  if (!accessToken) {
    throw new HttpsError("unauthenticated", "Truecaller token response missing access_token");
  }

  const profileResponse = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    const text = await profileResponse.text();
    throw new HttpsError(
      "unauthenticated",
      `Truecaller userinfo failed (${profileResponse.status}): ${text}`,
    );
  }

  const profile = await profileResponse.json();

  const phoneE164 = normalizeIndiaE164(
    profile.phone_number ?? profile.phoneNumber ?? profile.phone ?? profile.sub,
  );

  if (!phoneE164) {
    throw new HttpsError("failed-precondition", "Truecaller profile did not include a usable phone number");
  }

  const fullName = buildDisplayName(profile);
  const email = coerceString(profile.email);
  const picture = coerceString(profile.picture);

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByPhoneNumber(phoneE164);
  } catch {
    try {
      userRecord = await admin.auth().createUser({
        phoneNumber: phoneE164,
        displayName: fullName || undefined,
        photoURL: picture || undefined,
      });
    } catch (createErr) {
      if (createErr?.code === "auth/phone-number-already-exists") {
        userRecord = await admin.auth().getUserByPhoneNumber(phoneE164);
      } else {
        throw createErr;
      }
    }
  }

  const uid = userRecord.uid;

  if (fullName || picture) {
    await admin.auth().updateUser(uid, {
      displayName: fullName || userRecord.displayName,
      photoURL: picture || userRecord.photoURL,
    });
  }

  const db = admin.firestore();
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  const existing = snap.exists ? snap.data() ?? {} : {};

  const baseProfile = {
    uid,
    fullName: fullName || (typeof existing.fullName === "string" ? existing.fullName : "") || "",
    phoneNumber: phoneE164,
    profileImage: picture ?? existing.profileImage ?? null,
    email: email ?? existing.email ?? null,
    authProvider: "truecaller",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    await ref.set(
      {
        ...baseProfile,
        gender: "",
        city: "",
        area: "",
        coordinates: null,
        credits: 10,
        referralCode: randomReferralCode(),
        birthday: null,
        wishlist: [],
        addresses: [],
        savedServices: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    await ref.set(baseProfile, { merge: true });
  }

  const customToken = await admin.auth().createCustomToken(uid, {
    authProvider: "truecaller",
  });

  return {
    customToken,
    profile: {
      uid,
      phoneNumber: phoneE164,
      fullName: fullName || "",
      email,
      profileImage: picture,
    },
  };
});

