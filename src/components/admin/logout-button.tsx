"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("خدانگهدار!");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("خطا در خروج");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarMenuButton
      onClick={handleLogout}
      disabled={loading}
      className="hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground/80 cursor-pointer w-full"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      <span>خروج</span>
    </SidebarMenuButton>
  );
}
