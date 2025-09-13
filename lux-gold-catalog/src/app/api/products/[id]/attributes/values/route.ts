import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const attachValueSchema = z.object({
  attributeValueId: z.string(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = attachValueSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const attached = await prisma.productAttrValue.upsert({
    where: { productId_attributeValueId: { productId: id, attributeValueId: parsed.data.attributeValueId } },
    update: {},
    create: { productId: id, attributeValueId: parsed.data.attributeValueId },
  });
  return NextResponse.json(attached, { status: 201 });
}

