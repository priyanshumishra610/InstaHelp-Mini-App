/**
 * Mint a Hubble JWT SSO token (RS256, exp = iat + 60s) for local testing.
 * @see https://docs.myhubble.money/sdk/authentication/sso-setup
 *
 * Usage:
 *   HUBBLE_ISS=instahelp-sdk-1z4JmIpo HUBBLE_SUB=917022702220 HUBBLE_PHONE=7022702220 npm run mint:hubble-jwt
 *
 * Optional: HUBBLE_NAME, HUBBLE_EMAIL, HUBBLE_JWT_PRIVATE_KEY_PATH (default ./private_key.pem)
 */

require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const privateKeyPath =
  process.env.HUBBLE_JWT_PRIVATE_KEY_PATH ||
  path.join(process.cwd(), "private_key.pem");

const iss = process.env.HUBBLE_ISS || process.env.EXPO_PUBLIC_HUBBLE_CLIENT_ID;
const sub = process.env.HUBBLE_SUB;
const phoneNumber = process.env.HUBBLE_PHONE;

if (!iss || !sub || !phoneNumber) {
  console.error(
    "Set HUBBLE_ISS, HUBBLE_SUB, and HUBBLE_PHONE (10-digit local number).",
  );
  process.exit(1);
}

if (!fs.existsSync(privateKeyPath)) {
  console.error(`Missing private key: ${privateKeyPath}`);
  process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const now = Math.floor(Date.now() / 1000);

/** @type {import('jsonwebtoken').JwtPayload} */
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
  payload.cohorts = process.env.HUBBLE_COHORTS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
console.log(token);
