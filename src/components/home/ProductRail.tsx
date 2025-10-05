"use client";

import Link from "next/link";

type Item = {
  slug: string;
  name: string;
  image: string;
};

export default function ProductRail({ items }: { items: Item[] }) {
  if (!items.length) return null;
  
  // برای انیمیشن بی‌نهایت، محصولات را دو بار تکرار می‌کنیم
  const doubledItems = [...items, ...items];
  
  return (
    <div className="group relative mt-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-24 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="animate-rail group-hover:[animation-play-state:paused]">
        {doubledItems.map((item, idx) => (
          <Link
            href={`/product/${item.slug}`}
            key={`${item.slug}-${idx}`}
            className="relative h-32 w-48 sm:h-40 sm:w-64 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-elegant hover:shadow-elegant-lg hover:border-white/20 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur">
              {item.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
