import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { unlink } from "fs/promises";
import path from "path";

import { db } from "@/lib/db";
import { getSession, getPermissionLevel } from "@/lib/auth";

const updateSchema = z.object({
  alt: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const media = await db.media.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, name: true, username: true } },
    },
  });

  if (!media) {
    return NextResponse.json(
      { error: "رسانه یافت نشد" },
      { status: 404 }
    );
  }

  // Author can only view their own
  const level = getPermissionLevel(session.role, "media");
  if (level === "own" && media.uploadedById !== session.id) {
    return NextResponse.json(
      { error: "Forbidden - شما به این بخش دسترسی ندارید" },
      { status: 403 }
    );
  }

  return NextResponse.json(media);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.media.findUnique({
    where: { id },
    select: { id: true, uploadedById: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "رسانه یافت نشد" },
      { status: 404 }
    );
  }

  // Author can only update their own
  const level = getPermissionLevel(session.role, "media");
  if (level === "none") {
    return NextResponse.json(
      { error: "Forbidden - شما به این بخش دسترسی ندارید" },
      { status: 403 }
    );
  }
  if (level === "own" && existing.uploadedById !== session.id) {
    return NextResponse.json(
      { error: "Forbidden - شما فقط می‌توانید رسانه‌های خود را ویرایش کنید" },
      { status: 403 }
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) updateData[key] = value;
  }

  try {
    const updated = await db.media.update({
      where: { id },
      data: updateData,
      include: {
        uploadedBy: { select: { id: true, name: true, username: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update media error:", err);
    return NextResponse.json(
      { error: "به‌روزرسانی رسانه با خطا مواجه شد" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.media.findUnique({
    where: { id },
    select: { id: true, uploadedById: true, url: true, filename: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "رسانه یافت نشد" },
      { status: 404 }
    );
  }

  // Author can only delete their own
  const level = getPermissionLevel(session.role, "media");
  if (level === "none") {
    return NextResponse.json(
      { error: "Forbidden - شما به این بخش دسترسی ندارید" },
      { status: 403 }
    );
  }
  if (level === "own" && existing.uploadedById !== session.id) {
    return NextResponse.json(
      { error: "Forbidden - شما فقط می‌توانید رسانه‌های خود را حذف کنید" },
      { status: 403 }
    );
  }

  try {
    await db.media.delete({ where: { id } });

    // Best-effort: delete file from disk
    if (existing.url) {
      try {
        // existing.url is something like "/uploads/123-abc-file.jpg"
        const filePath = path.join(
          process.cwd(),
          "public",
          existing.url.replace(/^\//, "")
        );
        await unlink(filePath);
      } catch (err) {
        // File may already be gone - log and continue
        console.error("File delete error (non-fatal):", err);
      }
    }

    return NextResponse.json({ ok: true, message: "رسانه حذف شد" });
  } catch (err) {
    console.error("Delete media error:", err);
    return NextResponse.json(
      { error: "حذف رسانه با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
