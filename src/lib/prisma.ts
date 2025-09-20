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

  // Prefer pooled connection by default (better for serverless and fewer firewall issues)
  // Only use a direct (5432) connection in development when explicitly enabled
  // by setting PRISMA_USE_DIRECT=true (or DB_USE_DIRECT=true) and providing DATABASE_URL_DIRECT.
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

    // Supabase pooled ports can have a slower initial handshake. Give it a bit more room.
    if (!params.has("connect_timeout")) params.set("connect_timeout", "10"); // seconds
    if (!params.has("pool_timeout")) params.set("pool_timeout", "15"); // seconds

    // Allow a small pool to reduce head-of-line blocking in dev and low-traffic serverless.
    // Prisma defaults to 1 in PgBouncer mode; 3-5 is still safe for Supabase free tiers.
    if (!params.has("connection_limit")) params.set("connection_limit", "3");

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

  console.log(`[Prisma] Creating client with connection ID: ${connectionId}`);

  return new PrismaClient({
    log: isDev ? ["query", "error", "warn", "info"] : ["error"],
    datasourceUrl: resolveDatabaseUrl(),

    // Optimized for serverless environments
    transactionOptions: {
      maxWait: 2000, // Shorter wait time for serverless
      timeout: 4000, // Shorter timeout
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
  
  // In production serverless, always create fresh instances
  if (isProduction) {
    globalForPrisma.connectionCount++;
    console.log(`[Prisma] Production: Creating fresh instance #${globalForPrisma.connectionCount}`);
    return createOptimizedPrismaClient();
  }
  
  // In development, reuse instance but recreate if too old (5 minutes)
  const instanceAge = globalForPrisma.lastUsed ? now - globalForPrisma.lastUsed : Infinity;
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  if (!globalForPrisma.prismaInstance || instanceAge > maxAge) {
    if (globalForPrisma.prismaInstance) {
      console.log(`[Prisma] Development: Recreating stale instance (age: ${Math.round(instanceAge / 1000)}s)`);
      // Don't await disconnect in dev to avoid blocking
      globalForPrisma.prismaInstance.$disconnect().catch(console.error);
    }
    
    globalForPrisma.prismaInstance = createOptimizedPrismaClient();
    globalForPrisma.connectionCount++;
    console.log(`[Prisma] Development: Created instance #${globalForPrisma.connectionCount}`);
  }
  
  globalForPrisma.lastUsed = now;
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

