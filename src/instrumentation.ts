/**
 * Next.js Instrumentation
 * 
 * This file runs once when the Next.js server starts up.
 * Used for environment validation and initialization tasks.
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateAndLogEnvironment } = await import('./lib/env-validation');
    
    console.log('🚀 Initializing application...');
    validateAndLogEnvironment();
  }
}