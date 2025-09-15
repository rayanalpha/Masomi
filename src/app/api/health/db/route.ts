import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    const ok = Array.isArray(rows) && rows[0]?.ok === 1;
    return NextResponse.json({ ok }, { status: ok ? 200 : 500, headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
