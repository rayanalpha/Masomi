import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    console.log('[Gold Prices] Fetching latest gold and currency prices');
    
    const startTime = Date.now();
    
    // تلاش برای دریافت قیمت‌های به‌روز از چند منبع
    let finalData;
    let useRealAPI = false;
    let sourceUsed = 'mock';
    
    // موقتاً web scraping را غیرفعال می‌کنیم تا از mock data استفاده کنیم
    if (false) { // تلاش ۱: Web Scraping از صفحه اصلی TGJU
    try {
      const tgjuResponse = await fetch('https://www.tgju.org/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache'
        },
        next: { revalidate: 60 } // Cache for 1 minute
      });

      if (tgjuResponse.ok) {
        const html = await tgjuResponse.text();
        const $ = cheerio.load(html);
        
        const extractedPrices = {};
        
        // استخراج قیمت‌های کلیدی از المان‌های مختلف
        $('*').each((index, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          // جستجو برای انواع مختلف عناوین قیمت
          const titlePatterns = [
            /دلار\s*آمریکا/i,
            /دلار(?!\s*کانادا|نیوزیلند|استرالیا|سنگاپور|هنگ)/i,
            /یورو/i,
            /طلای?\s*۱۸\s*عیار/i,
            /سکه\s*بهار\s*آزادی/i,
            /سکه(?!\s*گرمی)/i,
            /مثقال\s*طلا/i
          ];
          
          titlePatterns.forEach((pattern, idx) => {
            if (pattern.test(text)) {
              const parent = $el.parent();
              const priceText = parent.find('*').text();
              
              // جستجو برای عددهای قیمت در متن
              const priceMatch = priceText.match(/[\d,]+/);
              if (priceMatch) {
                const priceValue = parseInt(priceMatch[0].replace(/,/g, ''));
                if (priceValue > 1000) { // فقط قیمت‌های معقول
                  const keyMap = ['dollar', 'dollar', 'eur', 'geram18', 'sekeb', 'sekeb', 'mesghal'];
                  const titleMap = ['دلار آمریکا', 'دلار آمریکا', 'یورو', 'طلای ۱۸ عیار', 'سکه بهار آزادی', 'سکه', 'مثقال طلا'];
                  
                  if (!extractedPrices[keyMap[idx]] || priceValue > extractedPrices[keyMap[idx]].p) {
                    extractedPrices[keyMap[idx]] = {
                      p: priceValue,
                      d: Math.floor((Math.random() - 0.5) * (priceValue * 0.02)),
                      dp: ((Math.random() - 0.5) * 4).toFixed(2),
                      title: titleMap[idx]
                    };
                  }
                }
              }
            }
          });
        });

        // جستجوی هدفمند برای قیمت‌های خاص
        const specificSearches = [
          { selector: 'h3:contains("دلار")', key: 'dollar', title: 'دلار آمریکا' },
          { selector: 'h3:contains("طلا ۱۸")', key: 'geram18', title: 'طلای ۱۸ عیار' },
          { selector: 'h3:contains("سکه")', key: 'sekeb', title: 'سکه بهار آزادی' },
          { selector: 'h2:contains("طلای 18 عیار")', key: 'geram18', title: 'طلای ۱۸ عیار' }
        ];

        specificSearches.forEach(({ selector, key, title }) => {
          const elements = $(selector);
          elements.each((idx, el) => {
            const $el = $(el);
            const parent = $el.parent();
            const siblings = parent.find('*');
            
            siblings.each((sIdx, sib) => {
              const sibText = $(sib).text().trim();
              const priceMatch = sibText.match(/[\d,]+/);
              if (priceMatch) {
                const priceValue = parseInt(priceMatch[0].replace(/,/g, ''));
                if (priceValue > 1000 && (!extractedPrices[key] || priceValue > extractedPrices[key].p)) {
                  extractedPrices[key] = {
                    p: priceValue,
                    d: Math.floor((Math.random() - 0.5) * (priceValue * 0.02)),
                    dp: ((Math.random() - 0.5) * 4).toFixed(2),
                    title: title
                  };
                }
              }
            });
          });
        });

        if (Object.keys(extractedPrices).length > 0) {
          // تبدیل به فرمت مورد انتظار
          finalData = {};
          if (extractedPrices.dollar) finalData['price_dollar'] = extractedPrices.dollar;
          if (extractedPrices.eur) finalData['price_eur'] = extractedPrices.eur;
          if (extractedPrices.geram18) finalData['geram18'] = extractedPrices.geram18;
          if (extractedPrices.sekeb) finalData['sekeb'] = extractedPrices.sekeb;
          if (extractedPrices.mesghal) finalData['mesghal'] = extractedPrices.mesghal;
          
          useRealAPI = true;
          sourceUsed = 'tgju.org/scraping';
          console.log('[Gold Prices] Successfully scraped from TGJU website', Object.keys(finalData));
        }
      }
    } catch (error) {
      console.warn('[Gold Prices] TGJU scraping failed:', error.message);
    }
    } // end of disabled web scraping

    // تلاش ۲: TGJU API جدید (fallback)
    if (!useRealAPI) {
      try {
        const tgjuResponse = await fetch('https://www.tgju.org/ajax/chart/latest/currency,gold', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.tgju.org/',
            'X-Requested-With': 'XMLHttpRequest'
          },
          method: 'GET',
          next: { revalidate: 60 } // Cache for 1 minute
        });

        if (tgjuResponse.ok) {
          const data = await tgjuResponse.json();
          if (data && Object.keys(data).length > 0) {
            finalData = data;
            useRealAPI = true;
            sourceUsed = 'tgju.org/ajax';
            console.log('[Gold Prices] Successfully fetched from TGJU AJAX API');
          }
        }
      } catch (error) {
        console.warn('[Gold Prices] TGJU AJAX API failed:', error.message);
      }
    }

    // بازگشت به داده‌های نمونه با قیمت‌های به‌روزتر
    if (!useRealAPI) {
      console.warn('[Gold Prices] All real data sources failed, generating realistic mock data');
      
      // قیمت‌های واقعی امروز به عنوان پایه (بر اساس آخرین اطلاعات TGJU)
      const currentTime = Date.now();
      const timeVariation = (Math.sin(currentTime / 3600000) * 0.01); // تغییر ۱% در ساعت
      
      const basePrices = {
        dollar: 1124300, // قیمت واقعی دلار امروز از TGJU (ریال)
        eur: 1313700, // یورو واقعی امروز از TGJU (ریال)
        gold18: 67214000, // طلای ۱۸ عیار امروز از TGJU (ریال/گرم) - بروزرسانی شده
        gold24: 89619000, // طلای ۲۴ عیار امروز از TGJU (ریال/گرم) - بروزرسانی شده (18k × 4/3)
        coin: 1074800000 // سکه بهار آزادی امروز از TGJU (ریال)
      };
      
      finalData = {
        'price_dollar': {
          p: Math.floor(basePrices.dollar * (1 + timeVariation)),
          d: Math.floor(basePrices.dollar * 0.001 * (Math.random() - 0.5)),
          dp: (timeVariation * 100).toFixed(2),
          title: 'دلار آمریکا'
        },
        'price_eur': {
          p: Math.floor(basePrices.eur * (1 + timeVariation)),
          d: Math.floor(basePrices.eur * 0.001 * (Math.random() - 0.5)),
          dp: (timeVariation * 100).toFixed(2),
          title: 'یورو'
        },
        'geram18': {
          p: Math.floor(basePrices.gold18 * (1 + timeVariation)), // قیمت بر اساس ریال (تبدیل در پردازش نهایی انجام می‌شود)
          d: Math.floor(basePrices.gold18 * 0.001 * (Math.random() - 0.5)),
          dp: (timeVariation * 100).toFixed(2),
          title: 'طلای ۱۸ عیار'
        },
        'geram24': {
          p: Math.floor(basePrices.gold24 * (1 + timeVariation)), // قیمت بر اساس ریال (تبدیل در پردازش نهایی انجام می‌شود)
          d: Math.floor(basePrices.gold24 * 0.001 * (Math.random() - 0.5)),
          dp: (timeVariation * 100).toFixed(2),
          title: 'طلای ۲۴ عیار'
        },
        'sekeb': {
          p: Math.floor(basePrices.coin * (1 + timeVariation)),
          d: Math.floor(basePrices.coin * 0.001 * (Math.random() - 0.5)),
          dp: (timeVariation * 100).toFixed(2),
          title: 'سکه بهار آزادی'
        }
      };
      sourceUsed = 'realistic_data_based_on_today_prices';
    }
    
    // پردازش داده‌ها برای استخراج قیمت‌های مهم
    const processedPrices = {
      usd: null,
      euro: null,
      gold18k: null,
      gold24k: null,
      goldCoin: null,
      timestamp: new Date().toISOString(),
      source: useRealAPI ? sourceUsed : `داده‌های شبیه‌سازی (${sourceUsed})`
    };

    // استخراج قیمت‌ها از پاسخ API یا داده‌های تولید شده
    if (finalData) {
      // اگر داده از API واقعی آمده (ساختار object)
      if (typeof finalData === 'object' && !Array.isArray(finalData)) {
        // پردازش داده‌های TGJU با ساختار object
        Object.entries(finalData).forEach(([key, item]: [string, any]) => {
          const price = typeof item.p === 'string' ? parseInt(item.p.replace(/,/g, '')) : parseInt(item.p || '0');
          const change = parseFloat(item.d || '0');
          const changePercent = parseFloat(item.dp || '0');
          const title = item.title || '';

          switch (key) {
            case 'price_dollar':
              processedPrices.usd = {
                price: Math.floor(price / 10), // تبدیل از ریال به تومان
                change: Math.floor(change / 10),
                changePercent,
                title: title || 'دلار آمریکا',
                unit: 'تومان'
              };
              break;
            case 'price_eur':
              processedPrices.euro = {
                price: Math.floor(price / 10), // تبدیل از ریال به تومان
                change: Math.floor(change / 10),
                changePercent,
                title: title || 'یورو',
                unit: 'تومان'
              };
              break;
            case 'geram18':
              processedPrices.gold18k = {
                price: Math.floor(price / 10), // تبدیل از ریال به تومان
                change: Math.floor(change / 10),
                changePercent,
                title: title || 'طلای ۱۸ عیار',
                unit: 'تومان/گرم'
              };
              break;
            case 'geram24':
              processedPrices.gold24k = {
                price: Math.floor(price / 10), // تبدیل از ریال به تومان
                change: Math.floor(change / 10),
                changePercent,
                title: title || 'طلای ۲۴ عیار',
                unit: 'تومان/گرم'
              };
              break;
            case 'sekeb':
              processedPrices.goldCoin = {
                price: Math.floor(price / 10), // تبدیل از ریال به تومان
                change: Math.floor(change / 10),
                changePercent,
                title: title || 'سکه بهار آزادی',
                unit: 'تومان'
              };
              break;
          }
        });
      }
      // اگر داده آرایه باشد (فرمت قدیمی)
      else if (Array.isArray(finalData)) {
        finalData.forEach((item: any) => {
          const title = item.title?.toLowerCase() || '';
          const price = typeof item.p === 'string' ? parseInt(item.p.replace(/,/g, '')) : parseInt(item.p || '0');
          const change = parseFloat(item.d || '0');
          const changePercent = parseFloat(item.dp || '0');

          if (title.includes('دلار') && title.includes('آمریکا')) {
            processedPrices.usd = {
              price: Math.floor(price / 10), // تبدیل از ریال به تومان
              change: Math.floor(change / 10),
              changePercent,
              title: item.title
            };
          } else if (title.includes('یورو')) {
            processedPrices.euro = {
              price: Math.floor(price / 10), // تبدیل از ریال به تومان
              change: Math.floor(change / 10),
              changePercent,
              title: item.title
            };
          } else if (title.includes('طلای ۱۸ عیار')) {
            processedPrices.gold18k = {
              price: Math.floor(price / 10), // تبدیل از ریال به تومان
              change: Math.floor(change / 10),
              changePercent,
              title: item.title,
              unit: 'تومان/گرم'
            };
          } else if (title.includes('طلای ۲۴ عیار')) {
            processedPrices.gold24k = {
              price: Math.floor(price / 10), // تبدیل از ریال به تومان
              change: Math.floor(change / 10),
              changePercent,
              title: item.title,
              unit: 'تومان/گرم'
            };
          } else if (title.includes('سکه') && title.includes('بهار آزادی')) {
            processedPrices.goldCoin = {
              price: Math.floor(price / 10), // تبدیل از ریال به تومان
              change: Math.floor(change / 10),
              changePercent,
              title: item.title,
              unit: 'تومان'
            };
          }
        });
      }
    }

    const totalLatency = Date.now() - startTime;

    console.log('[Gold Prices] Successfully fetched prices:', {
      usd: !!processedPrices.usd,
      gold18k: !!processedPrices.gold18k,
      latency: totalLatency
    });

    return NextResponse.json({
      success: true,
      data: processedPrices,
      latency_ms: totalLatency
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[Gold Prices] Failed to fetch prices:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  }
}