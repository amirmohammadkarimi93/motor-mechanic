import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "محتوا الزامی است").optional(),
  coverImage: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  structuredData: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  readingTime: z.number().int().optional().nullable(),
  tags: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await db.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, title: true, slug: true } },
    },
  });
  if (!article) {
    return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(article);
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

  const existing = await db.article.findUnique({
    where: { id },
    select: { id: true, slug: true, published: true, publishedAt: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
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
      const found = await db.article.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!found;
    });
  } else if (typeof data.title === "string" && !data.slug) {
    const newSlug = slugify(data.title);
    updateData.slug = await uniqueSlug(newSlug, async (s) => {
      if (s === existing.slug) return false;
      const found = await db.article.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!found;
    });
  }

  // Validate categoryId if provided
  if (data.categoryId !== undefined && data.categoryId !== null) {
    const cat = await db.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!cat) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 400 }
      );
    }
  }

  // Handle publishedAt
  if (data.publishedAt !== undefined) {
    if (data.publishedAt === null) {
      updateData.publishedAt = null;
    } else {
      const d = new Date(data.publishedAt);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "تاریخ انتشار نامعتبر است" },
          { status: 400 }
        );
      }
      updateData.publishedAt = d;
    }
  } else if (
    data.published === true &&
    !data.publishedAt &&
    !existing.publishedAt
  ) {
    // If switching to published and no publishedAt yet, set to now
    updateData.publishedAt = new Date();
  }

  try {
    const updated = await db.article.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update article error:", err);
    return NextResponse.json(
      { error: "به‌روزرسانی مقاله با خطا مواجه شد" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await db.article.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
  }

  try {
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "مقاله حذف شد" });
  } catch (err) {
    console.error("Delete article error:", err);
    return NextResponse.json(
      { error: "حذف مقاله با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
