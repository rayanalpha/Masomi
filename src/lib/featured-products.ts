import { withDatabaseRetry } from './db-serverless';
import type { PrismaClient } from '@prisma/client';

/**
 * Featured Products Logic
 * محصولات ویژه بر اساس معیارهای مختلف انتخاب می‌شوند
 */

export interface FeaturedProduct {
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
  featuredReason: string; // دلیل انتخاب به عنوان محصول ویژه
}

export type FeaturedProductsCriteria = {
  // معیارهای انتخاب محصولات ویژه
  bestSellers?: boolean;        // پرفروش‌ترین‌ها
  newArrivals?: boolean;           // محصولات جدید
  onSale?: boolean;                // محصولات تخفیفی
  highRated?: boolean;             // محصولات با امتیاز بالا
  premium?: boolean;               // محصولات پریمیوم
  seasonal?: boolean;              // محصولات فصلی
  custom?: string[];               // محصولات دستی انتخاب شده
};

/**
 * دریافت محصولات ویژه بر اساس معیارهای تعریف شده
 */
export async function getFeaturedProducts(
  criteria: FeaturedProductsCriteria = {},
  limit: number = 8
): Promise<FeaturedProduct[]> {
  try {
    console.log('[FeaturedProducts] Fetching featured products with criteria:', criteria);
    
    const products = await withDatabaseRetry(async (prisma: PrismaClient) => {
      const where: any = {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      };

      // اگر محصولات دستی انتخاب شده باشند
      if (criteria.custom && criteria.custom.length > 0) {
        where.id = { in: criteria.custom };
        const customProducts = await prisma.product.findMany({
          where,
          include: {
            images: { orderBy: [{ sort: 'asc' }, { id: 'asc' }] },
            categories: true,
          },
          take: limit,
        });
        
        return customProducts.map(product => ({
          ...product,
          featuredReason: 'محصول منتخب'
        }));
      }

      // معیارهای مختلف برای انتخاب محصولات ویژه
      const conditions: any[] = [];

      if (criteria.bestSellers) {
        // محصولات پرفروش (بر اساس تعداد سفارشات)
        conditions.push({
          orderItems: {
            some: {}
          }
        });
      }

      if (criteria.newArrivals) {
        // محصولات جدید (آخرین 30 روز)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        conditions.push({
          createdAt: {
            gte: thirtyDaysAgo
          }
        });
      }

      if (criteria.onSale) {
        // محصولات تخفیفی
        conditions.push({
          salePrice: {
            not: null
          }
        });
      }

      if (criteria.premium) {
        // محصولات پریمیوم (قیمت بالا)
        conditions.push({
          price: {
            gte: 1000000 // قیمت بالای 1 میلیون تومان
          }
        });
      }

      if (criteria.seasonal) {
        // محصولات فصلی (بر اساس دسته‌بندی)
        conditions.push({
          categories: {
            some: {
              slug: {
                in: ['spring', 'summer', 'autumn', 'winter', 'seasonal']
              }
            }
          }
        });
      }

      // اگر هیچ معیار خاصی انتخاب نشده، محصولات محبوب را برگردان
      if (conditions.length === 0) {
        conditions.push({
          orderItems: {
            some: {}
          }
        });
      }

      where.OR = conditions;

      const products = await prisma.product.findMany({
        where,
        include: {
          images: { orderBy: [{ sort: 'asc' }, { id: 'asc' }] },
          categories: true,
          _count: {
            select: { orderItems: true }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { price: 'desc' }
        ],
        take: limit,
      });

      return products.map(product => ({
        ...product,
        featuredReason: getFeaturedReason(product, criteria)
      }));
    }, 5, 1000);

    console.log(`[FeaturedProducts] Successfully fetched ${products.length} featured products`);
    return products as FeaturedProduct[];
    
  } catch (error) {
    console.error('[FeaturedProducts] Failed to fetch featured products:', error);
    return [];
  }
}

/**
 * تعیین دلیل انتخاب محصول به عنوان محصول ویژه
 */
function getFeaturedReason(product: any, criteria: FeaturedProductsCriteria): string {
  const reasons: string[] = [];

  if (criteria.bestSellers && product._count?.orderItems > 0) {
    reasons.push('پرفروش');
  }

  if (criteria.newArrivals) {
    const daysSinceCreated = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated <= 30) {
      reasons.push('جدید');
    }
  }

  if (criteria.onSale && product.salePrice && product.salePrice < product.price) {
    reasons.push('تخفیفی');
  }

  if (criteria.premium && product.price > 1000000) {
    reasons.push('پریمیوم');
  }

  if (criteria.seasonal) {
    const seasonalCategories = product.categories?.some((cat: any) => 
      ['spring', 'summer', 'autumn', 'winter', 'seasonal'].includes(cat.slug)
    );
    if (seasonalCategories) {
      reasons.push('فصلی');
    }
  }

  if (criteria.custom && criteria.custom.includes(product.id)) {
    reasons.push('منتخب');
  }

  return reasons.length > 0 ? reasons.join(' • ') : 'ویژه';
}

/**
 * دریافت تنظیمات محصولات ویژه از دیتابیس
 */
export async function getFeaturedProductsSettings() {
  try {
    // اینجا می‌توانید تنظیمات را از دیتابیس بخوانید
    // فعلاً تنظیمات پیش‌فرض را برمی‌گردانیم
    return {
      enabled: true,
      criteria: {
        bestSellers: true,
        newArrivals: true,
        onSale: true,
        premium: false,
        seasonal: false,
        custom: []
      },
      limit: 8,
      title: 'محصولات ویژه',
      subtitle: 'بهترین محصولات را برای شما انتخاب کرده‌ایم'
    };
  } catch (error) {
    console.error('[FeaturedProducts] Failed to get settings:', error);
    return {
      enabled: false,
      criteria: {},
      limit: 8,
      title: 'محصولات ویژه',
      subtitle: 'بهترین محصولات را برای شما انتخاب کرده‌ایم'
    };
  }
}
