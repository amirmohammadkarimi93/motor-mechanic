// Shared role/permission constants — safe to import from client and server.
// Kept separate from src/lib/auth.ts (which imports server-only modules
// like next/headers, bcryptjs and Prisma) so client components can use these
// constants without bundling server-only code.

export type Role = "super_admin" | "editor" | "author" | "landing_editor";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "مدیر ارشد",
  editor: "ویرایشگر",
  author: "نویسنده مقاله",
  landing_editor: "ویرایشگر لندینگ",
};

export const ROLE_PERMISSIONS: Record<
  Role,
  {
    articles: "none" | "own" | "all";
    categories: "none" | "own" | "all";
    services: boolean;
    media: "none" | "own" | "all";
    messages: boolean;
    settings: boolean;
    users: boolean;
    dashboard: boolean;
  }
> = {
  super_admin: {
    articles: "all",
    categories: "all",
    services: true,
    media: "all",
    messages: true,
    settings: true,
    users: true,
    dashboard: true,
  },
  editor: {
    articles: "all",
    categories: "all",
    services: true,
    media: "all",
    messages: true,
    settings: false,
    users: false,
    dashboard: true,
  },
  author: {
    articles: "own",
    categories: "none",
    services: false,
    media: "own",
    messages: false,
    settings: false,
    users: false,
    dashboard: true,
  },
  landing_editor: {
    articles: "none",
    categories: "all",
    services: false,
    media: "all",
    messages: true,
    settings: false,
    users: false,
    dashboard: true,
  },
};

export function isValidRole(role: string): role is Role {
  return role in ROLE_PERMISSIONS;
}
