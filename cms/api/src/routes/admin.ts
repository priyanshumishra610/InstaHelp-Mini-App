import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import {
  authenticate,
  requirePermission,
  logAudit,
} from "../middleware/auth.js";
import {
  validateBody,
  validateQuery,
  paginationSchema,
  bannerSchema,
  categorySchema,
  featuredCardSchema,
  dealSchema,
  loginSchema,
} from "../middleware/validate.js";
import {
  cacheDel,
  invalidateContentCache,
} from "../services/cache.js";
import {
  getSignedUploadParams,
  isCloudinaryConfigured,
} from "../services/cloudinary.js";

const router = Router();

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function pageLimit(query: Record<string, unknown>): { page: number; limit: number } {
  return {
    page: Number(query.page ?? 1),
    limit: Number(query.limit ?? 20),
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post("/auth/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
      role_name: string;
      permissions: string[];
    }>(
      `SELECT u.id, u.email, u.name, u.password_hash, r.name AS role_name, r.permissions
       FROM admin_users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1 AND u.is_active = TRUE AND u.deleted_at IS NULL`,
      [email.toLowerCase()],
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    await query(`UPDATE admin_users SET last_login_at = NOW() WHERE id = $1`, [
      user.id,
    ]);

    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"] },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role_name,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─── Dashboard Analytics ─────────────────────────────────────────────────────

router.get(
  "/dashboard/stats",
  authenticate,
  requirePermission("content:read", "*:read", "*"),
  async (_req, res) => {
    try {
      const [
        banners,
        deals,
        campaigns,
        clicks,
        recentActivity,
      ] = await Promise.all([
        query(`SELECT COUNT(*)::int AS count FROM banners WHERE deleted_at IS NULL AND status = 'active'`),
        query(`SELECT COUNT(*)::int AS count FROM deals WHERE deleted_at IS NULL AND status = 'active'`),
        query(`SELECT COUNT(*)::int AS count FROM vendor_campaigns WHERE deleted_at IS NULL AND status = 'active'`),
        query(`SELECT COALESCE(SUM(click_count), 0)::bigint AS total FROM banners WHERE deleted_at IS NULL`),
        query(
          `SELECT a.action, a.module, a.created_at, u.name AS admin_name
           FROM audit_logs a
           LEFT JOIN admin_users u ON u.id = a.admin_id
           ORDER BY a.created_at DESC LIMIT 10`,
        ),
      ]);

      res.json({
        stats: {
          activeBanners: banners.rows[0]?.count ?? 0,
          activeDeals: deals.rows[0]?.count ?? 0,
          activeCampaigns: campaigns.rows[0]?.count ?? 0,
          bannerClicks: Number(clicks.rows[0]?.total ?? 0),
          totalUsers: 0,
          dailyActiveUsers: 0,
          monthlyActiveUsers: 0,
          conversionRate: 0,
        },
        recentActivity: recentActivity.rows,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  },
);

// ─── Generic CRUD helper ─────────────────────────────────────────────────────

type CrudConfig = {
  table: string;
  module: string;
  columns: string[];
  insertValues: (body: Record<string, unknown>) => unknown[];
  updateSet: string;
  updateValues: (body: Record<string, unknown>, id: string) => unknown[];
  listSelect?: string;
};

function createCrudRoutes(config: CrudConfig) {
  const {
    table,
    module,
    columns,
    insertValues,
    updateSet,
    updateValues,
    listSelect = "*",
  } = config;

  router.get(
    `/${module}`,
    authenticate,
    requirePermission(`${module}:read`, "content:*", "*"),
    validateQuery(paginationSchema),
    async (req, res) => {
      try {
        const { page, limit } = pageLimit(req.query as Record<string, unknown>);
        const offset = (page - 1) * limit;
        const [data, count] = await Promise.all([
          query(
            `SELECT ${listSelect} FROM ${table}
             WHERE deleted_at IS NULL
             ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset],
          ),
          query(`SELECT COUNT(*)::int AS total FROM ${table} WHERE deleted_at IS NULL`),
        ]);
        res.json({
          data: data.rows,
          pagination: {
            page,
            limit,
            total: count.rows[0]?.total ?? 0,
            totalPages: Math.ceil((count.rows[0]?.total ?? 0) / limit),
          },
        });
      } catch {
        res.status(500).json({ error: `Failed to list ${module}` });
      }
    },
  );

  router.get(
    `/${module}/:id`,
    authenticate,
    requirePermission(`${module}:read`, "content:*", "*"),
    async (req, res) => {
      const result = await query(
        `SELECT ${listSelect} FROM ${table} WHERE id = $1 AND deleted_at IS NULL`,
        [req.params.id],
      );
      if (!result.rows[0]) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ data: result.rows[0] });
    },
  );

  router.post(
    `/${module}`,
    authenticate,
    requirePermission(`${module}:write`, "content:*", "*"),
    async (req, res) => {
      try {
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
        const result = await query(
          `INSERT INTO ${table} (${columns.join(", ")})
           VALUES (${placeholders}) RETURNING *`,
          insertValues(req.body),
        );
        await invalidateContentCache();
        await logAudit(
          req.user?.id,
          "create",
          module,
          result.rows[0].id,
          null,
          result.rows[0],
          req.ip,
        );
        res.status(201).json({ data: result.rows[0] });
      } catch (err) {
        console.error(`[${module}/create]`, err);
        res.status(500).json({ error: `Failed to create ${module}` });
      }
    },
  );

  router.put(
    `/${module}/:id`,
    authenticate,
    requirePermission(`${module}:write`, "content:*", "*"),
    async (req, res) => {
      try {
        const existing = await query(
          `SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`,
          [paramId(req.params.id)],
        );
        if (!existing.rows[0]) {
          res.status(404).json({ error: "Not found" });
          return;
        }

        const id = paramId(req.params.id);
        const values = updateValues(req.body, id);
        const result = await query(
          `UPDATE ${table} SET ${updateSet}, updated_at = NOW()
           WHERE id = $${values.length} AND deleted_at IS NULL RETURNING *`,
          values,
        );
        await invalidateContentCache();
        await logAudit(
          req.user?.id,
          "update",
          module,
          id,
          existing.rows[0],
          result.rows[0],
          req.ip,
        );
        res.json({ data: result.rows[0] });
      } catch {
        res.status(500).json({ error: `Failed to update ${module}` });
      }
    },
  );

  router.delete(
    `/${module}/:id`,
    authenticate,
    requirePermission(`${module}:write`, "content:*", "*"),
    async (req, res) => {
      const id = paramId(req.params.id);
      const existing = await query(
        `SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );
      if (!existing.rows[0]) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      await query(
        `UPDATE ${table} SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [id],
      );
      await invalidateContentCache();
      await logAudit(
        req.user?.id,
        "delete",
        module,
        id,
        existing.rows[0],
        null,
        req.ip,
      );
      res.json({ ok: true });
    },
  );
}

// ─── Banners CRUD ────────────────────────────────────────────────────────────

router.post(
  "/banners",
  authenticate,
  requirePermission("content:*", "*"),
  validateBody(bannerSchema),
  async (req, res) => {
    try {
      const b = req.body;
      const result = await query(
        `INSERT INTO banners (title, subtitle, image_url, mobile_image_url, tablet_image_url,
          cta_text, cta_url, deep_link, display_priority, status, start_date, end_date, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          b.title, b.subtitle, b.imageUrl, b.mobileImageUrl, b.tabletImageUrl,
          b.ctaText, b.ctaUrl, b.deepLink, b.displayPriority, b.status,
          b.startDate, b.endDate, req.user?.id,
        ],
      );
      await invalidateContentCache();
      res.status(201).json({ data: result.rows[0] });
    } catch {
      res.status(500).json({ error: "Failed to create banner" });
    }
  },
);

router.get(
  "/banners",
  authenticate,
  requirePermission("content:*", "*:read", "*"),
  validateQuery(paginationSchema),
  async (req, res) => {
    const { page, limit } = pageLimit(req.query as Record<string, unknown>);
    const offset = (page - 1) * limit;
    const [data, count] = await Promise.all([
      query(`SELECT * FROM banners WHERE deleted_at IS NULL ORDER BY display_priority DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      query(`SELECT COUNT(*)::int AS total FROM banners WHERE deleted_at IS NULL`),
    ]);
    res.json({
      data: data.rows,
      pagination: { page, limit, total: count.rows[0]?.total ?? 0 },
    });
  },
);

router.put("/banners/:id", authenticate, requirePermission("content:*", "*"), validateBody(bannerSchema.partial()), async (req, res) => {
  const b = req.body;
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  const mapping: Record<string, string> = {
    title: "title", subtitle: "subtitle", imageUrl: "image_url",
    mobileImageUrl: "mobile_image_url", tabletImageUrl: "tablet_image_url",
    ctaText: "cta_text", ctaUrl: "cta_url", deepLink: "deep_link",
    displayPriority: "display_priority", status: "status",
    startDate: "start_date", endDate: "end_date",
  };
  for (const [key, col] of Object.entries(mapping)) {
    if (b[key] !== undefined) {
      fields.push(`${col} = $${i++}`);
      values.push(b[key]);
    }
  }
  if (!fields.length) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  fields.push(`updated_by = $${i++}`);
  values.push(req.user?.id);
  const id = paramId(req.params.id);
  values.push(id);
  const result = await query(
    `UPDATE banners SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${i} AND deleted_at IS NULL RETURNING *`,
    values,
  );
  await invalidateContentCache();
  res.json({ data: result.rows[0] });
});

router.delete("/banners/:id", authenticate, requirePermission("content:*", "*"), async (req, res) => {
  await query(`UPDATE banners SET deleted_at = NOW() WHERE id = $1`, [paramId(req.params.id)]);
  await invalidateContentCache();
  res.json({ ok: true });
});

// ─── Categories ──────────────────────────────────────────────────────────────

router.get("/categories", authenticate, requirePermission("content:*", "*:read", "*"), validateQuery(paginationSchema), async (req, res) => {
  const { page, limit } = pageLimit(req.query as Record<string, unknown>);
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query(`SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY display_priority DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    query(`SELECT COUNT(*)::int AS total FROM categories WHERE deleted_at IS NULL`),
  ]);
  res.json({ data: data.rows, pagination: { page, limit, total: count.rows[0]?.total ?? 0 } });
});

router.post("/categories", authenticate, requirePermission("content:*", "*"), validateBody(categorySchema), async (req, res) => {
  const c = req.body;
  const result = await query(
    `INSERT INTO categories (name, slug, icon_url, banner_image_url, description,
      theme_color, display_priority, is_featured, is_hidden, status, metadata, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [c.name, c.slug, c.iconUrl, c.bannerImageUrl, c.description, c.themeColor,
     c.displayPriority, c.isFeatured, c.isHidden, c.status, JSON.stringify(c.metadata ?? {}), req.user?.id],
  );
  await invalidateContentCache();
  res.status(201).json({ data: result.rows[0] });
});

// ─── Featured Cards ──────────────────────────────────────────────────────────

router.get("/featured-cards", authenticate, requirePermission("content:*", "*:read", "*"), validateQuery(paginationSchema), async (req, res) => {
  const { page, limit } = pageLimit(req.query as Record<string, unknown>);
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query(`SELECT * FROM featured_cards WHERE deleted_at IS NULL ORDER BY display_priority DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    query(`SELECT COUNT(*)::int AS total FROM featured_cards WHERE deleted_at IS NULL`),
  ]);
  res.json({ data: data.rows, pagination: { page, limit, total: count.rows[0]?.total ?? 0 } });
});

router.post("/featured-cards", authenticate, requirePermission("content:*", "*"), validateBody(featuredCardSchema), async (req, res) => {
  const f = req.body;
  const result = await query(
    `INSERT INTO featured_cards (title, description, image_url, category, deep_link,
      cta_text, display_priority, status, start_date, end_date, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [f.title, f.description, f.imageUrl, f.category, f.deepLink, f.ctaText,
     f.displayPriority, f.status, f.startDate, f.endDate, req.user?.id],
  );
  await invalidateContentCache();
  res.status(201).json({ data: result.rows[0] });
});

// ─── Deals ───────────────────────────────────────────────────────────────────

router.get("/deals", authenticate, requirePermission("content:*", "deals:*", "*:read", "*"), validateQuery(paginationSchema), async (req, res) => {
  const { page, limit } = pageLimit(req.query as Record<string, unknown>);
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query(`SELECT * FROM deals WHERE deleted_at IS NULL ORDER BY display_priority DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    query(`SELECT COUNT(*)::int AS total FROM deals WHERE deleted_at IS NULL`),
  ]);
  res.json({ data: data.rows, pagination: { page, limit, total: count.rows[0]?.total ?? 0 } });
});

router.post("/deals", authenticate, requirePermission("content:*", "deals:*", "*"), validateBody(dealSchema), async (req, res) => {
  const d = req.body;
  const result = await query(
    `INSERT INTO deals (deal_title, description, deal_banner_url, merchant_logo_url,
      coupon_code, discount, cta_text, cta_url, affiliate_url, category, status,
      start_date, end_date, display_priority, metadata, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [d.dealTitle, d.description, d.dealBannerUrl, d.merchantLogoUrl, d.couponCode,
     d.discount, d.ctaText, d.ctaUrl, d.affiliateUrl, d.category, d.status,
     d.startDate, d.endDate, d.displayPriority, JSON.stringify(d.metadata ?? {}), req.user?.id],
  );
  await invalidateContentCache();
  res.status(201).json({ data: result.rows[0] });
});

// ─── Media / Cloudinary ──────────────────────────────────────────────────────

router.get("/media/upload-signature", authenticate, requirePermission("media:*", "content:*", "*"), async (_req, res) => {
  if (!isCloudinaryConfigured()) {
    res.status(503).json({ error: "Cloudinary not configured" });
    return;
  }
  try {
    const params = await getSignedUploadParams();
    res.json(params);
  } catch {
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});

router.get("/audit-logs", authenticate, requirePermission("*"), validateQuery(paginationSchema), async (req, res) => {
  const { page, limit } = pageLimit(req.query as Record<string, unknown>);
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT a.*, u.name AS admin_name, u.email AS admin_email
     FROM audit_logs a
     LEFT JOIN admin_users u ON u.id = a.admin_id
     ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  res.json({ data: result.rows });
});

// ─── Reorder ─────────────────────────────────────────────────────────────────

router.post("/reorder", authenticate, requirePermission("content:*", "*"), async (req, res) => {
  const { table, items } = req.body as {
    table: string;
    items: { id: string; displayPriority: number }[];
  };
  const allowed = ["banners", "categories", "featured_cards", "deals", "shop_categories", "home_sections"];
  if (!allowed.includes(table)) {
    res.status(400).json({ error: "Invalid table" });
    return;
  }
  const col = table === "home_sections" ? "display_order" : "display_priority";
  for (const item of items) {
    await query(`UPDATE ${table} SET ${col} = $1, updated_at = NOW() WHERE id = $2`, [
      item.displayPriority,
      item.id,
    ]);
  }
  await invalidateContentCache();
  res.json({ ok: true });
});

export default router;
