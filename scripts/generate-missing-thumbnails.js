const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const THUMBS_DIR = path.join(process.cwd(), 'public', 'uploads', '_thumbs');

async function generateMissingThumbnails() {
  console.log('🔍 Checking for missing thumbnails...');
  
  try {
    // Create thumbs directory if it doesn't exist
    await fs.mkdir(THUMBS_DIR, { recursive: true });
    
    // Get all image files in uploads directory
    const files = await fs.readdir(UPLOAD_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|avif)$/i.test(file) && 
      !file.startsWith('_thumbs')
    );
    
    console.log(`📁 Found ${imageFiles.length} image files`);
    
    let generated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const file of imageFiles) {
      try {
        const originalPath = path.join(UPLOAD_DIR, file);
        const nameWithoutExt = file.replace(/\.[^.]+$/, '');
        const thumbPath = path.join(THUMBS_DIR, `${nameWithoutExt}.webp`);
        
        // Check if thumbnail already exists
        try {
          await fs.access(thumbPath);
          console.log(`⏭️  Skipping ${file} - thumbnail already exists`);
          skipped++;
          continue;
        } catch {
          // Thumbnail doesn't exist, create it
        }
        
        console.log(`🔄 Generating thumbnail for ${file}...`);
        
        // Generate thumbnail
        await sharp(originalPath)
          .resize(400, 400, { 
            fit: "cover", 
            position: "center",
            withoutEnlargement: false
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(thumbPath);
        
        console.log(`✅ Generated thumbnail for ${file}`);
        generated++;
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Generated: ${generated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    
    if (generated > 0) {
      console.log('\n🎉 Missing thumbnails generated successfully!');
    } else {
      console.log('\n✨ All thumbnails are up to date!');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
generateMissingThumbnails();
