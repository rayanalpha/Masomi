import { NextResponse } from "next/server";
import { withApiHandler, requireAuth, rateLimit, ApiHandlerContext } from '@/lib/api-middleware';
import { saveImage } from "@/lib/storage";
import { logger } from '@/lib/logger';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = withApiHandler(
  requireAuth(['ADMIN', 'MANAGER'])(
    rateLimit(10, 60000)( // 10 uploads per minute
      async (context: ApiHandlerContext) => {
        logger.info('Upload request started', context.context);
        
        const contentType = context.request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
          logger.warn('Invalid content type for upload', { 
            ...context.context, 
            contentType 
          });
          
          const { ApiException } = await import('@/lib/api-middleware');
          throw new ApiException(
            'Content-Type must be multipart/form-data',
            415,
            'INVALID_CONTENT_TYPE'
          );
        }

        logger.debug('Parsing form data', context.context);
        const form = await context.request.formData();
        const file = form.get("file");
        
        const fileInfo = {
          hasFile: !!file,
          fileName: file instanceof File ? file.name : 'not file',
          fileType: file instanceof File ? file.type : 'not file',
          fileSize: file instanceof File ? file.size : 'not file'
        };
        
        logger.debug('Form data parsed', { ...context.context, fileInfo });
        
        if (!(file instanceof File)) {
          logger.warn('No valid file found in form data', context.context);
          
          const { ApiException } = await import('@/lib/api-middleware');
          throw new ApiException(
            'No file provided or invalid file format',
            400,
            'NO_FILE_PROVIDED'
          );
        }

        // Enhanced validation with detailed logging
        if (!ALLOWED_TYPES.has(file.type)) {
          logger.warn('Invalid file type uploaded', {
            ...context.context,
            fileType: file.type,
            allowedTypes: Array.from(ALLOWED_TYPES)
          });
          
          const { ApiException } = await import('@/lib/api-middleware');
          throw new ApiException(
            `Invalid file type: ${file.type}. Allowed types: ${Array.from(ALLOWED_TYPES).join(', ')}`,
            400,
            'INVALID_FILE_TYPE',
            { fileType: file.type, allowedTypes: Array.from(ALLOWED_TYPES) }
          );
        }
        
        if (file.size > MAX_FILE_SIZE) {
          logger.warn('File size exceeds limit', {
            ...context.context,
            fileSize: file.size,
            maxSize: MAX_FILE_SIZE
          });
          
          const { ApiException } = await import('@/lib/api-middleware');
          throw new ApiException(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            400,
            'FILE_TOO_LARGE',
            { fileSize: file.size, maxSize: MAX_FILE_SIZE }
          );
        }

        const baseName = (form.get("name")?.toString() || file.name || "upload")
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[^a-zA-Z0-9_-]/g, "_") // Sanitize
          .substring(0, 50); // Limit length
        
        const processInfo = {
          originalName: file.name,
          sanitizedBaseName: baseName,
          size: file.size,
          type: file.type
        };
        
        logger.info('Processing file upload', { ...context.context, processInfo });
        
        // Convert to buffer with error handling
        logger.debug('Converting file to buffer', context.context);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        if (buffer.length === 0) {
          logger.error('Empty file buffer created', context.context);
          
          const { ApiException } = await import('@/lib/api-middleware');
          throw new ApiException(
            'File appears to be empty',
            400,
            'EMPTY_FILE'
          );
        }
        
        logger.debug('File buffer created', { 
          ...context.context, 
          bufferSize: buffer.length 
        });

        // Save image with performance tracking
        const saveStart = Date.now();
        logger.info('Starting image save operation', context.context);
        
        try {
          const result = await saveImage({ 
            buffer, 
            baseName, 
            contentType: file.type 
          });
          
          const saveDuration = Date.now() - saveStart;
          
          logger.info('Image upload completed successfully', {
            ...context.context,
            result,
            saveDuration,
            fileSize: file.size,
            fileName: file.name
          });
          
          return NextResponse.json({
            success: true,
            ...result,
            uploadInfo: {
              originalName: file.name,
              size: file.size,
              type: file.type,
              duration: saveDuration
            },
            requestId: context.context.requestId
          }, { status: 201 });
          
        } catch (saveError) {
          const saveDuration = Date.now() - saveStart;
          
          logger.error('Image save operation failed', saveError, {
            ...context.context,
            saveDuration,
            fileInfo: processInfo
          });
          
          const { ApiException } = await import('@/lib/api-middleware');
          throw new ApiException(
            'Failed to save uploaded image',
            500,
            'SAVE_FAILED',
            { 
              originalError: saveError instanceof Error ? saveError.message : 'Unknown error',
              fileInfo: processInfo,
              saveDuration
            }
          );
        }
      }
    )
  )
);

