import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت | موتور مکانیک",
    template: "%s | پنل مدیریت",
  },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Fetch unread messages count for sidebar badge
  let unreadMessages = 0;
  try {
    unreadMessages = await db.contactMessage.count({ where: { read: false } });
  } catch {
    // ignore db errors
  }

  return (
    <SidebarProvider>
      <AppSidebar unreadMessages={unreadMessages} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-mr-1" />
          <Separator orientation="vertical" className="mr-2 h-5" />
          <div className="flex flex-1 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex size-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/20">
                <span className="text-xs font-bold">
                  {session.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">
                  {session.name || session.username}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  @{session.username}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-h-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
