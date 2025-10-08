"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface CategoryFilterProps {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    productCount: number;
  }>;
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get('category');

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams || '');
    
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    
    router.push(`/catalog?${params.toString()}`);
  };

  // Only show categories that have products
  const availableCategories = categories.filter(cat => cat.productCount > 0);

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-foreground/80">دسته‌بندی‌ها</h2>
      
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCategoryChange(null)}
          className={cn(
            "glass rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-lg",
            !currentCategory
              ? "bg-gold/20 border-gold/30 text-gold-light shadow-gold/20"
              : "border-white/10 text-foreground/70 hover:text-foreground hover:border-white/20"
          )}
        >
          همه محصولات
          <span className="mr-2 text-xs opacity-70">
            ({categories.reduce((sum, cat) => sum + cat.productCount, 0)})
          </span>
        </motion.button>

        {availableCategories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCategoryChange(category.slug)}
            className={cn(
              "glass rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-lg",
              currentCategory === category.slug
                ? "bg-gold/20 border-gold/30 text-gold-light shadow-gold/20"
                : "border-white/10 text-foreground/70 hover:text-foreground hover:border-white/20"
            )}
          >
            {category.name}
            <span className="mr-2 text-xs opacity-70">
              ({category.productCount})
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}