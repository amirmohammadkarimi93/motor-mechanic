import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Allowed image mime types
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Map mime-type to file extension (saves normalized extension)
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function sanitizeFilename(name: string): string {
  // Keep base name without special chars/spaces
  const base = name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[^\w\-]+/g, "-") // keep word chars and dashes
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "image";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const alt = formData.get("alt");
  const title = formData.get("title");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "فایلی ارسال نشده است" },
      { status: 400 }
    );
  }

  // Validate mime-type from the File object (browser-supplied) and check magic bytes via sharp
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "فقط تصویر قابل آپلود است" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "حجم فایل نباید بیش از ۱۰ مگابایت باشد" },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "فایل خالی است" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Use sharp to read true image metadata (also validates that this is a real image)
  let width: number | null = null;
  let height: number | null = null;
  let detectedFormat: string | null = null;
  try {
    const meta = await sharp(buffer).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
    detectedFormat = meta.format ?? null;
  } catch (err) {
    console.error("sharp metadata error:", err);
    return NextResponse.json(
      { error: "فقط تصویر قابل آپلود است" },
      { status: 400 }
    );
  }

  // Decide extension: prefer detected format, fallback to original
  const ext =
    (detectedFormat && MIME_EXT[`image/${detectedFormat}`]) ||
    MIME_EXT[file.type] ||
    "bin";

  const safeBase = sanitizeFilename(file.name);
  const uniqueId = crypto.randomUUID();
  const shortId = uniqueId.split("-")[0]; // first segment for readable name
  const timestamp = Date.now();
  const filename = `${timestamp}-${shortId}-${safeBase}.${ext}`;
  const relativeDir = "uploads";
  const uploadDir = path.join(process.cwd(), "public", relativeDir);

  try {
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("File write error:", err);
    return NextResponse.json(
      { error: "ذخیره فایل با خطا مواجه شد" },
      { status: 500 }
    );
  }

  const url = `/uploads/${filename}`;
  const mimeType = detectedFormat ? `image/${detectedFormat}` : file.type;

  try {
    const media = await db.media.create({
      data: {
        filename,
        url,
        alt: (alt as string | null)?.toString() || null,
        title: (title as string | null)?.toString() || null,
        mimeType,
        size: file.size,
        width,
        height,
        uploadedById: session.id,
      },
    });

    return NextResponse.json(
      {
        id: media.id,
        url: media.url,
        filename: media.filename,
        alt: media.alt,
        title: media.title,
        width: media.width,
        height: media.height,
        size: media.size,
        mimeType: media.mimeType,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("DB insert media error:", err);
    // Best-effort cleanup of file we wrote but failed to record
    try {
      const { unlink } = await import("fs/promises");
      await unlink(path.join(uploadDir, filename));
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: "ثبت رسانه با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
