import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromToken, ADMIN_COOKIE } from "@/lib/auth";

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
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin/") && !pathname.endsWith("/login")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const session = await getSessionFromToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
