import { NextRequest, NextResponse } from 'next/server';
import { withDatabaseRetry } from '@/lib/db-serverless';
import { withCsrfProtection } from '@/lib/csrf';
import fs from 'fs/promises';
import path from 'path';

export const DELETE = withCsrfProtection(async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // حذف کامل محصول از دیتابیس و فایل‌ها
    await withDatabaseRetry(async (prisma) => {
      // ابتدا اطلاعات محصول و تصاویرش را دریافت می‌کنیم
      const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true }
      });

      if (!product) {
        throw new Error('محصول پیدا نشد');
      }

      // حذف فایل‌های تصاویر از سیستم فایل
      const imageDeletions = product.images.map(async (image) => {
        try {
          // حذف فایل اصلی
          const imagePath = path.join(process.cwd(), 'public', image.url);
          
          // بررسی وجود فایل قبل از حذف
          try {
            await fs.access(imagePath);
            await fs.unlink(imagePath);
            console.log(`Image deleted: ${imagePath}`);
          } catch (accessError) {
            console.warn(`Image file not found, skipping: ${image.url}`);
          }
        } catch (fileError) {
          console.warn(`Failed to delete image file: ${image.url}`, fileError);
          // ادامه می‌دهیم حتی اگر فایل پاک نشود
        }
      });

      // منتظر حذف همه فایل‌ها می‌مانیم
      await Promise.allSettled(imageDeletions);

      // حذف رکوردهای تصاویر از دیتابیس
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });

      // حذف ارتباطات دسته‌بندی
      await prisma.product.update({
        where: { id },
        data: {
          categories: {
            set: [] // حذف همه ارتباطات دسته‌بندی
          }
        }
      });

      // حذف محصول اصلی
      await prisma.product.delete({
        where: { id }
      });

      return { success: true };
    });

    return NextResponse.json({
      success: true,
      message: 'محصول با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('DELETE_PRODUCT_ERROR:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در حذف محصول' 
      },
      { status: 500 }
    );
  }
});