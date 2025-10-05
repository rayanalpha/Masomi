'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoldPrice {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface CurrencyPrice {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function PriceTicker() {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
  const [currencyPrices, setCurrencyPrices] = useState<CurrencyPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPrices();
    // به‌روزرسانی هر 30 ثانیه
    const interval = setInterval(fetchPrices, 30000);
    // رفرش هنگام فوکوس تب
    const onFocus = () => fetchPrices();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const fetchPrices = async () => {
    try {
      if (!loading) {
        setIsUpdating(true);
      }
      setError(null);

      const response = await fetch('/api/prices', { cache: 'no-store' });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'خطا در دریافت قیمت‌ها');
      }

      setGoldPrices(result.data.gold);
      setCurrencyPrices(result.data.currency);
      setLastUpdated(new Date());
      setLoading(false);
      setIsUpdating(false);
    } catch (err) {
      setError('خطا در دریافت قیمت‌ها');
      setLoading(false);
      setIsUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(change)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border border-gold-500/20 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gold-500 border-t-transparent" />
          <span className="mr-3 text-gold-500 font-medium">در حال دریافت قیمت‌ها...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6">
        <div className="text-center text-red-400">
          <p className="font-medium">{error}</p>
          <button 
            onClick={fetchPrices}
            className="mt-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border border-gold-500/20 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gold-500">قیمت‌های لحظه‌ای</h3>
          {isUpdating && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold-500 border-t-transparent" />
          )}
        </div>
        <p className="text-gray-400 text-sm">
          آخرین به‌روزرسانی: {lastUpdated ? lastUpdated.toLocaleString('fa-IR') : 'در حال بارگذاری...'}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          به‌روزرسانی خودکار هر 1 دقیقه
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* قیمت طلا */}
        <div>
          <h4 className="text-xl font-semibold text-gold-400 mb-4 flex items-center">
            <span className="ml-2">🥇</span>
            قیمت طلا
          </h4>
          <div className="space-y-3">
            <AnimatePresence>
              {goldPrices.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gold-500/10"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-white">{item.name}</h5>
                      <p className="text-2xl font-bold text-gold-400">
                        {formatPrice(item.price)} تومان
                      </p>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                        {getChangeIcon(item.change)} {formatChange(item.change, item.changePercent)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* قیمت ارز */}
        <div>
          <h4 className="text-xl font-semibold text-gold-400 mb-4 flex items-center">
            <span className="ml-2">💱</span>
            قیمت ارز
          </h4>
          <div className="space-y-3">
            <AnimatePresence>
              {currencyPrices.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gold-500/10"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-white">{item.name}</h5>
                      <p className="text-2xl font-bold text-gold-400">
                        {formatPrice(item.price)} تومان
                      </p>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                        {getChangeIcon(item.change)} {formatChange(item.change, item.changePercent)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          * قیمت‌ها به‌روزرسانی خودکار دارند و ممکن است با قیمت‌های واقعی تفاوت داشته باشند
        </p>
      </div>
    </div>
  );
}
