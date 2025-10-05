"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TiltCard from "@/components/ui/TiltCard";
import SmartImage from "@/components/shared/SmartImage";

export default function CatalogCard({ p }: { p: { id: string; slug: string; name: string; images: { url: string; alt: string | null }[]; categories: { name: string }[] } }) {
  const img = p.images[0]?.url ?? "/file.svg";
  // استفاده از thumbnail اگر وجود داشته باشد، در غیر این صورت از تصویر اصلی
  const thumb = img.startsWith("/uploads/") 
    ? img.replace("/uploads/", "/uploads/_thumbs/").replace(/\.[^.]+$/, ".webp")
    : img;
  const cats = p.categories.map((c) => c.name);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
      <TiltCard className="glow sheen-on-hover">
        <Link href={`/product/${p.slug}`} className="group relative block overflow-hidden rounded-2xl border-gold shadow-elegant hover:shadow-elegant-lg transition-shadow">
          <SmartImage 
            src={thumb} 
            alt={p.name} 
            className="h-44 sm:h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackSrc={img}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-70" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            {cats.length ? (
              <div className="mb-2 flex flex-wrap gap-1">
                {cats.slice(0, 2).map((c, i) => (
                  <span key={i} className="glass rounded-full px-2 py-0.5 text-[11px] text-white/90">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="text-sm font-semibold">{p.name}</div>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
