'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          خطایی رخ داده است
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          متأسفیم، مشکلی در بارگذاری صفحه به وجود آمده است.
        </p>

        {error.message && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              جزئیات فنی (برای توسعه‌دهندگان)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition"
          >
            تلاش مجدد
          </button>
          
          <Link
            href="/"
            className="px-6 py-2 border border-gold-500 text-gold-500 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 transition"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}