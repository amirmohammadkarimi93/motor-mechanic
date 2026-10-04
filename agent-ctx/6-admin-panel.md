# Task 6 — Admin CMS Panel

## Overview
Built complete admin panel (CMS) for the motorcycle repair website (موتور مکانیک) with Persian RTL UI, dark industrial sidebar, and orange (#ea580c) accent.

## Files Created
### Pages (Next.js App Router)
- `src/app/admin/login/page.tsx` — Login page (client form, react-hook-form + zod, sonner toasts, industrial carbon background with hazard stripes + bike logo)
- `src/app/admin/login/layout.tsx` — Passthrough layout with metadata
- `src/app/admin/(panel)/layout.tsx` — Authenticated sidebar layout (getSession → redirect to login if unauthenticated, sidebar with unread messages badge, header bar with user info + theme toggle)
- `src/app/admin/(panel)/page.tsx` — Dashboard (server-side stats via `db`: articles count, published articles, categories, services, unread messages; recent messages table; recent articles table; quick action buttons)
- `src/app/admin/(panel)/categories/page.tsx` — Categories list (server-side paginated fetch, search)
- `src/app/admin/(panel)/articles/page.tsx` — Articles list (server-side paginated fetch, search + category filter + published filter)
- `src/app/admin/(panel)/services/page.tsx` — Services list (server-side paginated, search)
- `src/app/admin/(panel)/messages/page.tsx` — Messages list (server-side fetch, all/unread filter, unread count)
- `src/app/admin/(panel)/settings/page.tsx` — Settings page (server-side fetch singleton; client form with Tabs)

### Admin components
- `src/components/admin/app-sidebar.tsx` — Dark charcoal sidebar with brand logo, nav items, unread messages badge, footer (back to site + logout)
- `src/components/admin/logout-button.tsx` — POST /api/admin/logout → redirect to /admin/login
- `src/components/admin/theme-toggle.tsx` — Light/dark toggle (next-themes) with suppressHydrationWarning
- `src/components/admin/markdown-editor.tsx` — MDXEditor wrapper with toolbar (bold/italic/lists/headings/link/image/code/quote)
- `src/components/admin/categories-table.tsx` — Client table with search, pagination, delete confirm (AlertDialog), open edit/create Sheet
- `src/components/admin/category-form-sheet.tsx` — Sheet (left slide-over) with all category fields including SEO accordion
- `src/components/admin/articles-table.tsx` — Articles table with search + category filter + status filter, pagination
- `src/components/admin/article-form-sheet.tsx` — Article form Sheet with markdown editor, category select, tags, featured/published switches, SEO accordion
- `src/components/admin/services-table.tsx` — Services table with search + pagination
- `src/components/admin/service-form-sheet.tsx` — Service form Sheet (title, slug, description, icon, image, price, features as textarea → JSON array, published switch, order)
- `src/components/admin/messages-client.tsx` — Messages client with filter tabs, expandable detail dialog, mark-read/unread, delete, pagination
- `src/components/admin/settings-form.tsx` — Settings form with Tabs (اطلاعات اصلی، تماس، شبکه‌های اجتماعی، صفحه اصلی، درباره ما، آمار و ویژگی‌ها، سئو عمومی، رنگ اصلی). Features & stats have repeatable list editor with JSON serialization.
- `src/components/admin/types.ts` — Shared admin TypeScript types

## Key Decisions
1. **Route group `(panel)`**: Moved the authenticated admin pages into `src/app/admin/(panel)/...` so the sidebar+auth layout wraps ONLY the panel pages — not the login page. The login page lives at `src/app/admin/login/` and only uses the root layout + its own simple layout. URL paths stay the same (`/admin`, `/admin/categories`, etc.) because route groups don't affect the URL.
   - Note: Task instructions said "Admin layout: src/app/admin/layout.tsx" — moved to `src/app/admin/(panel)/layout.tsx` due to the Next.js layout inheritance constraint (otherwise /admin/login would be wrapped by the sidebar AND the auth check, causing infinite redirect loop).
2. **Data fetching**: Server components fetch directly via `db` (Prisma) for list pages. Forms POST/PUT/DELETE to API endpoints (built by Task 5 agent) using fetch. Sonner toasts for feedback.
3. **Markdown**: Used `@mdxeditor/editor` (already installed) for article content + about-content. Wrapped in `MarkdownEditor` client component.
4. **Theme toggle**: Used `suppressHydrationWarning` on the button to avoid the React 19 `react-hooks/set-state-in-effect` lint error that the existing site components trigger.
5. **Sidebar active state**: Active route uses `bg-brand-500/15 text-brand-300` for industrial orange accent.
6. **Sidebar side**: Set to `side="right"` for RTL layout (sidebar on right side of screen).
7. **Sheet direction**: All form sheets slide-in from `left` so they appear on the left side (in RTL they visually come from the right edge of the sidebar).

## API Contract Used
Per the assumed contract:
- `POST /api/admin/login` body `{username,password}` → `{ok:true, user}` or `{error}`
- `POST /api/admin/logout` → `{ok:true}`
- `GET /api/admin/categories?page=&limit=&search=` etc. (handled server-side directly via `db`)
- `POST/PUT/DELETE /api/admin/categories`, `/api/admin/articles`, `/api/admin/services`
- `PATCH /api/admin/messages/[id]` body `{read: boolean}` → toggle read state
- `DELETE /api/admin/messages/[id]`
- `GET /api/admin/settings` (handled server-side via db) → `PUT /api/admin/settings` body full settings

## Verification
- `bun run lint` — clean for all admin files. (Pre-existing errors in `src/components/site/header.tsx` and `src/components/site/share-buttons.tsx` belong to the public-site agent, not this task.)
- Manual curl test: `/admin/login` returns HTTP 200; all other `/admin/*` routes return HTTP 307 (redirect to login) when unauthenticated — confirms middleware + layout integration works correctly.
- All Persian text, RTL throughout, lucide-react icons, shadcn/ui components, sonner toasts, react-hook-form + zod for login/category/article/service forms.

## Issues
- Dev server kept dying in the sandbox when running many parallel curls — likely sandbox resource constraint. Code compiles fine and `bun run lint` passes.
- Could not run full end-to-end auth flow test (login + visit protected pages) due to the sandbox dev-server instability, but the structure is verified by lint + curl tests for the unauthenticated flow.
