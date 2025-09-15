import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null) as { ids?: string[] } | null;
  if (!body?.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }
  // Verify all images belong to the product
  const imgs = await prisma.productImage.findMany({ where: { id: { in: body.ids } } });
  if (imgs.length !== body.ids.length || imgs.some((im) => im.productId !== id)) {
    return new NextResponse("Invalid images", { status: 400 });
  }
  // Update sort in order
  await prisma.$transaction(
    body.ids.map((imgId, idx) =>
      prisma.productImage.update({ where: { id: imgId }, data: { sort: idx } })
    )
  );
  return new NextResponse(null, { status: 204 });
}
