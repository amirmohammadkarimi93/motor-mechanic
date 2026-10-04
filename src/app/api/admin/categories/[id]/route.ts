import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").optional(),
  slug: z.string().optional(),
  brand: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  structuredData: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id },
    include: {
      _count: { select: { articles: true, children: true } },
      parent: { select: { id: true, title: true, slug: true } },
      children: {
        select: { id: true, title: true, slug: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!category) {
    return NextResponse.json(
      { error: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }
  return NextResponse.json(category);
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

  const existing = await db.category.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) updateData[key] = value;
  }

  // Handle slug uniqueness if slug is being changed
  if (typeof data.slug === "string") {
    const newSlug = slugify(data.slug);
    updateData.slug = await uniqueSlug(newSlug, async (s) => {
      if (s === existing.slug) return false;
      const found = await db.category.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!found;
    });
  } else if (typeof data.title === "string" && !data.slug) {
    // If title changed and slug not explicitly set, regenerate slug from title
    const newSlug = slugify(data.title);
    updateData.slug = await uniqueSlug(newSlug, async (s) => {
      if (s === existing.slug) return false;
      const found = await db.category.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!found;
    });
  }

  // Validate parentId if provided
  if (data.parentId !== undefined && data.parentId !== null) {
    if (data.parentId === id) {
      return NextResponse.json(
        { error: "دسته‌بندی نمی‌تواند والد خود باشد" },
        { status: 400 }
      );
    }
    const parent = await db.category.findUnique({
      where: { id: data.parentId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json(
        { error: "دسته‌بندی والد یافت نشد" },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { articles: true, children: true } },
        parent: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update category error:", err);
    return NextResponse.json(
      { error: "به‌روزرسانی دسته‌بندی با خطا مواجه شد" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await db.category.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "دسته‌بندی یافت نشد" },
      { status: 404 }
    );
  }

  try {
    // Cascade delete: articles under this category will have categoryId set to null
    // First detach articles to keep them safe, then delete category
    await db.article.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    // Re-parent children to keep them safe
    await db.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    await db.category.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "دسته‌بندی حذف شد" });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json(
      { error: "حذف دسته‌بندی با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
