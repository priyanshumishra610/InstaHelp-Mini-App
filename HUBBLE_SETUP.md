# Hubble Gift Card SDK (InstaHelp®)

If the embedded store shows **Access Denied** or asks you to **log in to Hubble**, that is Hubble’s hosted gate — not InstaHelp’s phone login. Fix it with matching **dev vs production** keys and **lazy login** on your Hubble tenant (see below).

This app uses **Path B: lazy / guest access** — the WebView loads the SDK **without** a `token` query parameter. Hubble must enable **lazy login** for your `clientId` so users can browse the gift store without partner SSO. See [React Native parameters](https://docs.myhubble.money/sdk/platform-guides/react-native) (`token` is optional when lazy login is enabled).

The embedded URL is `https://sdk.myhubble.money/` (production) or `https://sdk.dev.myhubble.money/` (development), with `wrap-plt=rn`, matching the [Hubble React Native guide](https://docs.myhubble.money/sdk/platform-guides/react-native).

### What you need from Hubble

1. **`clientId`** and **`appSecret`** (already in your env).
2. Ask Hubble to configure your integration for **lazy login / guest browse** — not [Classic SSO](https://docs.myhubble.money/sdk/authentication/sso-setup#classic-sso-legacy) or JWT SSO that requires a `token` on every launch. If SSO stays enabled for your tenant, the SDK will keep showing Hubble’s login until Hubble changes that configuration.

### Query parameters (this app)

Implemented in `src/services/hubble/buildSdkUrl.ts` and `src/hooks/useHubble.ts`:

| Query key | Source | Notes |
| --- | --- | --- |
| `clientId` | `EXPO_PUBLIC_HUBBLE_CLIENT_ID` | Required |
| `appSecret` | `EXPO_PUBLIC_HUBBLE_APP_SECRET` | Required |
| `wrap-plt` | Always `rn` | React Native per Hubble |
| `appVersion` | Expo app version | Optional |
| `deviceId` | `Platform.OS` + `Constants.sessionId` | Optional |
| Deep-link extras | `category`, `showBackButton`, `amount`, `coupon`, … | From `HubbleWebViewScreen` / router params |

**Not sent:** `token` — intentional for lazy-login mode.

## Environment variables (EAS / local `.env`)

Set these as **Expo public** env vars (they are bundled into the client). **Never commit real secrets** to git.

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_HUBBLE_CLIENT_ID` | Yes | Issued by Hubble |
| `EXPO_PUBLIC_HUBBLE_APP_SECRET` | Yes | Issued by Hubble |
| `EXPO_PUBLIC_HUBBLE_ENV` | No | `development` → dev SDK host; anything else → production |
| `EXPO_PUBLIC_HUBBLE_ANALYTICS_LOG` | No | Set to `1` to log analytics events in dev |
| `EXPO_PUBLIC_HUBBLE_DEMO_BRAND_IDS` | No | Comma-separated Hubble `brandId` values for demo tiles |

### Production APK / AAB (EAS Build)

Add the Hubble variables in **[expo.dev](https://expo.dev)** → your project → **Environment variables** for the right build profile. The `production` profile in `eas.json` sets `EXPO_PUBLIC_HUBBLE_ENV=production` where applicable.

### Why “Client Id” / “App Secret” show on Expo’s Production panel

That screen lists **every variable used for production builds**. Hubble’s [React Native guide](https://docs.myhubble.money/sdk/platform-guides/react-native) expects `clientId` and `appSecret` as WebView URL query parameters, so those values **must be available when the JavaScript bundle is built**. In Expo they live under **`EXPO_PUBLIC_*`**, which means:

1. **Expo Dashboard** — Owners / collaborators with env access will see variable **names** and typically **values** there (same as CI secrets you configure for the build). That’s normal for project admins; restrict who has access to the Expo project if this matters.
2. **The shipped app** — Those strings are **included in the client bundle** (same as any `EXPO_PUBLIC_` value). They are **not** as protected as a backend API key. Hubble treats them as **mobile client pairing credentials**, not a silent server secret—but you should still **avoid committing** them to git, **rotate** them with Hubble if leaked, and never share screenshots of the Production env panel publicly.

If you need stronger isolation, only Hubble can offer an alternative flow (e.g. server-issued short-lived tokens instead of static URL params); the current SDK URL model is what their RN doc describes.

### Login screen or “access denied”

1. Confirm **lazy login** is enabled for your **`clientId`** (contact Hubble / integration portal).
2. Match **environment and keys**: `EXPO_PUBLIC_HUBBLE_ENV=development` must use **dev** `clientId` + `appSecret` with `sdk.dev.myhubble.money`; production builds use **prod** credentials with `sdk.myhubble.money`.
3. If Hubble insists on SSO, they need to disable mandatory `token` for your app, or you would have to change product direction and implement SSO separately (this codebase does not pass `token`).

## Native / EAS notes

- **Expo dev client / EAS build**: `react-native-webview` is included; run `npx expo prebuild` when you need native projects locally, or build with EAS.
- **Android 11+ UPI intents** / **iOS UPI schemes**: follow Hubble’s payment guides and merge their manifest / Info.plist recommendations.

## Deep links

Schemes: `instahelpminiapp://`, `instahelpmobileapp://`

Examples:

- `instahelpmobileapp://hubble-webview?sdkPath=search`
- `instahelpmobileapp://hubble-webview?brandId=YOUR_BRAND_ID`
- `instahelpmobileapp://hubble-webview?sdkPath=transactions&showBackButton=true`
- `instahelpmobileapp://hubble-webview?sdkPath=help`

## Code map

- `src/constants/hubble.ts` — env + marketplace content constants
- `src/services/hubble/*` — URL construction, navigation allowlist, message parsing
- `src/hooks/useHubble.ts` — WebView integration controller
- `src/hooks/useHubbleDeepLinks.ts` — cold start / foreground URL handling
- `src/screens/giftcards/GiftCardsScreen.tsx` — marketplace UI
- `src/screens/giftcards/HubbleWebViewScreen.tsx` — embedded SDK screen
- `src/app/(tabs)/hubble-webview.tsx` — Expo Router entry for the SDK (nested under tabs so the tab bar stays visible)
