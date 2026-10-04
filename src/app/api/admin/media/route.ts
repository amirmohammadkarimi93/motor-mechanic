import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, getPermissionLevel } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const level = getPermissionLevel(session.role, "media");
  if (level === "none") {
    return NextResponse.json(
      { error: "Forbidden - شما به این بخش دسترسی ندارید" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10) || 24)
  );
  const search = searchParams.get("search")?.trim() || "";

  // Build where clause
  const where: Record<string, unknown> = {};

  // Author role: only their own uploads
  if (level === "own") {
    where.uploadedById = session.id;
  }

  if (search) {
    where.OR = [
      { filename: { contains: search } },
      { alt: { contains: search } },
      { title: { contains: search } },
    ];
  }

  const [total, data] = await Promise.all([
    db.media.count({ where }),
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: {
          select: { id: true, name: true, username: true },
        },
      },
    }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
