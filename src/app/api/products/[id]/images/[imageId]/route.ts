import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; imageId: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id, imageId } = await ctx.params;
  const img = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!img || img.productId !== id) return new NextResponse("Not Found", { status: 404 });
  await prisma.productImage.delete({ where: { id: imageId } });
  return new NextResponse(null, { status: 204 });
}
