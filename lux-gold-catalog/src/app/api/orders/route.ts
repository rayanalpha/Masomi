import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const createOrderSchema = z.object({
  number: z.string().min(3),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
  subtotal: z.number(),
  discount: z.number().optional(),
  shipping: z.number().optional(),
  tax: z.number().optional(),
  total: z.number(),
});

export async function GET() {
  const items = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const json = await req.json();
  const parsed = createOrderSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.order.create({
    data: {
      ...parsed.data,
      status: parsed.data.status ?? "PENDING",
      discount: parsed.data.discount ?? 0,
      shipping: parsed.data.shipping ?? 0,
      tax: parsed.data.tax ?? 0,
    },
  });
  return NextResponse.json(created, { status: 201 });
}

