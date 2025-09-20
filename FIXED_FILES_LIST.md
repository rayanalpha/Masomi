# ✅ لیست کامل فایل‌های اصلاح شده

## تغییرات Configuration:

### 1. `package.json` ✅
- همه build dependencies به `dependencies` منتقل شدند
- شامل: `@types/react`, `@types/react-dom`, `typescript`, `tailwindcss`, `@tailwindcss/postcss`

### 2. `netlify.toml` ✅  
- حذف syntax error در timeout
- تنظیمات صحیح برای environment variables

## فایل‌های جدید ایجاد شده:

### 3. `src/lib/server-data.ts` ✅
- توابع `fetchProducts()`, `fetchProductBySlug()`, `fetchCategories()` 
- مدیریت امن اتصالات دیتابیس برای serverless

### 4. `src/app/error.tsx` ✅
- Error boundary برای مدیریت خطاها
- نمایش پیام‌های کاربرپسند

## فایل‌های Server Components اصلاح شده:

### Pages اصلی:
- ✅ `src/app/page.tsx` - صفحه اصلی
- ✅ `src/app/catalog/page.tsx` - کاتالوگ  
- ✅ `src/app/product/[slug]/page.tsx` - صفحه محصول

### Admin Pages:
- ✅ `src/app/admin/page.tsx` - داشبورد ادمین
- ✅ `src/app/admin/products/page.tsx` - لیست محصولات
- ✅ `src/app/admin/attributes/page.tsx` - مدیریت ویژگی‌ها
- ✅ `src/app/admin/categories/page.tsx` - مدیریت دسته‌ها  
- ✅ `src/app/admin/coupons/page.tsx` - مدیریت کوپن‌ها
- ✅ `src/app/admin/orders/page.tsx` - مدیریت سفارشات

## تغییرات کلیدی در هر فایل:

### قبل:
```typescript
import prisma from "@/lib/prisma";
const data = await prisma.product.findMany();
```

### بعد:
```typescript
import { withDatabaseRetry } from "@/lib/db-serverless";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const data = await withDatabaseRetry(async (prisma) => {
  return await prisma.product.findMany();
});
```

## فایل‌هایی که هنوز نیاز به بررسی دستی دارند:

⚠️ فایل‌های داخل فولدرهای `[id]` ممکن است نیاز به اصلاح دستی داشته باشند:
- `src/app/admin/*/[id]/page.tsx`

## نکات مهم:

1. **همه Server Components** باید از `withDatabaseRetry()` استفاده کنند
2. **Export های ضروری** برای هر page:
   - `export const dynamic = "force-dynamic"`
   - `export const revalidate = 0`
3. **عدم استفاده مستقیم از Prisma** در Server Components

## چک‌لیست نهایی قبل از Push:

- [ ] تمام فایل‌های لیست شده بالا اصلاح شده‌اند
- [ ] `package.json` شامل همه dependencies لازم است
- [ ] `netlify.toml` بدون خطای syntax است
- [ ] تست local با `npm run build` موفق است

## دستور تست Local:
```bash
npm run build
```

اگر build لوکال موفق بود، آماده push هستید! 🚀