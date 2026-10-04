# Task ID: 5 (full-page editors) — Agent: full-stack-developer

## Task
Convert the article editor and category (landing page) editor from **Sheet (slide-over)** forms to **full-page** editors for the motorcycle repair CMS (موتور مکانیک), Persian RTL.

## Files Created
- `src/app/admin/(panel)/articles/new/page.tsx` — Server component, fetches all categories, renders breadcrumb "داشبورد › مقالات › مقاله جدید", title "ایجاد مقاله جدید", back button → `/admin/articles`, and `<ArticleEditor categories={...} />`.
- `src/app/admin/(panel)/articles/[id]/page.tsx` — Server component, fetches article + categories + session in parallel, calls `notFound()` if missing, redirects to `/admin/articles?forbidden=1` when an `author` (own-permission) tries to edit another user's article, renders `<ArticleEditor article={...} categories={...} />`.
- `src/app/admin/(panel)/categories/new/page.tsx` — Same pattern: breadcrumb "داشبورد › دسته‌بندی‌ها › دسته‌بندی جدید", title "ایجاد دسته‌بندی / صفحه لندینگ جدید", `<CategoryEditor parentCategories={...} />`.
- `src/app/admin/(panel)/categories/[id]/page.tsx` — Server component, fetches category + all potential parents + session, `notFound()` if missing, redirects when a `landing_editor` with own-permission tries to edit another user's category, `<CategoryEditor category={...} parentCategories={...} />`.
- `src/components/admin/article-editor.tsx` — Full-page client form (no Sheet). 2-column responsive layout: main column (title, slug with auto-gen+manual override, excerpt, MDXEditor content, cover image URL with thumbnail preview, tags) + sidebar (publish card with `published`/`featured` switches + `publishedAt` datetime-local, category card, author-name + reading-time card, SEO accordion with metaTitle/metaDescription/metaKeywords/canonicalUrl/ogImage/structuredData). Sticky bottom action bar with 3 buttons: "ذخیره" (secondary), "ذخیره و انتشار" (orange brand-600), "انصراف" (outline Link → `/admin/articles`). On success redirects to `/admin/articles` via `useRouter.push + router.refresh`.
- `src/components/admin/category-editor.tsx` — Full-page client form, 2-column layout: main column (title, slug with auto-gen, brand, city, shortDescription, cover image URL with preview, MDXEditor content) + sidebar (publish card: published/featured switches + order, icon picker with live lucide preview, parent-category select, SEO accordion with structuredData JSON-LD textarea). Same 3-button sticky action bar → `/admin/categories`.

## Files Modified
- `src/app/admin/(panel)/articles/page.tsx` — Added `getSession()` + `getPermissionLevel(session.role, "articles")`; for `own` permission level, filters the `where` clause by `authorId = session.id` so authors only see their own articles in the list. Passes `currentUserId` + `permissionLevel` to the client `<ArticlesTable>` so it can show/hide per-row edit/delete actions.
- `src/app/admin/(panel)/categories/page.tsx` — Same RBAC pattern: `getPermissionLevel(session.role, "categories")`; for `own`, filters by `authorId = session.id`. Passes session info to `<CategoriesTable>`.
- `src/components/admin/articles-table.tsx` — Removed all `Sheet`/`useState` for sheet open + editing item. Removed `<ArticleFormSheet>` import. "افزودن مقاله جدید" button is now `<Button asChild><Link href="/admin/articles/new">...</Link></Button>`. Each row's edit pencil is now `<Link href="/admin/articles/${a.id}">`. Added `canManage(item)` helper that returns `true` if `permissionLevel === "all"` or `permissionLevel === "own" && item.authorId === currentUserId`; otherwise renders a `—` placeholder instead of action buttons. Delete with AlertDialog still works in-place.
- `src/components/admin/categories-table.tsx` — Same Link-based pattern; "افزودن دسته‌بندی جدید" → Link to `/admin/categories/new`, edit pencil → Link to `/admin/categories/[id]`. RBAC `canManage(item)` filters edit/delete buttons.

## Files Deleted
- `src/components/admin/article-form-sheet.tsx` (replaced by article-editor.tsx + new/[id] pages)
- `src/components/admin/category-form-sheet.tsx` (replaced by category-editor.tsx + new/[id] pages)

## Layout / UX
- Full-page breadcrumb at the top (داشبورد › مقالات › مقاله جدید / [article.title]).
- Desktop-only page title row with back button (right side, RTL).
- Mobile shows a compact title + back button above the form.
- 2-column grid `lg:grid-cols-3` with main content spanning `lg:col-span-2` and sidebar `1`. Collapses to single column on mobile.
- Sticky bottom action bar across the whole form (`lg:col-span-3`) with the three action buttons right-aligned.
- All RTL: icons are placed on the right (e.g. `pr-10` for search inputs with absolute icon at `right-3`).
- "بازگشت" / "انصراف" use `<ArrowRight className="size-4" />` which in RTL visually points to the right (back direction in RTL Persian).
- "ذخیره و انتشار" uses `<Send />` icon and `bg-brand-600 hover:bg-brand-700 text-white` per brand spec.

## RBAC Implementation
- Server-side: `src/app/admin/(panel)/articles/page.tsx` and `/categories/page.tsx` use `getPermissionLevel(role, "articles" | "categories")`. When the level is `"own"`, the `where` clause adds `authorId = session.id` so authors only see their own items in the list.
- Client-side: tables receive `currentUserId` + `permissionLevel` and use `canManage(item)` to render edit/delete buttons only for items the user is allowed to manage (`"all"` ⇒ always; `"own"` ⇒ only when `item.authorId === currentUserId`; `"none"` ⇒ never).
- Edit page (`[id]/page.tsx`): for `author` role (articles) and `landing_editor` role (categories) when permission level is `"own"`, the page redirects to `/admin/articles?forbidden=1` (or `/admin/categories?forbidden=1`) if the user tries to open the editor for someone else's content. The middleware already prevents cross-module access (e.g. author can't see `/admin/categories` at all because their permission level is `"none"` for categories — `canAccess` returns false → middleware redirects to `/admin?forbidden=1`).

## Notes
- Reused the existing `MarkdownEditor` wrapper from `src/components/admin/markdown-editor.tsx` (MDXEditor) for both article content and category content.
- Used existing API endpoints (`POST /api/admin/articles`, `PUT /api/admin/articles/[id]`, `POST /api/admin/categories`, `PUT /api/admin/categories/[id]`) — no new API endpoints created.
- The `publishedAt` field uses `<Input type="datetime-local">` with `isoToDatetimeLocal` / `datetimeLocalToIso` helpers. On submit, if `publishedAt` is empty but the article is being published, we fall back to `new Date().toISOString()` so the API still gets a valid timestamp.
- Slug auto-generation logic: as long as the slug is empty or matches `toSlug(title)` we keep regenerating from title. Once the user manually types a different slug, we stop overwriting it.
- Fixed the `zodResolver` ↔ `useForm` TypeScript incompatibility (TS2719 "two different Resolver types exist") by casting `zodResolver(schema) as Resolver<TValues>`. The same pattern would fix `service-form-sheet.tsx` (which has the same pre-existing error) but that file belongs to another agent and was not modified.
- All Persian UI text. Lucide icons throughout. shadcn/ui Card / Input / Textarea / Switch / Select / Accordion / Button / Label.
- Toast feedback via `sonner` (e.g. "مقاله ساخته شد", "دسته‌بندی به‌روزرسانی و منتشر شد").

## Verification
- `bun run lint` — clean for all 8 files I created/modified. The only remaining errors are in `src/middleware.ts` (pre-existing `no-assign-module-variable` — explicitly told NOT to modify).
- `bunx tsc --noEmit` — zero errors in my files. Remaining TS errors are in other agents' files (`service-form-sheet.tsx`, `media-manager.tsx`, `faq-section.tsx`, `process-steps.tsx`, `share-buttons.tsx`) which are out of scope.

## Files NOT Modified (per task constraints)
- `src/lib/auth.ts`, `src/lib/db.ts`, `src/lib/seo.ts`, `src/lib/slug.ts`
- `prisma/schema.prisma`
- `src/middleware.ts`
- `src/app/admin/login/*`
- `src/app/api/admin/*` (existing endpoints used as-is)
- `src/components/ui/*`
- `src/components/admin/app-sidebar.tsx`, `markdown-editor.tsx`, `logout-button.tsx`, `theme-toggle.tsx`
- `src/app/admin/(panel)/layout.tsx`
- `src/app/admin/(panel)/services/*`, `/messages/*`, `/settings/*`, `/media/*`, `/users/*`, `/profile/*`
- `src/app/(site)/*`, `src/components/site/*`
- `src/app/globals.css`, `src/app/layout.tsx`
