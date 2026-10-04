import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isValidRole, type Role } from "@/lib/auth";

// Public user shape (no password hash)
export type PublicUser = {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    articles: number;
    categories: number;
    media: number;
  };
};

function serialize(u: {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { articles: number; categories: number; media: number };
}): PublicUser {
  // Never expose password hash — we used select without password field
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    _count: u._count,
  };
}

const createSchema = z.object({
  username: z
    .string()
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
    .max(50, "نام کاربری نباید بیش از ۵۰ کاراکتر باشد")
    .regex(/^[a-zA-Z0-9_.-]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد و خط تیره باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  name: z.string().max(100, "نام نباید بیش از ۱۰۰ کاراکتر باشد").optional().nullable(),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  role: z.string().refine((v): v is Role => isValidRole(v), {
    message: "نقش انتخاب شده معتبر نیست",
  }),
  active: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );
  const search = searchParams.get("search")?.trim() || "";
  const role = searchParams.get("role")?.trim() || "";
  const active = searchParams.get("active"); // "true" | "false" | null

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { username: { contains: search } },
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role && isValidRole(role)) {
    where.role = role;
  }
  if (active === "true" || active === "false") {
    where.active = active === "true";
  }

  const [total, data] = await Promise.all([
    db.adminUser.count({ where }),
    db.adminUser.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            categories: true,
            media: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    data: data.map(serialize),
    total,
    page,
    limit,
  });
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

  // Check username uniqueness
  const existing = await db.adminUser.findUnique({
    where: { username: data.username },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "این نام کاربری قبلاً ثبت شده است" },
      { status: 409 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await db.adminUser.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name ?? null,
        email: data.email || null,
        role: data.role,
        active: data.active,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { articles: true, categories: true, media: true },
        },
      },
    });

    return NextResponse.json(serialize(user), { status: 201 });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json(
      { error: "ایجاد کاربر با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
