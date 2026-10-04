# Task 3 — Public Site Pages

## Agent
full-stack-developer (public pages)

## Task
Build the public site pages for the motorcycle repair website (موتور مکانیک) in Persian (RTL):
- Homepage, About, Contact, Articles list, Article detail (SEO-critical), Services/Categories list, Service/Category detail (most important SEO page)
- Reusable components in `src/components/site/`

## Reference for next agents
You can view previous agents' work records in this `/agent-ctx/` directory.

## Outcome
- All 7 public pages built and verified working (HTTP 200) by curl against dev server.
- All 17 reusable site components in place.
- Removed placeholder `src/app/page.tsx` so the (site) route group's homepage actually serves `/` (Next.js was previously rendering the Z.ai placeholder logo because root page.tsx shadowed the (site)/page.tsx route group).
- Added `<StatsBand>` to homepage (was imported but never used).
- Added `export const revalidate = 3600` to articles/page.tsx and services/page.tsx.
- Added `export const dynamicParams = true` to articles/[slug]/page.tsx and services/[slug]/page.tsx.
- `bun run lint` clean for all my changes. Only 1 pre-existing lint error remains in `src/components/site/header.tsx` (cannot modify per task instructions).
- Verified 404 handling: non-existent article/category slugs correctly return 404 via `notFound()`.

## Known issues left
1. `src/components/site/article-view-tracker.tsx` POSTs to `/api/articles/[slug]/view` which doesn't exist (Task 5 agent didn't build a public article-view endpoint, and I can't add API routes per task instructions). The fetch silently fails inside try/catch, so the article page still renders fine, but `views` count never increments. Task spec says view increment is OPTIONAL.
2. Pre-existing lint error in `src/components/site/header.tsx` line 27 (`useEffect(() => setMounted(true), [])` triggers `react-hooks/set-state-in-effect` rule). Cannot modify per task instructions. Fix suggestion: add `// eslint-disable-next-line react-hooks/set-state-in-effect` or refactor to use `suppressHydrationWarning`.

## Files I did NOT modify (per instructions)
- root `src/app/layout.tsx`
- `src/app/(site)/layout.tsx`
- `src/components/site/header.tsx`
- `src/components/site/footer.tsx`
- `src/components/ui/*`
- `src/lib/*`
- `prisma/schema.prisma`
- `src/app/admin/*`
- `src/app/api/*`
- `src/app/globals.css`

## Files I deleted
- `src/app/page.tsx` (Z.ai placeholder that conflicted with the (site) group's homepage for the `/` route)

## See also
Full worklog entry appended to `/home/z/my-project/worklog.md` under `Task ID: 3`.
