import Link from "next/link";
import { withDatabaseRetry } from "@/lib/db-serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesPage() {
  const cats = await withDatabaseRetry(async (prisma) => {
    return await prisma.category.findMany({ 
      orderBy: [{ parentId: "asc" }, { name: "asc" }] 
    });
  });
  return (
    <div className="space-y-8">
      <div className="admin-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="lux-h1 text-gold-gradient mb-2 text-xl sm:text-2xl lg:text-3xl">📁 مدیریت دسته‌بندی‌ها</h1>
          <p className="text-foreground/70 text-sm sm:text-base lg:text-lg font-medium">سازماندهی و مدیریت دسته‌بندی محصولات</p>
        </div>
        <Link href="/admin/categories/new" className="btn btn-admin-primary text-xs sm:text-sm w-full sm:w-auto">
          <span className="text-sm sm:text-lg">➕</span>
          <span className="hidden xs:inline">دسته جدید</span>
          <span className="xs:hidden">جدید</span>
        </Link>
      </div>
      
      <div className="admin-table overflow-x-auto rounded-2xl">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">نام دسته</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right hidden sm:table-cell">شناسه URL</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right hidden lg:table-cell">دسته والد</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right hidden md:table-cell">توضیحات</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-lg">📂</span>
                    <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{c.name}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <code className="text-xs bg-white/10 px-2 py-1 rounded text-foreground/60 truncate block max-w-[100px] lg:max-w-none">
                    {c.slug}
                  </code>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                  {c.parentId ? (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full truncate block max-w-[80px]">
                      {cats.find(x => x.id === c.parentId)?.name ?? "-"}
                    </span>
                  ) : (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                      دسته اصلی
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  <div className="text-foreground/60 text-xs sm:text-sm max-w-[100px] lg:max-w-xs truncate">
                    {c.description || 'بدون توضیحات'}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex gap-1 sm:gap-2 flex-col sm:flex-row">
                    <Link 
                      className="btn btn-admin-secondary px-2 sm:px-3 py-1 text-xs whitespace-nowrap" 
                      href={`/admin/categories/${c.id}`}
                    >
                      <span className="sm:hidden">✏️</span>
                      <span className="hidden sm:inline">✏️ ویرایش</span>
                    </Link>
                    <Link 
                      className="btn btn-outline px-2 sm:px-3 py-1 text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 whitespace-nowrap" 
                      href={`/catalog?category=${c.slug}`}
                      target="_blank"
                    >
                      <span className="sm:hidden">👁️</span>
                      <span className="hidden sm:inline">👁️ مشاهده</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-foreground/60">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📁</div>
                  <div className="text-base sm:text-lg font-medium mb-2">هیچ دسته‌بندی‌ای یافت نشد</div>
                  <div className="text-xs sm:text-sm">برای شروع اولین دسته‌بندی خود را ایجاد کنید</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

