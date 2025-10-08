"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "داشبورد", icon: "📊" },
  { href: "/admin/products", label: "محصولات", icon: "💎" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "📁" },
  { href: "/admin/attributes", label: "ویژگی‌ها", icon: "🏷️" },
  { href: "/admin/orders", label: "سفارشات", icon: "📦" },
  { href: "/admin/coupons", label: "کوپن‌ها", icon: "🎫" },
  { href: "/admin/settings", label: "تنظیمات", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block admin-sidebar rounded-2xl p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <div className="lux-h3 text-gold-gradient mb-2 text-lg lg:text-xl">پنل مدیریت</div>
        <div className="text-xs lg:text-sm text-foreground/60 font-medium">سیستم مدیریت گالری معصومی</div>
      </div>
      
      <nav className="space-y-2 lg:space-y-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href}
              className={`admin-nav-link flex items-center gap-2 lg:gap-3 text-sm lg:text-base ${isActive ? 'active' : ''}`} 
              href={link.href}
            >
              <span className="text-base lg:text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-8 lg:mt-12 pt-4 lg:pt-6 border-t border-white/10">
        <div className="text-xs text-foreground/40 text-center">
          گالری معصومی © 2024
        </div>
      </div>
    </aside>
  );
}