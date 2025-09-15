import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// This route proxies uploads from Supabase Storage to serve under /uploads/* in production (Netlify Functions)
// In development, it will read local files from /public/uploads if Supabase is not configured.

function isSupabaseEnabled() {
  return (
    typeof process.env.SUPABASE_URL === "string" &&
    process.env.SUPABASE_URL.length > 0 &&
    typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0
  );
}

function guessContentType(key: string) {
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".avif")) return "image/avif";
  if (key.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segs } = await ctx.params;
  const key = segs.join("/");

  if (!isSupabaseEnabled()) {
    // Serve from local filesystem (development)
    const filePath = path.join(process.cwd(), "public", "uploads", key);
    try {
      const data = await fs.readFile(filePath);
      const ct = guessContentType(key);
      const blob = new Blob([data], { type: ct });
      return new NextResponse(blob, { headers: { "content-type": ct, "cache-control": "public, max-age=60" } });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.storage.from("uploads").download(key);
  if (error || !data) return new NextResponse("Not found", { status: 404 });
  const arr = await data.arrayBuffer();
  const ct = guessContentType(key);
  return new NextResponse(arr, { headers: { "content-type": ct, "cache-control": "public, max-age=31536000, immutable" } });
}
