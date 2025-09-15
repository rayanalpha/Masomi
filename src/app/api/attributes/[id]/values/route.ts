import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const valueSchema = z.object({
  value: z.string().min(1),
  slug: z.string().min(1),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const contentType = req.headers.get("content-type") || "";
  let data: any;
  if (contentType.includes("application/json")) {
    data = await req.json();
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    data = { value: form.get("value"), slug: form.get("slug") };
  } else {
    return new NextResponse("Unsupported Media Type", { status: 415 });
  }
  const parsed = valueSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.attributeValue.create({ data: { attributeId: id, ...parsed.data } });
  return NextResponse.json(created, { status: 201 });
}

