import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({ 
      ok: true, 
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: (session.user as any)?.role
      } : null
    });
  } catch (e) {
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 });
  }
}