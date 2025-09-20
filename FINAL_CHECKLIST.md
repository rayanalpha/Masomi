# 🔥 چک‌لیست نهایی برای Deploy موفق در Netlify

## ✅ فایل‌های اصلاح شده:

### Configuration Files:
- [x] `package.json` - همه dependencies در جای صحیح
- [x] `netlify.toml` - بدون خطای syntax

### Core Libraries:
- [x] `src/lib/prisma.ts` - مدیریت اتصالات برای serverless
- [x] `src/lib/db-serverless.ts` - Retry logic و error handling
- [x] `src/lib/server-data.ts` - توابع data fetching (با fix TypeScript)

### Main Pages:
- [x] `src/app/page.tsx` - صفحه اصلی
- [x] `src/app/catalog/page.tsx` - کاتالوگ
- [x] `src/app/product/[slug]/page.tsx` - صفحه محصول
- [x] `src/app/error.tsx` - Error boundary

### Admin Pages (اصلاح شده):
- [x] `src/app/admin/page.tsx` - داشبورد
- [x] `src/app/admin/products/page.tsx` - لیست محصولات
- [x] `src/app/admin/attributes/page.tsx` - ویژگی‌ها
- [x] `src/app/admin/categories/page.tsx` - دسته‌ها
- [x] `src/app/admin/coupons/page.tsx` - کوپن‌ها
- [x] `src/app/admin/orders/page.tsx` - سفارشات

## ⚠️ فایل‌هایی که هنوز باید دستی اصلاح شوند:

### Admin [id] Pages:
- [ ] `src/app/admin/attributes/[id]/page.tsx`
- [ ] `src/app/admin/coupons/[id]/page.tsx`
- [ ] `src/app/admin/orders/[id]/page.tsx`
- [ ] `src/app/admin/products/[id]/page.tsx`
- [ ] `src/app/admin/products/[id]/ProductImagesPanel.tsx`
- [ ] `src/app/admin/products/[id]/variations/page.tsx`

## الگوی صحیح برای اصلاح هر فایل:

### 1. تغییر Import:
```typescript
// قبل:
import prisma from "@/lib/prisma";

// بعد:
import { withDatabaseRetry } from "@/lib/db-serverless";
```

### 2. اضافه کردن Exports:
```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

### 3. Wrap کردن Database Queries:
```typescript
// قبل:
const data = await prisma.model.findMany();

// بعد:
const data = await withDatabaseRetry(async (prisma) => {
  return await prisma.model.findMany();
});
```

## مشکلات شناخته شده که حل شدند:

1. ✅ **Syntax Error** - کاراکترهای `n در فایل‌ها
2. ✅ **TypeScript Error** - در `server-data.ts`
3. ✅ **Module Not Found** - پکیج‌های Tailwind و TypeScript
4. ✅ **Connection Pool Issues** - با استفاده از withDatabaseRetry

## تست نهایی قبل از Push:

### Local Build Test:
```bash
npm run build
```

### اگر build لوکال موفق بود:
1. همه فایل‌ها را commit کنید
2. Push به repository
3. منتظر Netlify build باشید

## نکات مهم:

### برای فایل‌های [id]:
PowerShell ممکن است با bracket notation مشکل داشته باشد. این فایل‌ها را دستی در VS Code یا IDE خود اصلاح کنید.

### الگوی کامل برای فایل‌های [id]:
```typescript
import { withDatabaseRetry } from "@/lib/db-serverless";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PageName({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const data = await withDatabaseRetry(async (prisma) => {
    return await prisma.model.findUnique({ 
      where: { id },
      // include relations if needed
    });
  });
  
  if (!data) {
    return <div>Not found</div>;
  }
  
  // rest of component...
}
```

## وضعیت نهایی:

- **Build Errors:** باید برطرف شده باشد
- **TypeScript Errors:** حل شده
- **Database Connections:** مدیریت صحیح برای serverless
- **Caching:** غیرفعال برای dynamic data

## قدم آخر:

اگر همچنان خطایی وجود دارد، لاگ دقیق خطا را بررسی کنید و فایل مربوطه را طبق الگوی بالا اصلاح کنید.