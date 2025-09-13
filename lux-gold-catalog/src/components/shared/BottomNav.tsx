"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2X2, Search, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  function openSearch() { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-search")); }
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 block md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <nav className="glass glow mx-auto mb-2 w-[min(620px,94%)] rounded-2xl border border-white/10 px-4 py-2">
        <ul className="flex items-center justify-between text-xs">
          <li>
            <Link href="/" className={`flex flex-col items-center gap-1 px-3 py-1 ${pathname === "/" ? "text-foreground" : "text-foreground/70"}`}>
              <Home size={18} />
              خانه
            </Link>
          </li>
          <li>
            <Link href="/catalog" className={`flex flex-col items-center gap-1 px-3 py-1 ${pathname?.startsWith("/catalog") ? "text-foreground" : "text-foreground/70"}`}>
              <Grid2X2 size={18} />
              کاتالوگ
            </Link>
          </li>
          <li>
            <button onClick={openSearch} className="flex flex-col items-center gap-1 px-3 py-1 text-foreground/70">
              <Search size={18} />
              جستجو
            </button>
          </li>
          <li>
            <Link href="/about" className={`flex flex-col items-center gap-1 px-3 py-1 ${pathname?.startsWith("/about") ? "text-foreground" : "text-foreground/70"}`}>
              <User size={18} />
              درباره
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
