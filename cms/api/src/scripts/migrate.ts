import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool, query } from "../db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../../../database/schema.sql");

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, "utf-8");
  console.log("[migrate] Running schema...");

  try {
    await pool.query(sql);
    console.log("[migrate] Schema applied successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("already exists")) {
      console.log("[migrate] Schema already exists — skipping");
    } else {
      console.error("[migrate] Failed:", message);
      process.exit(1);
    }
  }

  await pool.end();
}

migrate();
