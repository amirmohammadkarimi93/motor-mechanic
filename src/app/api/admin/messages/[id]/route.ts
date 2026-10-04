import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const patchSchema = z.object({
  read: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const existing = await db.contactMessage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "پیام یافت نشد" },
      { status: 404 }
    );
  }

  const updated = await db.contactMessage.update({
    where: { id },
    data: { read: parsed.data.read },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await db.contactMessage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "پیام یافت نشد" },
      { status: 404 }
    );
  }

  try {
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "پیام حذف شد" });
  } catch (err) {
    console.error("Delete message error:", err);
    return NextResponse.json(
      { error: "حذف پیام با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
