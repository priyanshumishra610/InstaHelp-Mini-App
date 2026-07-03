import type { Request, Response } from "express";
import { query } from "../db.js";
import { cacheGet, cacheSet } from "../services/cache.js";
import { optimizeImageUrl } from "../services/cloudinary.js";

const ACTIVE_FILTER = `
  deleted_at IS NULL
  AND status = 'active'
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
`;

function mapRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = value;
  }
  return out;
}

async function cachedQuery<T>(
  cacheKey: string,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const cached = await cacheGet<T[]>(cacheKey);
  if (cached) return cached;

  const result = await query(sql, params);
  const rows = result.rows.map((r) => mapRow(r as Record<string, unknown>)) as T[];
  await cacheSet(cacheKey, rows);
  return rows;
}

export async function getHomeContent(_req: Request, res: Response): Promise<void> {
  try {
    const [banners, featured, sections] = await Promise.all([
      cachedQuery(
        "content:home:banners",
        `SELECT id, title, subtitle, image_url, mobile_image_url, tablet_image_url,
                cta_text, cta_url, deep_link, display_priority
         FROM banners WHERE ${ACTIVE_FILTER}
         ORDER BY display_priority DESC, created_at DESC`,
      ),
      cachedQuery(
        "content:home:featured",
        `SELECT id, title, description, image_url, category, deep_link, cta_text, display_priority
         FROM featured_cards WHERE ${ACTIVE_FILTER}
         ORDER BY display_priority DESC`,
      ),
      cachedQuery(
        "content:home:sections",
        `SELECT id, section_type, title, subtitle, banner_url, background_style,
                visibility_rules, display_order, items
         FROM home_sections WHERE ${ACTIVE_FILTER}
         ORDER BY display_order ASC`,
      ),
    ]);

    res.json({
      banners: banners.map((b) => {
        const row = b as Record<string, unknown>;
        return {
          ...row,
          imageUrl: optimizeImageUrl(String(row.imageUrl ?? row.image_url ?? "")),
        };
      }),
      featured,
      sections,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[content/home]", err);
    res.status(500).json({ error: "Failed to fetch home content" });
  }
}

export async function getBanners(_req: Request, res: Response): Promise<void> {
  try {
    const banners = await cachedQuery(
      "content:banners",
      `SELECT * FROM banners WHERE ${ACTIVE_FILTER}
       ORDER BY display_priority DESC`,
    );
    res.json({ banners, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
}

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await cachedQuery(
      "content:categories",
      `SELECT id, name, slug, icon_url, banner_image_url, description,
              theme_color, display_priority, is_featured, metadata
       FROM categories
       WHERE deleted_at IS NULL AND status = 'active' AND is_hidden = FALSE
       ORDER BY display_priority DESC`,
    );
    res.json({ categories, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

export async function getDeals(_req: Request, res: Response): Promise<void> {
  try {
    const deals = await cachedQuery(
      "content:deals",
      `SELECT id, deal_title, description, deal_banner_url, merchant_logo_url,
              coupon_code, discount, cta_text, cta_url, affiliate_url,
              category, display_priority, metadata
       FROM deals WHERE ${ACTIVE_FILTER}
       ORDER BY display_priority DESC`,
    );
    res.json({ deals, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch deals" });
  }
}

export async function getShop(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await cachedQuery(
      "content:shop",
      `SELECT id, name, slug, icon_url, banner_url, promo_banner_url,
              merchant_highlight, featured_deals, display_priority
       FROM shop_categories
       WHERE deleted_at IS NULL AND status = 'active'
       ORDER BY display_priority DESC`,
    );
    res.json({ categories, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch shop content" });
  }
}

export async function getPromotions(_req: Request, res: Response): Promise<void> {
  try {
    const [popups, vendorCampaigns] = await Promise.all([
      cachedQuery(
        "content:popups",
        `SELECT id, popup_type, title, description, image_url, cta_text,
                deep_link, frequency_rules, targeting_rules
         FROM popups WHERE ${ACTIVE_FILTER}`,
      ),
      cachedQuery(
        "content:vendor_campaigns",
        `SELECT id, vendor_name, vendor_logo_url, campaign_banner_url,
                placement, destination_url, priority_score
         FROM vendor_campaigns WHERE ${ACTIVE_FILTER}
         ORDER BY priority_score DESC`,
      ),
    ]);
    res.json({ popups, vendorCampaigns, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
}

export async function getMobileAssets(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.query;
    const cacheKey = type
      ? `content:mobile_assets:${type}`
      : "content:mobile_assets:all";

    let sql = `SELECT id, asset_type, title, image_url, deep_link, metadata, display_order
               FROM mobile_assets WHERE ${ACTIVE_FILTER}`;
    const params: unknown[] = [];

    if (type && typeof type === "string") {
      sql += ` AND asset_type = $1`;
      params.push(type);
    }
    sql += ` ORDER BY display_order ASC`;

    const assets = await cachedQuery(cacheKey, sql, params);
    res.json({ assets, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch mobile assets" });
  }
}

export async function trackEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventType, module, entityId, metadata } = req.body;
    if (!eventType || !module) {
      res.status(400).json({ error: "eventType and module required" });
      return;
    }

    await query(
      `INSERT INTO analytics_events (event_type, module, entity_id, metadata)
       VALUES ($1, $2, $3, $4)`,
      [eventType, module, entityId ?? null, JSON.stringify(metadata ?? {})],
    );

    if (entityId) {
      const clickTypes = ["click", "banner_click", "deal_click", "category_click"];
      if (clickTypes.includes(eventType)) {
        const tableMap: Record<string, string> = {
          banners: "banners",
          deals: "deals",
          featured: "featured_cards",
          categories: "categories",
        };
        const table = tableMap[module];
        if (table) {
          await query(
            `UPDATE ${table} SET click_count = click_count + 1 WHERE id = $1`,
            [entityId],
          );
        }
      }
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to track event" });
  }
}
