import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromToken, ADMIN_COOKIE, canAccess, type Role } from "@/lib/auth";

// Map admin routes to required permission modules
const ROUTE_PERMISSIONS: { pattern: string; module: Parameters<typeof canAccess>[1] }[] = [
  { pattern: "/admin/users", module: "users" },
  { pattern: "/admin/settings", module: "settings" },
  { pattern: "/admin/categories", module: "categories" },
  { pattern: "/admin/articles", module: "articles" },
  { pattern: "/admin/services", module: "services" },
  { pattern: "/admin/messages", module: "messages" },
  { pattern: "/admin/media", module: "media" },
  { pattern: "/admin", module: "dashboard" },
];

// Map API admin routes to permission modules
const API_ROUTE_PERMISSIONS: { pattern: string; module: Parameters<typeof canAccess>[1] }[] = [
  { pattern: "/api/admin/users", module: "users" },
  { pattern: "/api/admin/settings", module: "settings" },
  { pattern: "/api/admin/categories", module: "categories" },
  { pattern: "/api/admin/articles", module: "articles" },
  { pattern: "/api/admin/services", module: "services" },
  { pattern: "/api/admin/messages", module: "messages" },
  { pattern: "/api/admin/media", module: "media" },
];

function getPermissionModule(
  pathname: string,
  list: typeof ROUTE_PERMISSIONS
): Parameters<typeof canAccess>[1] | null {
  // Find the most specific match (longest pattern)
  let bestMatch: { pattern: string; module: Parameters<typeof canAccess>[1] } | null = null;
  for (const item of list) {
    if (pathname === item.pattern || pathname.startsWith(item.pattern + "/")) {
      if (!bestMatch || item.pattern.length > bestMatch.pattern.length) {
        bestMatch = item;
      }
    }
  }
  return bestMatch?.module ?? null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin pages (not /admin/login or /api/admin/login)
  const isAdminPage =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/api/admin");

  if (isAdminPage) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const session = await getSessionFromToken(token);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // RBAC: check if user has permission to access this module
    const requiredModule = getPermissionModule(pathname, ROUTE_PERMISSIONS);
    if (requiredModule && !canAccess(session.role as Role, requiredModule)) {
      // Redirect to admin home with forbidden notice
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("forbidden", "1");
      return NextResponse.redirect(url);
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin/") && !pathname.endsWith("/login")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const session = await getSessionFromToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // RBAC: check API module permission
    const requiredModule = getPermissionModule(pathname, API_ROUTE_PERMISSIONS);
    if (requiredModule && !canAccess(session.role as Role, requiredModule)) {
      return NextResponse.json({ error: "Forbidden - شما به این بخش دسترسی ندارید" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
