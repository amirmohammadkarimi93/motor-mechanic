import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = await db.service.findUnique({ where: { id } });
  if (!service) {
    return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(service);
}

export async function PUT(
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const existing = await db.service.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) updateData[key] = value;
  }

  if (typeof data.slug === "string") {
    const newSlug = slugify(data.slug);
    updateData.slug = await uniqueSlug(newSlug, async (s) => {
      if (s === existing.slug) return false;
      const found = await db.service.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!found;
    });
  } else if (typeof data.title === "string" && !data.slug) {
    const newSlug = slugify(data.title);
    updateData.slug = await uniqueSlug(newSlug, async (s) => {
      if (s === existing.slug) return false;
      const found = await db.service.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!found;
    });
  }

  try {
    const updated = await db.service.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update service error:", err);
    return NextResponse.json(
      { error: "به‌روزرسانی خدمت با خطا مواجه شد" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await db.service.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 });
  }

  try {
    await db.service.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "خدمت حذف شد" });
  } catch (err) {
    console.error("Delete service error:", err);
    return NextResponse.json(
      { error: "حذف خدمت با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
