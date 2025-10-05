import { promises as fs } from 'fs';
import path from 'path';

/**
 * بررسی وجود تامبنیل و بازگرداندن URL مناسب
 */
export async function getOptimalImageUrl(originalUrl: string): Promise<string> {
  // اگر تصویر خارجی است، همان را برگردان
  if (!originalUrl.startsWith("/uploads/")) {
    return originalUrl;
  }

  const filename = originalUrl.replace("/uploads/", "");
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
  
  // لیست فرمت‌های تامبنیل به ترتیب اولویت
  const possibleThumbnails = [
    `/uploads/_thumbs/${nameWithoutExt}.webp`,  // WebP (ترجیح داده شده)
    `/uploads/_thumbs/${nameWithoutExt}.jpeg`,  // JPEG
    `/uploads/_thumbs/${nameWithoutExt}.jpg`,   // JPG
  ];
  
  // بررسی وجود تامبنیل
  for (const thumbPath of possibleThumbnails) {
    try {
      const fullPath = path.join(process.cwd(), "public", thumbPath);
      await fs.access(fullPath);
      return thumbPath; // تامبنیل موجود است
    } catch {
      // ادامه به فرمت بعدی
    }
  }
  
  // اگر تامبنیل موجود نباشد، تصویر اصلی را برگردان
  return originalUrl;
}

/**
 * دریافت URL تصویر برای نمایش در اسلایدشو
 */
export async function getSliderImageUrl(originalUrl: string): Promise<string> {
  // برای اسلایدشو، همیشه تصویر اصلی را استفاده کنیم
  // چون تامبنیل‌ها ممکن است موجود نباشند
  return originalUrl;
}

/**
 * دریافت URL تصویر برای نمایش در جستجو
 */
export async function getSearchImageUrl(originalUrl: string): Promise<string> {
  return getOptimalImageUrl(originalUrl);
}

/**
 * دریافت URL تصویر برای نمایش در محصولات ویژه
 */
export async function getFeaturedImageUrl(originalUrl: string): Promise<string> {
  return getOptimalImageUrl(originalUrl);
}
