import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; attributeId: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id, attributeId } = await ctx.params;
  await prisma.productAttribute.delete({ where: { productId_attributeId: { productId: id, attributeId } } });
  return new NextResponse(null, { status: 204 });
}

