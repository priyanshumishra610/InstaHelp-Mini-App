# Firebase Android (`google-services.json`)

## Local development

1. In [Firebase Console](https://console.firebase.google.com/) → Project settings → Your apps → Android, download **`google-services.json`**.
2. Place it at the **repo root**: `google-services.json` (same folder as `app.config.js`).
3. It must **match** `app.json` → `expo.android.package` (`com.priyanshum567.instahelp`).

Real files are **gitignored**. Use **`google-services.example.json`** as a shape reference only.

`app.config.js` will:

- Point Expo’s **`android.googleServicesFile`** at that file so **`expo prebuild`** / **`expo run:android`** copy it into **`android/app/`**.
- Fill **`EXPO_PUBLIC_FIREBASE_*`** for the JS Firebase SDK **when those variables are missing from `.env`**.

## EAS / CI builds

GitHub (and clones) often **won’t have** `google-services.json`.

- Add the file to the builder before prebuild **or**
- Mirror the Firebase keys in **EAS Environment variables** (`EXPO_PUBLIC_FIREBASE_*`) and ensure a **file secret** or pre-build step writes `google-services.json` to the project root.

If neither is present, Android native Firebase features may not behave correctly until the file exists on the machine used for **`eas build`**.

## Phone OTP: `billing not enabled`

Firebase **Phone Authentication (SMS)** requires the project to use the **pay-as-you-go Blaze** plan with a **Cloud Billing account** linked—even for low-volume testing.

1. Firebase Console → **Usage and billing** (or Google Cloud Console → Billing).
2. **Upgrade / link billing** so the Firebase project uses Blaze.
3. Wait a short time for propagation (sometimes up to a few hours).
4. You can reduce cost by adding **Authentication → Phone → Test phone numbers** for dev (no SMS for those).

Until billing is linked, OTP requests may fail with **`auth/billing-not-enabled`** or **`BILLING_NOT_ENABLED`** in the error details.
