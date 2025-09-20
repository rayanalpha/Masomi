import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db-serverless";

export async function GET() {
  try {
    console.log('[Health] System health check started');
    
    const startTime = Date.now();
    
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth();
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV
    };
    
    const totalLatency = Date.now() - startTime;
    
    const healthData = {
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth,
      environment_variables: envCheck,
      total_latency_ms: totalLatency
    };
    
    console.log('[Health] Health check completed:', {
      status: healthData.status,
      dbHealthy: dbHealth.healthy,
      latency: totalLatency
    });
    
    return NextResponse.json(healthData, {
      status: dbHealth.healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('[Health] Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'unknown'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}