-- InstaHelp Dynamic Content CMS — PostgreSQL Schema
-- Run against Supabase PostgreSQL or any PostgreSQL 14+ instance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Roles & Permissions ───────────────────────────────────────────────────

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role_id       UUID NOT NULL REFERENCES roles(id),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_admin_users_email ON admin_users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_users_role ON admin_users(role_id);

-- ─── Content Status Enum ───────────────────────────────────────────────────

CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'expired', 'archived');

-- ─── Home Banners ──────────────────────────────────────────────────────────

CREATE TABLE banners (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               VARCHAR(200) NOT NULL,
  subtitle            TEXT,
  image_url           TEXT NOT NULL,
  mobile_image_url    TEXT,
  tablet_image_url    TEXT,
  cta_text            VARCHAR(80),
  cta_url             TEXT,
  deep_link           TEXT,
  display_priority    INT NOT NULL DEFAULT 0,
  status              content_status NOT NULL DEFAULT 'draft',
  start_date          TIMESTAMPTZ,
  end_date            TIMESTAMPTZ,
  click_count         BIGINT NOT NULL DEFAULT 0,
  impression_count    BIGINT NOT NULL DEFAULT 0,
  version             INT NOT NULL DEFAULT 1,
  created_by          UUID REFERENCES admin_users(id),
  updated_by          UUID REFERENCES admin_users(id),
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_banners_status ON banners(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_banners_priority ON banners(display_priority DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_banners_schedule ON banners(start_date, end_date) WHERE deleted_at IS NULL;

-- ─── Featured Cards ────────────────────────────────────────────────────────

CREATE TABLE featured_cards (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  image_url        TEXT NOT NULL,
  category         VARCHAR(80),
  deep_link        TEXT,
  cta_text         VARCHAR(80),
  display_priority INT NOT NULL DEFAULT 0,
  status           content_status NOT NULL DEFAULT 'draft',
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  click_count      BIGINT NOT NULL DEFAULT 0,
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_featured_cards_status ON featured_cards(status) WHERE deleted_at IS NULL;

-- ─── Categories ────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(120) NOT NULL,
  slug             VARCHAR(120) NOT NULL UNIQUE,
  icon_url         TEXT,
  banner_image_url TEXT,
  description      TEXT,
  theme_color      VARCHAR(20) DEFAULT '#6366f1',
  display_priority INT NOT NULL DEFAULT 0,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden        BOOLEAN NOT NULL DEFAULT FALSE,
  status           content_status NOT NULL DEFAULT 'active',
  metadata         JSONB DEFAULT '{}',
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_categories_slug ON categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_priority ON categories(display_priority DESC) WHERE deleted_at IS NULL;

-- ─── Home Sections (Page Builder) ──────────────────────────────────────────

CREATE TABLE home_sections (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type     VARCHAR(60) NOT NULL,
  title            VARCHAR(200),
  subtitle         TEXT,
  banner_url       TEXT,
  background_style JSONB DEFAULT '{}',
  visibility_rules JSONB DEFAULT '{}',
  display_order    INT NOT NULL DEFAULT 0,
  status           content_status NOT NULL DEFAULT 'draft',
  items            JSONB DEFAULT '[]',
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_home_sections_order ON home_sections(display_order) WHERE deleted_at IS NULL;

-- ─── Shop Categories ─────────────────────────────────────────────────────────

CREATE TABLE shop_categories (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(120) NOT NULL,
  slug                VARCHAR(120) NOT NULL UNIQUE,
  icon_url            TEXT,
  banner_url          TEXT,
  promo_banner_url    TEXT,
  merchant_highlight  JSONB DEFAULT '{}',
  featured_deals      JSONB DEFAULT '[]',
  display_priority    INT NOT NULL DEFAULT 0,
  status              content_status NOT NULL DEFAULT 'active',
  created_by          UUID REFERENCES admin_users(id),
  updated_by          UUID REFERENCES admin_users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- ─── Deals & Offers ──────────────────────────────────────────────────────────

CREATE TABLE deals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_title       VARCHAR(200) NOT NULL,
  description      TEXT,
  deal_banner_url  TEXT,
  merchant_logo_url TEXT,
  coupon_code      VARCHAR(50),
  discount         VARCHAR(50),
  cta_text         VARCHAR(80),
  cta_url          TEXT,
  affiliate_url    TEXT,
  category         VARCHAR(80),
  status           content_status NOT NULL DEFAULT 'draft',
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  click_count      BIGINT NOT NULL DEFAULT 0,
  conversion_count BIGINT NOT NULL DEFAULT 0,
  display_priority INT NOT NULL DEFAULT 0,
  metadata         JSONB DEFAULT '{}',
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_deals_status ON deals(status) WHERE deleted_at IS NULL;

-- ─── Promotional Popups ──────────────────────────────────────────────────────

CREATE TABLE popups (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  popup_type       VARCHAR(40) NOT NULL,
  title            VARCHAR(200),
  description      TEXT,
  image_url        TEXT,
  cta_text         VARCHAR(80),
  deep_link        TEXT,
  frequency_rules  JSONB DEFAULT '{}',
  targeting_rules  JSONB DEFAULT '{}',
  status           content_status NOT NULL DEFAULT 'draft',
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  impression_count BIGINT NOT NULL DEFAULT 0,
  click_count      BIGINT NOT NULL DEFAULT 0,
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ─── Vendor Campaigns ────────────────────────────────────────────────────────

CREATE TABLE vendor_campaigns (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_name      VARCHAR(200) NOT NULL,
  vendor_logo_url  TEXT,
  campaign_banner_url TEXT NOT NULL,
  placement        VARCHAR(60) NOT NULL,
  destination_url  TEXT,
  priority_score   INT NOT NULL DEFAULT 0,
  status           content_status NOT NULL DEFAULT 'draft',
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  click_count      BIGINT NOT NULL DEFAULT 0,
  created_by       UUID REFERENCES admin_users(id),
  updated_by       UUID REFERENCES admin_users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ─── Mobile Assets ───────────────────────────────────────────────────────────

CREATE TABLE mobile_assets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type    VARCHAR(60) NOT NULL,
  title         VARCHAR(200),
  image_url     TEXT NOT NULL,
  deep_link     TEXT,
  metadata      JSONB DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  status        content_status NOT NULL DEFAULT 'active',
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  created_by    UUID REFERENCES admin_users(id),
  updated_by    UUID REFERENCES admin_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_mobile_assets_type ON mobile_assets(asset_type) WHERE deleted_at IS NULL;

-- ─── Push Notifications ──────────────────────────────────────────────────────

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200) NOT NULL,
  message       TEXT NOT NULL,
  image_url     TEXT,
  deep_link     TEXT,
  audience      JSONB DEFAULT '{"type":"all"}',
  scheduled_at  TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  status        VARCHAR(30) NOT NULL DEFAULT 'draft',
  delivered     INT NOT NULL DEFAULT 0,
  opened        INT NOT NULL DEFAULT 0,
  failed        INT NOT NULL DEFAULT 0,
  created_by    UUID REFERENCES admin_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ─── Promo Codes ─────────────────────────────────────────────────────────────

CREATE TABLE promo_codes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          VARCHAR(50) NOT NULL UNIQUE,
  description   TEXT,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses      INT,
  used_count    INT NOT NULL DEFAULT 0,
  status        content_status NOT NULL DEFAULT 'draft',
  start_date    TIMESTAMPTZ,
  end_date      TIMESTAMPTZ,
  created_by    UUID REFERENCES admin_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ─── Media Library ───────────────────────────────────────────────────────────

CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename        VARCHAR(255) NOT NULL,
  cloudinary_id   VARCHAR(255) NOT NULL,
  url             TEXT NOT NULL,
  folder          VARCHAR(120) DEFAULT 'general',
  tags            TEXT[] DEFAULT '{}',
  mime_type       VARCHAR(80),
  file_size       BIGINT,
  width           INT,
  height          INT,
  version         INT NOT NULL DEFAULT 1,
  uploaded_by     UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_media_folder ON media_assets(folder) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_tags ON media_assets USING GIN(tags) WHERE deleted_at IS NULL;

-- ─── Audit Logs ──────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID REFERENCES admin_users(id),
  action      VARCHAR(60) NOT NULL,
  module      VARCHAR(60) NOT NULL,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ─── Content Version History ─────────────────────────────────────────────────

CREATE TABLE content_versions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module      VARCHAR(60) NOT NULL,
  entity_id   UUID NOT NULL,
  version     INT NOT NULL,
  snapshot    JSONB NOT NULL,
  created_by  UUID REFERENCES admin_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_versions_entity ON content_versions(module, entity_id);

-- ─── Analytics Events ────────────────────────────────────────────────────────

CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type  VARCHAR(60) NOT NULL,
  module      VARCHAR(60) NOT NULL,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_module ON analytics_events(module, entity_id);

-- ─── Seed Default Roles ──────────────────────────────────────────────────────

INSERT INTO roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access', '["*"]'),
  ('content_manager', 'Manage all content modules', '["content:*", "media:*"]'),
  ('marketing_manager', 'Campaigns and notifications', '["campaigns:*", "notifications:*", "deals:*"]'),
  ('support_manager', 'Read access + user management', '["content:read", "users:read", "users:write"]'),
  ('viewer', 'Read-only access', '["*:read"]');
