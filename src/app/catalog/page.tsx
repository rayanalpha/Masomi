import prisma from "@/lib/prisma";
import CatalogCard from "@/components/catalog/CatalogCard";

export const dynamic = "force-dynamic";

export default async function CatalogPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = (await searchParams) ?? {};
  const category = params.category;
  
  let products = [];
  try {
    const where = {
      status: "PUBLISHED" as const,
      visibility: "PUBLIC" as const,
      ...(category ? { categories: { some: { slug: category } } } : {}),
    };
    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: [{ sort: "asc" }, { id: "asc" }] }, categories: true },
      take: 60,
    });
  } catch (e) {
    console.error("CATALOG_DB_ERROR", e);
    // Continue with empty array if DB fails
  }

  return (
    <div className="container py-10" id="search">
      <h1 className="lux-h1 mb-6 text-gold-gradient">کاتالوگ</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <CatalogCard key={p.id} p={{ id: p.id, slug: p.slug, name: p.name, images: p.images.map(im => ({ url: im.url, alt: im.alt })), categories: p.categories.map(c => ({ name: c.name })) }} />
        ))}
      </div>
    </div>
  );
}

