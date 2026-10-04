# Task ID: 5 — Agent: full-stack-developer (API routes)

## Task
Build admin API routes for motorcycle repair website CMS (Persian content, Next.js 16, Prisma SQLite).

## Work Log
- Created `src/lib/slug.ts` with Persian-safe `slugify()` and `uniqueSlug()` helpers
- Auth API routes:
  - `src/app/api/admin/login/route.ts` (POST) — validates body, calls `loginAdmin`, signs JWT, sets cookie
  - `src/app/api/admin/logout/route.ts` (POST) — clears cookie
  - `src/app/api/admin/me/route.ts` (GET) — returns current session user or 401
- Categories CRUD:
  - `src/app/api/admin/categories/route.ts` (GET list + POST create)
  - `src/app/api/admin/categories/[id]/route.ts` (GET, PUT, DELETE)
- Articles CRUD:
  - `src/app/api/admin/articles/route.ts` (GET list + POST create)
  - `src/app/api/admin/articles/[id]/route.ts` (GET, PUT, DELETE)
- Services CRUD:
  - `src/app/api/admin/services/route.ts` (GET list + POST create)
  - `src/app/api/admin/services/[id]/route.ts` (GET, PUT, DELETE)
- Site settings singleton:
  - `src/app/api/admin/settings/route.ts` (GET auto-creates defaults, PUT)
- Contact messages admin:
  - `src/app/api/admin/messages/route.ts` (GET list with `?unread` filter and `unreadCount`)
  - `src/app/api/admin/messages/[id]/route.ts` (PATCH toggle read, DELETE)
- Public contact form:
  - `src/app/api/contact/route.ts` (POST, NOT protected by middleware)
- Admin stats:
  - `src/app/api/admin/stats/route.ts` (GET returns counts)

## Stage Summary
- All admin routes (except `/api/admin/login`) are auto-protected by `src/middleware.ts` returning 401 on missing session.
- All error messages in Persian.
- All validation uses Zod; only the first error message is returned to keep responses compact.
- Slug auto-generated from `title` when not provided, with `-2`, `-3`, ... suffix on collision.
- Article `publishedAt` auto-set to `now()` when article is published but no `publishedAt` is provided.
- Category delete is a soft cascade: articles get `categoryId = null`, children get `parentId = null`, then the category is deleted.
- `bun run lint` passes for ALL new files (remaining lint errors are in other agents' pre-existing files: `theme-toggle.tsx`, `header.tsx`, `category-form-sheet.tsx`).
- `bunx tsc --noEmit` shows zero errors in my files (remaining errors are in other agents' files).

## API Contract (EXACT shapes)

### Authentication
- `POST /api/admin/login` — body `{username, password}` → 200 `{ok:true, user:{username, name}}` (sets httpOnly cookie) | 401 `{ok:false, error}`
- `POST /api/admin/logout` — → 200 `{ok:true}`
- `GET /api/admin/me` — → 200 `{ok:true, user:{id, username, name, role}}` | 401 `{ok:false, error}`

### Stats
- `GET /api/admin/stats` — → 200 `{articles, publishedArticles, categories, services, unreadMessages, totalMessages}` (all numbers)

### Categories (all return `{ error: string }` on failure)
- `GET /api/admin/categories?page=1&limit=20&search=...&published=true|false&featured=true|false` → 200 `{data: Category[], total, page, limit}`
  - Category includes `_count: { articles: number, children: number }` and `parent: { id, title, slug } | null`
- `POST /api/admin/categories` — body `{title, slug?, brand?, city?, shortDescription?, content?, image?, icon?, metaTitle?, metaDescription?, metaKeywords?, canonicalUrl?, ogImage?, structuredData?, parentId?, featured?, published?, order?}` → 201 created
- `GET /api/admin/categories/[id]` → 200 (with `_count`, `parent`, and `children: [{id, title, slug}]`) | 404
- `PUT /api/admin/categories/[id]` — same body as POST, all optional → 200 | 400/404
- `DELETE /api/admin/categories/[id]` — soft cascade → 200 `{ok:true, message}` | 404/500

### Articles
- `GET /api/admin/articles?page=1&limit=20&search=...&categoryId=...&published=true|false&featured=true|false` → 200 `{data, total, page, limit}`
  - Each article includes `category: { id, title, slug } | null`
- `POST /api/admin/articles` — body `{title, content, slug?, excerpt?, coverImage?, metaTitle?, metaDescription?, metaKeywords?, canonicalUrl?, ogImage?, structuredData?, categoryId?, authorName?, readingTime?, tags?, featured?, published?, publishedAt?}` → 201 created
- `GET /api/admin/articles/[id]` → 200 | 404
- `PUT /api/admin/articles/[id]` — same body as POST, all optional → 200 | 400/404
- `DELETE /api/admin/articles/[id]` → 200 `{ok:true, message}` | 404/500

### Services
- `GET /api/admin/services?page=1&limit=20&search=...&published=true|false` → 200 `{data, total, page, limit}`
- `POST /api/admin/services` — body `{title, slug?, description?, icon?, image?, price?, features?, published?, order?}` → 201
- `GET /api/admin/services/[id]` → 200 | 404
- `PUT /api/admin/services/[id]` — same as POST, all optional → 200 | 400/404
- `DELETE /api/admin/services/[id]` → 200 `{ok:true, message}` | 404/500

### Site Settings (singleton)
- `GET /api/admin/settings` → 200 SiteSettings (auto-created with defaults if missing)
  - Fields: siteName, siteDescription, logoText, phone, whatsapp, email, address, workingHours, mapEmbed, instagram, telegram, aboutTitle, aboutContent, aboutImage, heroBadge, heroTitle, heroSubtitle, heroImage, heroCtaText, features (JSON string), stats (JSON string), footerText, metaTitle, metaDescription, metaKeywords, ogImage, primaryColor, updatedAt
- `PUT /api/admin/settings` — body: any subset of above (null allowed for optional) → 200 updated

### Contact Messages (admin)
- `GET /api/admin/messages?page=1&limit=20&search=...&unread=true|false` → 200 `{data, total, unreadCount, page, limit}`
- `PATCH /api/admin/messages/[id]` — body `{read: boolean}` → 200 updated | 400/404
- `DELETE /api/admin/messages/[id]` → 200 `{ok:true, message}` | 404/500

### Public Contact Form
- `POST /api/contact` — body `{name (required), phone (required, digits/+/-/spaces), email? (valid email), subject? (max 200), message (required, max 5000)}` → 201 `{ok:true, message}` | 400 `{ok:false, error}`

## Notes for downstream agents
- Default admin credentials: `username=admin`, `password=admin123` (from `prisma/seed.ts`)
- All list endpoints follow the shape `{data, total, page, limit}`
- The middleware handles 401 automatically — no client-side session check needed
- Cookies are httpOnly; same-origin fetches include them by default; if cross-origin is needed use `credentials: "include"`
