import Link from "next/link";
import { withDatabaseRetry } from "@/lib/db-serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'در انتظار', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    CONFIRMED: { label: 'تأیید شده', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    PROCESSING: { label: 'در حال پردازش', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    SHIPPED: { label: 'ارسال شده', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
    DELIVERED: { label: 'تحویل داده شده', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    CANCELLED: { label: 'لغو شده', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
  };
  
  const config = statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

export default async function OrdersPage() {
  const orders = await withDatabaseRetry(async (prisma) => {
    return await prisma.order.findMany({ 
      orderBy: { createdAt: "desc" }, 
      take: 100 
    });
  });

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="admin-header-section rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
          <h1 className="lux-h2 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">📦 سفارش‌ها</h1>
          <p className="text-foreground/60 text-sm sm:text-base">مدیریت و پیگیری سفارشات مشتریان</p>
        </div>
        
        <div className="admin-card p-6 sm:p-8 lg:p-12 text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
          <h3 className="lux-h4 mb-2 text-lg sm:text-xl lg:text-2xl">هیچ سفارشی یافت نشد</h3>
          <p className="text-foreground/60 mb-4 sm:mb-6 text-sm sm:text-base">هنوز سفارشی ثبت نشده است. زمانی که مشتریان سفارش دهند، آن‌ها اینجا نمایش داده خواهند شد.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="admin-header-section rounded-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="lux-h2 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">📦 سفارش‌ها</h1>
            <p className="text-foreground/60 text-sm sm:text-base">مدیریت و پیگیری سفارشات مشتریان</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-white/10 w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-foreground/60">کل سفارشات</div>
            <div className="text-lg sm:text-2xl font-bold text-gold-gradient">{orders.length.toLocaleString('fa-IR')}</div>
          </div>
        </div>
      </div>

      <div className="admin-table-container overflow-x-auto">
        <table className="admin-table text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4">شماره سفارش</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">مشتری</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">وضعیت</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4">مجموع</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">تاریخ ثبت</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="font-medium text-gold-gradient text-xs sm:text-sm">#{order.number}</div>
                  <div className="lg:hidden text-xs text-foreground/60 mt-1">
                    {order.customerName}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                  <div>
                    <div className="font-medium text-xs sm:text-sm truncate max-w-[150px]">{order.customerName}</div>
                    <div className="text-xs text-foreground/60 truncate max-w-[150px]">{order.customerEmail}</div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="font-medium text-xs sm:text-sm">
                    {parseInt(order.total.toString()).toLocaleString('fa-IR')} تومان
                  </div>
                  <div className="sm:hidden text-xs text-foreground/60 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <div className="text-xs sm:text-sm">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </div>
                  <div className="text-xs text-foreground/60">
                    {new Date(order.createdAt).toLocaleTimeString("fa-IR")}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex flex-col gap-2">
                    <Link 
                      href={`/admin/orders/${order.id}`} 
                      className="btn-admin-primary text-xs px-2 sm:px-3 py-1 whitespace-nowrap"
                    >
                      <span className="sm:hidden">📋</span>
                      <span className="hidden sm:inline">📋 جزییات</span>
                    </Link>
                    <div className="md:hidden">
                      {getStatusBadge(order.status)}
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

