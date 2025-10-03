import { NextRequest, NextResponse } from 'next/server';
import { logger, createRequestContext, createPerformanceTracker, LogContext } from './logger';

/**
 * Enhanced API Middleware with Error Handling and Logging
 */

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ApiException extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface ApiHandlerContext {
  request: NextRequest;
  context: LogContext;
  performance: ReturnType<typeof createPerformanceTracker>;
}

export type ApiHandler = (context: ApiHandlerContext) => Promise<NextResponse>;

/**
 * Wraps API handlers with logging, error handling, and performance tracking
 */
export function withApiHandler(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestContext = createRequestContext(request);
    const performance = createPerformanceTracker();
    
    logger.apiRequest(requestContext.method!, requestContext.url!, requestContext);
    
    try {
      const response = await handler({
        request,
        context: requestContext,
        performance
      });
      
      const duration = performance.end();
      const status = response.status;
      
      logger.apiResponse(
        requestContext.method!, 
        requestContext.url!, 
        status, 
        duration, 
        requestContext
      );
      
      // Add standard headers
      response.headers.set('X-Request-ID', requestContext.requestId!);
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      return response;
      
    } catch (error) {
      const duration = performance.end();
      
      // Handle different types of errors
      if (error instanceof ApiException) {
        logger.error(
          `API Error: ${error.message}`,
          error,
          { ...requestContext, statusCode: error.statusCode, code: error.code }
        );
        
        return NextResponse.json({
          error: error.message,
          code: error.code,
          details: error.details,
          requestId: requestContext.requestId
        }, { 
          status: error.statusCode,
          headers: {
            'X-Request-ID': requestContext.requestId!,
            'X-Response-Time': `${duration}ms`
          }
        });
      }
      
      // Handle validation errors (Zod)
      if (error && typeof error === 'object' && 'issues' in error) {
        logger.warn('Validation Error', { ...requestContext, validationIssues: error });
        
        return NextResponse.json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error,
          requestId: requestContext.requestId
        }, { 
          status: 400,
          headers: {
            'X-Request-ID': requestContext.requestId!,
            'X-Response-Time': `${duration}ms`
          }
        });
      }
      
      // Handle database errors
      if (error instanceof Error) {
        const isDatabaseError = error.message.includes('Prisma') || 
                               error.message.includes('database') ||
                               (error as any).code?.startsWith('P');
        
        if (isDatabaseError) {
          logger.dbError('API database operation', error, requestContext);
        } else {
          logger.error('Unhandled API error', error, requestContext);
        }
        
        // Don't expose internal errors in production
        const message = process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message;
        
        return NextResponse.json({
          error: message,
          code: 'INTERNAL_ERROR',
          requestId: requestContext.requestId
        }, { 
          status: 500,
          headers: {
            'X-Request-ID': requestContext.requestId!,
            'X-Response-Time': `${duration}ms`
          }
        });
      }
      
      // Unknown error type
      logger.fatal('Unknown error type in API handler', error, requestContext);
      
      return NextResponse.json({
        error: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        requestId: requestContext.requestId
      }, { 
        status: 500,
        headers: {
          'X-Request-ID': requestContext.requestId!,
          'X-Response-Time': `${duration}ms`
        }
      });
    }
  };
}

/**
 * Authentication middleware
 */
export function requireAuth(roles: string[] = ['ADMIN', 'MANAGER']) {
  return (handler: ApiHandler): ApiHandler => {
    return async (context) => {
      const { getServerSession } = await import('next-auth');
      const { authOptions } = await import('@/server/auth');
      
      try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
          logger.securityEvent('Unauthorized API access attempt', 'warn', context.context);
          throw new ApiException('Authentication required', 401, 'AUTH_REQUIRED');
        }
        
        const userRole = (session.user as any).role;
        if (!roles.includes(userRole)) {
          logger.securityEvent(
            `Insufficient permissions for role ${userRole}`, 
            'warn', 
            { ...context.context, userId: session.user.email, requiredRoles: roles }
          );
          throw new ApiException('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
        }
        
        // Add user info to context
        context.context.userId = session.user.email || undefined;
        context.context.userRole = userRole;
        
        logger.authEvent('API access granted', session.user.email, context.context);
        
        return handler(context);
        
      } catch (error) {
        if (error instanceof ApiException) {
          throw error;
        }
        
        logger.error('Authentication check failed', error, context.context);
        throw new ApiException('Authentication failed', 500, 'AUTH_ERROR');
      }
    };
  };
}

/**
 * Request validation middleware using Zod
 */
export function validateRequest<T>(schema: any, field: 'body' | 'query' | 'params' = 'body') {
  return (handler: ApiHandler): ApiHandler => {
    return async (context) => {
      try {
        let data: any;
        
        switch (field) {
          case 'body':
            data = await context.request.json();
            break;
          case 'query':
            const url = new URL(context.request.url);
            data = Object.fromEntries(url.searchParams);
            break;
          case 'params':
            // This would need to be handled differently in practice
            data = {};
            break;
        }
        
        const validated = schema.parse(data);
        
        // Add validated data to context
        (context as any).validatedData = validated;
        
        logger.debug('Request validation successful', { 
          ...context.context, 
          field, 
          dataKeys: Object.keys(validated || {}) 
        });
        
        return handler(context);
        
      } catch (error) {
        logger.warn('Request validation failed', { ...context.context, error, field });
        throw error; // Let the main handler deal with validation errors
      }
    };
  };
}

/**
 * Rate limiting middleware with memory cleanup
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (handler: ApiHandler): ApiHandler => {
    return async (context) => {
      const clientId = context.request.headers.get('x-forwarded-for') || 
                      context.request.headers.get('x-real-ip') || 
                      'unknown';
      
      const now = Date.now();
      const clientData = rateLimitStore.get(clientId) || { count: 0, resetTime: now + windowMs };
      
      if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + windowMs;
      }
      
      clientData.count++;
      rateLimitStore.set(clientId, clientData);
      
      if (clientData.count > maxRequests) {
        logger.securityEvent(
          `Rate limit exceeded for client ${clientId}`, 
          'warn', 
          { ...context.context, clientId, count: clientData.count }
        );
        
        throw new ApiException(
          'Rate limit exceeded', 
          429, 
          'RATE_LIMIT_EXCEEDED',
          { resetTime: clientData.resetTime }
        );
      }
      
      return handler(context);
    };
  };
}

/**
 * CORS middleware
 */
export function cors(origins: string[] = ['http://localhost:3000']) {
  return (handler: ApiHandler): ApiHandler => {
    return async (context) => {
      const origin = context.request.headers.get('origin');
      const isAllowed = !origin || origins.includes(origin) || origins.includes('*');
      
      if (!isAllowed) {
        logger.securityEvent(
          `CORS blocked request from origin: ${origin}`, 
          'warn', 
          { ...context.context, origin, allowedOrigins: origins }
        );
        
        throw new ApiException('CORS policy violation', 403, 'CORS_VIOLATION');
      }
      
      const response = await handler(context);
      
      if (origin && origins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else if (origins.includes('*')) {
        response.headers.set('Access-Control-Allow-Origin', '*');
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    };
  };
}

export { logger };