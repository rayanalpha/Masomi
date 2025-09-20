import { withDatabaseRetry } from "@/lib/db-serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  let productCount = 0;
  let categoryCount = 0;
  let orderCount = 0;

  try {
    // Use serverless-safe database operations
    const counts = await withDatabaseRetry(async (prisma) => {
      const [products, categories, orders] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.order.count(),
      ]);
      return { products, categories, orders };
    }, 3, 500);
    
    productCount = counts.products;
    categoryCount = counts.categories;
    orderCount = counts.orders;
  } catch (e) {
    console.error("ADMIN_DASHBOARD_DB_ERROR", e);
    // Continue with zeros if DB fails
  }

  return (
    <div className="space-y-6">
      <h1 className="lux-h2 text-gold-gradient">داشبورد</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat title="تعداد محصولات" value={productCount} />
        <Stat title="تعداد دسته‌ها" value={categoryCount} />
        <Stat title="تعداد سفارش‌ها" value={orderCount} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="section-card p-4">
      <div className="lux-eyebrow">{title}</div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
    </div>
  );
}

