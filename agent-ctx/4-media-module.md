# Task ID: 4 — Media module (full-stack-developer)

## Task
Build the Media module for the motorcycle repair CMS (موتور مکانیک). Persian RTL.

## Files Created
- `src/app/api/admin/media/upload/route.ts` — POST upload (multipart/form-data, file+alt+title), validates image mime + 10MB max, sharp for dimensions, save to `public/uploads/{timestamp}-{shortuuid}-{sanitized-name}.{ext}`, creates Media record with uploadedById, returns 201 with media object
- `src/app/api/admin/media/route.ts` — GET list with pagination + search + RBAC (author sees own uploads only)
- `src/app/api/admin/media/[id]/route.ts` — GET single, PUT (alt/title/caption via zod), DELETE (also unlinks file from disk). Author can only modify their own.
- `src/app/admin/(panel)/media/page.tsx` — server component, fetches list, renders MediaManager
- `src/components/admin/media-manager.tsx` — client component (upload via XHR with progress, search, grid of media cards, edit dialog, delete confirm, copy URL, RTL Persian)

## Files Modified
- `src/components/admin/app-sidebar.tsx` — added `ImageIcon` Media nav item between "خدمات" and "پیام‌ها"; added `module: ModuleKey` to each NAV_ITEMS entry; added 8 `canAccess*` boolean props and filtered NAV_ITEMS by them
- `src/app/admin/(panel)/layout.tsx` — computes per-module `canAccess(session.role, module)` booleans (articles/categories/services/media/messages/users/settings/dashboard) and passes them to `<AppSidebar/>`

## Key Decisions
- Used **XMLHttpRequest** (not fetch) in the client to track real upload progress events (`xhr.upload.onprogress`)
- Used `crypto.randomUUID()` (first segment) + timestamp + sanitized original name for unique filenames, normalized to a known extension derived from sharp's detected format
- Server uses `sharp(buffer).metadata()` both to read real width/height AND to validate the file is genuinely an image (rejects disguised files)
- DELETE deletes the file from disk best-effort after the DB delete succeeds (non-fatal if file is already gone)
- Author role only sees/modifies their own uploads (using `getPermissionLevel(session.role, "media") === "own"`); super_admin, editor, landing_editor can manage all
- Upload endpoint is RBAC-aware via `getSession()` + the `media` permission in middleware (already configured)
- Edit dialog includes preview + meta info + alt/title/caption fields + a quick-copy URL box
- Grid uses responsive columns (2/3/4/5 across sm/md/lg/xl) and shows "من" badge or uploader name on cards when viewer has `media: all`
- All Persian text throughout; numbers/dates localized via `fa-IR`
- `bun run lint`: my new files introduce **0 errors** (only pre-existing errors in `src/middleware.ts` remain, which I am not allowed to modify)

## API Contract

### Upload
**POST `/api/admin/media/upload`** — multipart/form-data
- Fields: `file` (File, required), `alt` (string, optional), `title` (string, optional)
- Validates: only image/jpeg|png|webp|gif, max 10 MB
- 201: `{ id, url, filename, alt, title, width, height, size, mimeType }`
- 400: `{ error: "فقط تصویر قابل آپلود است" | "حجم فایل نباید بیش از ۱۰ مگابایت باشد" | ... }`
- 401: `{ error: "Unauthorized" }`

### List
**GET `/api/admin/media?page=1&limit=24&search=...`**
- 200: `{ data: Media[], total, page, limit }`
- Each Media includes `uploadedBy: { id, name, username } | null`
- Author role: only own uploads returned. super_admin/editor/landing_editor: all.

### Single
**GET `/api/admin/media/[id]`** — returns Media (with uploadedBy). Author: only own (403 otherwise).
**PUT `/api/admin/media/[id]`** — body: `{ alt?: string|null, title?: string|null, caption?: string|null }`. Returns updated Media. Author: only own (403).
**DELETE `/api/admin/media/[id]`** — returns `{ ok: true, message: "رسانه حذف شد" }`. Also removes file from disk. Author: only own (403).
