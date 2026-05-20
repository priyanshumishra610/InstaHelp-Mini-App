/**
 * Rasterizes the app icon source for Expo (icon + splash require PNG).
 * Run: npm run generate:icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const imagesDir = path.join(root, "assets", "images");
const sourcePath = path.join(imagesDir, "InstaHelp (1).png");

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

  await sharp(sourcePath)
    .resize(512, 512, { fit: "contain", background: white })
    .png()
    .toFile(path.join(imagesDir, "splash-icon.png"));

  console.log(
    "Wrote assets/images/app-icon.png (1024) and splash-icon.png (512) from InstaHelp (1).png",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
