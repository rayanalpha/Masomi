"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function FilterLink({ param, value, label }: { param: string; value: string; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = new URLSearchParams(searchParams?.toString?.() ?? "");
  qs.set(param, value);
  const href = `${pathname}?${qs.toString()}`;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-white/25 transition-colors"
    >
      {label}
    </Link>
  );
}

