import { withDatabaseRetry } from './db-serverless';
import type { PrismaClient } from '@prisma/client';

/**
 * Server Component Data Fetching Utilities
 * Provides robust data fetching with proper connection management for Netlify
 */

export interface ProductWithRelations {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price?: number | null;
  sku?: string | null;
  status: string;
  visibility: string;
  stock?: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    url: string;
    alt?: string | null;
    sort?: number | null;
  }>;
  categories: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
}

/**
 * Fetch products with proper serverless connection handling
 */
export async function fetchProducts(options?: {
  category?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  visibility?: 'PUBLIC' | 'PRIVATE';
  take?: number;
  skip?: number;
}): Promise<ProductWithRelations[]> {
  const {
    category,
    status = 'PUBLISHED',
    visibility = 'PUBLIC',
    take = 60,
    skip = 0
  } = options || {};

  try {
    console.log('[ServerData] Fetching products with options:', options);
    
    const products = await withDatabaseRetry(async (prisma: PrismaClient) => {
      const where = {
        status,
        visibility,
        ...(category ? { categories: { some: { slug: category } } } : {}),
      };

      return await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: [{ sort: 'asc' }, { id: 'asc' }]
          },
          categories: true
        },
        take,
        skip
      });
    }, 5, 1000); // 5 retries with 1000ms base delay for better reliability

    console.log(`[ServerData] Successfully fetched ${products.length} products`);
    return products as ProductWithRelations[];
    
  } catch (error) {
    console.error('[ServerData] Failed to fetch products:', error);
    
    // Return empty array instead of throwing to prevent page crashes
    // This allows the page to render with "no products" message
    return [];
  }
}

/**
 * Fetch single product by slug
 */
export async function fetchProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  try {
    console.log(`[ServerData] Fetching product with slug: ${slug}`);
    
    const product = await withDatabaseRetry(async (prisma: PrismaClient) => {
      return await prisma.product.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: [{ sort: 'asc' }, { id: 'asc' }]
          },
          categories: true,
          attributes: {
            include: {
              attribute: true
            }
          },
          variations: {
            include: {
              options: {
                include: {
                  attribute: true,
                  attributeValue: true
                }
              }
            }
          }
        }
      });
    }, 5, 1000); // 5 retries with 1000ms base delay

    if (product) {
      console.log(`[ServerData] Successfully fetched product: ${product.name}`);
    } else {
      console.log(`[ServerData] Product not found with slug: ${slug}`);
    }
    
    return product as ProductWithRelations | null;
    
  } catch (error) {
    console.error(`[ServerData] Failed to fetch product ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  try {
    console.log('[ServerData] Fetching categories');
    
    const categories = await withDatabaseRetry(async (prisma: PrismaClient) => {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });
    }, 5, 1000); // 5 retries with 1000ms base delay

    console.log(`[ServerData] Successfully fetched ${categories.length} categories`);
    return categories;
    
  } catch (error) {
    console.error('[ServerData] Failed to fetch categories:', error);
    return [];
  }
}

/**
 * Count total products (for pagination)
 */
export async function countProducts(options?: {
  category?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  visibility?: 'PUBLIC' | 'PRIVATE';
}): Promise<number> {
  const {
    category,
    status = 'PUBLISHED',
    visibility = 'PUBLIC'
  } = options || {};

  try {
    const count = await withDatabaseRetry(async (prisma: PrismaClient) => {
      const where = {
        status,
        visibility,
        ...(category ? { categories: { some: { slug: category } } } : {}),
      };

      return await prisma.product.count({ where });
    }, 5, 1000); // 5 retries with 1000ms base delay

    console.log(`[ServerData] Product count: ${count}`);
    return count;
    
  } catch (error) {
    console.error('[ServerData] Failed to count products:', error);
    return 0;
  }
}