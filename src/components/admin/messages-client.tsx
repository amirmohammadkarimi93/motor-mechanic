"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Mail,
  MailOpen,
  Trash2,
  Loader2,
  Phone,
  Inbox,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: Date;
};

interface MessagesClientProps {
  items: Message[];
  total: number;
  unreadCount: number;
  totalCount: number;
  page: number;
  limit: number;
  filter: string;
}

function formatJalaliDate(date: Date) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleDateString();
  }
}

export function MessagesClient({
  items,
  total,
  unreadCount,
  totalCount,
  page,
  limit,
  filter,
}: MessagesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Message | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("filter");
    else params.set("filter", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function toggleRead(m: Message, markRead: boolean) {
    setBusyId(m.id);
    try {
      const res = await fetch(`/api/admin/messages/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: markRead }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "عملیات ناموفق بود");
        return;
      }
      toast.success(markRead ? "پیام خوانده‌شد" : "پیام خوانده‌نشده شد");
      router.refresh();
      if (selected?.id === m.id) {
        setSelected({ ...m, read: markRead });
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "حذف ناموفق بود");
        return;
      }
      toast.success("پیام حذف شد");
      if (selected?.id === id) setSelected(null);
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setBusyId(null);
    }
  }

  async function openMessage(m: Message) {
    setSelected(m);
    if (!m.read) {
      // mark read on open
      void toggleRead(m, true);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter + stats */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <Tabs
          value={filter === "unread" ? "unread" : "all"}
          onValueChange={setFilter}
        >
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <Inbox className="size-3.5" />
              همه ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-1.5">
              <Filter className="size-3.5" />
              خوانده‌نشده ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {unreadCount > 0 && filter !== "unread" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("unread")}
          >
            مشاهده {unreadCount} پیام خوانده‌نشده
          </Button>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mail className="size-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {filter === "unread"
                ? "پیام خوانده‌نشده‌ای وجود ندارد"
                : "صندوق پیام‌ها خالی است"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((m) => (
            <Card
              key={m.id}
              className={
                "cursor-pointer transition-all hover:shadow-md hover:border-brand-500/40 " +
                (m.read ? "opacity-70" : "ring-1 ring-brand-500/30")
              }
              onClick={() => openMessage(m)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={
                    "size-10 rounded-lg flex items-center justify-center shrink-0 " +
                    (m.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-brand-500/10 text-brand-600 dark:text-brand-400")
                  }
                >
                  {m.read ? (
                    <MailOpen className="size-5" />
                  ) : (
                    <Mail className="size-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {m.phone}
                    </span>
                    {!m.read && (
                      <Badge className="bg-brand-500 hover:bg-brand-500 text-white">
                        جدید
                      </Badge>
                    )}
                  </div>
                  {m.subject && (
                    <p className="text-sm font-medium mt-1 truncate">
                      {m.subject}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {m.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatJalaliDate(m.createdAt)}
                  </p>
                </div>
                <div
                  className="flex gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleRead(m, !m.read)}
                    disabled={busyId === m.id}
                    aria-label={m.read ? "علامت‌گذاری خوانده‌نشده" : "علامت‌گذاری خوانده‌شده"}
                    title={m.read ? "خوانده‌نشده" : "خوانده‌شده"}
                  >
                    {busyId === m.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : m.read ? (
                      <Mail className="size-4" />
                    ) : (
                      <MailOpen className="size-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:bg-destructive/10 hover:text-destructive"
                        disabled={busyId === m.id}
                        aria-label="حذف"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف پیام</AlertDialogTitle>
                        <AlertDialogDescription>
                          آیا از حذف پیام «{m.name}» مطمئن هستید؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(m.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            صفحه <span className="font-medium text-foreground">{page}</span> از{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              قبلی
            </Button>
            <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
              بعدی
            </Button>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <Mail className="size-5 text-brand-500" />
              {selected?.subject || "پیام بدون موضوع"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {selected && formatJalaliDate(selected.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">نام:</span>{" "}
                  <span className="font-medium">{selected.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">تلفن:</span>{" "}
                  <a
                    href={`tel:${selected.phone}`}
                    className="font-mono text-brand-600 dark:text-brand-400 inline-flex items-center gap-1"
                    dir="ltr"
                  >
                    <Phone className="size-3" />
                    {selected.phone}
                  </a>
                </div>
                {selected.email && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">ایمیل:</span>{" "}
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-brand-600 dark:text-brand-400 font-mono"
                      dir="ltr"
                    >
                      {selected.email}
                    </a>
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => selected && toggleRead(selected, !selected.read)}
              disabled={busyId === selected?.id}
            >
              {selected?.read ? "خوانده‌نشده" : "خوانده‌شده"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف پیام</AlertDialogTitle>
                  <AlertDialogDescription>
                    آیا از حذف این پیام مطمئن هستید؟
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selected && handleDelete(selected.id)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
