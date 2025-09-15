import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

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

