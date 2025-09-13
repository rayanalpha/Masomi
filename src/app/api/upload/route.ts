import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBS_DIR = path.join(UPLOAD_DIR, "_thumbs");
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new NextResponse("Unsupported Media Type", { status: 415 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return new NextResponse("No file", { status: 400 });

  if (!ALLOWED.has(file.type)) {
    return new NextResponse("Invalid mime", { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMBS_DIR, { recursive: true });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.type.split("/")[1] || "bin";
  const base = (form.get("name")?.toString() || "upload").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${Date.now()}_${base}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);

  // Create thumbnail 400x400 cover
  const thumbPath = path.join(THUMBS_DIR, filename);
  try {
    await sharp(buffer).resize(400, 400, { fit: "cover" }).toFile(thumbPath);
  } catch (e) {
    // If thumbnail generation fails, continue with original
  }

  const url = `/uploads/${filename}`;
  const thumbUrl = `/uploads/_thumbs/${filename}`;
  return NextResponse.json({ url, thumbUrl }, { status: 201 });
}

