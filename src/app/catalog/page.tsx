import { fetchProducts } from "@/lib/server-data";
import CatalogCard from "@/components/catalog/CatalogCard";
import { Suspense } from "react";

// Disable caching to ensure fresh data on each request
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = (await searchParams) ?? {};
  const category = params.category;
  
  // Use the serverless-safe data fetching utility
  const products = await fetchProducts({
    category,
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    take: 60
  });

  return (
    <div className="container py-10" id="search">
      <h1 className="lux-h1 mb-6 text-gold-gradient">کاتالوگ</h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            هیچ محصولی یافت نشد
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            لطفاً بعداً دوباره امتحان کنید
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <CatalogCard 
              key={p.id} 
              p={{ 
                id: p.id, 
                slug: p.slug, 
                name: p.name, 
                images: p.images.map(im => ({ 
                  url: im.url, 
                  alt: im.alt || p.name 
                })), 
                categories: p.categories.map(c => ({ name: c.name })) 
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

