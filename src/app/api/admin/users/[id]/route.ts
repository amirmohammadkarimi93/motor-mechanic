import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession, isValidRole, type Role } from "@/lib/auth";

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
}) {
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

const userSelect = {
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
} as const;

const updateSchema = z.object({
  name: z.string().max(100, "نام نباید بیش از ۱۰۰ کاراکتر باشد").optional().nullable(),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")).nullable(),
  role: z
    .string()
    .refine((v): v is Role => isValidRole(v), {
      message: "نقش انتخاب شده معتبر نیست",
    })
    .optional(),
  active: z.boolean().optional(),
  password: z
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .optional()
    .or(z.literal("")),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.adminUser.findUnique({
    where: { id },
    select: userSelect,
  });
  if (!user) {
    return NextResponse.json(
      { error: "کاربر یافت نشد" },
      { status: 404 }
    );
  }
  return NextResponse.json(serialize(user));
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

  // Get current session (already authorized by middleware but we need id)
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "نشست نامعتبر است" }, { status: 401 });
  }

  const existing = await db.adminUser.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  // Prevent super_admin from removing their own super_admin role (lockout protection)
  if (
    session.id === id &&
    parsed.data.role &&
    parsed.data.role !== "super_admin" &&
    existing.role === "super_admin"
  ) {
    return NextResponse.json(
      { error: "نمی‌توانید نقش مدیر ارشد خود را تغییر دهید" },
      { status: 400 }
    );
  }

  // Prevent self-deactivation (lockout protection)
  if (
    session.id === id &&
    parsed.data.active === false &&
    existing.role === "super_admin"
  ) {
    return NextResponse.json(
      { error: "نمی‌توانید حساب خود را غیرفعال کنید" },
      { status: 400 }
    );
  }

  // If we're demoting the last super_admin, prevent it
  if (
    parsed.data.role &&
    parsed.data.role !== "super_admin" &&
    existing.role === "super_admin"
  ) {
    const superAdminCount = await db.adminUser.count({
      where: { role: "super_admin", active: true },
    });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "نمی‌توانید آخرین مدیر ارشد را به نقش دیگری تغییر دهید" },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name ?? null;
  if (parsed.data.email !== undefined)
    updateData.email = (parsed.data.email as string) || null;
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.active !== undefined) updateData.active = parsed.data.active;
  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 10);
  }

  try {
    const updated = await db.adminUser.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
    return NextResponse.json(serialize(updated));
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json(
      { error: "به‌روزرسانی کاربر با خطا مواجه شد" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "نشست نامعتبر است" }, { status: 401 });
  }

  // Prevent self-deletion
  if (session.id === id) {
    return NextResponse.json(
      { error: "نمی‌توانید حساب خود را حذف کنید" },
      { status: 400 }
    );
  }

  const existing = await db.adminUser.findUnique({
    where: { id },
    select: { id: true, role: true, username: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  // Prevent deleting the last super_admin
  if (existing.role === "super_admin") {
    const superAdminCount = await db.adminUser.count({
      where: { role: "super_admin", active: true },
    });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "نمی‌توانید آخرین مدیر ارشد را حذف کنید" },
        { status: 400 }
      );
    }
  }

  try {
    // Detach author relations so content remains intact (don't cascade delete)
    await Promise.all([
      db.article.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      }),
      db.category.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      }),
      db.media.updateMany({
        where: { uploadedById: id },
        data: { uploadedById: null },
      }),
    ]);

    await db.adminUser.delete({ where: { id } });
    return NextResponse.json({
      ok: true,
      message: `کاربر ${existing.username} حذف شد`,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: "حذف کاربر با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
