import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminMobileNav from "./AdminMobileNav";

export const dynamic = "force-dynamic";

function MobileAdminNavMount() {
  return (
    <div className="lg:hidden mb-4">
      <AdminMobileNav />
    </div>
  );
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-[260px_1fr]">
      {/* Mobile admin drawer trigger */}
      <div className="p-4 lg:hidden" />
      <aside className="hidden lg:block border-l border-white/10 bg-white/[0.02] p-4">
        <div className="lux-h3 text-gold-gradient mb-4">مدیریت</div>
        <nav className="space-y-2 text-sm">
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin">داشبورد</Link>
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin/products">محصولات</Link>
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin/categories">دسته‌ها</Link>
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin/attributes">ویژگی‌ها</Link>
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin/orders">سفارش‌ها</Link>
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin/coupons">کوپن‌ها</Link>
          <Link className="block hover:text-foreground/100 text-foreground/80 hover-underline" href="/admin/settings">تنظیمات</Link>
        </nav>
      </aside>
      <main className="p-4 lg:p-6">
        <MobileAdminNavMount />
        {children}
      </main>
    </div>
  );
}

