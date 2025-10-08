import Link from "next/link";
import { withDatabaseRetry } from "@/lib/db-serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTypeLabel(type: string) {
  const typeMap: Record<string, { label: string; icon: string; className: string }> = {
    PERCENT: { label: 'درصدی', icon: '%', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    FIXED: { label: 'مبلغ ثابت', icon: '💰', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  };
  
  const config = typeMap[type] || { label: type, icon: '🎫', className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

function getStatusBadge(active: boolean, usedCount: number, maxUses: number | null) {
  if (!active) {
    return (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full border bg-red-500/20 text-red-300 border-red-500/30">
        غیرفعال
      </span>
    );
  }
  
  if (maxUses && usedCount >= maxUses) {
    return (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full border bg-orange-500/20 text-orange-300 border-orange-500/30">
        تمام شده
      </span>
    );
  }
  
  return (
    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full border bg-green-500/20 text-green-300 border-green-500/30">
      فعال
    </span>
  );
}

export default async function CouponsPage() {
  const coupons = await withDatabaseRetry(async (prisma) => {
    return await prisma.coupon.findMany({ 
      orderBy: { createdAt: "desc" }, 
      take: 100 
    });
  });

  if (coupons.length === 0) {
    return (
      <div className="space-y-6">
        <div className="admin-header-section rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
          <h1 className="lux-h2 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">🎫 کوپن‌ها</h1>
          <p className="text-foreground/60 text-sm sm:text-base">مدیریت کوپن‌های تخفیف</p>
        </div>
        
        <div className="admin-card p-6 sm:p-8 lg:p-12 text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎫</div>
          <h3 className="lux-h4 mb-2 text-lg sm:text-xl lg:text-2xl">هیچ کوپنی یافت نشد</h3>
          <p className="text-foreground/60 mb-4 sm:mb-6 text-sm sm:text-base">برای ایجاد تخفیف‌های ویژه، کوپن جدید اضافه کنید.</p>
          <Link href="/admin/coupons/new" className="btn-admin-primary text-sm sm:text-base w-full sm:w-auto">
            <span>➕</span> کوپن جدید
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="admin-header-section rounded-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="lux-h2 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">🎫 کوپن‌ها</h1>
            <p className="text-foreground/60 text-sm sm:text-base">مدیریت کوپن‌های تخفیف</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-white/10 w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-foreground/60">کل کوپن‌ها</div>
              <div className="text-lg sm:text-2xl font-bold text-gold-gradient">{coupons.length.toLocaleString('fa-IR')}</div>
            </div>
            <Link href="/admin/coupons/new" className="btn-admin-primary text-xs sm:text-sm w-full sm:w-auto">
              <span>➕</span> 
              <span className="hidden xs:inline">کوپن جدید</span>
              <span className="xs:hidden">جدید</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-table-container overflow-x-auto">
        <table className="admin-table text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4">کد کوپن</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">نوع تخفیف</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4">مقدار تخفیف</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">میزان استفاده</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">وضعیت</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="font-mono text-gold-gradient font-bold text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                    {coupon.code}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  {getTypeLabel(coupon.type)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="font-medium text-xs sm:text-sm">
                    {coupon.type === 'PERCENT' 
                      ? `${coupon.amount.toString()}%`
                      : `${parseInt(coupon.amount.toString()).toLocaleString('fa-IR')} تومان`
                    }
                    <div className="sm:hidden text-xs text-foreground/60 mt-1">
                      {getTypeLabel(coupon.type)}
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium">{coupon.usedCount.toLocaleString('fa-IR')} بار</div>
                    {coupon.maxUses && (
                      <div className="text-xs text-foreground/60">
                        از {coupon.maxUses.toLocaleString('fa-IR')} مجاز
                      </div>
                    )}
                    {!coupon.maxUses && (
                      <div className="text-xs text-foreground/60">بدون محدودیت</div>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  {getStatusBadge(coupon.active, coupon.usedCount, coupon.maxUses)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col gap-2">
                    <Link 
                      href={`/admin/coupons/${coupon.id}`} 
                      className="btn-admin-secondary text-xs px-2 sm:px-3 py-1 whitespace-nowrap"
                    >
                      <span className="sm:hidden">✏️</span>
                      <span className="hidden sm:inline">✏️ ویرایش</span>
                    </Link>
                    <div className="md:hidden">
                      {getStatusBadge(coupon.active, coupon.usedCount, coupon.maxUses)}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

