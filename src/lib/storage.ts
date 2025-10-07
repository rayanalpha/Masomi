import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBS_DIR = path.join(UPLOAD_DIR, "_thumbs");
const BUCKET = "uploads";

function isSupabaseEnabled() {
  return (
    typeof process.env.SUPABASE_URL === "string" &&
    process.env.SUPABASE_URL.length > 0 &&
    typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string" &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0
  );
}

function sanitizeBaseName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extFromContentType(ct: string) {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return map[ct] || "bin";
}

export async function saveImage(params: { buffer: Buffer; baseName: string; contentType: string }): Promise<{ url: string; thumbUrl: string }> {
  console.log('[Storage] saveImage called:', {
    baseName: params.baseName,
    contentType: params.contentType,
    bufferSize: params.buffer.length,
    supabaseEnabled: isSupabaseEnabled()
  });
  
  // Enhanced validation
  if (!params.buffer || params.buffer.length === 0) {
    throw new Error('Invalid buffer: empty or null');
  }
  
  if (!params.contentType || !params.contentType.startsWith('image/')) {
    throw new Error(`Invalid content type: ${params.contentType}`);
  }
  
  const base = sanitizeBaseName(params.baseName || "upload");
  const ext = extFromContentType(params.contentType);
  const timestamp = Date.now();
  const filename = `${timestamp}_${base}.${ext}`;
  
  console.log('[Storage] Generated filename:', filename);

  // Create thumbnail 400x400 (cover) with enhanced error handling
  console.log('[Storage] Generating thumbnail...');
  let thumbBuffer: Buffer | null = null;
  
  try {
    // Validate image buffer before processing
    const image = sharp(params.buffer);
    const metadata = await image.metadata();
    
    console.log('[Storage] Image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size
    });
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: no dimensions');
    }
    
    // Security: Validate image dimensions to prevent memory exhaustion
    const MAX_IMAGE_DIMENSION = 10000; // 10000x10000 pixels max
    if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
      throw new Error(
        `Image too large: ${metadata.width}x${metadata.height}. ` +
        `Maximum allowed: ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`
      );
    }
    
    // Process with timeout to prevent hanging
    const processWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Image processing timeout')), timeoutMs)
        )
      ]);
    };
    
    thumbBuffer = await processWithTimeout(
      image
        .resize(400, 400, { 
          fit: "cover", 
          position: "center",
          withoutEnlargement: false
        })
        .webp({ quality: 85, effort: 6 }) // Use WebP for better compression
        .toBuffer(),
      10000 // 10 second timeout
    );
      
    console.log('[Storage] Thumbnail generated successfully:', {
      originalSize: params.buffer.length,
      thumbSize: thumbBuffer.length
    });
    
  } catch (e) {
    console.error('[Storage] Thumbnail generation failed:', e);
    thumbBuffer = null;
  }

  if (isSupabaseEnabled()) {
    console.log('[Storage] Using Supabase storage...');
    
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!, 
        {
          auth: { persistSession: false },
        }
      );
      
      console.log('[Storage] Supabase client created');
      
      // Test bucket access first
      console.log('[Storage] Testing bucket access...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('[Storage] Bucket access error:', bucketError);
        throw new Error(`Bucket access failed: ${bucketError.message}`);
      }
      
      console.log('[Storage] Available buckets:', buckets?.map(b => b.name));
      
      const bucketExists = buckets?.some(b => b.name === BUCKET);
      if (!bucketExists) {
        console.error(`[Storage] Bucket '${BUCKET}' not found`);
        throw new Error(`Bucket '${BUCKET}' not found`);
      }

      // Upload original image
      console.log('[Storage] Uploading original file to Supabase:', filename);
      const { data: uploadData, error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filename, params.buffer, {
          contentType: params.contentType,
          upsert: true,
          cacheControl: "31536000",
          duplex: 'half'
        });
      
      if (upErr) {
        console.error('[Storage] Supabase upload error:', {
          message: upErr.message,
          statusCode: (upErr as any).statusCode,
          error: upErr
        });
        throw new Error(`Upload failed: ${upErr.message}`);
      }
      
      console.log('[Storage] Original file uploaded successfully:', uploadData?.path);

      // Upload thumbnail (if generated)
      if (thumbBuffer) {
        console.log('[Storage] Uploading thumbnail to Supabase...');
        const thumbFilename = `_thumbs/${filename.replace(/\.[^.]+$/, '.webp')}`; // Use .webp for thumbs
        
        const { data: thumbData, error: thErr } = await supabase.storage
          .from(BUCKET)
          .upload(thumbFilename, thumbBuffer, {
            contentType: 'image/webp',
            upsert: true,
            cacheControl: "31536000",
            duplex: 'half'
          });
        
        if (thErr) {
          console.error('[Storage] Supabase thumbnail upload error:', thErr);
          // Don't fail the whole operation for thumbnail errors
          console.warn('[Storage] Continuing without thumbnail');
        } else {
          console.log('[Storage] Thumbnail uploaded successfully:', thumbData?.path);
        }
      }

      console.log('[Storage] Returning Supabase URLs');
      // Return proxied URLs (served via Next route /uploads)
      return {
        url: `/uploads/${filename}`,
        thumbUrl: `/uploads/_thumbs/${filename.replace(/\.[^.]+$/, '.webp')}`,
      };
      
    } catch (supabaseError) {
      console.error('[Storage] Supabase operation failed:', supabaseError);
      console.log('[Storage] Falling back to local storage...');
      // Continue to local storage fallback
    }
  }

  // Local filesystem fallback (development or Supabase failure)
  console.log('[Storage] Using local filesystem storage...');
  console.log('[Storage] Creating directories:', { UPLOAD_DIR, THUMBS_DIR });
  
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBS_DIR, { recursive: true });
    console.log('[Storage] Directories created successfully');

    const filepath = path.join(UPLOAD_DIR, filename);
    console.log('[Storage] Writing original file to:', filepath);
    await fs.writeFile(filepath, params.buffer);
    console.log('[Storage] Original file written successfully');

    if (thumbBuffer) {
      const thumbFilename = filename.replace(/\.[^.]+$/, '.webp');
      const thumbPath = path.join(THUMBS_DIR, thumbFilename);
      console.log('[Storage] Writing thumbnail to:', thumbPath);
      await fs.writeFile(thumbPath, thumbBuffer);
      console.log('[Storage] Thumbnail written successfully');
    }

    console.log('[Storage] Local storage completed successfully');
    return {
      url: `/uploads/${filename}`,
      thumbUrl: `/uploads/_thumbs/${filename.replace(/\.[^.]+$/, '.webp')}`,
    };
    
  } catch (localError) {
    console.error('[Storage] Local storage failed:', localError);
    throw new Error(`Storage operation failed: ${localError instanceof Error ? localError.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image and its thumbnail from storage
 * 
 * @param imageUrl - The URL of the image to delete (e.g., "/uploads/123_image.jpg")
 * @returns Promise<void>
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
    console.warn('[Storage] Invalid image URL for deletion:', imageUrl);
    return;
  }

  // Extract filename from URL
  const filename = imageUrl.replace('/uploads/', '');
  
  console.log('[Storage] Deleting image:', filename);

  if (isSupabaseEnabled()) {
    console.log('[Storage] Deleting from Supabase storage...');
    
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!, 
        process.env.SUPABASE_SERVICE_ROLE_KEY!, 
        {
          auth: { persistSession: false },
        }
      );

      // Delete original image
      const { error: deleteError } = await supabase.storage
        .from(BUCKET)
        .remove([filename]);
      
      if (deleteError) {
        console.error('[Storage] Supabase delete error:', deleteError);
        // Don't throw - continue to try deleting thumbnail
      } else {
        console.log('[Storage] Original image deleted from Supabase');
      }

      // Delete thumbnail
      const thumbFilename = `_thumbs/${filename.replace(/\.[^.]+$/, '.webp')}`;
      const { error: thumbDeleteError } = await supabase.storage
        .from(BUCKET)
        .remove([thumbFilename]);
      
      if (thumbDeleteError) {
        console.error('[Storage] Supabase thumbnail delete error:', thumbDeleteError);
      } else {
        console.log('[Storage] Thumbnail deleted from Supabase');
      }

      return;
      
    } catch (supabaseError) {
      console.error('[Storage] Supabase deletion failed:', supabaseError);
      // Continue to local storage fallback
    }
  }

  // Local filesystem fallback
  console.log('[Storage] Deleting from local filesystem...');
  
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Delete original image
    try {
      await fs.unlink(filepath);
      console.log('[Storage] Original image deleted from local storage');
    } catch (err: any) {
      if (err.code !== 'ENOENT') { // Ignore "file not found" errors
        console.error('[Storage] Failed to delete original image:', err);
      }
    }

    // Delete thumbnail
    const thumbFilename = filename.replace(/\.[^.]+$/, '.webp');
    const thumbPath = path.join(THUMBS_DIR, thumbFilename);
    
    try {
      await fs.unlink(thumbPath);
      console.log('[Storage] Thumbnail deleted from local storage');
    } catch (err: any) {
      if (err.code !== 'ENOENT') { // Ignore "file not found" errors
        console.error('[Storage] Failed to delete thumbnail:', err);
      }
    }
    
  } catch (localError) {
    console.error('[Storage] Local deletion failed:', localError);
    // Don't throw - deletion is best-effort
  }
}

/**
 * Delete multiple images in batch
 * 
 * @param imageUrls - Array of image URLs to delete
 * @returns Promise<void>
 */
export async function deleteImages(imageUrls: string[]): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) {
    return;
  }

  console.log('[Storage] Batch deleting images:', imageUrls.length);

  // Delete images in parallel for better performance
  await Promise.allSettled(
    imageUrls.map(url => deleteImage(url))
  );

  console.log('[Storage] Batch deletion completed');
}
