"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import ScrollProgressBar from "./ScrollProgressBar";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "خانه" },
  { href: "/catalog", label: "کاتالوگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export function Navbar() {
  const pathname = usePathname();


  return (
    <>
      <ScrollProgressBar />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container flex h-14 md:h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => (typeof window !== "undefined" && window.dispatchEvent(new CustomEvent("open-search")))} className="shimmer-border glow inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-white/25 transition">
              <Search size={16} />
              جستجو
            </button>
          </div>
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="گالری معصومی"
              width={180}
              height={40}
              priority
              className="h-8 md:h-10 w-auto object-contain transition-opacity hover:opacity-90"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn(
                  "hover-underline rounded-full px-3 py-1.5 text-sm transition-colors",
                  "text-foreground/70 hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}

