import { NextResponse } from 'next/server';
import { withApiHandler, rateLimit } from '@/lib/api-middleware';
import { 
  fetchRealGoldPrices, 
  fetchRealCurrencyPrices,
  fetchGoldFromCoinGecko,
  fetchCurrencyFromExchangeRate,
  convertUsdToToman,
  calculatePriceChange,
  fetchRealUSDRate
} from '@/lib/external-apis';
import {
  fetchGoldPricesWithFallback,
  fetchCurrencyPricesWithFallback
} from '@/lib/iranian-apis';

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

        let goldPrices, currencyPrices;
        // یکبار نرخ دلار را بگیر و بین طلا و ارز به اشتراک بگذار
        const usdToToman = await fetchRealUSDRate();

        try {
          // تلاش برای دریافت قیمت‌های واقعی از API های ایرانی
          const [iranianGoldPrices, iranianCurrencyPrices] = await Promise.all([
            fetchGoldPricesWithFallback(),
            fetchCurrencyPricesWithFallback()
          ]);
          
          goldPrices = iranianGoldPrices;
          currencyPrices = iranianCurrencyPrices;
          
          console.log('[API] Successfully fetched real prices from Iranian APIs');
        } catch (iranianError) {
          console.warn('[API] Iranian APIs failed, trying external APIs:', iranianError);
          
          try {
            // تلاش برای دریافت قیمت‌های واقعی از API های خارجی
            const [externalGoldPrices, externalCurrencyPrices] = await Promise.all([
              fetchRealGoldPrices(),
              fetchRealCurrencyPrices(usdToToman)
            ]);
            
            goldPrices = externalGoldPrices;
            currencyPrices = externalCurrencyPrices;
            
            console.log('[API] Successfully fetched real prices from external APIs');
          } catch (externalError) {
            console.warn('[API] External APIs failed, using fallback prices:', externalError);
            
            // در صورت خطا در API های خارجی، از قیمت‌های fallback استفاده کن
            const fallbackGoldPrices = [
              {
                name: 'طلا 18 عیار',
                price: 2100000,
                change: 15000,
                changePercent: 0.72
              },
              {
                name: 'طلا 21 عیار',
                price: 2450000,
                change: 17500,
                changePercent: 0.72
              },
              {
                name: 'طلا 24 عیار',
                price: 2800000,
                change: 20000,
                changePercent: 0.72
              },
              {
                name: 'نیم سکه',
                price: 1400000,
                change: 10000,
                changePercent: 0.72
              },
              {
                name: 'سکه تمام',
                price: 2800000,
                change: 20000,
                changePercent: 0.72
              }
            ];

            const fallbackCurrencyPrices = [
              {
                name: 'دلار آمریکا',
                price: 42000,
                change: 200,
                changePercent: 0.48
              },
              {
                name: 'یورو',
                price: 46000,
                change: -150,
                changePercent: -0.32
              },
              {
                name: 'پوند انگلیس',
                price: 53000,
                change: 300,
                changePercent: 0.57
              },
              {
                name: 'ین ژاپن',
                price: 280,
                change: -2,
                changePercent: -0.71
              }
            ];

            goldPrices = fallbackGoldPrices;
            currencyPrices = fallbackCurrencyPrices;
          }
        }

        console.log(`[API] Successfully fetched ${goldPrices.length} gold prices and ${currencyPrices.length} currency prices`);

        return new NextResponse(JSON.stringify({
          success: true,
          data: {
            gold: goldPrices,
            currency: currencyPrices,
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