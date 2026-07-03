# InstaHelp Dynamic Content CMS

Production-grade CMS for managing all mobile app content without Play Store / App Store updates.

## Architecture

```
Admin Dashboard (Next.js 15)  →  CMS API (Express)  →  PostgreSQL (Supabase)
        ↓                              ↓                        ↓
   Cloudinary CDN              Redis Cache              Mobile App (React Native)
```

## Quick Start

### 1. Database (Supabase PostgreSQL)

1. Create a Supabase project
2. Copy the connection string to `cms/api/.env` as `DATABASE_URL`
3. Run migrations and seed:

```bash
cd cms
cp api/.env.example api/.env
# Edit api/.env with your DATABASE_URL, JWT_SECRET, Cloudinary keys

npm install --prefix api
npm run db:migrate
npm run db:seed
```

Default admin: `admin@instahelp.in` / `ChangeMe123!`

### 2. CMS API

```bash
cd cms/api
npm install
npm run dev
# → http://localhost:4000
```

**Public Content APIs (mobile app):**
- `GET /api/content/home`
- `GET /api/content/banners`
- `GET /api/content/categories`
- `GET /api/content/deals`
- `GET /api/content/shop`
- `GET /api/content/promotions`
- `GET /api/content/mobile-assets?type=splash`
- `POST /api/content/events` (analytics)
- `WS /ws/content` (real-time updates)

**Admin APIs:** `POST /api/admin/auth/login`, CRUD under `/api/admin/*`

### 3. Admin Dashboard

```bash
cd cms/admin
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

### 4. Mobile App Integration

Add to your `.env`:

```
EXPO_PUBLIC_CMS_API_URL=http://localhost:4000
```

The mobile app automatically:
- Fetches banners, categories, shop content, splash assets from CMS
- Falls back to bundled constants if API is unavailable
- Caches content for 5 minutes (stale-while-revalidate)
- Receives real-time updates via WebSocket

## Modules

| Module | Admin Route | Mobile API |
|--------|-------------|------------|
| Home Banners | `/dashboard/content/banners` | `/api/content/banners` |
| Featured Cards | `/dashboard/content/featured` | `/api/content/home` |
| Categories | `/dashboard/content/categories` | `/api/content/categories` |
| Shop | `/dashboard/content/shop` | `/api/content/shop` |
| Deals | `/dashboard/content/deals` | `/api/content/deals` |
| Mobile Assets | `/dashboard/assets/*` | `/api/content/mobile-assets` |
| Audit Logs | `/dashboard/admin/audit-logs` | — |

## Security

- JWT authentication with RBAC (Super Admin, Content Manager, Marketing Manager, Support, Viewer)
- Rate limiting on public and admin endpoints
- Input validation with Zod
- Audit logging for all admin actions
- Cloudinary signed uploads

## Deployment

**API:** Deploy `cms/api` to Render or Railway. Set `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `CLOUDINARY_*`.

**Admin:** Deploy `cms/admin` to Vercel. Set `NEXT_PUBLIC_API_URL` to your API URL.

**Mobile:** Set `EXPO_PUBLIC_CMS_API_URL` in EAS environment variables and rebuild once. After that, all content updates are server-driven.

## Development

Run both services:

```bash
cd cms
npm install
npm run dev
```
