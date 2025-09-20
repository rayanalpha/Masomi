import { NextResponse } from "next/server";
import { withDatabaseRetry } from "@/lib/db-serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ok = await withDatabaseRetry(async (prisma) => {
      const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
      return Array.isArray(rows) && rows[0]?.ok === 1;
    }, 3, 200);

    return NextResponse.json(
      { ok },
      { status: ok ? 200 : 500, headers: { "cache-control": "no-store" } }
    );
  } catch (e: any) {
    // Provide minimal diagnostics in development without leaking secrets
    if (process.env.NODE_ENV === "development") {
      console.error("[Health] DB check failed:", e?.code || "", e?.message || e);
    }
    return NextResponse.json({ ok: false }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
