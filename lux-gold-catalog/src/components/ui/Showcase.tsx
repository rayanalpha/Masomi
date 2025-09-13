"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";

export function ProductCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-elegant"
        >
          <Skeleton className="h-44 sm:h-60 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" muted />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function ExampleShowcase() {
  return (
    <section className="container py-16">
      <h2 className="lux-h2 mb-6 text-gold-gradient">افکت‌های لوکس جدید</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="#" className="group relative block overflow-hidden rounded-2xl border-gold shadow-elegant hover:shadow-elegant-lg transition-shadow">
          <div className="bg-gold-metal h-40 opacity-80 group-hover:opacity-100 transition" />
          <div className="p-4">
            <div className="lux-eyebrow">کارت متالیک</div>
            <div className="lux-h3">گرادیان طلایی</div>
          </div>
        </Link>
      </div>
    </section>
  );
}
