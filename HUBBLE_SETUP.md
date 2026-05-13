# Hubble Gift Card SDK (InstaHelp®)

This app embeds the official Hubble React Native flow using a `WebView` pointed at `https://sdk.myhubble.money/` (production) or `https://sdk.dev.myhubble.money/` (development), with `wrap-plt=rn`, matching the Hubble React Native guide.

## Environment variables (EAS / local `.env`)

Set these as **Expo public** env vars (they are bundled into the client). **Never commit real secrets** to git (this repo gitignores `.env`; use EAS for cloud builds).

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_HUBBLE_CLIENT_ID` | Yes | Issued by Hubble |
| `EXPO_PUBLIC_HUBBLE_APP_SECRET` | Yes | Issued by Hubble |
| `EXPO_PUBLIC_HUBBLE_ENV` | No | `development` uses the dev SDK host; anything else uses production |
| `EXPO_PUBLIC_HUBBLE_ANALYTICS_LOG` | No | Set to `1` to print analytics events to the console in dev |
| `EXPO_PUBLIC_HUBBLE_DEMO_BRAND_IDS` | No | Comma-separated Hubble `brandId` values for demo tiles |
| `EXPO_PUBLIC_HUBBLE_USER_JWT` | No | **Hubble Partner JWT only** (three segments, two dots). InstaHelp’s `sessionToken` is **not** sent to Hubble. Use this only if Hubble gave you a JWT flow; otherwise omit for lazy login. |

### Production APK / AAB (EAS Build)

Cloud builders **do not read your local `.env`**. Before `eas build --profile production` (or `preview` APK), add the same three variables in **[expo.dev](https://expo.dev)** → your project → **Environment variables** → scope **Production** (and **Preview** if you use that profile):

- `EXPO_PUBLIC_HUBBLE_CLIENT_ID`
- `EXPO_PUBLIC_HUBBLE_APP_SECRET`
- Optionally `EXPO_PUBLIC_HUBBLE_ENV`=`production` (the `production` profile in `eas.json` already sets this for production builds)

CLI alternative: `eas env:create` / project dashboard — keep values out of `eas.json` and out of committed source.

The SDK URL includes a `token` query param **only** when the value looks like a Partner JWT (`a.b.c`). InstaHelp phone auth tokens are not JWTs and are **not** forwarded, so Hubble can use **lazy login** when your Hubble project allows it.

### Login screen, “Access Denied”, or “no auth / direct access”

The **Hubble web UI** (welcome screen, phone login, allowlists) is controlled entirely by **Hubble’s configuration** for your `clientId`. This app cannot disable that UI from the client.

- Ask Hubble to enable **lazy / guest access** for your integration if you should browse without logging in (their docs: `token` is optional *when lazy login is enabled* for your tenant).
- If they expect **SSO**, you must mint their **Partner JWT** server-side and pass it (e.g. via `EXPO_PUBLIC_HUBBLE_USER_JWT` only for testing — production should use a secure channel, not a public env var).
- **Phone login failures** (e.g. Access Denied): use the format and rules Hubble gives you (country code, allowlisted numbers, staging vs production credentials).

### “Access Denied” on Hubble’s login screen

The InstaHelp app only opens the WebView URL with `clientId`, `appSecret`, `wrap-plt=rn`, and optionally a **valid Partner JWT** as `token`. **Access Denied** is decided **inside Hubble** (allowlist, environment, or token checks). Work through this in order:

1. **Staging vs production**  
   - `EXPO_PUBLIC_HUBBLE_ENV=development` → SDK host is **`sdk.dev.myhubble.money`**. Credentials must be **dev** credentials from Hubble.  
   - Production (or omitting dev) → **`sdk.myhubble.money`** → use **production** `clientId` / `appSecret`.  
   Mixing **prod keys on dev host** (or the reverse) often produces login or access errors.

2. **Phone number format**  
   For India, use **E.164**: **`+917022702220`**, not only `7022702220`. Many integrations reject numbers without country code.

3. **Allowlisted / test users**  
   Ask Hubble whether your `clientId` only allows **specific test numbers** or domains until go-live. **Access Denied** often means “this MSISDN is not allowed for this tenant.”

4. **`EXPO_PUBLIC_HUBBLE_USER_JWT`**  
   If you set this to a **fake** or **expired** JWT (three segments but not signed for Hubble), Hubble can deny access. **Unset** this variable while debugging phone login unless Hubble gave you a real test JWT.

5. **JWT SSO path**  
   If your project is meant to use **SSO**, phone login may always fail until your **backend** issues a correct Partner JWT and the app passes it as `token` (see the JWT SSO section above).

6. **Still stuck**  
   Send Hubble: your **`clientId`**, which **host** you load (`dev` vs `prod`), the **exact number** you tried (with `+`), and a **screenshot** of Access Denied. They can confirm allowlist, lazy login, and SSO expectations in one pass.

## JWT SSO (recommended) — official guide

Full reference: **[SSO Setup — Hubble Documentation](https://docs.myhubble.money/sdk/authentication/sso-setup)**.

Hubble **JWT SSO** does **not** require an inbound `POST /sso` on your server. Your **backend** signs a short-lived JWT; the app passes it as the SDK **`token`** query param; Hubble verifies it using the **public key** you registered.

### Rules (from Hubble)

| Requirement | Detail |
| --- | --- |
| Algorithm | **`RS256` only** |
| Lifetime | **`exp` = `iat` + 60 seconds` exactly** (single-use handshake; **do not** cache or reuse tokens) |
| `iss` | Your Hubble **`clientId`** (from onboarding / integration portal) |
| `sub` | Your internal user id |
| `iat` / `exp` | Unix timestamps |
| `phoneNumber` | User’s mobile **with country code** (Hubble’s example: `919999912345` — digits, no `+` in the claim) |

Optional claims: `name`, `email`, `cohorts` (see the doc).

### One-time setup

1. Generate RSA keypair (`openssl genrsa` / `openssl rsa -pubout` — commands are in the doc above).  
2. Paste **`public_key.pem`** into Hubble’s **JWT SSO Public Key** field.  
3. Keep **`private_key.pem`** only on your backend; sign every new session with it.

### InstaHelp app

The app adds **`token`** to the SDK URL only when the value looks like a JWT (`a.b.c`). For production, your app should **fetch a fresh JWT** from your API after InstaHelp login (not a static `.env` value). For local experiments only, you can use `EXPO_PUBLIC_HUBBLE_USER_JWT` with a token your backend just minted.

### Mint a test JWT locally (Node, same as Hubble’s sample)

This repo includes **`scripts/mint-hubble-jwt.cjs`** (uses [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) — same idea as the [official Node example](https://docs.myhubble.money/sdk/authentication/sso-setup)).

1. Put your **`private_key.pem`** in the project root (or elsewhere); `*.pem` is gitignored.  
2. From the repo root:

```bash
export HUBBLE_ISS="your-hubble-client-id"
export HUBBLE_SUB="internal-user-id"
export HUBBLE_PHONE="917022702220"
# optional: HUBBLE_NAME HUBBLE_EMAIL HUBBLE_COHORTS="premium,beta"
# optional: HUBBLE_JWT_PRIVATE_KEY_PATH="/absolute/path/to/private_key.pem"
npm run mint:hubble-jwt
```

3. Copy the single line of output into **`EXPO_PUBLIC_HUBBLE_USER_JWT`** in `.env` **only for a quick test**, then restart Expo. Tokens are valid for **60 seconds** — generate a new one each time you open the gift store, or wire a real API that mints on demand.

If **`iss`** is wrong, **`exp`** is not `iat+60`, **`phoneNumber`** is missing/wrong, or the signature doesn’t match the registered public key, Hubble will reject the session — often surfacing as login / access errors instead of a clear catalog.

### Classic SSO (legacy)

Older integrations use a **token + your `POST …/sso` endpoint** (Hubble calls you). New work should follow **JWT SSO** in the doc above, not classic SSO, unless Hubble told you otherwise.

## Native / EAS notes

- **Expo dev client / EAS build**: `react-native-webview` is included; run `npx expo prebuild` when you need native projects locally, or build with EAS.
- **Android 11+ UPI intents**: follow Hubble’s Android payment guide and add the recommended `<queries>` entries to `AndroidManifest.xml` via an Expo config plugin or a `expo prebuild` managed `app.config.js` hook.
- **iOS UPI app discovery**: follow Hubble’s iOS guide and merge the recommended `LSApplicationQueriesSchemes` entries into `ios.infoPlist` via `app.json` / `app.config.*`.

## Deep links

Configured schemes in `app.json`:

- `instahelpminiapp://`
- `instahelpmobileapp://`

Open the embedded store directly:

- `instahelpmobileapp://hubble-webview?sdkPath=search`
- `instahelpmobileapp://hubble-webview?brandId=YOUR_BRAND_ID`
- `instahelpmobileapp://hubble-webview?sdkPath=transactions&showBackButton=true`
- `instahelpmobileapp://hubble-webview?sdkPath=help`

## Code map

- `src/constants/hubble.ts` — env + marketplace content constants
- `src/services/hubble/*` — URL construction, navigation allowlist, message parsing
- `src/hooks/useHubble.ts` — WebView integration controller
- `src/hooks/useHubbleDeepLinks.ts` — cold start / foreground URL handling
- `src/screens/giftcards/GiftCardsScreen.tsx` — premium marketplace UI
- `src/screens/giftcards/HubbleWebViewScreen.tsx` — embedded SDK screen
- `src/app/hubble-webview.tsx` — Expo Router entry for the SDK screen
