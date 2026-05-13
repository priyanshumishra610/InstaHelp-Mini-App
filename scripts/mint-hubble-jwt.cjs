/**
 * Mint a Hubble JWT SSO token (RS256, exp = iat + 60s) for local testing.
 * @see https://docs.myhubble.money/sdk/authentication/sso-setup
 *
 * Usage (from repo root):
 *   npm run mint:hubble-jwt
 *
 * Required env:
 *   HUBBLE_JWT_PRIVATE_KEY_PATH — path to RSA private key PEM (default: ./private_key.pem)
 *   HUBBLE_ISS — your Hubble clientId (same as EXPO_PUBLIC_HUBBLE_CLIENT_ID)
 *   HUBBLE_SUB — your internal user id
 *   HUBBLE_PHONE — E.164 digits without + (e.g. 917022702220 for India)
 *
 * Optional: HUBBLE_NAME, HUBBLE_EMAIL, HUBBLE_COHORTS (comma-separated)
 *
 * Never commit private_key.pem. *.pem is gitignored.
 */

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return String(v).trim();
}

const keyPath = path.resolve(
  process.cwd(),
  process.env.HUBBLE_JWT_PRIVATE_KEY_PATH || "private_key.pem",
);

if (!fs.existsSync(keyPath)) {
  console.error(`Private key not found: ${keyPath}`);
  console.error("Generate with openssl (see HUBBLE_SETUP.md) and set HUBBLE_JWT_PRIVATE_KEY_PATH if needed.");
  process.exit(1);
}

const privateKey = fs.readFileSync(keyPath);
const now = Math.floor(Date.now() / 1000);

const iss = requireEnv("HUBBLE_ISS");
const sub = requireEnv("HUBBLE_SUB");
const phoneNumber = requireEnv("HUBBLE_PHONE");

const payload = {
  sub,
  iss,
  iat: now,
  exp: now + 60,
  phoneNumber,
};

if (process.env.HUBBLE_NAME) payload.name = process.env.HUBBLE_NAME;
if (process.env.HUBBLE_EMAIL) payload.email = process.env.HUBBLE_EMAIL;
if (process.env.HUBBLE_COHORTS) {
  payload.cohorts = process.env.HUBBLE_COHORTS.split(",").map((s) => s.trim()).filter(Boolean);
}

const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
process.stdout.write(token + "\n");
