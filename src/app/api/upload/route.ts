import { NextResponse } from "next/server";
import { saveImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const base = (form.get("name")?.toString() || "upload").replace(/[^a-zA-Z0-9_-]/g, "_");
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { url, thumbUrl } = await saveImage({ buffer, baseName: base, contentType: file.type });

  return NextResponse.json({ url, thumbUrl }, { status: 201 });
}

