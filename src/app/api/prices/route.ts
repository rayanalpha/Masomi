import { NextResponse } from 'next/server';
import { withApiHandler, rateLimit } from '@/lib/api-middleware';
import { 
  fetchRealGoldPrices, 
  fetchRealCurrencyPrices,
  fetchRealCoinPrices,
  fetchRealUSDRate
} from '@/lib/external-apis';

export const dynamic = "force-dynamic";
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * GET /api/prices - دریافت قیمت‌های لحظه‌ای طلا و ارز
 */
export const GET = withApiHandler(
  rateLimit(10, 60000)( // 10 requests per minute
    async (context) => {
      try {
        console.log('[API] GET /api/prices called');

        // دریافت قیمت‌ها فقط از TGJU
        const [goldPrices, currencyPrices, coinPrices] = await Promise.all([
          fetchRealGoldPrices(),
          fetchRealCurrencyPrices(),
          fetchRealCoinPrices()
        ]);
        
        console.log('[API] Successfully fetched real prices from TGJU');

        console.log(`[API] Successfully fetched ${goldPrices.length} gold prices, ${currencyPrices.length} currency prices, and ${coinPrices.length} coin prices`);

        return new NextResponse(JSON.stringify({
          success: true,
          data: {
            gold: goldPrices,
            currency: currencyPrices,
            coins: coinPrices,
            lastUpdated: new Date().toISOString()
          },
          message: 'قیمت‌ها با موفقیت دریافت شد'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

      } catch (error) {
        console.error('[API] Error in GET /api/prices:', error);
        return NextResponse.json({
          success: false,
          error: 'خطا در دریافت قیمت‌ها',
          data: null
        }, { status: 500 });
      }
    }
  )
);