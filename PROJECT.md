# 🏍️ موتور مکانیک - سایت تعمیرات موتور سیکلت

> مرکز تخصصی تعمیرات موتور سیکلت در مشهد — این فایل مستندات کامل پروژه است. هر تغییری که لازم دارید، از این فایل بخوانید.

---

## 📑 فهرست

1. [معرفی پروژه](#-معرفی-پروژه)
2. [تکنولوژی‌های استفاده‌شده](#-تکنولوژی‌های-استفاده‌شده)
3. [معماری و ساختار فایل‌ها](#-معماری-و-ساختار-فایل‌ها)
4. [پایگاه داده و Schema](#-پایگاه-داده-و-schema)
5. [صفحات عمومی سایت](#-صفحات-عمومی-سایت)
6. [پنل مدیریت /admin](#-پنل-مدیریت-admin)
7. [API‌ها](#-apiها)
8. [سیستم SEO](#-سیستم-seo)
9. [ساخت صفحه‌های سئو جدید (داینامیک)](#-ساخت-صفحه‌های-سئو-جدید-داینامیک)
10. [پیکربندی و راه‌اندازی](#-پیکربندی-و-راه‌اندازی)
11. [تغییر تم و رنگ‌ها](#-تغییر-تم-و-رنگ‌ها)
12. [راهنمای تسک‌های رایج](#-راهنمای-تسک‌های-رایج)
13. [Deployment (استقرار)](#-deployment-استقرار)
14. [اعتبارنامه‌ها و اطلاعات ورود](#-اعتبارنامه‌ها-و-اطلاعات-ورود)
15. [عیب‌یابی](#-عیب‌یابی)

---

## 📌 معرفی پروژه

این پروژه یک وب‌سایت کامل برای مرکز تخصصی تعمیر موتور سیکلت است که شامل دو بخش اصلی می‌باشد:

1. **سایت عمومی** — کاربران معمولی می‌بینند: صفحه اصلی، درباره ما، تماس با ما، مقالات، دسته‌بندی‌های سئو (مثل «تعمیر موتورگلکسی در مشهد»).
2. **پنل مدیریت (CMS)** — در مسیر `/admin` قابل دسترسی است: مدیریت کامل محتوا، مقالات، دسته‌بندی‌ها، خدمات، تنظیمات سایت، و پیام‌های تماس.

### ✨ ویژگی‌های کلیدی

- ✅ طراحی فارسی RTL کامل با فونت Vazirmatn
- ✅ تم صنعتی-نارنجی (الهام از گاراژ موتور و حرارت صنعتی)
- ✅ صفحات سئو داینامیک برای هر دسته‌بندی (هر برند موتور + شهر)
- ✅ CMS کامل با امکان ایجاد نامحدود صفحه سئو
- ✅ پشتیبانی از Dark/Light mode
- ✅ موبایل-فرست و کاملاً ریسپانسیو
- ✅ JSON-LD structured data برای SEO فنی
- ✅ Sitemap و robots خودکار
- ✅ سئو فنی: canonical، OpenGraph، Twitter Card، metadata داینامیک
- ✅ احراز هویت با JWT + httpOnly cookie
- ✅ Markdown editor برای مقالات و محتوا
- ✅ سیستم پیام‌های تماس (با مدیریت در پنل)

---

## 🛠️ تکنولوژی‌های استفاده‌شده

| لایه | تکنولوژی | توضیح |
|------|---------|-------|
| Framework | Next.js 16 | App Router، React 19 |
| زبان | TypeScript 5 | strict typing |
| Styling | Tailwind CSS 4 | utility-first |
| UI Components | shadcn/ui (New York) | Radix UI primitives + Lucide icons |
| Database | Prisma ORM + SQLite | ORM مدرن |
| Auth | JWT (jose) + bcryptjs | httpOnly cookie |
| Form | react-hook-form + zod | validation |
| Markdown | @mdxeditor/editor + react-markdown | admin editor + render |
| Animation | Framer Motion | subtle entrance |
| State | TanStack Query | server state (در صورت نیاز) |
| Theme | next-themes | dark/light mode |
| Toasts | sonner + radix toast | notifications |

> ℹ️ درخواست کاربر: استفاده از کتابخانه HeroUI بررسی شد، اما **shadcn/ui** به‌دلیل:
> - نصب‌شده بودن و فعال بودن در پروژه
> - تطبیق‌پذیری بالا و Tailwind-native بودن
> - تعداد زیاد کامپوننت‌ها (40+)
> - New York style مدرن و تمیز
> - سازگاری با Next.js 16 و React 19
> - پشتیبانی RTL خوب
>
> انتخاب شد. این تصمیم به این معنا نیست که HeroUI بد است، بلکه shadcn/ui در این پروژه بهتر سازگار بود و کیفیت و سرعت توسعه را بالا برد.

---

## 🏗️ معماری و ساختار فایل‌ها

```
my-project/
├── prisma/
│   ├── schema.prisma          ← تعریف مدل‌های دیتابیس
│   └── seed.ts                ← پر کردن اولیه دیتابیس
├── public/
│   ├── images/                ← تصاویر تولیدشده با AI
│   ├── logo.svg
│   └── robots.txt
├── scripts/
│   └── gen-images.ts          ← اسکریپت تولید تصاویر با AI
├── src/
│   ├── app/
│   │   ├── layout.tsx         ← Root layout (Vazirmatn + RTL + ThemeProvider)
│   │   ├── globals.css        ← Theme، colors، utilities
│   │   ├── sitemap.ts         ← Sitemap داینامیک
│   │   ├── robots.ts          ← robots.txt داینامیک
│   │   ├── manifest.ts        ← PWA manifest
│   │   ├── middleware.ts      ← محافظت از /admin و /api/admin
│   │   ├── (site)/            ← صفحات عمومی (route group)
│   │   │   ├── layout.tsx     ← هدر + فوتر + JSON-LD
│   │   │   ├── page.tsx       ← صفحه اصلی
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── articles/
│   │   │   └── services/      ← دسته‌بندی‌های سئو
│   │   ├── admin/             ← پنل CMS
│   │   │   ├── login/
│   │   │   ├── (panel)/       ← layout با sidebar
│   │   │   │   ├── page.tsx   ← داشبورد
│   │   │   │   ├── categories/
│   │   │   │   ├── articles/
│   │   │   │   ├── services/
│   │   │   │   ├── messages/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   └── api/               ← API Routes
│   │       ├── admin/         ← محافظت‌شده
│   │       │   ├── login/
│   │       │   ├── logout/
│   │       │   ├── me/
│   │       │   ├── stats/
│   │       │   ├── categories/
│   │       │   ├── articles/
│   │       │   ├── services/
│   │       │   ├── messages/
│   │       │   └── settings/
│   │       └── contact/       ← عمومی (فرم تماس)
│   ├── components/
│   │   ├── ui/                ← shadcn/ui components
│   │   ├── site/              ← کامپوننت‌های عمومی (header، footer، cards)
│   │   └── admin/             ← کامپوننت‌های پنل (sidebar، forms)
│   ├── lib/
│   │   ├── db.ts              ← Prisma client
│   │   ├── auth.ts            ← JWT auth helpers
│   │   ├── seo.ts             ← metadata + JSON-LD helpers
│   │   ├── slug.ts            ← slug generator (Persian-aware)
│   │   └── utils.ts           ← cn() helper
│   └── hooks/
├── worklog.md                 ← لاگ کار سابیجنت‌ها
├── PROJECT.md                 ← همین فایل
├── package.json
└── tailwind.config.ts
```

---

## 🗄️ پایگاه داده و Schema

فایل `prisma/schema.prisma` شامل 6 مدل است:

### 1. `AdminUser` — ادمین پنل
```prisma
model AdminUser {
  id, username (unique), password (bcrypt hash), name, role, createdAt, updatedAt
}
```

### 2. `Category` — دسته‌بندی + صفحه سئو داینامیک ⭐
```prisma
model Category {
  id, title, slug (unique), brand, city,  // برای سئو محلی
  shortDescription, content (markdown),   // محتوای سئو
  image, icon,
  // فیلدهای SEO
  metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage, structuredData,
  // سلسله‌مراتب
  parentId, parent, children,
  // رابطه با مقالات
  articles,
  // نمایش
  featured, published, order,
  createdAt, updatedAt
}
```
> 💡 **هر Category یک صفحه سئو است**. مثلاً «تعمیر موتورگلکسی در مشهد» یک Category است که در `/services/[slug]` نمایش داده می‌شود.

### 3. `Article` — مقالات وبلاگ
```prisma
model Article {
  id, title, slug (unique), excerpt, content (markdown), coverImage,
  metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage, structuredData,
  categoryId, category,
  authorName, readingTime, tags,
  featured, published, publishedAt, views,
  createdAt, updatedAt
}
```

### 4. `Service` — خدمات تعمیرگاه
```prisma
model Service {
  id, title, slug, description, icon (lucide name), image, price,
  features (JSON string array), published, order,
  createdAt, updatedAt
}
```

### 5. `SiteSettings` — تنظیمات یکتا (singleton)
```prisma
model SiteSettings {
  id = "singleton",  // همیشه یک رکورد
  // برند
  siteName, siteDescription, logoText,
  // تماس
  phone, whatsapp, email, address, workingHours, mapEmbed, instagram, telegram,
  // درباره
  aboutTitle, aboutContent (markdown), aboutImage,
  // Hero صفحه اصلی
  heroBadge, heroTitle, heroSubtitle, heroImage, heroCtaText,
  // لیست‌ها (JSON)
  features (array of {icon,title,desc}), stats (array of {label,value,suffix}),
  // فوتر و SEO عمومی
  footerText, metaTitle, metaDescription, metaKeywords, ogImage, primaryColor,
  updatedAt
}
```

### 6. `ContactMessage` — پیام‌های فرم تماس
```prisma
model ContactMessage {
  id, name, phone, email, subject, message, read, createdAt
}
```

### دستورات مفید Prisma

```bash
bun run db:push        # push schema به دیتابیس (بعد از تغییر schema)
bun run db:seed        # پر کردن داده‌های اولیه
bun run db:generate    # regenerate Prisma Client
bun run db:reset       # reset کامل دیتابیس (با data loss)
```

---

## 🌐 صفحات عمومی سایت

| مسیر | فایل | توضیح |
|------|------|-------|
| `/` | `app/(site)/page.tsx` | صفحه اصلی — hero، ویژگی‌ها، آمار، خدمات، دسته‌بندی‌های منتخب، مقالات، CTA |
| `/about` | `app/(site)/about/page.tsx` | درباره ما — تصویر + محتوای markdown + آمار + خدمات |
| `/contact` | `app/(site)/contact/page.tsx` | تماس با ما — فرم تماس + اطلاعات تماس + نقشه |
| `/articles` | `app/(site)/articles/page.tsx` | لیست مقالات با فیلتر دسته و صفحه‌بندی |
| `/articles/[slug]` | `app/(site)/articles/[slug]/page.tsx` | جزئیات مقاله + مقالات مرتبط |
| `/services` | `app/(site)/services/page.tsx` | لیست دسته‌بندی‌ها با فیلتر برند/شهر |
| `/services/[slug]` | `app/(site)/services/[slug]/page.tsx` | ⭐ صفحه سئو داینامیک هر دسته (محتوای SEO) |

### کامپوننت‌های مشترک (`src/components/site/`)

- `header.tsx` — هدر با لوگو، navigation، تم toggle، منوی موبایل
- `footer.tsx` — فوتر با اطلاعات تماس، دسترسی‌های سریع، شبکه‌های اجتماعی
- `markdown.tsx` — رندر کردن markdown با استایل Tailwind
- `article-card.tsx`, `service-card.tsx`, `category-card.tsx` — کارت‌های محتوا
- `section-heading.tsx`, `cta-section.tsx`, `stats-band.tsx`, `breadcrumb-nav.tsx`, `icon.tsx` — helper‌ها

---

## 🎛️ پنل مدیریت /admin

| مسیر | توضیح |
|------|-------|
| `/admin/login` | صفحه ورود با طراحی صنعتی |
| `/admin` | داشبورد — آمار، پیام‌های اخیر، مقالات اخیر |
| `/admin/categories` | مدیریت دسته‌بندی‌ها (CRUD با Sheet form) |
| `/admin/articles` | مدیریت مقالات (CRUD با markdown editor) |
| `/admin/services` | مدیریت خدمات |
| `/admin/messages` | مدیریت پیام‌های تماس |
| `/admin/settings` | تنظیمات سایت (با Tabs و بخش‌های مختلف) |

### ویژگی‌های پنل

- **Sidebar تیره** (deep charcoal) با آکسنتی نارنجی برای حالت فعال
- **Sheet (slide-over)** برای فرم‌های ایجاد/ویرایش (بدون نیاز به صفحه جدا)
- **Markdown editor** کامل (MDXEditor) برای مقالات و محتوای دسته‌بندی
- **Accordion** برای فیلدهای SEO در فرم‌ها
- **Pagination + Search** در همه لیست‌ها
- **Badge‌های unread** برای پیام‌ها
- **Toast notification** با sonner
- **تایید حذف** با AlertDialog
- **تنظیمات سایت به‌صورت Tabs** (اطلاعات اصلی، تماس، شبکه اجتماعی، Hero، درباره، آمار، SEO، رنگ)

---

## 🔌 API‌ها

### احراز هویت
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | `/api/admin/login` | ورود — body: `{username, password}` → `{ok, user}` |
| POST | `/api/admin/logout` | خروج — `{ok:true}` |
| GET | `/api/admin/me` | دریافت اطلاعات کاربر جاری |
| GET | `/api/admin/stats` | آمار داشبورد |

### Categories (محافظت‌شده)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/api/admin/categories?page=&limit=&search=` | لیست با pagination |
| POST | `/api/admin/categories` | ایجاد |
| GET | `/api/admin/categories/[id]` | دریافت یکی |
| PUT | `/api/admin/categories/[id]` | ویرایش |
| DELETE | `/api/admin/categories/[id]` | حذف (cascade) |

### Articles / Services / Messages / Settings
همان الگوی CRUD بالا.

### عمومی
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | `/api/contact` | فرم تماس از سایت عمومی (نیازی به auth ندارد) |

> همه endpoint‌های `/api/admin/*` به‌جز `/login` توسط middleware محافظت می‌شوند. اگر cookie session نباشد، پاسخ 401 است.

---

## 🎯 سیستم SEO

### ویژگی‌های سئو فنی پیاده‌سازی‌شده

1. **Metadata داینامیک**: هر صفحه `generateMetadata` دارد.
2. **`generateStaticParams`** برای صفحات `[slug]` (پیش‌رندر شدن).
3. **JSON-LD Structured Data**:
   - `LocalBusiness` / `AutoRepair` در layout عمومی
   - `Article` در صفحه مقاله
   - `Service` + `BreadcrumbList` در صفحه دسته‌بندی
4. **Sitemap** خودکار در `/sitemap.xml` از دیتابیس
5. **robots.txt** خودکار در `/robots.txt` (Disallow /admin و /api)
6. **Canonical URLs** برای همه صفحات
7. **OpenGraph + Twitter Card** metadata کامل
8. **Manifest** برای PWA
9. **hreflang** و `lang="fa"` + `dir="rtl"` در root
10. **Semantic HTML**: `<header>`, `<main>`, `<nav>`, `<article>`, `<footer>`
11. **Breadcrumbs** با breadcrumb structured data
12. **Image optimization** با Next/Image
13. **ISR** (Incremental Static Regeneration): `revalidate = 3600` در صفحات لیست

### ساخت صفحه سئو جدید (داینامیک)

مهم‌ترین ویژگی پروژه: **مدیر می‌تواند تعداد نامحدود صفحه سئو بسازد**.

**روش**:
1. وارد پنل مدیریت `/admin` شوید (admin / admin123)
2. به بخش «دسته‌بندی‌ها» بروید
3. روی «افزودن دسته‌بندی جدید» کلیک کنید
4. این فیلدها را پر کنید:
   - **عنوان** (مثلاً «تعمیر موتور هوندا در مشهد») — این H1 و title سئو است
   - **Slug** (مثلاً `تعمیر-موتور-هوندا-در-مشهد`) — URL نهایی
   - **برند** (مثلاً «هوندا») — برای فیلتر
   - **شهر** (مثلاً «مشهد») — برای سئو محلی
   - **توضیح کوتاه** — توضیحی که در لیست و meta description استفاده می‌شود
   - **محتوا** (markdown) — محتوای کامل سئو صفحه (H2، پاراگراف، لیست...)
   - **تصویر** — URL تصویر
   - **فعال/منتخب** — toggle
   - **بخش SEO** (در accordion): metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage

5. ذخیره کنید. صفحه جدید در `/services/[slug]` در دسترس است و در sitemap خودکار اضافه می‌شود.

### سلسله‌مراتب دسته‌بندی (اختیاری)

مدل Category از `parentId` پشتیبانی می‌کند تا زیردسته‌بندی بسازید.但目前 UI پنل فقط دسته‌بندی‌های تخت را مدیریت می‌کند (می‌توان این را در آینده اضافه کرد).

---

## ⚙️ پیکربندی و راه‌اندازی

### متغیرهای محیطی (`.env`)

```env
DATABASE_URL="file:/home/z/my-project/db/custom.db"
JWT_SECRET="your-secret-key-change-in-production"  # مهم!
NEXT_PUBLIC_SITE_URL="https://motormechanic.ir"     # برای canonical و sitemap
```

> ℹ️ اگر `JWT_SECRET` تنظیم نشود، یک مقدار پیش‌فرض در `src/lib/auth.ts` استفاده می‌شود که برای production مناسب نیست.

### نصب و راه‌اندازی از صفر

```bash
bun install                       # نصب پکیج‌ها
bun run db:push                   # ساخت دیتابیس
bun run db:seed                   # پر کردن داده اولیه
bun run dev                       # اجرای dev server (port 3000)
```

### تولید تصاویر با AI

```bash
bun run scripts/gen-images.ts     # تولید همه تصاویر (با z-ai-web-dev-sdk)
```

تصاویر در `public/images/` ذخیره می‌شوند. برای توقف سریع: `Ctrl+C` یا `pkill -f gen-images`.

---

## 🎨 تغییر تم و رنگ‌ها

### تم اصلی (light/dark)

در `src/app/globals.css` متغیرهای CSS زیر تعریف شده‌اند. برای تغییر، این مقادیر را تغییر دهید:

```css
:root {
  --primary: oklch(0.65 0.21 38);          /* نارنجی برند */
  --background: oklch(0.985 0.002 60);     /* پس‌زمینه روشن */
  --ink: oklch(0.16 0.008 60);             /* مشکی صنعتی */
  /* ... */
}

.dark {
  /* تم تاریک */
}
```

### تغییر رنگ برند

رنگ برند در 9 سایه تعریف شده: `--brand-50` تا `--brand-900`. برای تغییر برند، همه را تغییر دهید:

```css
:root {
  --brand-50: ...;
  --brand-500: ...;  /* رنگ اصلی */
  --brand-600: ...;  /* برای hover */
  --brand-700: ...;  /* برای active */
  /* ... */
}
```

### Utility classes سفارشی (در `globals.css`)

- `bg-hazard` — خطوط خطر صنعتی (orange/black)
- `bg-carbon` — بافت کربن‌فایبر
- `bg-stripes` — خطوط مورب نارنجی محو
- `font-display` — فونت Vazirmatn bold
- `glow-brand` — درخشش نارنجی
- `badge-skew`, `corner-cut` — اشکال صنعتی

---

## 📚 راهنمای تسک‌های رایج

### ۱. افزودن مقاله جدید

1. ورود به `/admin` → بخش «مقالات» → «افزودن مقاله جدید»
2. پر کردن عنوان، خلاصه، محتوا (markdown)، تصویر کاور، دسته‌بندی
3. تنظیم published=true و optionally featured
4. ذخیره

### ۲. افزودن دسته‌بندی (صفحه سئو) جدید

(همانطور که در [بخش ساخت صفحه سئو جدید](#ساخت-صفحه‌های-سئو-جدید-داینامیک) توضیح داده شد)

### ۳. تغییر شماره تلفن یا آدرس

1. ورود به `/admin` → بخش «تنظیمات سایت»
2. تب «تماس» را باز کنید
3. فیلدها را تغییر دهید → ذخیره

### ۴. تغییر متن‌های صفحه اصلی (Hero)

1. `/admin` → «تنظیمات» → تب «صفحه اصلی»
2. heroBadge, heroTitle, heroSubtitle, heroCtaText, heroImage را تغییر دهید

### ۵. افزودن/حذف ویژگی‌های صفحه اصلی (Features)

1. `/admin` → «تنظیمات» → تب «آمار و ویژگی‌ها»
2. لیست features (آرایه JSON) را ویرایش کنید:
   ```json
   [
     {"icon": "shield-check", "title": "گارانتی", "desc": "..."},
     {"icon": "wrench", "title": "تیم متخصص", "desc": "..."}
   ]
   ```
   > icon نام lucide-react است. لیست: https://lucide.dev/icons

### ۶. تغییر آمار صفحه اصلی

همان بخش «آمار و ویژگی‌ها»، فیلد stats:
```json
[
  {"label": "سال تجربه", "value": "15", "suffix": "+"},
  {"label": "موتور تعمیر شده", "value": "5000", "suffix": "+"}
]
```

### ۷. مدیریت پیام‌های تماس

1. `/admin` → «پیام‌ها»
2. پیام‌های خوانده‌نشده با badge نارنجی
3. روی پیام کلیک کنید → دیالوگ جزئیات باز می‌شود
4. علامت‌گذاری به‌عنوان خوانده‌شده/نشده یا حذف

### ۸. تغییر رمز عبور ادمین

در حال حاضر فرم تغییر رمز در پنل نیست. برای تغییر:
```bash
# از bcryptjs استفاده کنید
bun -e "import bcrypt from 'bcryptjs'; console.log(bcrypt.hashSync('newpassword', 10))"
# سپس در دیتابیس update کنید:
bun -e "import { PrismaClient } from '@prisma/client'; import bcrypt from 'bcryptjs'; const p = new PrismaClient(); p.adminUser.update({where:{username:'admin'}, data:{password: bcrypt.hashSync('newpassword', 10)}}).then(()=>{console.log('done')})"
```

> 💡 برای آینده: می‌توان فرم «تغییر رمز» در `/admin/profile` اضافه کرد.

---

## 🚀 Deployment (استقرار)

### Build

```bash
bun run build    # خروجی: .next/standalone
bun run start    # اجرای production (پورت تعریف‌شده)
```

> در محیط فعلی sandbox از build استفاده نکنید؛ فقط `bun run dev` را اجرا کنید.

### Production requirements

- متغیر `JWT_SECRET` باید مقدار امن و طولانی داشته باشد
- متغیر `NEXT_PUBLIC_SITE_URL` باید URL نهایی دامنه باشد
- دیتابیس SQLite برای production کوچک/متوسط کافی است؛ برای ترافیک بالا به PostgreSQL یا MySQL migration کنید (تنها تغییر در `prisma/schema.prisma` در بخش `datasource`)

### Migration به PostgreSQL

```prisma
datasource db {
  provider = "postgresql"  // ← تغییر
  url      = env("DATABASE_URL")
}
```
سپس: `bun run db:push`

---

## 🔐 اعتبارنامه‌ها و اطلاعات ورود

### ادمین پیش‌فرض (از seed)

- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **مهم**: این فقط برای development است. در production حتماً رمز را تغییر دهید.

### اطلاعات تماس پیش‌فرض (در seed)

- تلفن: 0513333333
- ایمیل: info@motormechanic.ir
- آدرس: مشهد، بلوار وکیل‌آباد، نبش وکیل‌آباد ۳۲، مجتمع تخصصی موتور سیکلت

---

## 🐞 عیب‌یابی

### خطا: "Cannot find module '@prisma/client'"
```bash
bun run db:generate
```

### خطا: "EADDRINUSE: address already in use :::3000"
```bash
pkill -f "next dev"; sleep 2; bun run dev
```

### صفحه ادمین ریدایرکت می‌شود به /admin/login
- Cookie session نادرست یا منقضی شده. دوباره login کنید.
- اگر همیشه: بررسی کنید `JWT_SECRET` در `.env` تنظیم شده باشد.

### تصاویر نمایش داده نمی‌شوند
- مطمئن شوید `public/images/` شامل تصاویر است (اجرای `bun run scripts/gen-images.ts`)
- اگر Image component خطا می‌دهد، ممکن است `next.config.ts` نیاز به `images.remotePatterns` داشته باشد

### سئو: صفحات در Google ایندکس نمی‌شوند
- `NEXT_PUBLIC_SITE_URL` را به دامنه production تغییر دهید
- بررسی کنید `/robots.txt` و `/sitemap.xml` در دسترس هستند
- Google Search Console را تنظیم کنید و sitemap را submit کنید

### تغییر فونت
- در `src/app/layout.tsx` فونت Vazirmatn را با فونت دلخواه جایگزین کنید (مثلاً `Estedad` از next/font/google)
- در `globals.css` متغیر `--font-vazirmatn` را به متغیر جدید آپدیت کنید

### Lint خطا می‌دهد
```bash
bun run lint
```
بیشتر خطاها مربوط به `react-hooks/set-state-in-effect` در `header.tsx` است که می‌توان با `// eslint-disable-next-line` نادیده گرفت.

---

## 📝 توسعه‌های پیشنهادی آینده

- [ ] فرم «تغییر رمز» در `/admin/profile`
- [ ] آپلود تصویر مستقیم (به‌جای URL) با ذخیره‌سازی S3/MinIO
- [ ] سیستم comment برای مقالات
- [ ] فرم نوبت‌دهی آنلاین (با تقویم)
- [ ] SMS notification برای پیام‌های تماس
- [ ] صفحه جستجوی کامل (search)
- [ ] چندزبانه (i18n) با next-intl (نصب شده)
- [ ] افزودن FAQ schema به صفحات دسته
- [ ] سبد خرید قطعات (e-commerce)
- [ ] Live chat با وب‌سوکت

---

## 📞 اطلاعات تماس توسعه‌دهنده

این پروژه با Z.ai Code توسعه یافته است. برای هر تغییر یا توسعه، فایل `worklog.md` را بخوانید تا روند کار سابیجنت‌ها را بدانید.

---

## 🎯 خلاصه

این پروژه یک **CMS کامل** برای سایت تعمیرات موتور سیکلت است که شامل:
- صفحات عمومی با سئو فنی کامل
- پنل ادمین برای مدیریت همه محتوا
- صفحات داینامیک سئو (نامحدود) برای هر برند + شهر
- تم صنعتی-نارنجی منحصربه‌فرد
- پشتیبانی کامل RTL فارسی

برای هر تغییری، اول به این فایل مراجعه کنید. اگر چیزی نبود، به `worklog.md` (لاگ کار سابیجنت‌ها) یا کد مستقیم نگاه کنید.

موفق باشید! 🏍️🔥

---

# 🆕 بروزرسانی‌های نسخه ۲ (V2 Updates)

## 🔐 امنیت لاگین (اصلاح شد)
- ❌ قبلاً فرم لاگین با GET password را در URL نشون می‌داد
- ✅ حالا: حذف کامل `<form>` و `name` attribute از input‌ها
- ✅ Button با `type="button" + onClick` مستقیم
- ✅ Enter key handler روی input‌ها (بدون native form submit)
- ✅ navigation با `window.location.href` برای full page reload
- ✅ تایید شده با agent-browser: هیچ پسوردی در URL یا network logs نشون داده نمیشه

## 📁 بخش رسانه (Media Library) - جدید
مدیریت تصاویر سایت با امکان آپلود و ذخیره alt + title (مهم برای SEO و accessibility).

### مسیرها
- **صفحه پنل**: `/admin/media`
- **API‌ها**:
  - `POST /api/admin/media/upload` — آپلود (multipart/form-data با `file` + `alt` + `title`)
  - `GET /api/admin/media?page=&limit=&search=` — لیست با pagination
  - `GET/PUT/DELETE /api/admin/media/[id]` — CRUD یک رسانه

### ویژگی‌ها
- ✅ Drag & drop upload zone با پیشرفت آپلود زنده (XHR progress)
- ✅ اعتبارسنجی: فقط تصاویر (jpeg, png, webp, gif)، حداکثر 10MB
- ✅ ذخیره در `public/uploads/{timestamp}-{uuid}-{filename}`
- ✅ خواندن ابعاد تصویر با `sharp`
- ✅ فیلدهای alt و title (با importance برای SEO و screen readers)
- ✅ ویرایش alt/title/caption در dialog
- ✅ کپی URL به clipboard
- ✅ حذف (هم فایل و هم رکورد DB)
- ✅ RBAC: author فقط تصاویر خودش رو می‌بینه

## 👥 سیستم کاربران و سطوح دسترسی (RBAC) - جدید

### ۴ نقش (Roles)

| Role (انگلیسی) | Label (فارسی) | دسترسی‌ها |
|---------|--------|-----------|
| `super_admin` | مدیر ارشد | همه چیز + مدیریت کاربران + تنظیمات |
| `editor` | ویرایشگر | مقالات + دسته‌بندی‌ها + خدمات + رسانه + پیام‌ها |
| `author` | نویسنده مقاله | مقالات (فقط خودش) + رسانه (فقط خودش) |
| `landing_editor` | ویرایشگر لندینگ | دسته‌بندی‌ها + رسانه + پیام‌ها |

### ماتریس دسترسی

| Module | super_admin | editor | author | landing_editor |
|--------|-------------|--------|--------|----------------|
| داشبورد | ✅ | ✅ | ✅ | ✅ |
| مقالات | همه | همه | خودش | ❌ |
| دسته‌بندی‌ها | همه | همه | ❌ | همه |
| خدمات | ✅ | ✅ | ❌ | ❌ |
| رسانه | همه | همه | خودش | همه |
| پیام‌ها | ✅ | ✅ | ❌ | ✅ |
| تنظیمات | ✅ | ❌ | ❌ | ❌ |
| کاربران | ✅ | ❌ | ❌ | ❌ |

### کاربران پیش‌فرض (در seed)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | super_admin |
| `editor` | `editor123` | editor |
| `author` | `author123` | author |
| `landing` | `landing123` | landing_editor |

### مسیرها
- **صفحه مدیریت کاربران**: `/admin/users` (فقط super_admin)
- **صفحه پروفایل**: `/admin/profile` (همه کاربران - تغییر رمز خودشون)
- **API‌ها**:
  - `GET /api/admin/users` — لیست کاربران با تعداد محتوای هرکدوم
  - `POST /api/admin/users` — ایجاد کاربر جدید (با نقش)
  - `GET/PUT/DELETE /api/admin/users/[id]` — CRUD یک کاربر
  - `POST /api/admin/me/password` — تغییر رمز خود کاربر

### محافظت‌های خودکار
- ❌ نمی‌تونی خودت رو حذف کنی
- ❌ نمی‌تونی خودت رو از super_admin به نقش پایین‌تر تبدیل کنی (lockout prevention)
- ❌ نمی‌تونی آخرین super_admin رو حذف یا demote کنی
- ❌ نمی‌تونی خودت رو deactivate کنی
- ✅ هش bcrypt برای پسوردها
- ✅ password hash هیچ‌وقت در response برگردونده نمیشه

### UI Features
- جدول با avatar (initials رنگی)، نقش‌ها با badge رنگی (red/orange/blue/green)
- Inline toggle برای active/deactive
- نمایش تعداد محتوای هر کاربر (مقالات | دسته‌بندی‌ها | رسانه)
- Dialog با permission matrix - وقتی نقش رو انتخاب می‌کنی، نشون میده چه دسترسی‌هایی داره
- Search + filter by role + pagination

## 📄 ویرایشگرهای Full-Page - جدید

قبلاً مقالات و دسته‌بندی‌ها در Sheet (slide-over کناری) ویرایش می‌شدن. حالا به full-page تبدیل شدن:

### مسیرها
- `/admin/articles/new` — ایجاد مقاله جدید (full page)
- `/admin/articles/[id]` — ویرایش مقاله (full page)
- `/admin/categories/new` — ایجاد دسته‌بندی/لندینگ (full page)
- `/admin/categories/[id]` — ویرایش دسته‌بندی (full page)

### Layout فرم
- Breadcrumb در بالا (داشبورد > مقالات > مقاله جدید)
- عنوان صفحه + دکمه بازگشت
- ۲ ستونی responsive (main + sidebar) روی desktop
- ستون main: عنوان، slug، خلاصه، تصویر کاور، محتوا (markdown editor)
- ستون sidebar: publish settings، category، SEO accordion
- Action bar پایین: "ذخیره"، "ذخیره و انتشار"، "انصراف"
- auto-slug generation از title
- preview تصویر کاور
- icon picker با preview برای دسته‌بندی‌ها
- RBAC enforcement: author فقط مقالات خودش رو ویرایش می‌کنه

## 📈 صفحه اصلی کامل‌تر برای سئو - جدید

### بخش‌های جدید اضافه شده (به ترتیب):
1. **Hero (enhanced)**: popular searches pills زیر CTAها
2. **Features strip** (موجود)
3. **🆕 Brands Strip**: "تعمیر تخصصی تمام برندهای موتور سیکلت" + pill links به همه دسته‌بندی‌ها
4. **Stats band (enhanced)**: حالا ۵ امار به جای ۴
5. **Services grid (enhanced)**: "اطلاعات بیشتر" link روی هر کارت
6. **🆕 Process Steps**: ۶ مرحله تعمیر با شماره، آیکون، عنوان، توضیح
7. **Featured Categories** (موجود)
8. **🆕 Trust Signals / Why Choose Us**: ۶ کارت مزیت
9. **🆕 Testimonials**: ۴ نظر مشتری با rating ستاره، dark section
10. **🆕 Service Area**: ۲۰ منطقه مشهد (local SEO)
11. **About preview** (موجود)
12. **Latest Articles (enhanced)**: ۶ مقاله به جای ۳ + filter pills
13. **🆕 FAQ**: ۶ سوال متداول با Accordion
14. **CTA band** (موجود)

### JSON-LD Schemas اضافه‌شده
- `FAQPage` schema (CRITICAL for rich results در Google)
- `ItemList` schema برای services
- `BreadcrumbList` schema
- `AutoRepair` (موجود، از layout)

### کامپوننت‌های جدید در `src/components/site/`
- `process-steps.tsx`
- `testimonials.tsx`
- `faq-section.tsx`
- `brands-strip.tsx`
- `trust-signals.tsx`
- `service-area.tsx`
- `latest-articles.tsx` (enhanced)

## ↗️ RTL کامل

همه المان‌ها در سایت و پنل ادمین RTL هستن:
- HTML: `<html dir="rtl" lang="fa">`
- Sidebar سمت راست (با `side="right"` در shadcn)
- Icons در سمت راست input‌ها (با `pr-10`)
- ChevronLeft برای "next/forward" در RTL (درست反转 شده)
- اعداد و تاریخ‌ها با `dir="ltr"` (درست)
- Switchها، Badgeها، Accordion‌ها همه RTL-aware
- Toast notifications در top-center

## 🗄️ Prisma Schema Changes (v2)

مدل‌های جدید/تغییر یافته:
- `AdminUser`: اضافه شد `email`, `active`, relations به articles/categories/media
- `Category`: اضافه شد `authorId` + `author` relation
- `Article`: اضافه شد `authorId` + `author` relation
- `Media` (NEW): `id, filename, url, alt, title, caption, mimeType, size, width, height, uploadedById, createdAt`
- `SiteSettings`: اضافه شد `testimonials`, `faqs`, `processSteps` (JSON strings)

## 🛠️ Maintenance / Development

### Reset DB و reseed
```bash
bun run db:push  # اعمال schema
bun run db:seed  # پر کردن داده‌ها (با 4 کاربر + 6 service + 5 category + 3 article + settings)
```

### Helper files
- `src/lib/auth.ts` — RBAC helpers: `canAccess()`, `getPermissionLevel()`, `requireRole()`
- `src/lib/roles.ts` — Client-safe RBAC definitions (برای use در client components)
- `src/lib/slug.ts` — Slug generation (Persian-aware)
- `src/lib/seo.ts` — Metadata + JSON-LD helpers

