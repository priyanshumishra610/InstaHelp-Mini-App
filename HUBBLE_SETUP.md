# Hubble Gift Card SDK (InstaHelp®)

This app embeds the official Hubble React Native flow using a `WebView` pointed at `https://sdk.myhubble.money/` (production) or `https://sdk.dev.myhubble.money/` (development), with `wrap-plt=rn`, matching the [Hubble React Native guide](https://docs.myhubble.money/sdk/platform-guides/react-native).

**No SSO / no `token` param.** The SDK URL never includes partner auth. Hubble must have **lazy login** enabled for your `clientId` so users can browse without JWT or [classic SSO](https://docs.myhubble.money/sdk/authentication/sso-setup#classic-sso-legacy).

### Query parameters (what this app sends)

Implemented in `src/services/hubble/buildSdkUrl.ts` and `src/hooks/useHubble.ts`:

| Query key | Source | Notes |
| --- | --- | --- |
| `clientId` | `EXPO_PUBLIC_HUBBLE_CLIENT_ID` | Required |
| `appSecret` | `EXPO_PUBLIC_HUBBLE_APP_SECRET` | Required |
| `wrap-plt` | Always `rn` | React Native per Hubble |
| `appVersion` | Expo app version | Optional |
| `deviceId` | `Platform.OS` + `Constants.sessionId` | Optional |
| Deep-link extras | `category`, `showBackButton`, `amount`, `coupon`, … | Only from `HubbleWebViewScreen` / router params |

**Not sent:** `token` (and no env var is read for partner JWT).

## Environment variables (EAS / local `.env`)

Set these as **Expo public** env vars (they are bundled into the client). **Never commit real secrets** to git (this repo gitignores `.env`; use EAS for cloud builds).

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_HUBBLE_CLIENT_ID` | Yes | Issued by Hubble |
| `EXPO_PUBLIC_HUBBLE_APP_SECRET` | Yes | Issued by Hubble |
| `EXPO_PUBLIC_HUBBLE_ENV` | No | `development` uses the dev SDK host; anything else uses production |
| `EXPO_PUBLIC_HUBBLE_ANALYTICS_LOG` | No | Set to `1` to print analytics events to the console in dev |
| `EXPO_PUBLIC_HUBBLE_DEMO_BRAND_IDS` | No | Comma-separated Hubble `brandId` values for demo tiles |

### Production APK / AAB (EAS Build)

Cloud builders **do not read your local `.env`**. Before `eas build --profile production` (or `preview` APK), add the same variables in **[expo.dev](https://expo.dev)** → your project → **Environment variables** → scope **Production** (and **Preview** if you use that profile):

- `EXPO_PUBLIC_HUBBLE_CLIENT_ID`
- `EXPO_PUBLIC_HUBBLE_APP_SECRET`
- Optionally `EXPO_PUBLIC_HUBBLE_ENV`=`production` (the `production` profile in `eas.json` already sets this for production builds)

If you still have an old **`EXPO_PUBLIC_HUBBLE_USER_JWT`** (or similar) in `.env` / EAS from a prior setup, you can delete it — this codebase does not read it.

### Login screen, “Access Denied”, or “no auth / direct access”

The **Hubble web UI** (welcome screen, phone login, allowlists) is controlled by **Hubble’s configuration** for your `clientId`. This app does not pass SSO tokens.

1. Ask Hubble to enable **lazy / guest access** for your integration (`token` is optional when lazy login is enabled — see [React Native parameters](https://docs.myhubble.money/sdk/platform-guides/react-native)).
2. **Staging vs production** — `EXPO_PUBLIC_HUBBLE_ENV=development` → `sdk.dev.myhubble.money` with **dev** credentials; production → `sdk.myhubble.money` with **prod** credentials. Mixing hosts and keys often causes access errors.
3. If Hubble still shows a login wall, they may have **JWT SSO** or **classic SSO** enabled on your tenant — ask them to disable partner auth and enable lazy login only.

Do **not** use [Classic SSO (legacy)](https://docs.myhubble.money/sdk/authentication/sso-setup#classic-sso-legacy) or JWT SSO for this app unless you intentionally add a backend and change the integration later.

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
