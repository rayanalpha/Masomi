'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Coins } from 'lucide-react';

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  title: string;
  unit?: string;
}

interface LivePricesData {
  usd: PriceData | null;
  euro: PriceData | null;
  gold18k: PriceData | null;
  gold24k: PriceData | null;
  goldCoin: PriceData | null;
  timestamp: string;
  source: string;
}

export default function LivePrices() {
  const [pricesData, setPricesData] = useState<LivePricesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/gold-prices');
      const result = await response.json();

      if (result.success && result.data) {
        setPricesData(result.data);
        setLastUpdate(new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit', 
          second: '2-digit',
          hour12: false
        }));
        setError(null);
      } else {
        setError(result.error || 'خطا در دریافت قیمت‌ها');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // به‌روزرسانی هر 30 ثانیه (مانند سایت TGJU)
    const interval = setInterval(fetchPrices, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // بروزرسانی زمان فعلی هر ثانیه
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      }));
    };
    
    updateCurrentTime(); // اولین بار فوراً اجرا شود
    const timeInterval = setInterval(updateCurrentTime, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const formatPrice = (price: number, unit?: string) => {
    const formatted = price.toLocaleString('fa-IR');
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change > 0;
    const changeFormatted = Math.abs(change).toLocaleString('fa-IR');
    const percentFormatted = Math.abs(changePercent).toFixed(2);
    
    return {
      text: `${changeFormatted} (${percentFormatted}%)`,
      isPositive,
      icon: isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
    };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[var(--gold-900)]/20 to-[var(--gold-800)]/20 backdrop-blur-sm border border-[var(--gold-500)]/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-[var(--gold-400)]" />
          <h3 className="text-lg font-semibold text-[var(--gold-100)]">قیمت‌های لحظه‌ای</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--gold-700)]/30 rounded mb-2"></div>
              <div className="h-3 bg-[var(--gold-700)]/20 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !pricesData) {
    return (
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-100">قیمت‌های لحظه‌ای</h3>
        </div>
        <p className="text-red-300 text-sm">{error}</p>
        <button 
          onClick={fetchPrices}
          className="mt-2 text-xs text-red-200 hover:text-red-100 underline"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[var(--gold-900)]/20 to-[var(--gold-800)]/20 backdrop-blur-sm border border-[var(--gold-500)]/20 rounded-2xl p-6 hover:from-[var(--gold-900)]/30 hover:to-[var(--gold-800)]/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-[var(--gold-400)]" />
          <h3 className="text-lg font-semibold text-[var(--gold-100)]">قیمت‌های لحظه‌ای</h3>
        </div>
        <div className="text-xs text-[var(--gold-400)]">
          <div>زمان فعلی: {currentTime}</div>
          <div>آخرین به‌روزرسانی: {lastUpdate}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* دلار آمریکا */}
        {pricesData.usd && (
          <div className="flex items-center justify-between p-3 bg-[var(--gold-800)]/20 rounded-lg border border-[var(--gold-600)]/20">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-sm font-medium text-[var(--gold-100)]">دلار آمریکا</div>
                <div className="text-xs text-[var(--gold-300)]">{formatPrice(pricesData.usd.price)} تومان</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              pricesData.usd.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatChange(pricesData.usd.change, pricesData.usd.changePercent).icon}
              <span>{formatChange(pricesData.usd.change, pricesData.usd.changePercent).text}</span>
            </div>
          </div>
        )}

        {/* یورو */}
        {pricesData.euro && (
          <div className="flex items-center justify-between p-3 bg-[var(--gold-800)]/20 rounded-lg border border-[var(--gold-600)]/20">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold text-white">€</div>
              <div>
                <div className="text-sm font-medium text-[var(--gold-100)]">یورو</div>
                <div className="text-xs text-[var(--gold-300)]">{formatPrice(pricesData.euro.price)} تومان</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              pricesData.euro.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatChange(pricesData.euro.change, pricesData.euro.changePercent).icon}
              <span>{formatChange(pricesData.euro.change, pricesData.euro.changePercent).text}</span>
            </div>
          </div>
        )}

        {/* طلای 18 عیار */}
        {pricesData.gold18k && (
          <div className="flex items-center justify-between p-3 bg-[var(--gold-800)]/20 rounded-lg border border-[var(--gold-600)]/20">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--gold-400)] rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-[var(--gold-100)]">طلای ۱۸ عیار</div>
                <div className="text-xs text-[var(--gold-300)]">{formatPrice(pricesData.gold18k.price, pricesData.gold18k.unit)}</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              pricesData.gold18k.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatChange(pricesData.gold18k.change, pricesData.gold18k.changePercent).icon}
              <span>{formatChange(pricesData.gold18k.change, pricesData.gold18k.changePercent).text}</span>
            </div>
          </div>
        )}

        {/* سکه بهار آزادی */}
        {pricesData.goldCoin && (
          <div className="flex items-center justify-between p-3 bg-[var(--gold-800)]/20 rounded-lg border border-[var(--gold-600)]/20">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[var(--gold-400)]" />
              <div>
                <div className="text-sm font-medium text-[var(--gold-100)]">سکه بهار آزادی</div>
                <div className="text-xs text-[var(--gold-300)]">{formatPrice(pricesData.goldCoin.price, pricesData.goldCoin.unit)}</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              pricesData.goldCoin.change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatChange(pricesData.goldCoin.change, pricesData.goldCoin.changePercent).icon}
              <span>{formatChange(pricesData.goldCoin.change, pricesData.goldCoin.changePercent).text}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--gold-600)]/20">
        <div className="flex items-center justify-between text-xs text-[var(--gold-400)]">
          <span>منبع: {pricesData.source}</span>
          <button 
            onClick={fetchPrices}
            className="hover:text-[var(--gold-300)] transition-colors"
          >
            به‌روزرسانی
          </button>
        </div>
      </div>
    </div>
  );
}