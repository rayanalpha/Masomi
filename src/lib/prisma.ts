import { PrismaClient } from "@prisma/client";

/**
 * Enhanced Prisma Client Management for Serverless Environments
 * Addresses prepared statement conflicts and connection pooling issues
 */

// Resolve the most reliable database URL for the current environment without exposing secrets
function resolveDatabaseUrl(): string {
  const base = process.env.DATABASE_URL;
  if (!base) {
    throw new Error("DATABASE_URL is not set");
  }

  const isDev = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  // For production serverless (Netlify/Liara), always use pooled connection
  if (isProduction) {
    safeLogResolvedTarget(base, "Pooled (Production)");
    return maybeAugmentTimeouts(base);
  }

  // For development, prefer pooled connection unless explicitly overridden
  const directOverride = process.env.DATABASE_URL_DIRECT;
  const useDirectFlag = [process.env.PRISMA_USE_DIRECT, process.env.DB_USE_DIRECT]
    .some((v) => v && ["1", "true", "TRUE", "True"].includes(v));

  if (isDev && useDirectFlag && directOverride) {
    safeLogResolvedTarget(directOverride, "DIRECT (explicit)");
    return maybeAugmentTimeouts(directOverride);
  }

  // Default: use pooled URL
  safeLogResolvedTarget(base, "Pooled");
  return maybeAugmentTimeouts(base);
}

// Add pragmatic timeouts and a small pool to avoid early timeouts on cold start
function maybeAugmentTimeouts(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const params = url.searchParams;
    const isProduction = process.env.NODE_ENV === "production";

    // Enhanced timeouts for serverless environments
    if (!params.has("connect_timeout")) {
      params.set("connect_timeout", isProduction ? "15" : "10"); // seconds
    }
    if (!params.has("pool_timeout")) {
      params.set("pool_timeout", isProduction ? "20" : "15"); // seconds
    }
    if (!params.has("socket_timeout")) {
      params.set("socket_timeout", isProduction ? "30" : "20"); // seconds
    }

    // Optimized connection pool for serverless
    if (!params.has("connection_limit")) {
      params.set("connection_limit", isProduction ? "1" : "3");
    }

    // Add connection pooling parameters for better serverless performance
    if (!params.has("pgbouncer")) {
      params.set("pgbouncer", "true");
    }

    url.search = params.toString();
    return url.toString();
  } catch {
    return urlStr;
  }
}

// Log only the non-sensitive target (host:port) we will connect to
function safeLogResolvedTarget(urlStr: string, mode: string) {
  try {
    const url = new URL(urlStr);
    const host = url.hostname;
    const port = url.port || (url.protocol === "postgresql:" ? "5432" : "");
    console.info(`[Prisma] Target (${mode}): ${host}${port ? ":" + port : ""}`);
  } catch {
    console.info(`[Prisma] Target (${mode}): <unparsable>`);
  }
}

// Enhanced connection configuration for serverless
const createOptimizedPrismaClient = () => {
  const isDev = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  // Generate unique connection ID to prevent prepared statement conflicts
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  if (isDev) {
    console.log(`[Prisma] Creating client with connection ID: ${connectionId}`);
  }

  return new PrismaClient({
    log: isDev ? ["query", "error", "warn", "info"] : ["error"],
    datasourceUrl: resolveDatabaseUrl(),

    // Optimized for serverless environments
    transactionOptions: {
      maxWait: isProduction ? 5000 : 2000, // Longer wait for production
      timeout: isProduction ? 10000 : 4000, // Longer timeout for production
      isolationLevel: 'ReadCommitted' // More compatible with connection pooling
    }
  });
};

// Global singleton pattern optimized for serverless
const globalForPrisma = globalThis as unknown as {
  prismaInstance: PrismaClient | undefined;
  lastUsed: number;
  connectionCount: number;
};

// Initialize connection counter
if (!globalForPrisma.connectionCount) {
  globalForPrisma.connectionCount = 0;
}

// Function to get or create Prisma instance
function getPrismaClient(): PrismaClient {
  const now = Date.now();
  const isDev = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  
  // Calculate instance age and max age based on environment
  const instanceAge = globalForPrisma.lastUsed ? now - globalForPrisma.lastUsed : Infinity;
  const maxAge = isProduction ? 10 * 60 * 1000 : 3 * 60 * 1000; // 10 min production, 3 min dev
  
  // Check if we need to create a new instance
  const needsNewInstance = !globalForPrisma.prismaInstance || instanceAge > maxAge;
  
  if (needsNewInstance) {
    if (globalForPrisma.prismaInstance) {
      const ageInSeconds = Math.round(instanceAge / 1000);
      if (isDev) {
        console.log(`[Prisma] Recreating stale instance (age: ${ageInSeconds}s, max: ${maxAge / 1000}s)`);
      }
      
      // Disconnect old instance in background to avoid blocking
      const oldInstance = globalForPrisma.prismaInstance;
      setTimeout(() => {
        oldInstance.$disconnect().catch((err) => {
          if (isDev) {
            console.error('[Prisma] Background disconnect error:', err);
          }
        });
      }, 5000); // 5 second delay to allow in-flight queries to complete
    }
    
    globalForPrisma.prismaInstance = createOptimizedPrismaClient();
    globalForPrisma.connectionCount++;
    
    if (isDev) {
      console.log(`[Prisma] Created instance #${globalForPrisma.connectionCount} (${isProduction ? 'production' : 'development'})`);
    }
  }
  
  globalForPrisma.lastUsed = now;
  
  // TypeScript guard: ensure instance is always defined
  if (!globalForPrisma.prismaInstance) {
    throw new Error('[Prisma] Failed to initialize Prisma client');
  }
  
  return globalForPrisma.prismaInstance;
}

// Export the optimized client
export const prisma = getPrismaClient();

// Helper function to ensure fresh connection in serverless
export function getFreshPrismaClient(): PrismaClient {
  return createOptimizedPrismaClient();
}

// Enhanced cleanup for serverless environments
export async function disconnectPrisma(client?: PrismaClient): Promise<void> {
  const targetClient = client || (globalForPrisma.prismaInstance as PrismaClient);
  
  if (targetClient) {
    try {
      console.log('[Prisma] Disconnecting client...');
      await targetClient.$disconnect();
      console.log('[Prisma] Client disconnected successfully');
      
      // Clear global reference if it's the same instance
      if (targetClient === globalForPrisma.prismaInstance) {
        globalForPrisma.prismaInstance = undefined;
      }
    } catch (error) {
      console.error('[Prisma] Error during disconnect:', error);
    }
  }
}

export default prisma;

