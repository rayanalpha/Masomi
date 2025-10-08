const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
const outputPath = path.join(process.cwd(), 'public', 'images', 'logo-splash.png');

async function optimizeLogo() {
  try {
    // بررسی وجود فایل ورودی
    if (!fs.existsSync(inputPath)) {
      console.error('❌ فایل لوگو یافت نشد:', inputPath);
      return;
    }

    console.log('🔄 در حال بهینه‌سازی لوگو برای splash screen...');
    
    // دریافت ابعاد فایل اصلی
    const metadata = await sharp(inputPath).metadata();
    console.log(`📏 ابعاد اصلی: ${metadata.width} x ${metadata.height}`);
    console.log(`📦 حجم اصلی: ${(fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)} MB`);

    // بهینه‌سازی برای splash screen:
    // - کاهش ابعاد به حداکثر 400px width
    // - کیفیت بالا ولی حجم کم
    // - فرمت PNG با compression
    await sharp(inputPath)
      .resize(400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .png({ 
        quality: 90,
        compressionLevel: 6,
        palette: true
      })
      .toFile(outputPath);

    // بررسی نتایج
    const newMetadata = await sharp(outputPath).metadata();
    const newSize = fs.statSync(outputPath).size;
    
    console.log(`✅ لوگو بهینه‌سازی شد!`);
    console.log(`📏 ابعاد جدید: ${newMetadata.width} x ${newMetadata.height}`);
    console.log(`📦 حجم جدید: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`🎯 کاهش حجم: ${(((fs.statSync(inputPath).size - newSize) / fs.statSync(inputPath).size) * 100).toFixed(1)}%`);
    console.log(`💾 فایل ذخیره شد: ${outputPath}`);

  } catch (error) {
    console.error('❌ خطا در بهینه‌سازی:', error);
  }
}

optimizeLogo();