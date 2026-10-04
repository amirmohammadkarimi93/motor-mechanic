"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, LockKeyhole, User, Bike, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری را وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "ورود ناموفق بود");
        return;
      }
      toast.success("خوش آمدید!");
      const redirect = searchParams.get("redirect") || "/admin";
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-30 rounded-full" />
            <div className="relative size-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <Bike className="size-10 text-white" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-display tracking-tight">
            موتور مکانیک
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            پنل مدیریت محتوا — مرکز تخصصی تعمیرات موتور سیکلت
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام کاربری</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        autoComplete="username"
                        className="pr-10"
                        placeholder="نام کاربری خود را وارد کنید"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockKeyhole className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        className="pr-10"
                        placeholder="رمز عبور خود را وارد کنید"
                        disabled={loading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-11 text-base bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  ورود به پنل
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 pt-6 border-t border-border/60 text-center">
          <p className="text-xs text-muted-foreground">
            برای بازیابی رمز عبور با مدیر سیستم تماس بگیرید
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-svh flex items-center justify-center p-4 bg-carbon relative overflow-hidden">
      {/* Industrial hazard stripe accent */}
      <div className="absolute top-0 inset-x-0 h-2 bg-hazard opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-2 bg-hazard opacity-80" />
      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/4 size-72 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-72 bg-brand-700/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <Loader2 className="size-8 animate-spin text-brand-500" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
