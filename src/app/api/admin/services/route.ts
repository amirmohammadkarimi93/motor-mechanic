import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
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
  const published = searchParams.get("published");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (published === "true" || published === "false") {
    where.published = published === "true";
  }

  const [total, data] = await Promise.all([
    db.service.count({ where }),
    db.service.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
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
    const existing = await db.service.findUnique({
      where: { slug: s },
      select: { id: true },
    });
    return !!existing;
  });

  try {
    const service = await db.service.create({
      data: {
        title: data.title,
        slug: finalSlug,
        description: data.description ?? null,
        icon: data.icon ?? null,
        image: data.image ?? null,
        price: data.price ?? null,
        features: data.features ?? null,
        published: data.published,
        order: data.order,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error("Create service error:", err);
    return NextResponse.json(
      { error: "ایجاد خدمت با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
