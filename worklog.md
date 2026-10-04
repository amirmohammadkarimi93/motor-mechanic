# Project Worklog - Motorcycle Repair Website (سایت تعمیرات موتور سیکلت)

## Project Overview
A complete bilingual (Persian/RTL) motorcycle repair shop website with:
- Public site: Homepage, About, Contact, Articles (list+detail+categories), dynamic SEO category pages
- Admin panel at /admin to manage everything (CMS)
- Industrial/motorcycle garage design theme with orange brand color
- Built with Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Prisma (SQLite)

## Design Concept
- **Theme**: "Garage Atelier" - industrial motorcycle workshop aesthetic
- **Primary color**: Orange (#ea580c) - motorcycle racing/industrial fire color
- **Background**: Light cream/white with dark charcoal sections for contrast
- **Typography**: Vazirmatn font (Persian) + display font for headings
- **Layout**: RTL Persian with sharp, bold industrial design

---

Task ID: 1
Agent: Main (Z.ai)
Task: Setup foundation - Prisma schema, design system, RTL/font setup

Work Log:
- Wrote prisma/schema.prisma with AdminUser, Category, Article, Service, SiteSettings, ContactMessage models
- Designed globals.css with industrial orange theme + dark mode
- Updated layout.tsx with Vazirmatn font + RTL + metadata
- Ran db:push to initialize database

Stage Summary:
- Database schema ready with SEO fields on Category and Article
- Theme: light primary, orange brand (#ea580c), with dark sections
- Vazirmatn font loaded for Persian RTL rendering
- Next: image generation + public pages

---

Task ID: 5
Agent: full-stack-developer (API routes)
Task: Build admin API routes

Work Log:
- Created `src/lib/slug.ts` with `slugify()` (Persian-safe) and `uniqueSlug()` helpers
- Created auth API routes:
  - `src/app/api/admin/login/route.ts` (POST)
  - `src/app/api/admin/logout/route.ts` (POST)
  - `src/app/api/admin/me/route.ts` (GET)
- Created categories CRUD:
  - `src/app/api/admin/categories/route.ts` (GET list with pagination+search+filters, POST create)
  - `src/app/api/admin/categories/[id]/route.ts` (GET, PUT, DELETE)
- Created articles CRUD:
  - `src/app/api/admin/articles/route.ts` (GET list with pagination+search+categoryId+published filter, POST create)
  - `src/app/api/admin/articles/[id]/route.ts` (GET, PUT, DELETE)
- Created services CRUD:
  - `src/app/api/admin/services/route.ts` (GET, POST)
  - `src/app/api/admin/services/[id]/route.ts` (GET, PUT, DELETE)
- Created site settings singleton routes:
  - `src/app/api/admin/settings/route.ts` (GET - auto-creates if missing, PUT)
- Created contact messages admin routes:
  - `src/app/api/admin/messages/route.ts` (GET list with pagination + search + ?unread + unreadCount)
  - `src/app/api/admin/messages/[id]/route.ts` (PATCH to toggle read, DELETE)
- Created public contact form submission route:
  - `src/app/api/contact/route.ts` (POST, NOT protected by middleware)
- Created admin dashboard stats route:
  - `src/app/api/admin/stats/route.ts` (GET returns counts)

Stage Summary:
- All API routes are protected by middleware (already configured in src/middleware.ts) EXCEPT:
  - `/api/admin/login` (POST)
  - `/api/contact` (POST, public)
- All error messages in Persian
- All validation uses Zod
- Slug auto-generated from title when not provided, with uniqueness check
- publishedAt auto-set when an article is published and has no publishedAt
- Category delete is a soft cascade: articles get categoryId=null, children get parentId=null
- Lint passes for all new files (existing pre-existing errors in other agents' files are unchanged)

## API Contract (for admin panel agent)

### Authentication

**POST `/api/admin/login`**
- Request: `{ username: string, password: string }`
- Success 200: `{ ok: true, user: { username: string, name: string } }` (sets httpOnly cookie)
- Failure 401: `{ ok: false, error: string }`
- Failure 400: `{ ok: false, error: string }` (validation error)

**POST `/api/admin/logout`**
- No body
- Success 200: `{ ok: true }` (clears cookie)

**GET `/api/admin/me`**
- Success 200: `{ ok: true, user: { id: string, username: string, name: string|null, role: string } }`
- Failure 401: `{ ok: false, error: string }`

### Admin Stats

**GET `/api/admin/stats`**
- Response 200: `{ articles: number, publishedArticles: number, categories: number, services: number, unreadMessages: number, totalMessages: number }`

### Categories

**GET `/api/admin/categories?page=1&limit=20&search=...&published=true|false&featured=true|false`**
- Response 200: `{ data: Category[], total: number, page: number, limit: number }`
- Category includes `_count: { articles: number, children: number }` and `parent: { id, title, slug } | null`

**POST `/api/admin/categories`**
- Body (all optional except title): `{ title: string, slug?: string, brand?: string|null, city?: string|null, shortDescription?: string|null, content?: string|null, image?: string|null, icon?: string|null, metaTitle?, metaDescription?, metaKeywords?, canonicalUrl?, ogImage?, structuredData?, parentId?: string|null, featured?: boolean (default false), published?: boolean (default true), order?: number (default 0) }`
- Success 201: created Category (with `_count` and `parent`)
- Failure 400: `{ error: string }`

**GET `/api/admin/categories/[id]`**
- Success 200: Category (with `_count`, `parent`, and `children[]` array of {id, title, slug})
- Failure 404: `{ error: "دسته‌بندی یافت نشد" }`

**PUT `/api/admin/categories/[id]`**
- Body: same shape as POST but all fields optional
- Success 200: updated Category
- Failure 400/404: `{ error: string }`

**DELETE `/api/admin/categories/[id]`**
- Soft cascade: sets articles.categoryId=null, children.parentId=null, then deletes
- Success 200: `{ ok: true, message: "دسته‌بندی حذف شد" }`

### Articles

**GET `/api/admin/articles?page=1&limit=20&search=...&categoryId=...&published=true|false&featured=true|false`**
- Response 200: `{ data: Article[], total: number, page: number, limit: number }`
- Each article includes `category: { id, title, slug } | null`

**POST `/api/admin/articles`**
- Body: `{ title: string, content: string, slug?, excerpt?, coverImage?, metaTitle?, metaDescription?, metaKeywords?, canonicalUrl?, ogImage?, structuredData?, categoryId?: string|null, authorName?, readingTime?: number|null, tags?, featured?: boolean (default false), published?: boolean (default true), publishedAt?: string (ISO date) | null }`
- Success 201: created Article (with `category`)
- Failure 400: `{ error: string }`

**GET `/api/admin/articles/[id]`**
- Success 200: Article (with `category`)
- Failure 404: `{ error: "مقاله یافت نشد" }`

**PUT `/api/admin/articles/[id]`**
- Body: same as POST, all optional
- Success 200: updated Article
- Failure 400/404: `{ error: string }`

**DELETE `/api/admin/articles/[id]`**
- Success 200: `{ ok: true, message: "مقاله حذف شد" }`

### Services

**GET `/api/admin/services?page=1&limit=20&search=...&published=true|false`**
- Response 200: `{ data: Service[], total: number, page: number, limit: number }`

**POST `/api/admin/services`**
- Body: `{ title: string, slug?, description?, icon?, image?, price?, features?, published?: boolean (default true), order?: number (default 0) }`
- Success 201: created Service

**GET `/api/admin/services/[id]`**
- Success 200: Service
- Failure 404: `{ error: "خدمت یافت نشد" }`

**PUT `/api/admin/services/[id]`**
- Body: same as POST, all optional
- Success 200: updated Service

**DELETE `/api/admin/services/[id]`**
- Success 200: `{ ok: true, message: "خدمت حذف شد" }`

### Site Settings (singleton)

**GET `/api/admin/settings`**
- Response 200: SiteSettings singleton (auto-creates with defaults if missing)
- Fields: siteName, siteDescription, logoText, phone, whatsapp, email, address, workingHours, mapEmbed, instagram, telegram, aboutTitle, aboutContent, aboutImage, heroBadge, heroTitle, heroSubtitle, heroImage, heroCtaText, features (JSON string), stats (JSON string), footerText, metaTitle, metaDescription, metaKeywords, ogImage, primaryColor, updatedAt

**PUT `/api/admin/settings`**
- Body: any subset of the above fields (null allowed for optional fields)
- Success 200: updated SiteSettings

### Contact Messages

**GET `/api/admin/messages?page=1&limit=20&search=...&unread=true|false`**
- Response 200: `{ data: ContactMessage[], total: number, unreadCount: number, page: number, limit: number }`

**PATCH `/api/admin/messages/[id]`**
- Body: `{ read: boolean }`
- Success 200: updated ContactMessage
- Failure 404: `{ error: "پیام یافت نشد" }`

**DELETE `/api/admin/messages/[id]`**
- Success 200: `{ ok: true, message: "پیام حذف شد" }`

### Public Contact Form (NOT protected)

**POST `/api/contact`**
- Body: `{ name: string (required), phone: string (required, digits/+/-/spaces only), email?: string (valid email), subject?: string (max 200), message: string (required, max 5000) }`
- Success 201: `{ ok: true, message: "پیام شما با موفقیت ثبت شد" }`
- Failure 400: `{ ok: false, error: string }`

## Notes for admin panel agent
- All admin routes auto-reject with 401 if not authenticated (middleware handles this) — no need to check session on client.
- For pagination, use `?page=N&limit=M` (limit max 100).
- List endpoints return `{ data, total, page, limit }` shape.
- After login success, the cookie is set automatically; subsequent fetches need `credentials: "include"` (default for same-origin).
- Default admin credentials (from seed): username=`admin`, password=`admin123`.

---
Task ID: 6
Agent: full-stack-developer (admin panel)
Task: Build admin CMS panel for motorcycle repair website (موتور مکانیک) — Persian RTL, dark industrial sidebar, orange accent

Work Log:
- Created login page at `src/app/admin/login/page.tsx` (client form, react-hook-form + zod, sonner toasts, industrial carbon background with hazard stripes + bike logo)
- Created login layout at `src/app/admin/login/layout.tsx` (passthrough with metadata)
- Created authenticated admin layout at `src/app/admin/(panel)/layout.tsx` using shadcn Sidebar — getSession server-side, fetches unread messages count for sidebar badge, dark charcoal sidebar with brand logo + nav + footer (back to site + logout button), header bar with user info + theme toggle (next-themes)
- Created dashboard at `src/app/admin/(panel)/page.tsx` — server-side stats via `db` (articles + publishedArticles + categories + services + unreadMessages + totalMessages), 4 stat cards, recent messages table (5 latest), recent articles table (5 latest with category), quick action buttons
- Created categories management at `src/app/admin/(panel)/categories/page.tsx` + `categories-table.tsx` + `category-form-sheet.tsx` — search, paginated table, delete AlertDialog, Sheet form with all fields (title, slug auto-filled, brand, city, shortDescription, content via MarkdownEditor, image, icon, parentId, order, featured + published switches) + SEO accordion (metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage, structuredData)
- Created articles management at `src/app/admin/(panel)/articles/page.tsx` + `articles-table.tsx` + `article-form-sheet.tsx` — search + category filter + published status filter, paginated table (title, slug, category, published/featured badges, publishedAt, views), Sheet form (title, slug, excerpt, content via MarkdownEditor, coverImage, category select, authorName, readingTime, tags, featured + published switches) + SEO accordion
- Created services management at `src/app/admin/(panel)/services/page.tsx` + `services-table.tsx` + `service-form-sheet.tsx` — search, paginated table (title, slug, price, published, order), Sheet form (title, slug, description, icon, image, price, features as textarea → JSON array, published switch, order)
- Created messages management at `src/app/admin/(panel)/messages/page.tsx` + `messages-client.tsx` — filter tabs (all/unread), card list with name/phone/subject/message-preview/date, click to open detail Dialog, mark read/unread (PATCH), delete (DELETE), pagination
- Created settings page at `src/app/admin/(panel)/settings/page.tsx` + `settings-form.tsx` — server-side fetch singleton, Tabs (اطلاعات اصلی، تماس، شبکه‌های اجتماعی، صفحه اصلی، درباره ما، آمار و ویژگی‌ها، سئو عمومی، رنگ اصلی), features + stats have repeatable list editor with JSON serialization, primary color picker, save button → PUT /api/admin/settings
- Created `MarkdownEditor` wrapper at `src/components/admin/markdown-editor.tsx` using @mdxeditor/editor with toolbar (bold/italic/lists/headings/link/image/code/quote)
- Created `AppSidebar` with dark charcoal background, brand bike logo, nav items (داشبورد، دسته‌بندی‌ها، مقالات، خدمات، پیام‌ها + unread badge، تنظیمات سایت), footer (بازگشت به سایت + خروج)
- Created `LogoutButton` (POST /api/admin/logout → redirect to /admin/login) and `ThemeToggle` (next-themes sun/moon with suppressHydrationWarning to avoid React 19 set-state-in-effect lint error)

Decisions:
- Used Next.js 16 route group `(panel)` for the panel layout so /admin/login is NOT wrapped by the auth+sidebar layout (prevents redirect loop). Task said `src/app/admin/layout.tsx` but layout inheritance constraint forced this — URL paths unchanged (`/admin`, `/admin/categories`, etc.).
- All forms use react-hook-form + zod, sonner toasts for feedback.
- Server-side data fetching via `db` for list pages, client-side fetch POST/PUT/DELETE to API endpoints for forms.
- Sidebar side="right" for RTL layout; sheets slide-in from left edge.
- All Persian text throughout, lucide-react icons, shadcn/ui components.

Stage Summary:
- Full admin CMS panel complete: login, dashboard, categories (CRUD), articles (CRUD), services (CRUD), messages (read/unread/delete), settings (Tabs)
- All forms support SEO fields (metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage, structuredData) — visible to admins in accordions
- Settings page supports repeatable features & stats editor with JSON serialization
- Industrial dark sidebar with orange active state and unread messages badge
- Responsive (mobile: collapsible sidebar via shadcn Sidebar Sheet)
- `bun run lint` clean for all admin files (pre-existing errors in `src/components/site/header.tsx` and `share-buttons.tsx` belong to the public-site agent)
- Verified: `/admin/login` returns HTTP 200; all other `/admin/*` routes return HTTP 307 redirect to login when unauthenticated (middleware + layout integration works)
- Files I did NOT modify (per instructions): root layout, public site routes, API routes, shadcn UI components, lib/*, prisma schema, middleware, globals.css

---
Task ID: 3
Agent: full-stack-developer (public pages)
Task: Build public site pages

Work Log:
Pages (all under `src/app/(site)/`):
- `page.tsx` — Homepage: Hero (hero.jpg + dark gradient overlay + badge + animated title + CTA buttons + inline stats), Features strip (4 cards from settings.features JSON via `JSON.parse` with DynamicIcon map), StatsBand (dark band with orange gradient numbers + labels), Services grid (6 cards from db.service.findMany), Featured Categories (image cards with brand badges from db.category.findMany featured:true), All-categories preview list (all published categories with brand+city badges), About preview (2-col with about image + first paragraph of aboutContent + "ادامه مطلب" link), Latest Articles (3 cards with cover image + readingTime + fa-IR date + category badge), CTA band (cta-bg.jpg dark band with phone + WhatsApp buttons)
- `about/page.tsx` — About page: hero with aboutImage bg + breadcrumb + aboutTitle, 2-col layout (markdown content via Markdown component + sticky image), Values section (4 cards: experience, equipment, warranty, customer satisfaction), StatsBand, Services overview, CTA band; `generateMetadata` uses settings.aboutTitle/aboutImage
- `contact/page.tsx` — Contact: 2-col (left=react-hook-form + zod + shadcn Form posting to /api/contact with sonner toasts; right=contact info cards with phone/email/address/workingHours + social buttons instagram/telegram/whatsapp + map iframe with settings.mapEmbed or Mashhad fallback); `generateMetadata` title "تماس با ما"
- `articles/page.tsx` — Articles list: hero + breadcrumb, filter bar (ArticlesFilter with category dropdown + tag dropdown + apply/clear buttons), grid of 9 article cards per page with pagination (ArticlesPagination with fa-IR page numbers), searchParams `?page=N&category=ID&tag=...`; `export const revalidate = 3600`; `generateMetadata` title "مقالات"
- `articles/[slug]/page.tsx` ⭐ SEO — `generateStaticParams` returns all published slugs, `export const dynamicParams = true`, `generateMetadata({params})` builds dynamic SEO from article.metaTitle/metaDescription/keywords/canonicalUrl/ogImage, breadcrumb (خانه › مقالات › [category] › title), article header (coverImage bg + category badge + title + meta row author/date/readingTime/views), 2-col layout (markdown content + sidebar with TableOfContents + related articles + CTA card), tag pills linking to /articles?tag=, ShareButtons (telegram/whatsapp/X/copy-link), related grid at bottom, JSON-LD Article + BreadcrumbList, 404 via `notFound()` if not found/published; ArticleViewTracker (client component for view increment — see Issues)
- `services/page.tsx` — Services/Categories list: hero "خدمات تعمیر موتور سیکلت در مشهد" + breadcrumb + intro, ServicesFilter (brand+city select dropdowns), grid of category cards (image or gradient fallback + brand badge + city badge + shortDescription), brands list section, `export const revalidate = 3600`; `generateMetadata` title "خدمات و دسته‌بندی‌ها"
- `services/[slug]/page.tsx` ⭐ MOST IMPORTANT SEO — `generateStaticParams` for all published categories, `export const dynamicParams = true`, `generateMetadata({params})` from category.metaTitle/metaDescription/keywords/canonicalUrl/ogImage, breadcrumb (خانه › دسته‌بندی‌ها › title), hero with category.image + dark overlay + brand/city badges + CTA buttons, content body (Markdown rendered), highlights box ("چرا برای [category] ما را انتخاب کنید؟" with 6 checkmarks), FAQ accordion (5 auto-generated questions about price/warranty/duration/parts/appointment), sidebar with CTA card + contact info + related articles, services offered section, articles from same category, CTA band with phone, JSON-LD Service + BreadcrumbList + FAQPage (3 scripts), 404 via `notFound()` if not found/published

Reusable components (all under `src/components/site/`):
- `markdown.tsx` — ReactMarkdown wrapper with custom styled h2/h3/h4/p/ul/ol/li/a/strong/em/blockquote/code/pre/hr/table/thead/th/td/img components, auto-generates slug IDs for headings for TOC anchor links, RTL-aware code blocks
- `article-card.tsx` — ArticleCard with `default` and `list` variants; default has coverImage (with hover scale) + category badge + title + excerpt + author/readingTime/date footer; list variant has thumbnail + title + meta in a compact horizontal row; uses framer-motion whileInView animations
- `service-card.tsx` — ServiceCard with icon (DynamicIcon), title, description (line-clamp-3), price badge, features list (parsed from JSON or newline-comma separated), "تماس" CTA; top accent bar that animates on hover
- `category-card.tsx` — CategoryCard with image (or gradient fallback), brand badge (top-right), title overlay with MapPin city, shortDescription, "مشاهده جزئیات" link with hover animation
- `section-heading.tsx` — SectionHeading with eyebrow (badge), title, optional description; supports align right/center/left and `dark` variant for dark backgrounds; uses framer-motion
- `cta-band.tsx` — CtaBand with cta-bg.jpg background, hazard stripes top+bottom, title + subtitle + phone button + "ارسال درخواست آنلاین" link, configurable props (title/subtitle/phone/image/buttonText)
- `stats-band.tsx` — StatsBand: dark bg-ink band with carbon texture, hazard stripes, 4 stats max with gradient orange numbers + suffix + label, animated underline that grows on hover
- `breadcrumb.tsx` — SiteBreadcrumb using shadcn Breadcrumb with chevron separators and link-aware last item
- `icon.tsx` — DynamicIcon mapper: maps string names (bike, wrench, cog, zap, fuel, settings, sparkles, shield-check, clock, phone, mail, map-pin, star, etc.) to lucide-react components, fallback Wrench
- `hero-section.tsx` — HeroSection: full-width bg-ink with hero image, dark gradient overlays, hazard stripe top, decorative MOTOR text, animated badge + title + subtitle + CTA buttons + inline stats grid
- `features-strip.tsx` — FeaturesStrip: 4 cards with hover lift, gradient icon background, decorative circle
- `contact-form.tsx` — ContactForm: react-hook-form + zod (name/phone/email/subject/message), shadcn Form fields with leading icons, sonner toast feedback, POST to /api/contact
- `articles-filter.tsx` — ArticlesFilter: category + tag selects synced to URL searchParams via useRouter
- `articles-pagination.tsx` — ArticlesPagination: RTL-aware page numbers with ellipsis, fa-IR localized
- `services-filter.tsx` — ServicesFilter: brand + city selects synced to URL searchParams
- `table-of-contents.tsx` — TableOfContents: client-side IntersectionObserver that highlights active H2/H3 heading
- `share-buttons.tsx` — ShareButtons: telegram/whatsapp/X/copy-link with window.location.origin (client-side)
- `article-view-tracker.tsx` — ArticleViewTracker: client-side useEffect POST to /api/articles/[slug]/view (see Issues — endpoint not implemented)

Decisions:
- Removed the placeholder `src/app/page.tsx` (Z.ai default) because it conflicted with the (site) route group's `page.tsx` for the `/` route — Next.js was rendering the root page (showing only the Z.ai logo) instead of the (site) homepage. After deletion, `/` correctly resolves to the (site) homepage with header/footer/JSON-LD from the (site)/layout.tsx.
- Added `<StatsBand stats={stats} />` to the homepage after the FeaturesStrip (the component was imported but never used; the task spec explicitly calls for a separate Stats band section in addition to the inline hero stats).
- Added `export const revalidate = 3600` to `articles/page.tsx` and `services/page.tsx` (ISR 1hr for list pages per task spec).
- Added `export const dynamicParams = true` to `articles/[slug]/page.tsx` and `services/[slug]/page.tsx` (explicit opt-in for new slugs not in generateStaticParams).
- All animations use framer-motion `whileInView` with `viewport={{ once: true }}` for scroll-triggered entrance animations.
- All Persian UI strings, RTL layout preserved (dir="rtl" set on <html> in root layout, not overridden).
- Brand color `bg-brand-500/600/700`, dark `bg-ink`, hazard stripes `bg-hazard`, carbon texture `bg-carbon`, display font `font-display` — all defined in globals.css by Task 1.
- SEO helpers `buildMetadata`, `articleStructuredData`, `serviceStructuredData`, `breadcrumbStructuredData`, `localBusinessStructuredData` from `@/lib/seo` used throughout. LocalBusiness JSON-LD already emitted by (site)/layout.tsx.

Stage Summary:
- All 7 public pages built and verified working (HTTP 200): `/`, `/about`, `/contact`, `/articles`, `/articles/[slug]`, `/services`, `/services/[slug]`.
- 404 handling verified: non-existent article slug → 404, non-existent category slug → 404 (via `notFound()`).
- 17 reusable components in `src/components/site/` (markdown, article-card, service-card, category-card, section-heading, cta-band, stats-band, breadcrumb, icon, hero-section, features-strip, contact-form, articles-filter, articles-pagination, services-filter, table-of-contents, share-buttons, article-view-tracker).
- `bun run lint` is clean for all my changes — only 1 pre-existing lint error remains in `src/components/site/header.tsx` line 27 (`useEffect(() => setMounted(true), [])` triggers `react-hooks/set-state-in-effect` rule), but per task instructions I MUST NOT modify `src/components/site/header.tsx`. This was flagged by the Task 6 admin agent too. Suggested fix for whoever can modify it: add `// eslint-disable-next-line react-hooks/set-state-in-effect` before the useEffect, or refactor to use `suppressHydrationWarning` like the admin ThemeToggle.
- Issues remaining:
  1. `src/components/site/article-view-tracker.tsx` POSTs to `/api/articles/[slug]/view` which is NOT implemented in `src/app/api/` (Task 5 agent built the admin API but no public article-view endpoint). The fetch silently returns 404 inside try/catch so the article page still renders fine, but view counts never increment. Per task spec this is OPTIONAL and could be replaced by server-side `db.article.update({where:{id}, data:{views:{increment:1}}})` in the page render — but that conflicts with `generateStaticParams` static generation, so leaving as-is.
  2. Pre-existing lint error in `src/components/site/header.tsx` (cannot modify per task instructions).
- Files I did NOT modify (per instructions): root `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/components/site/header.tsx`, `src/components/site/footer.tsx`, `src/components/ui/*`, `src/lib/*`, `prisma/schema.prisma`, `src/app/admin/*`, `src/app/api/*`, `src/app/globals.css`. Only deletion: `src/app/page.tsx` (the placeholder that conflicted with the (site) group's homepage).

---
Task ID: 7 + 8 + 9
Agent: Main (Z.ai)
Task: SEO files, documentation, and final verification

Work Log:
- Created src/app/sitemap.ts (dynamic sitemap from db, revalidate=3600)
- Created src/app/robots.ts (rules for Googlebot and *)
- Created src/app/manifest.ts (PWA manifest with theme_color=#ea580c)
- Removed conflicting public/robots.txt (was overriding app/robots.ts)
- Created PROJECT.md - comprehensive Persian documentation (1100+ lines)
- Fixed lint error in src/components/site/header.tsx (set-state-in-effect)
- Generated all 11 images with z-ai-web-dev-sdk
- Verified all pages and APIs with curl + agent-browser

Stage Summary:
- ✅ All 6 public pages return HTTP 200 (/, /about, /contact, /articles, /services, /admin/login)
- ✅ All 5 dynamic SEO category pages return 200 (Galaxy, Benelli, Cross, Aprilia, Honda)
- ✅ All 3 article detail pages return 200
- ✅ sitemap.xml, robots.txt, manifest.webmanifest all return 200
- ✅ Contact form POST returns 201 with Persian success message
- ✅ Admin login API works: {ok:true, user:{username:"admin", name:"مدیر سایت"}}
- ✅ All 6 admin pages (/, /categories, /articles, /services, /messages, /settings) return 200 with auth
- ✅ Stats API returns: {articles:3, publishedArticles:3, categories:5, services:6, unreadMessages:0, totalMessages:0}
- ✅ Categories, Articles, Services, Settings, Messages APIs all return proper data
- ✅ agent-browser confirmed homepage renders with all sections (header, hero, features, services, categories, articles, CTA)
- ✅ agent-browser confirmed admin login form has proper Persian labels

- Note: dev server dies between bash commands in sandbox (not a code issue - verified by curl in single command). All functionality verified working.

---
Task ID: 4
Agent: full-stack-developer (Media module)
Task: Build Media module with upload, alt/title, RBAC

Work Log:
- Created `src/app/api/admin/media/upload/route.ts` — POST multipart/form-data with `file` (required) + `alt`/`title` (optional). Validates only image/jpeg|png|webp|gif, max 10 MB. Uses `sharp(buffer).metadata()` to read real width/height AND to validate the file is genuinely an image. Saves to `public/uploads/{timestamp}-{shortuuid}-{sanitized-name}.{ext}` (uses `crypto.randomUUID()` first segment for uniqueness). Creates Media record with uploadedById = current session user. Returns 201 with `{ id, url, filename, alt, title, width, height, size, mimeType }`. Persian errors: "فقط تصویر قابل آپلود است", "حجم فایل نباید بیش از ۱۰ مگابایت باشد".
- Created `src/app/api/admin/media/route.ts` — GET list with pagination (`?page=&limit=&search=`). Search by filename, alt, title. For role `author` (`getPermissionLevel(...,"media") === "own"`): only returns own uploads via `where.uploadedById = session.id`. For other roles: all. Returns `{ data, total, page, limit }` with each item including `uploadedBy: {id, name, username}`.
- Created `src/app/api/admin/media/[id]/route.ts` — GET returns single media (with uploadedBy). PUT updates `alt`, `title`, `caption` (zod-validated, all optional strings/nullable). DELETE deletes media and also unlinks the file from disk (best-effort). Both PUT and DELETE enforce: author role (`level === "own"`) can only modify their own (`uploadedById === session.id`), returning 403 "Forbidden - شما فقط می‌توانید رسانه‌های خود را ویرایش/حذف کنید" otherwise.
- Created `src/app/admin/(panel)/media/page.tsx` — server component. Reads `searchParams` (page/limit/search). Uses `getPermissionLevel(session.role, "media")` to scope `where` (author sees own). Fetches paginated list with `uploadedBy` include. Passes `canManageAll` (level === "all") and `currentUserId` to client so the grid can disable edit/delete on others' uploads and show "من" badge.
- Created `src/components/admin/media-manager.tsx` — 'use client' component. Drag & drop upload zone with dashed border that highlights on drag-over. Uses XMLHttpRequest (not fetch) so it can subscribe to `xhr.upload.onprogress` for real-time upload percentage. Client-side pre-validation (mime + size) matches the server. After successful upload: `router.refresh()`. Search bar updates URL via router. Responsive grid (2 cols mobile / 3 sm / 4 md / 5 lg) of media cards: Next/Image with `fill` and `aspect-square`, filename truncated, alt preview, dimensions + size + date in fa-IR, hover-overlay actions (کپی URL / ویرایش / حذف). Edit dialog with image preview + alt/title/caption inputs + a quick-copy URL box. Delete confirmation via AlertDialog. Toast notifications via sonner throughout.
- Updated `src/components/admin/app-sidebar.tsx` — added `Image as ImageIcon` import from lucide-react; added `module: ModuleKey` to every NAV_ITEMS entry; inserted `{ title: "رسانه‌ها", href: "/admin/media", icon: ImageIcon, module: "media" }` between "خدمات" and "پیام‌ها"; added 8 optional boolean props (`canAccessArticles`, `canAccessCategories`, `canAccessServices`, `canAccessMedia`, `canAccessMessages`, `canAccessUsers`, `canAccessSettings`, `canAccessDashboard`) and filters `NAV_ITEMS` by an access map (defaults all `true` except `canAccessUsers` and `canAccessSettings` which default `false` to match the existing super_admin-only convention).
- Updated `src/app/admin/(panel)/layout.tsx` — imported `canAccess` from `@/lib/auth`. Computes 8 booleans via `canAccess(session.role, module)` and passes them to `<AppSidebar/>`. Layout already had `session`, just plumbs the new permission flags down. Backward-compatible: every prop defaults to a sensible value so other consumers (if any) still work.

Decisions:
- Used **XMLHttpRequest** instead of fetch for the upload so the user can see a live percentage progress bar (fetch lacks upload progress events in stable browsers). The bar is a 1-pixel brand-500 strip at the bottom of the drop zone.
- Used `crypto.randomUUID()` + `Date.now()` + sanitized original filename for unique names — task hint said "use crypto.randomUUID for unique name"; we keep the original (sanitized) base name too for human readability.
- Used `sharp(buffer).metadata()` both for dimensions AND as a content-validation gate: a file claiming `image/jpeg` but with non-image bytes will throw and we reject with "فقط تصویر قابل آپلود است" before it touches disk.
- Filename extension is normalized via the **detected** format from sharp (not the browser-supplied mime), so a `.png`-renamed JPEG becomes `.jpg` on disk. The stored `mimeType` field uses `image/{detectedFormat}` so the database always reflects reality.
- File deletion on DELETE is **best-effort**: even if `unlink` fails (file already gone, permissions, etc), we still succeed the API response since the DB record is gone and the orphaned file is harmless.
- The `caption` field on Media model (already in schema) is included in PUT even though the task description mentioned "alt, title, caption" — task instructions explicitly listed all three, so we wire it up too.
- The `mine` badge and "من"/uploader-name badges only show when the viewer has `media: all` permission (super_admin/editor/landing_editor) — authors don't see them because they only ever see their own.
- The `modifier` check on the client uses `canManageAll || uploadedById === currentUserId` and is mirrored by the server's `level === "own" && uploadedById !== session.id → 403`. Defense in depth.
- Sidebar visibility filter is computed server-side (layout) and passed as plain booleans to the client component — no auth lib imported into the client bundle (which would break the Next.js server-only boundary).

Stage Summary:
- Full Media module complete: upload (drag&drop + progress), list (paginated + searchable), edit (alt/title/caption via dialog), delete (with file removal), copy URL, RBAC (author sees own only, super_admin/editor/landing_editor see all).
- Sidebar updated with new "رسانه‌ها" link + per-item RBAC filtering via 8 booleans passed from the server layout.
- All Persian UI text, RTL aware (the whole app is `dir="rtl"`, classes like `pr-10` for icon-on-right are correct for RTL).
- All error/success messages in Persian (sonner toasts).
- `bun run lint`: my new code introduces **0 new errors** and **0 new warnings** (only pre-existing 2 errors in `src/middleware.ts` and 6 warnings in `src/components/admin/article-editor.tsx` / `category-editor.tsx` remain — those files are owned by other agents and I did not modify them).

API contract summary:
- POST `/api/admin/media/upload` — multipart/form-data with `file` (+ optional `alt`, `title`). 201 → `{ id, url, filename, alt, title, width, height, size, mimeType }`. 400 with Persian error for bad mime/size.
- GET `/api/admin/media?page=1&limit=24&search=` — 200 → `{ data: Media[], total, page, limit }`. Author sees own only.
- GET `/api/admin/media/[id]` — 200 → Media (with uploadedBy). 404 if not found. 403 if author tries another user's.
- PUT `/api/admin/media/[id]` — body `{ alt?, title?, caption? }` (all optional strings/nullable). 200 → updated Media. 403 if author tries another's.
- DELETE `/api/admin/media/[id]` — 200 → `{ ok: true, message: "رسانه حذف شد" }`. Removes file from disk. 403 if author tries another's.

Files I did NOT modify (per instructions): root `src/app/layout.tsx`, public site routes, `src/lib/*`, `prisma/schema.prisma`, `src/middleware.ts`, `src/app/admin/login/*`, other API routes, `src/components/ui/*`, `src/app/globals.css`.

---
Task ID: 7
Agent: full-stack-developer (Users RBAC)
Task: Build user management with RBAC, profile page, role-based UI

Work Log:
- Created `src/lib/roles.ts` — shared role constants (ROLE_LABELS, ROLE_PERMISSIONS, Role type, isValidRole) safe to import from both client and server. Kept separate from `src/lib/auth.ts` (which imports server-only modules like next/headers, bcryptjs, Prisma) so client components can use these constants without bundling server-only code.
- Created `src/app/api/admin/users/route.ts`:
  - GET: paginated list `{data, total, page, limit}` with `search` (username/name/email), `role` filter, `active` filter. Selects user fields **without password** and includes `_count` of articles, categories, media per user.
  - POST: create new user with zod validation (username min 3 chars regex, password min 6 chars, role must be valid). Hashes password with bcryptjs. Checks username uniqueness → 409 with Persian error "این نام کاربری قبلاً ثبت شده است". Returns created user (no password).
- Created `src/app/api/admin/users/[id]/route.ts`:
  - GET: single user (no password) + counts of their content.
  - PUT: update user. Fields: name?, email?, role?, active?, password? (optional). If password provided, hashes it. Validates role if provided. **Self-protection rules**:
    - Prevents super_admin from demoting themselves to non-super_admin (400 "نمی‌توانید نقش مدیر ارشد خود را تغییر دهید")
    - Prevents super_admin from deactivating themselves (400 "نمی‌توانید حساب خود را غیرفعال کنید")
    - Prevents demoting the last active super_admin (400 "نمی‌توانید آخرین مدیر ارشد را به نقش دیگری تغییر دهید")
    - Returns updated user (no password).
  - DELETE: delete user.
    - Prevents self-deletion (400 "نمی‌توانید حساب خود را حذف کنید")
    - Prevents deleting the last super_admin (400 "نمی‌توانید آخرین مدیر ارشد را حذف کنید")
    - Detaches author relations (sets authorId/uploadedById to null on articles/categories/media) — content is NOT cascade-deleted.
    - Returns success message in Persian.
- Created `src/app/api/admin/me/password/route.ts`:
  - POST: change own password. Body: `{currentPassword, newPassword}`. Validates newPassword min 6 chars. Verifies currentPassword with bcrypt. Refuses same-as-current. Returns Persian error "رمز عبور فعلی اشتباه است" if current wrong, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" if too short.
- Created `src/app/admin/(panel)/users/page.tsx`:
  - Server component. Reads searchParams (page, limit, search, role). Fetches users via `db.adminUser.findMany` (no password selected) with pagination + filters, plus 4 role counts for the stats row. Renders Persian page header "مدیریت کاربران" + subtitle + hands off to `<UsersManager>` client component.
- Created `src/components/admin/users-manager.tsx` (client):
  - Renders 4 stats cards (one per role) at the top with color-coded accent.
  - Search bar (search by username/name/email) + role filter select with 4 Persian role labels + "افزودن کاربر جدید" button.
  - Table with columns: کاربر (avatar initials + name + @username), ایمیل, نقش (color-coded badge: super_admin=red, editor=orange, author=blue, landing_editor=emerald), فعال (inline Switch toggle that PATCHes `active` to PUT endpoint), محتوا (count badges: articles | categories | media), تاریخ ساخت, عملیات (ویرایش | حذف).
  - Pagination (قبلی / بعدی + صفحه X از Y).
  - Active toggle: optimistically fires PUT to `/api/admin/users/[id]` with `{active: bool}`.
  - Delete: AlertDialog confirmation with shield alert icon.
  - "افزودن کاربر جدید" and "ویرایش" both open `<UserFormDialog>`.
- Created `src/components/admin/user-form-dialog.tsx` (client):
  - shadcn Dialog with react-hook-form + zod.
  - Fields: username (text, **disabled in edit mode** with hint "نام کاربری قابل تغییر نیست"), password (password input, required in create, optional in edit with hint "در صورت تمایل به تغییر وارد کنید"), name, email, role (Select with 4 options showing Persian labels), active (Switch).
  - Validation: username min 3 (regex: ASCII letters/digits/dash/underscore/dot only), password min 6 in create mode.
  - Submits POST to `/api/admin/users` for create, PUT to `/api/admin/users/[id]` for update. Updates omit username (not editable) and omit password if blank.
  - **Permission matrix**: when a role is selected, shows a list of permission rows for that role. Each row shows: permission label (مقالات، دسته‌بندی‌ها، رسانه، خدمات، پیام‌ها، تنظیمات سایت، مدیریت کاربران، داشبورد) + value (همه / فقط موارد خود / ندارد / —) + colored icon (green ShieldCheck for granted, red ShieldAlert for denied).
  - Toast feedback via sonner: success and error messages in Persian.
- Created `src/app/admin/(panel)/profile/page.tsx` (server):
  - Any logged-in user can access (no special permission required — falls under `/admin` dashboard permission which all 4 roles have).
  - Fetches current user from session via `getSession()` + `db.adminUser.findUnique` (no password). Renders:
    - Left card: avatar initials + name + @username + role badge + email + created date + 3-stat box (articles/categories/media counts).
    - Right card: `<ProfilePasswordForm>` for changing own password.
- Created `src/components/admin/profile-password-form.tsx` (client):
  - react-hook-form + zod form with 3 fields: currentPassword, newPassword, confirmPassword (with refine check that newPassword === confirmPassword).
  - Inputs use `pr-10` for leading LockKeyhole/Lock icons.
  - POST to `/api/admin/me/password` with `{currentPassword, newPassword}`.
  - Persian toast feedback on success/error. Form resets on success.
  - Includes "نکات امنیتی" help box with 3 bullet points (min 6 chars, mix chars, don't reuse).

Stage Summary:
- Full user management with RBAC complete. All pages and APIs return HTTP 200 (verified with curl).
- All edge cases tested end-to-end with curl:
  - ✅ Create valid user → 201 with sanitized response (no password)
  - ✅ Duplicate username → 409 "این نام کاربری قبلاً ثبت شده است"
  - ✅ Short password (< 6 chars) → 400 "رمز عبور باید حداقل ۶ کاراکتر باشد"
  - ✅ Invalid role → 400 "نقش انتخاب شده معتبر نیست"
  - ✅ Self-delete → 400 "نمی‌توانید حساب خود را حذف کنید"
  - ✅ Self-demote super_admin → editor → 400 "نمی‌توانید نقش مدیر ارشد خود را تغییر دهید"
  - ✅ Self-deactivate super_admin → 400 "نمی‌توانید حساب خود را غیرفعال کنید"
  - ✅ Update non-self user → 200
  - ✅ Change own password (correct current) → 200
  - ✅ Change own password (wrong current) → 400 "رمز عبور فعلی اشتباه است"
  - ✅ Same password rejection → 400 "رمز عبور جدید باید با رمز فعلی متفاوت باشد"
  - ✅ Delete non-self user → 200
  - ✅ Editor (non-super_admin) trying /admin/users → middleware redirects to /admin?forbidden=1
  - ✅ Editor trying /api/admin/users → 403 Forbidden
  - ✅ Author can access /admin/profile → 200 (any logged-in user can)
  - ✅ Author trying /api/admin/users → 403 Forbidden
- All API errors returned with Persian messages. Toast notifications in sonner.
- `bun run lint` clean for all my new files. `tsc --noEmit` clean for all my new files.
- Files I did NOT modify (per instructions): `src/lib/auth.ts`, `src/lib/db.ts`, `src/middleware.ts`, `prisma/schema.prisma`, `src/app/admin/(panel)/layout.tsx`, `src/components/admin/app-sidebar.tsx`, `src/components/ui/*`, `src/app/(site)/*`, `src/app/layout.tsx`, `src/app/globals.css`, other agents' admin pages, other agents' API routes.

## API Contract Summary

### Admin Users (super_admin only — middleware-enforced)

**GET `/api/admin/users?page=1&limit=20&search=...&role=super_admin|editor|author|landing_editor&active=true|false`**
- Response 200: `{ data: PublicUser[], total, page, limit }`
- PublicUser: `{ id, username, name, email, role, active, createdAt, updatedAt, _count: {articles, categories, media} }` — **never exposes password**

**POST `/api/admin/users`**
- Body: `{ username: string (3-50, alphanumeric/_.-), password: string (min 6), name?, email?, role: "super_admin"|"editor"|"author"|"landing_editor", active?: boolean (default true) }`
- Success 201: PublicUser (direct, not wrapped)
- Failure 400: `{ error: string }` (validation errors)
- Failure 409: `{ error: "این نام کاربری قبلاً ثبت شده است" }`

**GET `/api/admin/users/[id]`**
- Success 200: PublicUser
- Failure 404: `{ error: "کاربر یافت نشد" }`

**PUT `/api/admin/users/[id]`**
- Body: `{ name?, email?, role?, active?, password? }` (all optional; password blank = unchanged)
- Success 200: PublicUser
- Failure 400: `{ error: string }` — Persian, including self-protection errors:
  - "نمی‌توانید نقش مدیر ارشد خود را تغییر دهید" (self-demote)
  - "نمی‌توانید حساب خود را غیرفعال کنید" (self-deactivate)
  - "نمی‌توانید آخرین مدیر ارشد را به نقش دیگری تغییر دهید" (last super_admin demote)
- Failure 404: `{ error: "کاربر یافت نشد" }`

**DELETE `/api/admin/users/[id]`**
- Success 200: `{ ok: true, message: "کاربر {username} حذف شد" }` — content stays, only authorId/uploadedById are nulled
- Failure 400: `{ error: "نمی‌توانید حساب خود را حذف کنید" }` (self-delete) OR `{ error: "نمی‌توانید آخرین مدیر ارشد را حذف کنید" }` (last super_admin)

### Change Own Password (any authenticated user)

**POST `/api/admin/me/password`**
- Body: `{ currentPassword: string, newPassword: string (min 6) }`
- Success 200: `{ ok: true, message: "رمز عبور با موفقیت تغییر کرد" }`
- Failure 400: `{ error: "رمز عبور فعلی اشتباه است" }` OR `{ error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" }` OR `{ error: "رمز عبور جدید باید با رمز فعلی متفاوت باشد" }`

## Role Descriptions (shown in user form permission matrix)
- **super_admin** (مدیر ارشد): مقالات=all, دسته‌بندی‌ها=all, رسانه=all, خدمات=yes, پیام‌ها=yes, تنظیمات=yes, کاربران=yes, داشبورد=yes
- **editor** (ویرایشگر): مقالات=all, دسته‌بندی‌ها=all, رسانه=all, خدمات=yes, پیام‌ها=yes, تنظیمات=no, کاربران=no, داشبورد=yes
- **author** (نویسنده مقاله): مقالات=own, دسته‌بندی‌ها=none, رسانه=own, خدمات=no, پیام‌ها=no, تنظیمات=no, کاربران=no, داشبورد=yes
- **landing_editor** (ویرایشگر لندینگ): مقالات=none, دسته‌بندی‌ها=all, رسانه=all, خدمات=no, پیام‌ها=yes, تنظیمات=no, کاربران=no, داشبورد=yes

---

Task ID: 6
Agent: full-stack-developer (homepage SEO expansion)
Task: Expand homepage with FAQ, testimonials, process steps, brands strip, trust signals, service area sections + JSON-LD

Work Log:

### New components created (in `src/components/site/`)

1. **`process-steps.tsx`** — 6-step horizontal flow section ("فرآیند تعمیر موتور سیکلت شما در موتور مکانیک"). Client component using Framer Motion stagger animation. Each step shows step number in orange circle (Persian numerals via `toLocaleString("fa-IR")`), lucide icon, title, description. Responsive: 1 col mobile → 2 col tablet → 3 col desktop → 6 col xl. Desktop has arrow connectors (ChevronLeft icon) between cards. Includes horizontal flow line.

2. **`testimonials.tsx`** — Testimonials section ("آنچه مشتریان ما می‌گویند"). Dark `bg-ink` background with carbon overlay + hazard stripe accents. 4 cards in responsive grid (1/2/4 cols). Each card: Quote icon (filled), 5-star rating using lucide `Star` (filled vs outline based on rating), italic Persian content in «» quotes, avatar with initials fallback (gradient backgrounds rotated), name + role. Quote decorative «  in background.

3. **`faq-section.tsx`** — FAQ accordion ("سوالات متداول تعمیر موتور سیکلت"). Server component wrapping shadcn `Accordion` (single, collapsible). Each FAQ item has numbered orange circle, question as trigger, answer as content. **Injects `FAQPage` JSON-LD script** for Google rich results — CRITICAL for SEO. Uses `dangerouslySetInnerHTML` with `JSON.stringify`.

4. **`brands-strip.tsx`** — Brands pill listing ("تعمیر تخصصی تمام برندهای موتور سیکلت"). Server component. Renders all categories as rounded pills with Wrench icon, links to `/services/{slug}`. Below pills, SEO keyword-rich paragraph mentioning "گلکسی، بنلی، کراس، آپریلیا، هوندا، یاماها، سوزوکی" for brand+city keyword density.

5. **`trust-signals.tsx`** — Why Choose Us ("چرا موتور مکانیک را انتخاب کنید؟"). Client component with Framer Motion. 6 hardcoded trust signals in responsive 1/2/3 col grid: گارانتی معتبر، قطعات اصلی، مکانیک‌های متخصص، قیمت منصفانه، تعمیر سریع، ۱۵ سال سابقه. Each card has gradient orange icon (badge-check, shield-check, users, dollar-sign, clock, award).

6. **`service-area.tsx`** — Service area / cities served ("تعمیر موتور سیکلت در مشهد و حومه"). Server component. Lists 20 Mashhad areas in responsive 2/3/4 col grid with `MapPin` icon. Each pill links to a styled card with hover effect. Local SEO boost.

7. **`latest-articles.tsx`** — Latest articles wrapper with filter pills. Client component using `useState` + `AnimatePresence` from Framer Motion. Fetches 6 articles (up from 3). Filter pills at top show only categories that have articles. "همه" pill + one per used category. Wraps existing `ArticleCard` component.

### Existing files modified

- **`src/components/site/icon.tsx`** — Extended `ICON_MAP` with new icons: `search`, `calculator`, `quote`, `award`, `users`, `thumbs-up`, `handshake`, `badge-check`, `truck`, `package-check`, `dollar-sign`, `user-check`. All used by new components.

- **`src/components/site/hero-section.tsx`** — Added new optional `popularSearches?: { label: string; href: string }[]` prop. Renders under the CTAs as "جستجوی پرطرفدار:" followed by pill links (تعمیر موتورگلکسی، تعمیر موتور بنلی، تعمیر موتور کراس → /services/{slug}). Animation delayed to 0.4, stats delay bumped to 0.5 for clean stagger.

- **`src/components/site/stats-band.tsx`** — Now adapts grid columns based on stat count (5 → `grid-cols-2 lg:grid-cols-5`, otherwise default 4). Stat label font size bumped slightly. Used by homepage with 5th "میانگین زمان تعمیر: ۲۴ ساعت" stat.

- **`src/components/site/service-card.tsx`** — Added optional `phone?: string | null` prop. Card footer now shows "اطلاعات بیشتر" link to `/contact` (ChevronLeft animation) + a "تماس" link if phone provided (uses `tel:` href with Phone icon). Card uses flex column layout for consistent height. Replaced hardcoded phone with prop.

- **`src/app/(site)/page.tsx`** — Heavy rewrite. New sections in order: Hero (popular searches) → Features strip → Brands strip → Stats band (5th stat) → Services grid (enhanced) → Process steps → Featured categories → Trust signals → Testimonials → Service area → All categories preview → About preview → Latest articles (6 + filter pills) → FAQ → CTA. Added `POPULAR_SEARCHES` constant. Built `buildItemListJsonLd()` helper. Injects 2 JSON-LD scripts at top of page: `BreadcrumbList` for "خانه" + `ItemList` for services list. Parses `testimonials`, `faqs`, `processSteps` from `settings` JSON. Fetches 6 articles (up from 3) and includes `category.id` for filter. Uses `absoluteUrl` + `breadcrumbStructuredData` from `@/lib/seo`.

### JSON-LD structured data added

- **`FAQPage`** schema — generated in `faq-section.tsx` from `settings.faqs` array, injected as `<script type="application/ld+json">` inside the FAQ section. CRITICAL for Google rich results (FAQ rich snippets).
- **`BreadcrumbList`** schema — generated in `page.tsx` via `breadcrumbStructuredData([{ name: "خانه", url: "/" }])`, injected as script at top of homepage.
- **`ItemList`** schema — built in `page.tsx` via `buildItemListJsonLd(services)`, lists all 6 services as `Service` items with position, name, description, URL, provider.
- **`AutoRepair` (LocalBusiness)** — already injected by site layout (`localBusinessStructuredData`), unchanged.

### Data setup

- Populated `SiteSettings.testimonials`, `SiteSettings.faqs`, `SiteSettings.processSteps` JSON fields in the database (these were NULL before — schema had the fields but seed's `upsert` had empty `update: {}` so existing singleton wasn't updated). Used the same JSON content already specified in `prisma/seed.ts`.

Stage Summary:

- **Built**: 7 new reusable site components (process-steps, testimonials, faq-section, brands-strip, trust-signals, service-area, latest-articles) + enhanced 4 existing components (hero, stats-band, service-card, icon).
- **Homepage**: Now has 14 sections in correct order, all RTL Persian, all responsive (mobile-first), all with Framer Motion entrance animations.
- **SEO enhancements**:
  - `FAQPage` JSON-LD for FAQ rich results in Google SERP (critical)
  - `ItemList` JSON-LD for services list
  - `BreadcrumbList` JSON-LD for "خانه" breadcrumb
  - Existing `AutoRepair` LocalBusiness JSON-LD (unchanged, from layout)
  - Popular search pills in hero (deep-links to category landing pages → boosts internal linking & brand+city keyword targeting)
  - Brands strip with all categories as linked pills (boosts internal linking & brand keyword density)
  - Service area listing 20 Mashhad areas (local SEO for "تعمیر موتور سیکلت در {منطقه}" queries)
  - Trust signals section (boosts E-E-A-T signals)
  - Testimonials section with ratings (boosts social proof & trust)
  - Process steps section (helps Google understand service workflow + improves user engagement)
- **Verification**: Homepage renders with HTTP 200 in dev server. All 9 new sections/enhancements present in HTML output. All 4 JSON-LD schemas present. `bun run lint` clean for all new/modified files (the only 2 lint errors are pre-existing in `src/middleware.ts` from Task 5, which I'm not allowed to modify per task spec).
- **RTL awareness**: All new components use RTL-friendly layouts; arrows use `ChevronLeft` for "next/more" direction; Persian numerals via `toLocaleString("fa-IR")`.

---
Task ID: 5
Agent: full-stack-developer (full-page editors)
Task: Convert article/category editors from Sheet to full pages

Work Log:

Files Created:
- src/app/admin/(panel)/articles/new/page.tsx — server component, breadcrumb "مقالات › مقاله جدید", title "ایجاد مقاله جدید", back button, renders <ArticleEditor categories=...>
- src/app/admin/(panel)/articles/[id]/page.tsx — server component, fetches article + categories + session, notFound() if missing, redirects if author tries to edit someone else's article, renders <ArticleEditor article=... categories=...>
- src/app/admin/(panel)/categories/new/page.tsx — breadcrumb "دسته‌بندی‌ها › دسته‌بندی جدید", title "ایجاد دسته‌بندی / صفحه لندینگ جدید", <CategoryEditor parentCategories=...>
- src/app/admin/(panel)/categories/[id]/page.tsx — same pattern + landing_editor own-RBAC redirect
- src/components/admin/article-editor.tsx — full-page client form (no Sheet). 2-column: main (title, slug auto-gen, excerpt, MDXEditor content, cover image with preview, tags) + sidebar (publish card: published/featured switches + publishedAt datetime-local; category select; author name + reading time; SEO accordion with metaTitle/metaDescription/metaKeywords/canonicalUrl/ogImage/structuredData). Sticky bottom action bar: "ذخیره" (secondary), "ذخیره و انتشار" (orange), "انصراف" (Link to /admin/articles).
- src/components/admin/category-editor.tsx — full-page client form, same 2-column layout. Main: title, slug, brand, city, shortDescription, cover image preview, MDXEditor content. Sidebar: publish card (published/featured switches + order), lucide icon picker with live preview, parent category select, SEO accordion with structuredData textarea. Same 3-button sticky action bar.

Files Modified:
- src/app/admin/(panel)/articles/page.tsx — added getSession + getPermissionLevel("articles"); for "own" level, filters where by authorId = session.id; passes currentUserId + permissionLevel to client table
- src/app/admin/(panel)/categories/page.tsx — same RBAC pattern for categories module
- src/components/admin/articles-table.tsx — removed Sheet, removed useState for sheet/editing, removed ArticleFormSheet import; "افزودن مقاله جدید" Button is now Link to /admin/articles/new; row edit pencil is Link to /admin/articles/[id]; added canManage(item) helper that returns true if permissionLevel === "all" or (own && authorId === currentUserId); only renders edit/delete buttons for manageable rows
- src/components/admin/categories-table.tsx — same Link-based pattern + canManage() RBAC filter

Files Deleted:
- src/components/admin/article-form-sheet.tsx
- src/components/admin/category-form-sheet.tsx

Stage Summary:
- Article and category editors are now full-page editors at /admin/articles/new, /admin/articles/[id], /admin/categories/new, /admin/categories/[id].
- 2-column responsive layout (single column on mobile, 2 columns on lg+), Card-based form with sidebar containing publish + SEO + auxiliary fields.
- MDXEditor reused for content via existing src/components/admin/markdown-editor.tsx wrapper.
- Existing API endpoints used as-is (POST/PUT to /api/admin/articles and /api/admin/categories). No new API endpoints created.
- RBAC at two layers:
  1. Server list pages filter by authorId when permissionLevel === "own" (so authors only see their own content).
  2. Client table component conditionally renders edit/delete buttons via canManage(item) using currentUserId + permissionLevel.
  3. Server edit pages redirect to /admin/articles?forbidden=1 if a user with "own" permission tries to open someone else's content via URL.
- All Persian text, RTL layout preserved, shadcn/ui components, sonner toasts, lucide icons, brand orange (bg-brand-600/700) on primary actions.
- "ذخیره و انتشار" button sets published=true on save (regardless of switch state); "ذخیره" preserves current switch state.
- publishedAt: datetime-local input; on submit, if empty and publishing, falls back to new Date().toISOString() so the API still gets a valid timestamp.
- Slug auto-generates from title while empty or matching the auto-slug; stops overwriting once the user types a custom slug.
- Fixed zodResolver ↔ useForm TS2719 incompatibility by casting `zodResolver(schema) as Resolver<TValues>` (also affects the existing service-form-sheet.tsx, not touched here).
- `bun run lint` clean for all 8 created/modified files (only pre-existing errors in src/middleware.ts remain, which I'm told NOT to modify).
- `bunx tsc --noEmit` clean for my files (remaining TS errors are in other agents' files: service-form-sheet.tsx, media-manager.tsx, faq-section.tsx, process-steps.tsx, share-buttons.tsx).
- Did NOT modify: auth.ts, db.ts, seo.ts, slug.ts, schema.prisma, middleware.ts, admin/login/*, api/admin/*, components/ui/*, app-sidebar.tsx, markdown-editor.tsx, (panel)/layout.tsx, services/*, messages/*, settings/*, (site)/*, globals.css, root layout.tsx.
- Worklog entry written to /home/z/my-project/agent-ctx/5-full-page-editors.md.

---
Task ID: 8 + 9
Agent: Main (Z.ai)
Task: RTL audit + final verification

Work Log:
- Verified RTL: HTML dir="rtl" lang="fa" on all pages
- Fixed lint errors in middleware.ts (renamed `module` variable to `requiredModule` to avoid `@next/next/no-assign-module-variable` rule)
- All admin pages return 200 with proper RBAC enforcement:
  - super_admin: access to all 11 admin pages
  - author: blocked from /admin/categories, /admin/users, /admin/messages, /admin/settings (307 redirect to /admin?forbidden=1)
  - landing_editor: blocked from /admin/articles, /admin/users, /admin/settings (307 redirect)
- All public pages return 200
- Tested with agent-browser:
  - Homepage renders all 14 sections (Hero, Features, Brands Strip, Stats, Services, Process Steps, Featured Categories, Trust Signals, Testimonials, Service Area, About, Latest Articles, FAQ, CTA)
  - Admin login works (no password in URL - security verified)
  - Article full-page editor works with breadcrumb + 2-column layout + markdown editor
  - Users management page shows table with roles + active toggle + content counts
  - Media page shows drag&drop upload zone
- Tested APIs:
  - Media upload: 201 Created, saves to public/uploads/, stores alt+title, returns dimensions
  - User create: 201 Created with role assignment
  - Users list: returns data with _count of articles/categories/media
  - Author user gets 403 Forbidden on /api/admin/users (RBAC enforcement)
  - User delete: 200 OK with Persian success message
- Security verified: no GET parameters with password, login uses POST to /api/admin/login

Stage Summary:
- ✅ Security: login no longer leaks password in URL
- ✅ Media module: full CRUD with upload + alt/title + image dimensions
- ✅ RBAC: 4 roles (super_admin, editor, author, landing_editor) with proper permissions enforced in middleware + API + UI
- ✅ Full-page editors: /admin/articles/new, /admin/articles/[id], /admin/categories/new, /admin/categories/[id]
- ✅ Homepage SEO: 9 new sections including FAQ with JSON-LD, testimonials, process steps, brands strip, trust signals, service area
- ✅ RTL: all elements respect RTL (sidebar right-aligned, icons positioned correctly)
- ✅ User management: super_admin can create/edit/delete users with role assignment + permission matrix display
- ✅ Profile page: any user can change their own password
