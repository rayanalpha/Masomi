import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gold-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          صفحه مورد نظر یافت نشد
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
