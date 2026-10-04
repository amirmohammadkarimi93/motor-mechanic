"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  LayoutDashboard,
  Layers,
  FileText,
  Wrench,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "./logout-button";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "unread";
};

const NAV_ITEMS: NavItem[] = [
  { title: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { title: "دسته‌بندی‌ها", href: "/admin/categories", icon: Layers },
  { title: "مقالات", href: "/admin/articles", icon: FileText },
  { title: "خدمات", href: "/admin/services", icon: Wrench },
  { title: "پیام‌ها", href: "/admin/messages", icon: Mail, badgeKey: "unread" },
  { title: "تنظیمات سایت", href: "/admin/settings", icon: Settings },
];

interface AppSidebarProps {
  unreadMessages?: number;
}

export function AppSidebar({ unreadMessages = 0 }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar side="right" className="bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4 pb-3">
        <Link
          href="/admin"
          className="flex items-center gap-3 group"
          aria-label="خانه مدیریت"
        >
          <div className="size-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/10">
            <Bike className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-sidebar-foreground">
              موتور مکانیک
            </span>
            <span className="text-[11px] text-sidebar-foreground/60 leading-tight">
              پنل مدیریت محتوا
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            مدیریت محتوا
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-brand-500/15 text-brand-300 hover:bg-brand-500/20 hover:text-brand-200 font-medium"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={isActive ? "text-brand-400" : ""}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badgeKey === "unread" && unreadMessages > 0 && (
                      <SidebarMenuBadge>
                        <Badge
                          variant="default"
                          className="bg-brand-500 text-white hover:bg-brand-500 h-5 px-1.5 min-w-5 justify-center"
                        >
                          {unreadMessages > 99 ? "99+" : unreadMessages}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <ExternalLink />
                <span>بازگشت به سایت</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
