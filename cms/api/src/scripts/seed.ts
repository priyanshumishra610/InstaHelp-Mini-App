import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool, query } from "../db.js";

dotenv.config();

const SAMPLE_BANNERS = [
  {
    title: "Offer of the Week",
    subtitle: "Get up to 40% off on home services.",
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=70",
    cta_text: "Book now",
    cta_url: "https://instahelp.in",
    deep_link: "category:home",
    display_priority: 100,
    status: "active",
  },
  {
    title: "Business Essentials",
    subtitle: "GST, CA & legal help starting at ₹499.",
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70",
    cta_text: "Explore",
    deep_link: "category:business",
    display_priority: 90,
    status: "active",
  },
];

const SAMPLE_CATEGORIES = [
  { name: "Travel", slug: "travel", theme_color: "#0ea5e9", display_priority: 100 },
  { name: "Beauty", slug: "beauty", theme_color: "#ec4899", display_priority: 90 },
  { name: "Doctors", slug: "doctors", theme_color: "#10b981", display_priority: 80 },
  { name: "Real Estate", slug: "real-estate", theme_color: "#8b5cf6", display_priority: 70 },
  { name: "Logistics", slug: "logistics", theme_color: "#f59e0b", display_priority: 60 },
  { name: "Bills", slug: "bills", theme_color: "#6366f1", display_priority: 50 },
  { name: "Repairs", slug: "repairs", theme_color: "#ef4444", display_priority: 40 },
  { name: "CCTV", slug: "cctv", theme_color: "#64748b", display_priority: 30 },
  { name: "B2B", slug: "b2b", theme_color: "#14b8a6", display_priority: 20 },
];

const SAMPLE_MOBILE_ASSETS = [
  {
    asset_type: "splash",
    title: "InstaHelp Splash",
    image_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    metadata: { backgroundColor: "#0A0A1A", tagline: "We'll get it done" },
    display_order: 0,
    status: "active",
  },
  {
    asset_type: "onboarding",
    title: "Welcome to InstaHelp",
    image_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=70",
    display_order: 0,
    status: "active",
  },
  {
    asset_type: "referral",
    title: "Refer & Earn",
    image_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=70",
    deep_link: "referral",
    display_order: 0,
    status: "active",
  },
  {
    asset_type: "wallet",
    title: "Wallet Promotions",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=70",
    deep_link: "wallet",
    display_order: 0,
    status: "active",
  },
];

async function seed() {
  const email = process.env.ADMIN_EMAIL ?? "admin@instahelp.in";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const name = process.env.ADMIN_NAME ?? "Super Admin";

  const roleResult = await query(`SELECT id FROM roles WHERE name = 'super_admin'`);
  const roleId = roleResult.rows[0]?.id;
  if (!roleId) {
    console.error("[seed] super_admin role not found — run migrate first");
    process.exit(1);
  }

  const existing = await query(`SELECT id FROM admin_users WHERE email = $1`, [email]);
  if (!existing.rows[0]) {
    const hash = await bcrypt.hash(password, 12);
    await query(
      `INSERT INTO admin_users (email, password_hash, name, role_id) VALUES ($1, $2, $3, $4)`,
      [email, hash, name, roleId],
    );
    console.log(`[seed] Created admin user: ${email}`);
  } else {
    console.log(`[seed] Admin user already exists: ${email}`);
  }

  const bannerCount = await query(`SELECT COUNT(*)::int AS c FROM banners`);
  if ((bannerCount.rows[0]?.c ?? 0) === 0) {
    for (const b of SAMPLE_BANNERS) {
      await query(
        `INSERT INTO banners (title, subtitle, image_url, cta_text, cta_url, deep_link, display_priority, status, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [b.title, b.subtitle, b.image_url, b.cta_text, b.cta_url ?? null, b.deep_link ?? null, b.display_priority, b.status],
      );
    }
    console.log(`[seed] Inserted ${SAMPLE_BANNERS.length} sample banners`);
  }

  const catCount = await query(`SELECT COUNT(*)::int AS c FROM categories`);
  if ((catCount.rows[0]?.c ?? 0) === 0) {
    for (const c of SAMPLE_CATEGORIES) {
      await query(
        `INSERT INTO categories (name, slug, theme_color, display_priority, status)
         VALUES ($1,$2,$3,$4,'active')`,
        [c.name, c.slug, c.theme_color, c.display_priority],
      );
    }
    console.log(`[seed] Inserted ${SAMPLE_CATEGORIES.length} sample categories`);
  }

  const assetCount = await query(`SELECT COUNT(*)::int AS c FROM mobile_assets`);
  if ((assetCount.rows[0]?.c ?? 0) === 0) {
    for (const a of SAMPLE_MOBILE_ASSETS) {
      await query(
        `INSERT INTO mobile_assets (asset_type, title, image_url, deep_link, metadata, display_order, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [a.asset_type, a.title, a.image_url, a.deep_link ?? null, JSON.stringify(a.metadata ?? {}), a.display_order, a.status],
      );
    }
    console.log(`[seed] Inserted ${SAMPLE_MOBILE_ASSETS.length} mobile assets`);
  }

  console.log("[seed] Done");
  await pool.end();
}

seed();
