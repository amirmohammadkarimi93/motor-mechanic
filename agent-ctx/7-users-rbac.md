# Task 7 — Users RBAC module

## Files created (all new — no existing files modified)
- `src/lib/roles.ts` — shared role constants safe for client+server
- `src/app/api/admin/users/route.ts` — GET (list, paginated, with counts) + POST (create, zod, bcrypt hash, uniqueness check)
- `src/app/api/admin/users/[id]/route.ts` — GET + PUT (with self-protection) + DELETE (with self/last-admin protection + soft author detach)
- `src/app/api/admin/me/password/route.ts` — POST change own password
- `src/app/admin/(panel)/users/page.tsx` — server component, fetches users + per-role counts
- `src/app/admin/(panel)/profile/page.tsx` — server component, shows current user info + password form
- `src/components/admin/users-manager.tsx` — client: stats + search + filter + table + inline switch toggle + delete + dialog
- `src/components/admin/user-form-dialog.tsx` — client: Dialog with form + permission matrix display
- `src/components/admin/profile-password-form.tsx` — client: change-own-password form

## Key endpoints (super_admin only via middleware)
- GET `/api/admin/users?page=1&limit=20&search=...&role=...&active=...` → `{data, total, page, limit}`
- POST `/api/admin/users` → 201 PublicUser / 409 duplicate
- GET `/api/admin/users/[id]` → 200 PublicUser / 404
- PUT `/api/admin/users/[id]` → 200 / 400 (self-demote / self-deactivate / last-admin demote)
- DELETE `/api/admin/users/[id]` → 200 / 400 (self / last-admin) — soft detaches authorId/uploadedById
- POST `/api/admin/me/password` (any auth user) → 200 / 400 (wrong current / too short / same as current)

## Notes for other agents
- PublicUser shape: `{ id, username, name, email, role, active, createdAt, updatedAt, _count: {articles, categories, media} }` — **password is never exposed**.
- I did NOT modify `@/lib/auth.ts`. Instead I created `@/lib/roles.ts` with the same constants/types so client components can import them without bundling Prisma/next-headers/bcryptjs. The two files are duplicates — if you want to clean up, you could re-export from auth.ts. I left auth.ts untouched per task constraints.
- Color codes for role badges (Tailwind): super_admin = `bg-red-500/10 text-red-600 border-red-500/30`, editor = `bg-orange-500/10 text-orange-600 border-orange-500/30`, author = `bg-blue-500/10 text-blue-600 border-blue-500/30`, landing_editor = `bg-emerald-500/10 text-emerald-600 border-emerald-500/30`.
- All lint + TypeScript clean for my new files.
- Pre-existing errors in `src/middleware.ts` (no-assign-module-variable) and other agents' files (article-editor.tsx, category-editor.tsx, service-form-sheet.tsx, media-manager.tsx, faq-section.tsx, process-steps.tsx, share-buttons.tsx) are unchanged.

## Sidebar nav
The sidebar (app-sidebar.tsx) belongs to another agent and currently does NOT include a "مدیریت کاربران" link — but the page works at `/admin/users` and is reachable directly. If a sidebar entry should be added, it must be added by whoever owns app-sidebar.tsx. Permission module is `users` which only super_admin has.
