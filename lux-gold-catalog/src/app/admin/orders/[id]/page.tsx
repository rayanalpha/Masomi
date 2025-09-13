import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true, variation: true } } } });
  if (!order) return <div>سفارش یافت نشد.</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="lux-h2 text-gold-gradient">سفارش #{order.number}</h1>
        <Link className="hover-underline" href="/admin/orders">بازگشت</Link>
      </div>
      <div className="section-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div><span className="text-zinc-400">وضعیت:</span> {order.status}</div>
          <div><span className="text-zinc-400">مشتری:</span> {order.customerName} ({order.customerEmail})</div>
          <div><span className="text-zinc-400">جمع کل:</span> {order.total.toString()}</div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-3 py-2 text-right">محصول</th>
              <th className="px-3 py-2 text-right">تنوع</th>
              <th className="px-3 py-2 text-right">تعداد</th>
              <th className="px-3 py-2 text-right">قیمت واحد</th>
              <th className="px-3 py-2 text-right">مبلغ</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t border-white/10">
                <td className="px-3 py-2">{it.product.name}</td>
                <td className="px-3 py-2 text-zinc-400">{it.variation?.sku ?? "-"}</td>
                <td className="px-3 py-2">{it.quantity}</td>
                <td className="px-3 py-2">{it.unitPrice.toString()}</td>
                <td className="px-3 py-2">{it.total.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

