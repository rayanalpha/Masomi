"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/categories", label: "دسته‌ها" },
  { href: "/admin/attributes", label: "ویژگی‌ها" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/coupons", label: "کوپن‌ها" },
  { href: "/admin/settings", label: "تنظیمات" },
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
    <div className="lg:hidden mb-4">
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline">
        <Menu size={18} />
        منوی مدیریت
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[80%] max-w-80 section-card p-4 shadow-elegant flex flex-col">
            <div className="flex items-center justify-between">
              <div className="lux-h3 text-gold-gradient">مدیریت</div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/15 p-1 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <nav className="mt-4 space-y-1 text-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block rounded-lg px-3 py-2 hover:bg-white/5 ${pathname === l.href ? "text-foreground" : "text-foreground/80"}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
