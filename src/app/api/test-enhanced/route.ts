import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiHandler, requireAuth, validateRequest, rateLimit, ApiHandlerContext } from '@/lib/api-middleware';
import { withDatabaseRetry } from '@/lib/db-serverless';
import { logger } from '@/lib/logger';

// Request validation schema
const testRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  message: z.string().optional()
});

/**
 * GET /api/test-enhanced - Test endpoint with enhanced middleware
 */
export const GET = withApiHandler(
  rateLimit(50, 60000)( // 50 requests per minute
    async (context: ApiHandlerContext) => {
      logger.info('Test GET endpoint called', context.context);
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        requestId: context.context.requestId,
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };
      
      return NextResponse.json(healthInfo);
    }
  )
);

/**
 * POST /api/test-enhanced - Test endpoint with auth and validation
 */
export const POST = withApiHandler(
  requireAuth(['ADMIN', 'MANAGER'])(
    validateRequest(testRequestSchema)(
      rateLimit(20, 60000)( // 20 requests per minute for authenticated endpoints
        async (context: ApiHandlerContext) => {
          const validatedData = (context as any).validatedData as z.infer<typeof testRequestSchema>;
          
          logger.info('Test POST endpoint called', {
            ...context.context,
            requestData: validatedData
          });
          
          // Simulate database operation
          const result = await withDatabaseRetry(async (prisma) => {
            // Example: Count users (just for testing)
            const userCount = await prisma.user.count();
            
            logger.dbOperation('user.count', 'user', context.performance.end());
            
            return {
              userCount,
              processedData: {
                name: validatedData.name.toUpperCase(),
                email: validatedData.email.toLowerCase(),
                message: validatedData.message || 'No message provided'
              }
            };
          });
          
          return NextResponse.json({
            success: true,
            requestId: context.context.requestId,
            data: result
          }, { status: 201 });
        }
      )
    )
  )
);

/**
 * PUT /api/test-enhanced - Test error handling
 */
export const PUT = withApiHandler(
  requireAuth(['ADMIN'])(
    async (context: ApiHandlerContext) => {
      const url = new URL(context.request.url);
      const shouldError = url.searchParams.get('error');
      
      if (shouldError === 'validation') {
        // This will be caught by the middleware
        throw new Error('This is a test validation error');
      }
      
      if (shouldError === 'database') {
        // Simulate a database error
        throw new Error('Prisma client error: Connection failed');
      }
      
      if (shouldError === 'custom') {
        // Use our custom ApiException
        const { ApiException } = await import('@/lib/api-middleware');
        throw new ApiException(
          'This is a custom API error',
          422,
          'CUSTOM_ERROR',
          { additionalInfo: 'Test error details' }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'No error occurred',
        requestId: context.context.requestId
      });
    }
  )
);

/**
 * DELETE /api/test-enhanced - Test security events
 */
export const DELETE = withApiHandler(
  async (context: ApiHandlerContext) => {
    // This endpoint is not protected - will trigger security events
    logger.securityEvent(
      'Unprotected DELETE endpoint accessed',
      'warn',
      context.context
    );
    
    return NextResponse.json({
      warning: 'This is an unprotected endpoint',
      requestId: context.context.requestId
    }, { status: 200 });
  }
);