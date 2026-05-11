/**
 * Rasterizes assets/images/10.svg for Expo (icon + splash require PNG).
 * Run: node scripts/generate-icon-assets.cjs
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const svgPath = path.join(root, "assets", "images", "10.svg");

async function main() {
  const svg = fs.readFileSync(svgPath);
  const white = { r: 255, g: 255, b: 255, alpha: 1 };

  await sharp(svg)
    .resize(1024, 1024, { fit: "contain", background: white })
    .png()
    .toFile(path.join(root, "assets", "images", "app-icon.png"));

  await sharp(svg)
    .resize(512, 512, { fit: "contain", background: white })
    .png()
    .toFile(path.join(root, "assets", "images", "splash-icon.png"));

  console.log("Wrote assets/images/app-icon.png and splash-icon.png from 10.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
