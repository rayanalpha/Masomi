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
    
    const interval = setInterval(fetchPrices, 30000);
    
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
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--gold-900)]/30 via-black/40 to-[var(--gold-800)]/30 backdrop-blur-xl border border-[var(--gold-500)]/30 rounded-3xl p-8 shadow-luxury animate-luxury-glass-appear">
        {/* Glass morphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--gold-500)]/20 rounded-full">
              <Coins className="w-6 h-6 text-[var(--gold-400)] animate-luxury-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-[var(--gold-100)] bg-gradient-to-r from-[var(--gold-100)] to-[var(--gold-300)] bg-clip-text text-transparent">
              قیمت‌های لحظه‌ای
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative overflow-hidden bg-black/20 backdrop-blur-sm border border-[var(--gold-600)]/20 rounded-2xl p-4">
                <div className="animate-luxury-shimmer">
                  <div className="h-5 bg-gradient-to-r from-[var(--gold-700)]/40 to-[var(--gold-600)]/20 rounded-full mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-[var(--gold-700)]/30 to-transparent rounded-full w-3/4 mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-[var(--gold-700)]/20 to-transparent rounded-full w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Animated loading particles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-[var(--gold-400)]/60 rounded-full animate-luxury-float"
            style={{
              right: `${20 + i * 20}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`
            }} />
        ))}
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
    <div className="relative overflow-hidden bg-gradient-to-br from-[var(--gold-900)]/30 via-black/40 to-[var(--gold-800)]/30 backdrop-blur-xl border border-[var(--gold-500)]/30 rounded-3xl p-8 shadow-luxury hover:shadow-luxury-xl transition-all duration-500 group animate-luxury-glass-appear">
      {/* Enhanced glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent rounded-3xl group-hover:from-white/12 transition-all duration-500" />
      
      {/* Animated border glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[var(--gold-500)]/20 via-[var(--gold-400)]/30 to-[var(--gold-500)]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative p-3 bg-[var(--gold-500)]/20 rounded-full group-hover:bg-[var(--gold-500)]/30 transition-colors duration-300">
              <Coins className="w-6 h-6 text-[var(--gold-400)] group-hover:text-[var(--gold-300)] transition-colors duration-300" />
              <div className="absolute inset-0 bg-[var(--gold-400)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--gold-100)] to-[var(--gold-300)] bg-clip-text text-transparent">
              قیمت‌های لحظه‌ای
            </h3>
          </div>
          <div className="text-xs text-[var(--gold-400)] text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>زمان فعلی: <span className="font-mono text-[var(--gold-300)]">{currentTime}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--gold-400)] rounded-full animate-pulse" />
              <span>آخرین به‌روزرسانی: <span className="font-mono text-[var(--gold-300)]">{lastUpdate}</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* دلار آمریکا */}
          {pricesData.usd && (
            <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-[var(--gold-600)]/20 hover:border-[var(--gold-500)]/40 transition-all duration-300 group">
              {/* Price card background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--gold-100)]">دلار آمریکا</div>
                    <div className="text-xs text-[var(--gold-300)] font-mono animate-luxury-counter">
                      {formatPrice(pricesData.usd.price)} تومان
                    </div>
                  </div>
                </div>
                <div className={`flex flex-col items-end gap-1 ${
                  pricesData.usd.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {formatChange(pricesData.usd.change, pricesData.usd.changePercent).icon}
                    <span>{formatChange(pricesData.usd.change, pricesData.usd.changePercent).text}</span>
                  </div>
                  {/* Mini chart placeholder */}
                  <div className="flex items-end gap-px h-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className={`w-1 bg-current rounded-full animate-luxury-chart-${i}`}
                        style={{ height: `${20 + Math.random() * 80}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* یورو */}
          {pricesData.euro && (
            <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-[var(--gold-600)]/20 hover:border-[var(--gold-500)]/40 transition-all duration-300 group">
              {/* Price card background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold text-white">€</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--gold-100)]">یورو</div>
                    <div className="text-xs text-[var(--gold-300)] font-mono animate-luxury-counter">
                      {formatPrice(pricesData.euro.price)} تومان
                    </div>
                  </div>
                </div>
                <div className={`flex flex-col items-end gap-1 ${
                  pricesData.euro.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {formatChange(pricesData.euro.change, pricesData.euro.changePercent).icon}
                    <span>{formatChange(pricesData.euro.change, pricesData.euro.changePercent).text}</span>
                  </div>
                  {/* Mini chart placeholder */}
                  <div className="flex items-end gap-px h-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className={`w-1 bg-current rounded-full animate-luxury-chart-${i}`}
                        style={{ height: `${30 + Math.random() * 70}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* طلای 18 عیار */}
          {pricesData.gold18k && (
            <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-[var(--gold-600)]/20 hover:border-[var(--gold-500)]/40 transition-all duration-300 group">
              {/* Price card background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-500)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--gold-500)]/20 rounded-full">
                    <div className="w-5 h-5 bg-[var(--gold-400)] rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--gold-100)]">طلای ۱۸ عیار</div>
                    <div className="text-xs text-[var(--gold-300)] font-mono animate-luxury-counter">
                      {formatPrice(pricesData.gold18k.price, pricesData.gold18k.unit)}
                    </div>
                  </div>
                </div>
                <div className={`flex flex-col items-end gap-1 ${
                  pricesData.gold18k.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {formatChange(pricesData.gold18k.change, pricesData.gold18k.changePercent).icon}
                    <span>{formatChange(pricesData.gold18k.change, pricesData.gold18k.changePercent).text}</span>
                  </div>
                  {/* Mini chart placeholder */}
                  <div className="flex items-end gap-px h-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className={`w-1 bg-current rounded-full animate-luxury-chart-${i}`}
                        style={{ height: `${40 + Math.random() * 60}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* سکه بهار آزادی */}
          {pricesData.goldCoin && (
            <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-[var(--gold-600)]/20 hover:border-[var(--gold-500)]/40 transition-all duration-300 group">
              {/* Price card background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-600)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--gold-600)]/20 rounded-full">
                    <Coins className="w-5 h-5 text-[var(--gold-400)]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--gold-100)]">سکه بهار آزادی</div>
                    <div className="text-xs text-[var(--gold-300)] font-mono animate-luxury-counter">
                      {formatPrice(pricesData.goldCoin.price, pricesData.goldCoin.unit)}
                    </div>
                  </div>
                </div>
                <div className={`flex flex-col items-end gap-1 ${
                  pricesData.goldCoin.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {formatChange(pricesData.goldCoin.change, pricesData.goldCoin.changePercent).icon}
                    <span>{formatChange(pricesData.goldCoin.change, pricesData.goldCoin.changePercent).text}</span>
                  </div>
                  {/* Mini chart placeholder */}
                  <div className="flex items-end gap-px h-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className={`w-1 bg-current rounded-full animate-luxury-chart-${i}`}
                        style={{ height: `${25 + Math.random() * 75}%` }} />
                    ))}
                  </div>
                </div>
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
    </div>
  );
}