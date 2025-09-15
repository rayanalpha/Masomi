import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const createVarSchema = z.object({
  sku: z.string().min(1).optional(),
  price: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  status: z.boolean().optional(),
  options: z.array(z.object({ attributeId: z.string(), attributeValueId: z.string() })).min(1),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const items = await prisma.variation.findMany({ where: { productId: id }, include: { options: { include: { attribute: true, attributeValue: true } } } });
  return NextResponse.json({ items });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = createVarSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { sku, price, salePrice, stock, status, options } = parsed.data;

  const created = await prisma.variation.create({
    data: {
      productId: id,
      sku,
      price: price ?? null,
      salePrice: salePrice ?? null,
      stock: stock ?? 0,
      status: status ?? true,
      options: { create: options.map(o => ({ attributeId: o.attributeId, attributeValueId: o.attributeValueId })) },
    },
  });

  return NextResponse.json(created, { status: 201 });
}

