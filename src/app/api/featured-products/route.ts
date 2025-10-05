import { NextResponse } from 'next/server';
import { getFeaturedProducts, getFeaturedProductsSettings } from '@/lib/featured-products';
import { withApiHandler, rateLimit } from '@/lib/api-middleware';

export const dynamic = "force-dynamic";

/**
 * GET /api/featured-products - دریافت محصولات ویژه
 */
export const GET = withApiHandler(
  rateLimit(20, 60000)( // 20 requests per minute
    async (context) => {
      try {
        console.log('[API] GET /api/featured-products called');
        
        // دریافت تنظیمات محصولات ویژه
        const settings = await getFeaturedProductsSettings();
        
        if (!settings.enabled) {
          return NextResponse.json({
            success: true,
            products: [],
            settings,
            message: 'محصولات ویژه غیرفعال است'
          });
        }

        // دریافت محصولات ویژه
        const products = await getFeaturedProducts(settings.criteria, settings.limit);
        
        console.log(`[API] Successfully fetched ${products.length} featured products`);
        
        return NextResponse.json({
          success: true,
          products,
          settings: {
            title: settings.title,
            subtitle: settings.subtitle,
            limit: settings.limit
          },
          count: products.length
        });
        
      } catch (error) {
        console.error('[API] Error in GET /api/featured-products:', error);
        return NextResponse.json({
          success: false,
          error: 'خطا در دریافت محصولات ویژه',
          products: []
        }, { status: 500 });
      }
    }
  )
);
