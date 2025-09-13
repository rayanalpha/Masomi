import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const attachSchema = z.object({
  attributeId: z.string(),
  useForVariations: z.boolean().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      attributes: { include: { attribute: { include: { values: true } } } },
      attrValues: { include: { attributeValue: true } },
    },
  });
  if (!product) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(product);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = attachSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { attributeId, useForVariations } = parsed.data;

  const attached = await prisma.productAttribute.upsert({
    where: { productId_attributeId: { productId: id, attributeId } },
    update: { useForVariations: useForVariations ?? false },
    create: { productId: id, attributeId, useForVariations: useForVariations ?? false },
  });
  return NextResponse.json(attached, { status: 201 });
}

