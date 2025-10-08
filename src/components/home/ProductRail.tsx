"use client";

import Link from "next/link";

type Item = {
  slug: string;
  name: string;
  image: string;
  price?: number | null;
  categories?: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  isSpecial?: boolean;
  isNew?: boolean;
};

const formatPrice = (price: number | null | undefined) => {
  if (!price) return 'قیمت: تماس بگیرید';
  return price.toLocaleString('fa-IR') + ' تومان';
};

const getCategoryDisplay = (categories?: Array<{ name: string }>) => {
  if (!categories || categories.length === 0) return 'عمومی';
  return categories[0].name; // نمایش اولین دسته‌بندی
};

export default function ProductRail({ items }: { items: Item[] }) {
  if (!items.length) return null;
  
  // برای انیمیشن بی‌نهایت، محصولات را سه بار تکرار می‌کنیم
  // که با CSS width: 300% و translateX(-33.333%) هماهنگ باشد
  const repeatedItems = [...items, ...items, ...items];
  
  return (
    <div className="group relative mt-16 overflow-hidden">
      {/* Enhanced fade effects */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />
      
      {/* Enhanced background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold-900)]/10 via-transparent to-[var(--gold-900)]/10 rounded-3xl blur-2xl" />
      
      <div className="animate-rail group-hover:[animation-play-state:paused] relative z-10">
        {repeatedItems.map((item, idx) => (
          <Link
            href={`/product/${item.slug}`}
            key={`${item.slug}-${idx}`}
            className="group/card relative h-28 w-44 sm:h-36 sm:w-56 md:h-48 md:w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--gold-500)]/20 bg-black/20 backdrop-blur-sm shadow-luxury hover:shadow-luxury-xl hover:border-[var(--gold-400)]/40 transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
            style={{ 
              transformOrigin: 'center',
              perspective: '1000px'
            }}
          >
            {/* 3D Transform Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-500)]/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-2xl" />
            
            {/* Enhanced image with parallax effect */}
            <div className="relative h-full w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.image} 
                alt={item.name} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
              />
              
              {/* Luxury overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            
            {/* Enhanced product info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              {/* Category badge */}
              <div className="mb-2 inline-block">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--gold-500)]/20 text-[var(--gold-300)] border border-[var(--gold-500)]/30">
                  {getCategoryDisplay(item.categories)}
                </span>
              </div>
              
              {/* Product name */}
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1 line-clamp-1 group-hover/card:text-[var(--gold-200)] transition-colors duration-300">
                {item.name}
              </h3>
              
              {/* Price */}
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-bold text-[var(--gold-300)] font-mono">
                  {formatPrice(item.price)}
                </p>
                
                {/* Special badge */}
                {item.isSpecial && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                    ویژه
                  </span>
                )}
                
                {/* New badge */}
                {item.isNew && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                    جدید
                  </span>
                )}
              </div>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold-500)]/20 via-[var(--gold-400)]/30 to-[var(--gold-500)]/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
            
            {/* Touch-friendly tap area */}
            <div className="absolute inset-0 rounded-2xl transition-colors duration-200 active:bg-white/5 md:active:bg-transparent" />
          </Link>
        ))}
      </div>
      
      {/* Enhanced mobile touch indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:hidden z-30">
        {[1, 2, 3].map((dot) => (
          <div key={dot} className={`w-2 h-2 rounded-full bg-[var(--gold-500)]/30`} />
        ))}
      </div>
    </div>
  );
}
