import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.number().optional(),
  sku: z.string().optional(),
  categorySlug: z.string().optional(),
  imageUrl: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const perPage = Math.min(Number(searchParams.get("perPage") || 20), 100);
  const q = searchParams.get("q") || undefined;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { sku: { contains: q } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      include: { categories: true, images: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ items, page, perPage, total });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Optionally connect category
  let categoriesConnect: { id: string }[] = [];
  if (data.categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
    if (cat) categoriesConnect = [{ id: cat.id }];
  }

  const created = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      sku: data.sku,
      status: data.status ?? "DRAFT",
      visibility: data.visibility ?? "PUBLIC",
      stock: typeof data.stock === "number" ? data.stock : undefined,
      categories: categoriesConnect.length ? { connect: categoriesConnect } : undefined,
      images: data.imageUrl ? { create: [{ url: data.imageUrl, alt: data.name }] } : undefined,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

