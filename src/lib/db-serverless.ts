import { PrismaClient } from '@prisma/client';
import { prisma as globalPrisma } from './prisma';

/**
 * Enhanced Serverless Database Utilities
 * Provides robust database operations with proper connection management
 */

// Enhanced error detection for retryable errors
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code;
  
  // Prepared statement conflicts
  const hasPreparedStatementError = (
    code === 'P2030' ||
    code === '42P05' ||
    message.includes('prepared statement') ||
    message.includes('already exists') ||
    message.includes('duplicate prepared statement')
  );
  
  // Connection issues
  const hasConnectionError = (
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1008' ||
    code === 'P1017' ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('enotfound')
  );
  
  // Transaction conflicts
  const hasTransactionError = (
    code === 'P2034' ||
    message.includes('transaction') ||
    message.includes('deadlock')
  );
  
  return hasPreparedStatementError || hasConnectionError || hasTransactionError;
}

// Calculate backoff delay with jitter
function calculateBackoffDelay(attempt: number, baseDelay: number = 200): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 100; // Add randomness to prevent thundering herd
  return Math.min(exponentialDelay + jitter, 5000); // Cap at 5 seconds
}

// Enhanced retry wrapper with intelligent error handling
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 200
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB] Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`[DB] Operation succeeded after ${attempt} attempts`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      console.error(`[DB] Attempt ${attempt}/${maxRetries} failed:`, {
        code: error.code,
        message: error.message?.substring(0, 200)
      });
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        console.error('[DB] Non-retryable error, failing immediately');
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt >= maxRetries) {
        console.error(`[DB] All ${maxRetries} retry attempts exhausted`);
        break;
      }
      
      // Calculate delay and wait before retrying
      const delay = calculateBackoffDelay(attempt, baseDelay);
      console.log(`[DB] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Enhanced database operation wrapper
export async function withDatabase<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const isDev = process.env.NODE_ENV === "development";
  
  try {
    // Use global singleton Prisma client (managed by prisma.ts)
    if (isDev) {
      console.log('[DB] Executing database operation with singleton client');
    }
    
    const result = await operation(globalPrisma);
    
    if (isDev) {
      console.log('[DB] Database operation completed successfully');
    }
    
    return result;
    
  } catch (error) {
    console.error('[DB] Database operation failed:', error);
    throw error;
  }
  // No disconnect needed - singleton manages its own lifecycle
}

// Convenience function that combines withDatabase and withRetry
export async function withDatabaseRetry<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 200
): Promise<T> {
  return withRetry(
    () => withDatabase(operation),
    maxRetries,
    baseDelay
  );
}

// Helper for database health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    
    await withDatabase(async (prisma) => {
      await prisma.$queryRaw`SELECT 1`;
    });
    
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency
    };
    
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
