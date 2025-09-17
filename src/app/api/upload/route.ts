import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { saveImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

export async function POST(req: Request) {
  console.log('POST /api/upload called');
  
  // Check session
  const session = await getServerSession(authOptions);
  console.log('Session in upload API:', {
    hasSession: !!session,
    user: session?.user ? {
      email: session.user.email,
      role: (session.user as any).role
    } : null
  });
  
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    console.log('Upload authorization failed:', { hasSession: !!session, role });
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new NextResponse("Unsupported Media Type", { status: 415 });
  }

  const form = await req.formData();
  const file = form.get("file");
  console.log('File from form:', { 
    hasFile: !!file, 
    fileName: file instanceof File ? file.name : 'not file',
    fileType: file instanceof File ? file.type : 'not file'
  });
  
  if (!(file instanceof File)) return new NextResponse("No file", { status: 400 });

  if (!ALLOWED.has(file.type)) {
    console.log('Invalid file type:', file.type);
    return new NextResponse("Invalid mime", { status: 400 });
  }

  const base = (form.get("name")?.toString() || "upload").replace(/[^a-zA-Z0-9_-]/g, "_");
  console.log('Base name for file:', base);
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  console.log('File buffer size:', buffer.length);

  try {
    const { url, thumbUrl } = await saveImage({ buffer, baseName: base, contentType: file.type });
    console.log('File saved successfully:', { url, thumbUrl });
    return NextResponse.json({ url, thumbUrl }, { status: 201 });
  } catch (error) {
    console.error('Error saving file:', error);
    return new NextResponse("Save failed", { status: 500 });
  }
}

