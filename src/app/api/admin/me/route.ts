import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "نشست معتبر نیست" },
      { status: 401 }
    );
  }

  const user = await db.adminUser.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, name: true, role: true },
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, user });
}
