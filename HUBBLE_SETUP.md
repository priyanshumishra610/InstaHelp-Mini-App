# Hubble Gift Card SDK (InstaHelp)

Official guides:

- [React Native](https://docs.myhubble.money/sdk/platform-guides/react-native)
- [Android WebView](https://docs.myhubble.money/sdk/platform-guides/android)
- [SSO / auth](https://docs.myhubble.money/sdk/authentication/sso-setup)

## What Hubble supports

Hubble is a **WebView URL integration**, not a separate native SDK in this app. React Native uses `wrap-plt=rn`; native Android uses `wrap-plt=an`.

### Allowed query parameters (official)

| Parameter | Required | Notes |
| --- | --- | --- |
| `clientId` | Yes | From Hubble |
| `appSecret` | Yes | From Hubble |
| `wrap-plt` | Yes | `rn` for React Native |
| `token` | No | User auth token. **Optional only if lazy login is enabled on your Hubble tenant.** |
| `appVersion` | No | Defaults to `"10000"` in docs |
| `deviceId` | No | Optional device id |

Hubble does **not** document `ssoProvider`, `userId`, `phone`, `name`, or `email` as URL parameters. Do not send custom identity query keys.

### Deep link routes

| Page | Path |
| --- | --- |
| Home (catalog) | `/` |
| Brand | `/buy/{brandId}` |
| Search | `/search` |
| Transactions | `/transactions` |
| Help | `/help` |

Example production URL:

`https://sdk.myhubble.money/search?clientId=...&appSecret=...&wrap-plt=rn`

## InstaHelp implementation

- Config: `src/integrations/hubble/hubbleConfig.ts`
- URL builder: `src/integrations/hubble/hubbleClient.ts`
- Hook: `src/hooks/useHubble.ts`
- Screen: `src/screens/giftcards/HubbleWebViewScreen.tsx`

We send only the official parameters above (no `token`, no custom SSO fields). WebView uses `cacheEnabled={false}` and `incognito`, matching Hubble’s RN sample for a clean session.

Navigation allowlist: `sdk.myhubble.money` / `sdk.dev.myhubble.money` plus Razorpay payment hosts.

Events: `close`, `app_ready`, `error`, and `analytics` via `postMessage` — parsed in `hubbleClient.ts`.

## Why a Hubble login screen still appears

Per [React Native parameters](https://docs.myhubble.money/sdk/platform-guides/react-native):

> `token` — Optional if **lazy login is enabled**.

If lazy login is **not** enabled for `instahelp-sdk-1z4JmIpo`, Hubble expects a valid `token` on every launch. No InstaHelp app change can remove that screen without one of:

1. **Lazy login (guest browse)** — Ask Hubble to enable lazy login for your production `clientId`. Then launch with `clientId` + `appSecret` + `wrap-plt=rn` only (what we do now).

2. **JWT SSO** — Backend signs a short-lived RS256 JWT; app passes it as `token`. See [SSO Setup → JWT SSO](https://docs.myhubble.money/sdk/authentication/sso-setup).

3. **Classic SSO (legacy)** — Backend exposes `POST /sso`; app passes an opaque `token`; Hubble calls your server. Not suitable for “no login” unless you auto-mint tokens for every user.

**Do not** use phone number, email, or user id as `token`. Hubble explicitly warns this is insecure.

## Environment variables

- `EXPO_PUBLIC_HUBBLE_CLIENT_ID`
- `EXPO_PUBLIC_HUBBLE_APP_SECRET`
- `EXPO_PUBLIC_HUBBLE_ENV` — `development` → `sdk.dev.myhubble.money`, else production
- `EXPO_PUBLIC_HUBBLE_ANALYTICS_LOG` — `1` to log analytics in dev
- `EXPO_PUBLIC_HUBBLE_DEMO_BRAND_IDS` — optional demo brand ids

Set the same values in EAS for store builds. Restart with `npx expo start -c` after changing `.env`.

## Android UPI payments

For Android 11+, Hubble requires a manifest `<queries>` block for `upi` scheme so checkout can open UPI apps. See [Android integration → UPI Intent Configuration](https://docs.myhubble.money/sdk/platform-guides/android). Add via Expo config plugin / prebuild before shipping payments on Android.

## Action for Hubble support

Email Hubble with:

- Production `clientId`: `instahelp-sdk-1z4JmIpo`
- Request: **enable lazy login** so the SDK loads without `token` and without a hosted login / OTP screen
- Confirm production SDK host: `https://sdk.myhubble.money/`

Until they enable lazy login (or you add a backend JWT `token` flow), the hosted login screen is expected Hubble behavior, not an InstaHelp routing bug.
