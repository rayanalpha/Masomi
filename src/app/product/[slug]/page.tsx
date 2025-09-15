import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, include: { images: true, categories: true } });
  if (!p) return {};
  return {
    title: p.name,
    description: p.description ?? undefined,
    openGraph: {
      title: p.name,
      description: p.description ?? undefined,
      images: p.images[0]?.url ? [p.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ sort: "asc" }, { id: "asc" }] },
      categories: true,
      attributes: { include: { attribute: true } },
      attrValues: { include: { attributeValue: { include: { attribute: true } } } },
      variations: { include: { options: { include: { attribute: true, attributeValue: true } } } },
    },
  });
  if (!p) return notFound();

  // Compute availability
  const available = (p.stock ?? 0) > 0 || p.variations.some((v) => v.status && v.stock > 0);

  // Build attribute -> values map from attached attribute values
  const attrMap = new Map<string, { name: string; values: Set<string> }>();
  for (const pav of p.attrValues) {
    const av = pav.attributeValue;
    const attrName = av.attribute.name;
    const key = av.attribute.id;
    if (!attrMap.has(key)) attrMap.set(key, { name: attrName, values: new Set<string>() });
    attrMap.get(key)!.values.add(av.value);
  }
  // If no attached values, derive from variations options
  if (attrMap.size === 0 && p.variations.length) {
    for (const v of p.variations) {
      for (const opt of v.options) {
        const key = opt.attribute.id;
        if (!attrMap.has(key)) attrMap.set(key, { name: opt.attribute.name, values: new Set<string>() });
        attrMap.get(key)!.values.add(opt.attributeValue.value);
      }
    }
  }

  const categories = p.categories.map((c) => c.name);

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6">
          <ProductGallery images={p.images.map((im) => ({ url: im.url, alt: im.alt ?? p.name }))} />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h1 className="lux-h2 text-gold-gradient">{p.name}</h1>
            {categories.length ? (
              <div className="mt-1 text-sm text-foreground/70">دسته‌ها: {categories.join("، ")}</div>
            ) : null}
          </div>

          <section className="section-card p-4 text-sm">
            <h2 className="mb-3 font-semibold">مشخصات</h2>
            <ul className="space-y-2">
              {p.sku ? (
                <li>
                  کد محصول (SKU): <span className="text-foreground/90 ltr:inline-block">{p.sku}</span>
                </li>
              ) : null}
              {typeof p.price === "number" ? (
                <li>
                  قیمت پایه: <span className="text-foreground/90">{p.price}</span>
                </li>
              ) : null}
              {typeof p.salePrice === "number" ? (
                <li>
                  قیمت حراج: <span className="text-foreground/90">{p.salePrice}</span>
                </li>
              ) : null}
              <li>
                وضعیت: <span className="text-foreground/90">{available ? "موجود" : "ناموجود"}</span>
              </li>
              {typeof p.stock === "number" ? (
                <li>
                  موجودی: <span className="text-foreground/90">{p.stock}</span>
                </li>
              ) : null}
              {[...attrMap.values()].map((a) => (
                <li key={a.name}>
                  {a.name}: <span className="text-foreground/90">{[...a.values].join("، ")}</span>
                </li>
              ))}
            </ul>
          </section>

          {p.description ? (
            <section className="section-card p-4 text-sm">
              <h2 className="mb-3 font-semibold">توضیحات</h2>
              <p className="leading-7 whitespace-pre-wrap text-foreground/90">{p.description}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

