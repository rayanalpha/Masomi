import { withDatabaseRetry } from "@/lib/db-serverless";
import Link from "next/link";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <h1 className="lux-h2 text-gold-gradient">سفارش‌ها</h1>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-3 py-2 text-right">شماره</th>
              <th className="px-3 py-2 text-right">مشتری</th>
              <th className="px-3 py-2 text-right">وضعیت</th>
              <th className="px-3 py-2 text-right">مجموع</th>
              <th className="px-3 py-2 text-right">تاریخ</th>
              <th className="px-3 py-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/10">
                <td className="px-3 py-2">{o.number}</td>
                <td className="px-3 py-2">{o.customerName} ({o.customerEmail})</td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2">{o.total.toString()}</td>
                <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString("fa-IR")}</td>
                <td className="px-3 py-2"><Link className="text-brand" href={`/admin/orders/${o.id}`}>جزییات</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

