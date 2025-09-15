import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const updateCouponSchema = z.object({
  code: z.string().min(2).optional(),
  type: z.enum(["PERCENT", "FIXED"]).optional(),
  amount: z.number().min(0).optional(),
  minSubtotal: z.number().nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  active: z.boolean().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(coupon);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = updateCouponSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = {
    ...parsed.data,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
  };

  const updated = await prisma.coupon.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.coupon.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

