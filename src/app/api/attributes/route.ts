import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

export async function GET() {
  const items = await prisma.attribute.findMany({
    orderBy: { name: "asc" },
    include: { values: true },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
    }
  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const created = await prisma.attribute.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}

