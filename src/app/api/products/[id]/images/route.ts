import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const createImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const images = await prisma.productImage.findMany({ where: { productId: id }, orderBy: [{ sort: "asc" }, { id: "asc" }] });
  return NextResponse.json({ items: images });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = createImageSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const last = await prisma.productImage.findFirst({ where: { productId: id }, orderBy: { sort: "desc" } });
  const nextSort = (last?.sort ?? -1) + 1;

  const created = await prisma.productImage.create({
    data: { productId: id, url: parsed.data.url, alt: parsed.data.alt ?? null, sort: nextSort },
  });
  return NextResponse.json(created, { status: 201 });
}

