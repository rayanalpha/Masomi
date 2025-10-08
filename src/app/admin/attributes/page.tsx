import Link from "next/link";
import { withDatabaseRetry } from "@/lib/db-serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AttributesPage() {
  const attrs = await withDatabaseRetry(async (prisma) => {
    return await prisma.attribute.findMany({ 
      include: { _count: { select: { values: true } } }, 
      orderBy: { name: "asc" } 
    });
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="lux-h2 text-gold-gradient text-xl sm:text-2xl lg:text-3xl">مدیریت ویژگی‌ها</h1>
        <Link href="/admin/attributes/new" className="btn btn-gold text-xs sm:text-sm w-full sm:w-auto">
          <span className="hidden xs:inline">ویژگی جدید</span>
          <span className="xs:hidden">جدید</span>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-white/5 text-foreground/70">
            <tr>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right">نام</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right hidden sm:table-cell">Slug</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right hidden md:table-cell">تعداد مقادیر</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {attrs.map((a) => (
              <tr key={a.id} className="border-t border-white/10">
                <td className="px-2 sm:px-3 py-2 sm:py-3">
                  <div className="font-medium">{a.name}</div>
                  <div className="sm:hidden text-xs text-foreground/60 mt-1">{a.slug}</div>
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-foreground/60 hidden sm:table-cell truncate max-w-[100px] lg:max-w-none">{a.slug}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 hidden md:table-cell">{(a as any)._count.values}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3">
                  <div className="flex flex-col gap-1">
                    <Link className="text-brand text-xs sm:text-sm" href={`/admin/attributes/${a.id}`}>
                      <span className="sm:hidden">مدیریت</span>
                      <span className="hidden sm:inline">مدیریت</span>
                    </Link>
                    <div className="md:hidden text-xs text-foreground/60">
                      {(a as any)._count.values} مقدار
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {attrs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-foreground/60">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏷️</div>
                  <div className="text-base sm:text-lg font-medium mb-2">هیچ ویژگی‌ای یافت نشد</div>
                  <div className="text-xs sm:text-sm">برای شروع اولین ویژگی خود را ایجاد کنید</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

