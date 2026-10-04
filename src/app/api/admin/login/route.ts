import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  loginAdmin,
  signToken,
  setSessionCookie,
  type Role,
} from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;
  const result = await loginAdmin(username, password);
  if (!result.success || !result.user) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "نام کاربری یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  }

  const token = await signToken({
    id: result.user.id,
    username: result.user.username,
    name: result.user.name,
    role: result.user.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: {
      username: result.user.username,
      name: result.user.name ?? "",
      role: result.user.role,
    },
  });
}
