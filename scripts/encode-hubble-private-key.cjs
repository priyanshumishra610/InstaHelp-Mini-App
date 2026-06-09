/**
 * Encode private_key.pem as one line for Apps Script Script properties.
 * Converts to PKCS#8 first — Apps Script computeRsaSha256Signature prefers
 * -----BEGIN PRIVATE KEY----- over -----BEGIN RSA PRIVATE KEY-----.
 *
 * Usage:
 *   npm run encode:hubble-private-key
 *
 * Paste the output into Script properties as HUBBLE_JWT_PRIVATE_KEY_B64
 * Delete HUBBLE_JWT_PRIVATE_KEY if it contains the Hubble app secret.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const keyPath = path.join(process.cwd(), "private_key.pem");
if (!fs.existsSync(keyPath)) {
  console.error("Missing private_key.pem in project root.");
  process.exit(1);
}

const rsaPem = fs.readFileSync(keyPath, "utf8");
const pkcs8Pem = execSync(
  "openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt",
  { input: rsaPem, encoding: "utf8" },
);
const b64 = Buffer.from(pkcs8Pem, "utf8").toString("base64");

console.log("Apps Script → Project settings → Script properties:");
console.log("");
console.log("1. DELETE property HUBBLE_JWT_PRIVATE_KEY if it holds the app secret");
console.log("2. Add / replace:");
console.log("");
console.log("Name:  HUBBLE_JWT_PRIVATE_KEY_B64");
console.log("Value: (single line below — no spaces or line breaks)");
console.log("");
console.log(b64);
