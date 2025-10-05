'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price?: number;
  salePrice?: number;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
  featuredReason: string;
}

interface FeaturedProductsProps {
  initialProducts?: FeaturedProduct[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export default function FeaturedProducts({ 
  initialProducts = [], 
  title = "محصولات ویژه",
  subtitle = "بهترین محصولات را برای شما انتخاب کرده‌ایم",
  showViewAll = true
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<FeaturedProduct[]>(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialProducts.length) {
      fetchFeaturedProducts();
    }
  }, [initialProducts.length]);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/featured-products');
      if (!response.ok) throw new Error('Failed to fetch featured products');
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setError('خطا در بارگذاری محصولات ویژه');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="lux-h2 text-gold-gradient mb-4">{title}</h2>
            <p className="text-foreground/70">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-80 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center">
            <h2 className="lux-h2 text-gold-gradient mb-4">{title}</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/50">
      <div className="container">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="lux-h2 text-gold-gradient mb-4">{title}</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group"
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <FeaturedProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {showViewAll && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link 
              href="/catalog"
              className="btn btn-gold shimmer-border"
            >
              مشاهده همه محصولات
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FeaturedProductCard({ product }: { product: FeaturedProduct }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images[0];
  const price = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Featured Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            {product.featuredReason}
          </span>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discount}% تخفیف
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {mainImage && (
            <motion.div
              className="w-full h-full"
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                fill
                className="object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Categories */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.categories.slice(0, 2).map((category) => (
                <span
                  key={category.slug}
                  className="text-xs text-gold-400 bg-gold-500/10 px-2 py-1 rounded"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {price && (
              <span className="text-lg font-bold text-gold-500">
                {price.toLocaleString('fa-IR')} تومان
              </span>
            )}
            {originalPrice && (
              <span className="text-sm text-foreground/50 line-through">
                {originalPrice.toLocaleString('fa-IR')}
              </span>
            )}
          </div>
        </div>

        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
}
