import { PrismaClient } from '@prisma/client';

// Create fresh Prisma instance for each serverless function invocation
export function createServerlessPrisma() {
  const instanceId = Math.random().toString(36).substring(2, 15);
  console.log(`Creating serverless Prisma instance: ${instanceId}`);
  
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
    transactionOptions: {
      maxWait: 2000,
      timeout: 3000,
    },
  });
}

// Execute database operation with automatic cleanup
export async function withDatabase<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = createServerlessPrisma();
  
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected successfully');
    
    const result = await operation(prisma);
    console.log('Database operation completed');
    
    return result;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  } finally {
    try {
      console.log('Disconnecting from database...');
      await prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}

// Retry wrapper for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a prepared statement error
      if (error.code === 'P2030' || error.message?.includes('prepared statement') || error.message?.includes('42P05')) {
        console.log(`Prepared statement error on attempt ${attempt}/${maxRetries}, retrying...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
      }
      
      // If it's not a retryable error, throw immediately
      if (attempt === 1) {
        console.error('Non-retryable error:', error);
        throw error;
      }
      
      console.log(`Database operation failed on attempt ${attempt}/${maxRetries}:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  console.error('All retry attempts failed');
  throw lastError;
}