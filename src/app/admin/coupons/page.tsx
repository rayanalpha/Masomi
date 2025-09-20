import { withDatabaseRetry } from "@/lib/db-serverless";
`nexport const dynamic = "force-dynamic";`nexport const revalidate = 0;`nimport Link from "next/link";
`nexport const dynamic = "force-dynamic";`nexport const revalidate = 0;`n
export default async function CouponsPage() {
  const coupons = await withDatabaseRetry(async (prisma) => await prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 100 }));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="lux-h2 text-gold-gradient">کوپن‌ها</h1>
        <Link href="/admin/coupons/new" className="btn btn-gold text-sm">کوپن جدید</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-3 py-2 text-right">کد</th>
              <th className="px-3 py-2 text-right">نوع</th>
              <th className="px-3 py-2 text-right">مقدار</th>
              <th className="px-3 py-2 text-right">استفاده شده</th>
              <th className="px-3 py-2 text-right">وضعیت</th>
              <th className="px-3 py-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="px-3 py-2">{c.code}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">{c.amount.toString()}</td>
                <td className="px-3 py-2">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                <td className="px-3 py-2">{c.active ? "فعال" : "غیرفعال"}</td>
                <td className="px-3 py-2"><Link className="text-brand" href={`/admin/coupons/${c.id}`}>ویرایش</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

