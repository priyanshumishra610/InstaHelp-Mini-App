# Truecaller OAuth on Android

InstaHelp uses the **official** Truecaller OAuth Android SDK (**`com.truecaller.android.sdk:truecaller-sdk:3.2.1`**) packaged in the local Expo module **`modules/instahelp-truecaller`**.

The SDK presents its own consent / login UI exactly as shipped by Truecaller. InstaHelp’s phone screen is unchanged visually; tapping **Send OTP** first asks Truecaller when it is configured and available.

## Prerequisites

1. **Expo Dev Client / EAS Build** — the SDK is native and does not run in Expo Go.
2. A **Truecaller OAuth client ID** created in  
   [`https://sdk-console-noneu.truecaller.com/`](https://sdk-console-noneu.truecaller.com/)  
   scoped to scopes such as **`profile`**, **`phone`**, **`openid`**, **`email`** (matching the native flow).
3. **Firebase Callable** **`truecallerFinalize`** deployed from `functions/` (see below).
4. Set **`TRUECALLER_CLIENT_ID`** as a runtime environment variable on the Callable (same ID as baked into Android).

### App configuration

Fill in `.env` (never commit secrets):

```
EXPO_PUBLIC_TRUECALLER_CLIENT_ID=YOUR_TRUECALLER_OAUTH_CLIENT_ID
EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION=us-central1   # Must match Callable region
```

`app.config.js` copies **`EXPO_PUBLIC_TRUECALLER_CLIENT_ID`** into `extra.truecallerAndroidClientId` plus `extra.publicEnv`, and `./plugins/withTruecallerAndroid.js` writes:

- `<meta-data android:name="com.truecaller.android.sdk.ClientId" .../>`
- Package visibility `<queries><package android:name="com.truecaller"/></queries>`
- `MainActivity android:launchMode="singleTask"` (Truecaller OAuth guidance)

## Firebase Callable

Inside `functions/index.js`:

- Exchanges the PKCE **`authorization_code`** at  
  **`https://oauth-account-noneu.truecaller.com/v1/token`**
- Reads profile from **`https://oauth-account-noneu.truecaller.com/v1/userinfo`**
- Upserts **`users/{uid}`** (`authProvider: "truecaller"`, timestamps, referrals, credits, etc.)
- Returns a **Firebase Auth custom token** for the Expo client (`signInWithCustomToken`)

### Deploy checklist

```
cd functions
npm install

# Set BOTH environment variables before deploy (GCP console or Firebase CLI equivalents)
firebase functions:config:set   # Deprecated path — prefer GCP env vars UI
TRUECALLER_CLIENT_ID=...
FUNCTION_REGION=us-central1       # Overrides default region if desired

firebase deploy --only functions:truecallerFinalize
```

Alternatively set **`TRUECALLER_CLIENT_ID`** under **Functions → Configuration → Environment variables** in Google Cloud Console. Keep the region aligned with **`EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION`**.

### Why a Callable?

Truecaller OAuth still needs Firebase **custom tokens**, which **must be minted with the Admin SDK** on trusted infrastructure per Firebase security rules — the Callable is the smallest production‑grade bridge.

## User flow recap

```
InstaHelp phone UI (unchanged)
  └─► Android & client id configured
        ├─ Truecaller SDK OAuth host activity (official UI)
             ├ success → Firebase custom token (`truecallerFinalize`) → persisted session + Firestore merge
             ├ unavailable / dismissed / infra error → silently fall back …
        └► Firebase Phone OTP (`Send OTP`) path unchanged
```

iOS skips Truecaller entirely and uses OTP only until Truecaller publishes an acceptable iOS counterpart.
