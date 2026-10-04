import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "محتوا الزامی است"),
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
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );
  const search = searchParams.get("search")?.trim() || "";
  const categoryId = searchParams.get("categoryId");
  const published = searchParams.get("published");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { tags: { contains: search } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (published === "true" || published === "false") {
    where.published = published === "true";
  }
  if (featured === "true" || featured === "false") {
    where.featured = featured === "true";
  }

  const [total, data] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
  const finalSlug = await uniqueSlug(baseSlug, async (s) => {
    const existing = await db.article.findUnique({
      where: { slug: s },
      select: { id: true },
    });
    return !!existing;
  });

  if (data.categoryId) {
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

  // Auto-set publishedAt if published but not set
  let publishedAt: Date | null = null;
  if (data.publishedAt) {
    const d = new Date(data.publishedAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "تاریخ انتشار نامعتبر است" },
        { status: 400 }
      );
    }
    publishedAt = d;
  } else if (data.published) {
    publishedAt = new Date();
  }

  try {
    const article = await db.article.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt ?? null,
        content: data.content,
        coverImage: data.coverImage ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        metaKeywords: data.metaKeywords ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        ogImage: data.ogImage ?? null,
        structuredData: data.structuredData ?? null,
        categoryId: data.categoryId ?? null,
        authorName: data.authorName ?? null,
        readingTime: data.readingTime ?? null,
        tags: data.tags ?? null,
        featured: data.featured,
        published: data.published,
        publishedAt,
      },
      include: {
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error("Create article error:", err);
    return NextResponse.json(
      { error: "ایجاد مقاله با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
