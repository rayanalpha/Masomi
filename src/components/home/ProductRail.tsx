"use client";

import Link from "next/link";

type Item = {
  slug: string;
  name: string;
  image: string;
};

export default function ProductRail({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="group relative mt-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="animate-rail flex gap-3 sm:gap-4 will-change-transform group-hover:[animation-play-state:paused]">
        {doubled.map((it, idx) => (
          <Link
            href={`/product/${it.slug}`}
            key={`${it.slug}-${idx}`}
            className="relative h-32 w-48 sm:h-40 sm:w-64 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant hover:shadow-elegant-lg hover:border-white/20 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur">
              {it.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
