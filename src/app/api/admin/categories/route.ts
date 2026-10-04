import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
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
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );
  const search = searchParams.get("search")?.trim() || "";
  const published = searchParams.get("published"); // "true" | "false" | null
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
      { brand: { contains: search } },
      { city: { contains: search } },
    ];
  }
  if (published === "true" || published === "false") {
    where.published = published === "true";
  }
  if (featured === "true" || featured === "false") {
    where.featured = featured === "true";
  }

  const [total, data] = await Promise.all([
    db.category.count({ where }),
    db.category.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { articles: true } },
        parent: { select: { id: true, title: true, slug: true } },
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
    const existing = await db.category.findUnique({
      where: { slug: s },
      select: { id: true },
    });
    return !!existing;
  });

  // Validate parentId if provided
  if (data.parentId) {
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
    const category = await db.category.create({
      data: {
        title: data.title,
        slug: finalSlug,
        brand: data.brand ?? null,
        city: data.city ?? null,
        shortDescription: data.shortDescription ?? null,
        content: data.content ?? null,
        image: data.image ?? null,
        icon: data.icon ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        metaKeywords: data.metaKeywords ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        ogImage: data.ogImage ?? null,
        structuredData: data.structuredData ?? null,
        parentId: data.parentId ?? null,
        featured: data.featured,
        published: data.published,
        order: data.order,
      },
      include: {
        _count: { select: { articles: true } },
        parent: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: "ایجاد دسته‌بندی با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
