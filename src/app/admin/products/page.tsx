import Link from "next/link";
import { withDatabaseRetry } from "@/lib/db-serverless";
import ProductList from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage() {
  let products: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    price: number | null;
    categories: Array<{ id: string; name: string }>;
  }> = [];
  
  try {
    // Use serverless-safe database operations
    products = await withDatabaseRetry(async (prisma) => {
      return await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { categories: true },
      });
    }, 3, 500);
  } catch (e) {
    console.error("ADMIN_PRODUCTS_DB_ERROR", e);
    // Continue with empty array if DB fails
  }

  return (
    <div className="space-y-8">
      <div className="admin-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="lux-h1 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">💎 مدیریت محصولات</h1>
          <p className="text-foreground/70 text-sm sm:text-lg font-medium">مدیریت و ویرایش محصولات فروشگاه</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn btn-admin-primary text-sm sm:text-base w-full sm:w-auto"
        >
          <span className="text-base sm:text-lg">➕</span>
          محصول جدید
        </Link>
      </div>

      <ProductList products={products} />
    </div>
  );
}

