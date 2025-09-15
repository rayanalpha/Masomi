import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBS_DIR = path.join(UPLOAD_DIR, "_thumbs");
const BUCKET = "uploads";

function isSupabaseEnabled() {
  return (
    typeof process.env.SUPABASE_URL === "string" &&
    process.env.SUPABASE_URL.length > 0 &&
    typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0
  );
}

function sanitizeBaseName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extFromContentType(ct: string) {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return map[ct] || "bin";
}

export async function saveImage(params: { buffer: Buffer; baseName: string; contentType: string }): Promise<{ url: string; thumbUrl: string }> {
  const base = sanitizeBaseName(params.baseName || "upload");
  const ext = extFromContentType(params.contentType);
  const filename = `${Date.now()}_${base}.${ext}`;

  // Create thumbnail 400x400 (cover)
  let thumbBuffer: Buffer | null = null;
  try {
    thumbBuffer = await sharp(params.buffer).resize(400, 400, { fit: "cover" }).toBuffer();
  } catch (e) {
    thumbBuffer = null;
  }

  if (isSupabaseEnabled()) {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });

    // Upload original
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(filename, params.buffer, {
      contentType: params.contentType,
      upsert: true,
      cacheControl: "31536000",
    });
    if (upErr) throw upErr;

    // Upload thumb (if generated)
    if (thumbBuffer) {
      const { error: thErr } = await supabase.storage.from(BUCKET).upload(`_thumbs/${filename}`, thumbBuffer, {
        contentType: params.contentType,
        upsert: true,
        cacheControl: "31536000",
      });
      if (thErr) throw thErr;
    }

    // Return proxied URLs (served via Next route /uploads)
    return {
      url: `/uploads/${filename}`,
      thumbUrl: `/uploads/_thumbs/${filename}`,
    };
  }

  // Local filesystem fallback (development)
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(THUMBS_DIR, { recursive: true });

  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, params.buffer);

  if (thumbBuffer) {
    const thumbPath = path.join(THUMBS_DIR, filename);
    await fs.writeFile(thumbPath, thumbBuffer);
  }

  return {
    url: `/uploads/${filename}`,
    thumbUrl: `/uploads/_thumbs/${filename}`,
  };
}
