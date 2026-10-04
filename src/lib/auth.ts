import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "motor-mechanic-secret-key-change-in-production-2024"
);

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = "7d"; // 7 days

// Role definitions and their permissions
export type Role = "super_admin" | "editor" | "author" | "landing_editor";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "مدیر ارشد",
  editor: "ویرایشگر",
  author: "نویسنده مقاله",
  landing_editor: "ویرایشگر لندینگ",
};

export const ROLE_PERMISSIONS: Record<Role, {
  articles: "none" | "own" | "all";
  categories: "none" | "own" | "all";
  services: boolean;
  media: "none" | "own" | "all";
  messages: boolean;
  settings: boolean;
  users: boolean;
  dashboard: boolean;
}> = {
  super_admin: {
    articles: "all",
    categories: "all",
    services: true,
    media: "all",
    messages: true,
    settings: true,
    users: true,
    dashboard: true,
  },
  editor: {
    articles: "all",
    categories: "all",
    services: true,
    media: "all",
    messages: true,
    settings: false,
    users: false,
    dashboard: true,
  },
  author: {
    articles: "own",
    categories: "none",
    services: false,
    media: "own",
    messages: false,
    settings: false,
    users: false,
    dashboard: true,
  },
  landing_editor: {
    articles: "none",
    categories: "all",
    services: false,
    media: "all",
    messages: true,
    settings: false,
    users: false,
    dashboard: true,
  },
};

export function isValidRole(role: string): role is Role {
  return role in ROLE_PERMISSIONS;
}

export function canAccess(
  role: string | undefined,
  module: keyof (typeof ROLE_PERMISSIONS)[Role]
): boolean {
  if (!role || !isValidRole(role)) return false;
  const perm = ROLE_PERMISSIONS[role][module];
  if (typeof perm === "boolean") return perm;
  return perm !== "none";
}

export function getPermissionLevel(
  role: string | undefined,
  module: "articles" | "categories" | "media"
): "none" | "own" | "all" {
  if (!role || !isValidRole(role)) return "none";
  const perm = ROLE_PERMISSIONS[role][module];
  if (perm === "none" || perm === "own" || perm === "all") return perm;
  return "none";
}

export interface AdminSession {
  id: string;
  username: string;
  name?: string;
  role: Role;
}

export async function signToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(SECRET);
}

export async function verifyToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string | undefined,
      role: (payload.role as Role) || "author",
    };
  } catch {
    return null;
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: { id: string; username: string; name?: string; role: Role } }> {
  const user = await db.adminUser.findUnique({ where: { username } });
  if (!user) return { success: false, error: "نام کاربری یا رمز عبور اشتباه است" };
  if (!user.active) return { success: false, error: "حساب کاربری شما غیرفعال است" };
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { success: false, error: "نام کاربری یا رمز عبور اشتباه است" };
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name || undefined,
      role: (user.role as Role) || "author",
    },
  };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(role: Role | Role[]): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

// Check if user can access a specific module (for server components)
export async function canAccessModule(
  module: keyof (typeof ROLE_PERMISSIONS)[Role]
): Promise<boolean> {
  const session = await getSession();
  return canAccess(session?.role, module);
}

// For middleware (edge runtime compatible)
export async function getSessionFromToken(token: string | undefined) {
  if (!token) return null;
  return verifyToken(token);
}

export const ADMIN_COOKIE = COOKIE_NAME;
