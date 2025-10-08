"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="lg:hidden mb-4 sm:mb-6">
      <button type="button" onClick={() => setOpen(true)} className="btn btn-admin-secondary text-sm sm:text-base p-3 sm:p-4">
        <Menu size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden xs:inline">منوی مدیریت</span>
        <span className="xs:hidden">منو</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm admin-mobile-nav p-6 shadow-luxury-xl flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="lux-h3 text-gold-gradient mb-1">پنل مدیریت</div>
                <div className="text-xs text-foreground/60">گالری معصومی</div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="btn btn-admin-secondary p-2"
              >
                <X size={18} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2">
              {links.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`admin-nav-link flex items-center gap-3 ${isActive ? 'active' : ''}`}
                  >
                    <span className="text-lg">{l.icon}</span>
                    <span className="font-medium">{l.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <div className="text-xs text-foreground/40">
                گالری معصومی © 2024
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
