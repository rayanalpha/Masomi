import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(cat);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;

  let data: any;
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await req.json();
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    if (form.get("_method") && String(form.get("_method")).toUpperCase() !== "PATCH") {
      return new NextResponse("Method Not Allowed", { status: 405 });
    }
    data = {
      name: form.get("name") || undefined,
      slug: form.get("slug") || undefined,
      parentId: form.get("parentId") ? String(form.get("parentId")) : null,
    };
  } else {
    return new NextResponse("Unsupported Media Type", { status: 415 });
  }

  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const updated = await prisma.category.update({ where: { id }, data: parsed.data });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

