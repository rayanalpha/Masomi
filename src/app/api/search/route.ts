import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ items: [] });

  const products = await prisma.product.findMany({
    where: {
      AND: [
        { status: "PUBLISHED" },
        { visibility: "PUBLIC" },
        { OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { categories: { some: { name: { contains: q } } } },
        ]}
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { images: { orderBy: [{ sort: "asc" }, { id: "asc" }] } },
  });

  const items = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.images[0]?.url?.startsWith("/uploads/") ? p.images[0].url.replace("/uploads/", "/uploads/_thumbs/") : (p.images[0]?.url || "/file.svg"),
  }));
  return NextResponse.json({ items });
}
