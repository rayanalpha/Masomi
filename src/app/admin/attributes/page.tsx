import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AttributesPage() {
  const attrs = await prisma.attribute.findMany({ include: { _count: { select: { values: true } } }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="lux-h2 text-gold-gradient">مدیریت ویژگی‌ها</h1>
        <Link href="/admin/attributes/new" className="btn btn-gold text-sm">ویژگی جدید</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-3 py-2 text-right">نام</th>
              <th className="px-3 py-2 text-right">Slug</th>
              <th className="px-3 py-2 text-right">تعداد مقادیر</th>
              <th className="px-3 py-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {attrs.map((a) => (
              <tr key={a.id} className="border-t border-white/10">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2 text-foreground/60">{a.slug}</td>
                <td className="px-3 py-2">{(a as any)._count.values}</td>
                <td className="px-3 py-2"><Link className="text-brand" href={`/admin/attributes/${a.id}`}>مدیریت</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

