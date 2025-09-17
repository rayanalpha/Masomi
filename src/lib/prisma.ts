import { PrismaClient } from "@prisma/client";

// Serverless-friendly Prisma instance management
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  instanceCount: number;
};

// Create new instance with unique connection for each serverless invocation
function createPrismaInstance() {
  const instanceId = (globalForPrisma.instanceCount || 0) + 1;
  globalForPrisma.instanceCount = instanceId;
  
  console.log(`Creating Prisma instance #${instanceId}`);
  
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
    transactionOptions: {
      maxWait: 3000,
      timeout: 5000,
    },
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaInstance();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Serverless cleanup - disconnect after each request in production
if (process.env.NODE_ENV === "production") {
  // Auto-disconnect after 30 seconds of inactivity
  let disconnectTimer: NodeJS.Timeout;
  
  const scheduleDisconnect = () => {
    if (disconnectTimer) clearTimeout(disconnectTimer);
    disconnectTimer = setTimeout(async () => {
      try {
        await prisma.$disconnect();
        console.log('Prisma disconnected due to inactivity');
      } catch (error) {
        console.error('Error disconnecting Prisma:', error);
      }
    }, 30000);
  };
  
  // Schedule disconnect after each operation
  const originalQuery = prisma.$queryRaw;
  (prisma.$queryRaw as any) = new Proxy(originalQuery, {
    apply: async (target: any, thisArg: any, args: any[]) => {
      const result = await target.apply(thisArg, args);
      scheduleDisconnect();
      return result;
    }
  });
}

export default prisma;

