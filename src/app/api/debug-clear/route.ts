import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  const response = NextResponse.json({ 
    message: "All cookies cleared",
    clearedCookies: allCookies.map(c => c.name)
  });
  
  // Clear all cookies
  allCookies.forEach(cookie => {
    response.cookies.delete(cookie.name);
  });
  
  return response;
}