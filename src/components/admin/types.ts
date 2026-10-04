import type { Category, Article } from "@prisma/client";

// Category with optional relations used by admin
export type CategoryWithRelations = Category & {
  children?: Category[];
  parent?: Category | null;
  _count?: { articles: number };
};

export type ArticleWithRelations = Article & {
  category?: { id: string; title: string } | null;
};

export type ServiceRow = import("@prisma/client").Service;
export type MessageRow = import("@prisma/client").ContactMessage;
