import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    
    return NextResponse.json({ 
      ok: true, 
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: role,
        id: (session.user as any)?.id
      } : null,
      role: role,
      isValidRole: role === "ADMIN" || role === "MANAGER",
      shouldAllowAccess: !!(session && role && (role === "ADMIN" || role === "MANAGER"))
    });
  } catch (e) {
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    }, { status: 500 });
  }
}