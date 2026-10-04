"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Loader2, Phone, Mail, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  phone: z
    .string()
    .min(10, "شماره تماس معتبر نیست")
    .regex(/^[0-9+\s-]+$/, "فقط عدد و علامت‌های مجاز"),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  subject: z.string().optional(),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "ارسال پیام ناموفق بود");
      }
      toast.success("پیام شما با موفقیت ارسال شد!", {
        description: "به‌زودی با شما تماس خواهیم گرفت.",
      });
      form.reset();
    } catch (e) {
      toast.error("خطا در ارسال پیام", {
        description: e instanceof Error ? e.message : "لطفاً دوباره تلاش کنید",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 bg-card border border-border rounded-xl shadow-sm p-5 md:p-7"
      >
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
            فرم تماس
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            برای دریافت مشاوره یا نوبت تعمیر، فرم زیر را تکمیل کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  نام و نام خانوادگی *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="مثال: علی رضایی"
                      className="pr-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  شماره تماس *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="0915xxxxxxx"
                      className="pr-10"
                      dir="ltr"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">ایمیل</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="email@example.com"
                      className="pr-10"
                      dir="ltr"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">موضوع</FormLabel>
                <FormControl>
                  <Input placeholder="موضوع پیام" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">پیام *</FormLabel>
              <FormControl>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                  <Textarea
                    placeholder="متن پیام شما..."
                    className="pr-10 min-h-[140px]"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-600/30"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              در حال ارسال...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 ml-2" />
              ارسال پیام
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
