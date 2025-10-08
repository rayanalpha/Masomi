import { withDatabaseRetry } from "@/lib/db-serverless";
import Link from "next/link";

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
    <div className="space-y-6 sm:space-y-8">
      <div className="admin-header">
        <h1 className="lux-h1 text-gold-gradient mb-2 text-2xl sm:text-3xl lg:text-4xl">داشبورد مدیریت</h1>
        <p className="text-foreground/70 text-base sm:text-lg font-medium">خلاصه‌ای از وضعیت فروشگاه شما</p>
      </div>
      
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Stat title="تعداد محصولات" value={productCount} icon="💎" color="from-emerald-400 to-emerald-600" />
        <Stat title="دسته‌بندی‌ها" value={categoryCount} icon="📁" color="from-blue-400 to-blue-600" />
        <Stat title="سفارشات" value={orderCount} icon="📦" color="from-purple-400 to-purple-600" />
      </div>
      
      <QuickActions />
    </div>
  );
}

function Stat({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="admin-card p-4 sm:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="lux-eyebrow text-foreground/60 text-sm sm:text-base">{title}</div>
        <div className={`text-xl sm:text-2xl p-2 rounded-xl bg-gradient-to-r ${color} bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <div className="admin-stat-value text-2xl sm:text-3xl">{value.toLocaleString('fa-IR')}</div>
      <div className="mt-2 text-xs sm:text-sm text-emerald-400 font-medium">
        ↗ +12% نسبت به ماه قبل
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="admin-card p-4 sm:p-6">
      <h3 className="lux-h3 text-gold-gradient mb-4 text-lg sm:text-xl">عملیات سریع</h3>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/products/new" className="btn btn-admin-primary text-sm sm:text-base p-3 sm:p-4">
          <span className="text-base sm:text-lg">➕</span>
          <span className="hidden sm:inline">محصول جدید</span>
          <span className="sm:hidden">محصول</span>
        </Link>
        <Link href="/admin/categories/new" className="btn btn-admin-secondary text-sm sm:text-base p-3 sm:p-4">
          <span className="text-base sm:text-lg">📁</span>
          <span className="hidden sm:inline">دسته جدید</span>
          <span className="sm:hidden">دسته</span>
        </Link>
        <Link href="/admin/coupons/new" className="btn btn-admin-secondary text-sm sm:text-base p-3 sm:p-4">
          <span className="text-base sm:text-lg">🎫</span>
          <span className="hidden sm:inline">کوپن جدید</span>
          <span className="sm:hidden">کوپن</span>
        </Link>
        <Link href="/admin/settings" className="btn btn-admin-secondary text-sm sm:text-base p-3 sm:p-4">
          <span className="text-base sm:text-lg">⚙️</span>
          <span className="hidden sm:inline">تنظیمات</span>
          <span className="sm:hidden">تنظیم</span>
        </Link>
      </div>
    </div>
  );
}