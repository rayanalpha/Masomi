import Link from "next/link";
import { withDatabaseRetry } from "@/lib/db-serverless";

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { name: "asc" }] });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="lux-h2 text-gold-gradient">مدیریت دسته‌ها</h1>
        <Link href="/admin/categories/new" className="btn btn-gold text-sm">دسته جدید</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-3 py-2 text-right">نام</th>
              <th className="px-3 py-2 text-right">Slug</th>
              <th className="px-3 py-2 text-right">والد</th>
              <th className="px-3 py-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2 text-foreground/60">{c.slug}</td>
                <td className="px-3 py-2 text-zinc-400">{c.parentId ? cats.find(x => x.id === c.parentId)?.name ?? "-" : "-"}</td>
                <td className="px-3 py-2"><Link className="text-brand" href={`/admin/categories/${c.id}`}>ویرایش</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

