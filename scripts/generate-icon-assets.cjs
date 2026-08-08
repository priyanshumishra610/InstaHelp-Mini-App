/**
 * Rasterizes brand assets for Expo (icon + Uber-style splash wordmark).
 * Run: npm run generate:icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const imagesDir = path.join(root, "assets", "images");
const sourcePath = path.join(imagesDir, "InstaHelp (1).png");

function wordmarkSvg({ width, height, fontSize, label = "InstaHelp" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="50%"
    y="52%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Arial, Helvetica Neue, Helvetica, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    letter-spacing="-2"
    fill="#FFFFFF"
  >${label}</text>
</svg>`;
}

async function writeWordmark(filePath, width, height, fontSize, label) {
  await sharp(Buffer.from(wordmarkSvg({ width, height, fontSize, label })))
    .png()
    .toFile(filePath);
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing source icon: ${sourcePath}`);
    process.exit(1);
  }

  const white = { r: 255, g: 255, b: 255, alpha: 1 };

  await sharp(sourcePath)
    .resize(1024, 1024, { fit: "contain", background: white })
    .png()
    .toFile(path.join(imagesDir, "app-icon.png"));

  // Uber-style: white wordmark on transparent (shown on black splash canvas)
  await writeWordmark(
    path.join(imagesDir, "splash-wordmark.png"),
    1600,
    480,
    210,
    "InstaHelp®",
  );
  await writeWordmark(
    path.join(imagesDir, "splash-icon.png"),
    1024,
    1024,
    164,
    "InstaHelp",
  );

  const squareSizes = {
    mdpi: 288,
    hdpi: 432,
    xhdpi: 576,
    xxhdpi: 864,
    xxxhdpi: 1152,
  };

  for (const [density, size] of Object.entries(squareSizes)) {
    const out = path.join(
      root,
      `android/app/src/main/res/drawable-${density}/splashscreen_logo.png`,
    );
    if (!fs.existsSync(path.dirname(out))) continue;
    await writeWordmark(out, size, size, Math.round(size * 0.125), "InstaHelp");
  }

  // Android status-bar notification icon: clean InstaHelp text logo (one line)
  const notificationSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <text
    x="50%"
    y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Arial Narrow, Arial, Helvetica Neue, Helvetica, sans-serif"
    font-weight="800"
    font-size="16"
    letter-spacing="-0.9"
    fill="#FFFFFF"
  >InstaHelp</text>
</svg>`;
  await sharp(Buffer.from(notificationSvg))
    .ensureAlpha()
    .png()
    .toFile(path.join(imagesDir, "notification-icon.png"));

  // Clean horizontal wordmark (white)
  const wordmarkSvgFull = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="128" viewBox="0 0 512 128" xmlns="http://www.w3.org/2000/svg">
  <text
    x="50%"
    y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Arial, Helvetica Neue, Helvetica, sans-serif"
    font-weight="700"
    font-size="72"
    letter-spacing="-2.5"
    fill="#FFFFFF"
  >InstaHelp</text>
</svg>`;
  await sharp(Buffer.from(wordmarkSvgFull))
    .ensureAlpha()
    .png()
    .toFile(path.join(imagesDir, "instahelp-wordmark.png"));

  console.log(
    "Wrote app-icon.png, splash-wordmark.png, splash-icon.png, notification-icon.png, instahelp-wordmark.png, and Android splash logos",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
