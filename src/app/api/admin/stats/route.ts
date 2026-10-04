import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [
    articles,
    publishedArticles,
    categories,
    services,
    unreadMessages,
    totalMessages,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { published: true } }),
    db.category.count(),
    db.service.count(),
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.count(),
  ]);

  return NextResponse.json({
    articles,
    publishedArticles,
    categories,
    services,
    unreadMessages,
    totalMessages,
  });
}
