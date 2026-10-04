# 🏍️ موتور مکانیک — سایت تعمیرات موتور سیکلت

مرکز تخصصی تعمیرات موتور سیکلت در مشهد. وب‌سایت فارسی RTL با پنل مدیریت کامل (CMS).

## ✨ ویژگی‌ها

- 🎨 طراحی صنعتی-نارنجی، فونت Vazirmatn، RTL کامل
- 🛠️ پنل مدیریت `/admin` با مدیریت کامل محتوا
- 📁 بخش رسانه (Media) با آپلود + alt + title
- 👥 سیستم کاربران و سطوح دسترسی (RBAC)
- 📄 ویرایشگر مقالات و لندینگ‌ها در صفحه کامل
- 📈 صفحه اصلی بهینه‌شده برای سئو (FAQ، نظرات، process، brands)
- 🔍 SEO فنی: sitemap، robots.txt، JSON-LD، metadata داینامیک
- 📱 کاملاً ریسپانسیو + پشتیبانی Dark mode

## 🚀 راه‌اندازی

### پیش‌نیازها
- [Node.js 18+](https://nodejs.org/) یا [Bun](https://bun.sh/)

### نصب
```bash
git clone https://github.com/amirmohammadkarimi93/motor-mechanic.git
cd motor-mechanic
bun install
```

### پیکربندی
```bash
cp .env.example .env
# ویرایش فایل .env و مقدار JWT_SECRET را به یک رشته تصادفی طولانی تغییر دهید
```

### راه‌اندازی دیتابیس
```bash
bun run db:push    # ساخت جداول
bun run db:seed    # پر کردن داده‌های اولیه
```

### اجرا
```bash
bun run dev
```
سپس به `http://localhost:3000` بروید.

## 🔐 ورود به پنل مدیریت

به `/admin/login` بروید. کاربران پیش‌فرض (از seed):

| نام کاربری | رمز عبور | نقش |
|-----------|----------|-----|
| `admin` | `admin123` | مدیر ارشد (دسترسی کامل) |
| `editor` | `editor123` | ویرایشگر |
| `author` | `author123` | نویسنده (فقط مقالات خودش) |
| `landing` | `landing123` | ویرایشگر لندینگ |

⚠️ **مهم**: در production حتماً رمزهای پیش‌فرض را تغییر دهید.

## 🛠️ تکنولوژی‌ها

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **Auth**: JWT (jose) + bcryptjs
- **Forms**: react-hook-form + zod
- **Markdown**: @mdxeditor/editor + react-markdown

## 📚 مستندات

برای راهنمای کامل توسعه و آشنایی با ساختار پروژه، فایل [`PROJECT.md`](./PROJECT.md) را بخوانید.

## 📄 لایسنس

این پروژه اختصاصی است. © موتور مکانیک
