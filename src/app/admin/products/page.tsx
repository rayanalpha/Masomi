import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { categories: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="lux-h2 text-gold-gradient">مدیریت محصولات</h1>
        <Link
          href="/admin/products/new"
          className="btn btn-gold text-sm"
        >
          محصول جدید
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-3 py-2 text-right">نام</th>
              <th className="px-3 py-2 text-right">شناسه</th>
              <th className="px-3 py-2 text-right">وضعیت</th>
              <th className="px-3 py-2 text-right">قیمت</th>
              <th className="px-3 py-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2 text-foreground/60">{p.slug}</td>
                <td className="px-3 py-2">{p.status}</td>
                <td className="px-3 py-2">{p.price ?? "-"}</td>
                <td className="px-3 py-2">
                  <Link className="hover-underline" href={`/admin/products/${p.id}`}>ویرایش</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

