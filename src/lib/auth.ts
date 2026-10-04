import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "motor-mechanic-secret-key-change-in-production-2024"
);

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = "7d"; // 7 days

export interface AdminSession {
  id: string;
  username: string;
  name?: string;
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
    };
  } catch {
    return null;
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await db.adminUser.findUnique({ where: { username } });
  if (!user) return { success: false, error: "نام کاربری یا رمز عبور اشتباه است" };
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { success: false, error: "نام کاربری یا رمز عبور اشتباه است" };
  return { success: true };
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

// For middleware (edge runtime compatible)
export async function getSessionFromToken(token: string | undefined) {
  if (!token) return null;
  return verifyToken(token);
}

export const ADMIN_COOKIE = COOKIE_NAME;
