import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const createCouponSchema = z.object({
  code: z.string().min(2),
  type: z.enum(["PERCENT", "FIXED"]),
  amount: z.number().min(0),
  minSubtotal: z.number().nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const items = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const json = await req.json();
  const parsed = createCouponSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      amount: parsed.data.amount,
      minSubtotal: parsed.data.minSubtotal ?? null,
      maxUses: parsed.data.maxUses ?? null,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      active: parsed.data.active ?? true,
    },
  });
  return NextResponse.json(created, { status: 201 });
}

