/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at startup to catch configuration
 * issues early rather than at runtime.
 */

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical variables (must be present)
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim().length === 0) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Validate DATABASE_URL format
  if (required.DATABASE_URL) {
    if (!required.DATABASE_URL.startsWith('postgresql://') && 
        !required.DATABASE_URL.startsWith('postgres://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    // Check for connection pooling parameters
    if (!required.DATABASE_URL.includes('connection_limit')) {
      warnings.push('DATABASE_URL missing connection_limit parameter (recommended for serverless)');
    }

    if (!required.DATABASE_URL.includes('connect_timeout')) {
      warnings.push('DATABASE_URL missing connect_timeout parameter (recommended)');
    }
  }

  // Validate NEXTAUTH_SECRET length
  if (required.NEXTAUTH_SECRET && required.NEXTAUTH_SECRET.length < 32) {
    warnings.push('NEXTAUTH_SECRET should be at least 32 characters for security');
  }

  // Validate NEXTAUTH_URL format
  if (required.NEXTAUTH_URL) {
    try {
      const url = new URL(required.NEXTAUTH_URL);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('NEXTAUTH_URL must use http:// or https:// protocol');
      }
    } catch {
      errors.push('NEXTAUTH_URL must be a valid URL');
    }
  }

  // Optional but recommended variables
  const optional = {
    DATABASE_URL_DIRECT: process.env.DATABASE_URL_DIRECT,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CSRF_SECRET: process.env.CSRF_SECRET,
  };

  // Validate Supabase configuration (both or neither)
  const hasSupabaseUrl = optional.SUPABASE_URL && optional.SUPABASE_URL.length > 0;
  const hasSupabaseKey = optional.SUPABASE_SERVICE_ROLE_KEY && optional.SUPABASE_SERVICE_ROLE_KEY.length > 0;

  if (hasSupabaseUrl !== hasSupabaseKey) {
    warnings.push('Supabase configuration incomplete: both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  if (hasSupabaseUrl) {
    try {
      const url = new URL(optional.SUPABASE_URL!);
      if (!url.hostname.includes('supabase')) {
        warnings.push('SUPABASE_URL does not appear to be a valid Supabase URL');
      }
    } catch {
      errors.push('SUPABASE_URL must be a valid URL');
    }
  }

  // Check for CSRF secret
  if (!optional.CSRF_SECRET) {
    warnings.push('CSRF_SECRET not set, falling back to NEXTAUTH_SECRET (consider setting a separate secret)');
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    warnings.push(`Unusual NODE_ENV value: ${nodeEnv} (expected: development, production, or test)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment and log results
 * Throws error if validation fails in production
 */
export function validateAndLogEnvironment(): void {
  const result = validateEnvironment();

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment Configuration Warnings:');
    result.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  if (result.errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    result.errors.forEach(error => console.error(`   - ${error}`));

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Cannot start application with missing required variables.');
    } else {
      console.error('⚠️  Application may not function correctly with missing variables');
    }
  } else if (result.warnings.length === 0) {
    console.log('✅ Environment configuration validated successfully');
  }
}

/**
 * Get a required environment variable or throw error
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable with default
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : defaultValue;
}