import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100, "نام بسیار طولانی است"),
  phone: z
    .string()
    .min(6, "شماره تماس نامعتبر است")
    .max(20, "شماره تماس نامعتبر است")
    .regex(/^[0-9+\-\s]+$/, "شماره تماس فقط می‌تواند شامل اعداد باشد"),
  email: z
    .string()
    .email("ایمیل نامعتبر است")
    .optional()
    .or(z.literal("")),
  subject: z.string().max(200, "موضوع بسیار طولانی است").optional(),
  message: z
    .string()
    .min(1, "پیام الزامی است")
    .max(5000, "پیام بسیار طولانی است"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر",
      },
      { status: 400 }
    );
  }

  const { name, phone, email, subject, message } = parsed.data;

  try {
    await db.contactMessage.create({
      data: {
        name,
        phone,
        email: email && email.length > 0 ? email : null,
        subject: subject && subject.length > 0 ? subject : null,
        message,
      },
    });
    return NextResponse.json(
      { ok: true, message: "پیام شما با موفقیت ثبت شد" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create contact message error:", err);
    return NextResponse.json(
      { ok: false, error: "ثبت پیام با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
