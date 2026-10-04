import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );
  const search = searchParams.get("search")?.trim() || "";
  const unread = searchParams.get("unread");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
      { message: { contains: search } },
    ];
  }
  if (unread === "true") where.read = false;
  if (unread === "false") where.read = true;

  const [total, unreadCount, data] = await Promise.all([
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data,
    total,
    unreadCount,
    page,
    limit,
  });
}
