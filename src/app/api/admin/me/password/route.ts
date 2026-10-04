import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی را وارد کنید"),
  newPassword: z.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "نشست نامعتبر است" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "رمز عبور جدید باید با رمز فعلی متفاوت باشد" },
      { status: 400 }
    );
  }

  const user = await db.adminUser.findUnique({
    where: { id: session.id },
    select: { id: true, password: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "رمز عبور فعلی اشتباه است" },
      { status: 400 }
    );
  }

  try {
    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.adminUser.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    return NextResponse.json({
      ok: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "تغییر رمز عبور با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
