/**
 * CSRF Protection Middleware
 * 
 * Provides Cross-Site Request Forgery protection for state-changing operations.
 * Uses double-submit cookie pattern with cryptographic verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a signed hash of the CSRF token for verification
 */
function signToken(token: string): string {
  return createHash('sha256')
    .update(`${token}.${CSRF_SECRET}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Verify that a CSRF token matches its signature
 */
function verifyToken(token: string, signature: string): boolean {
  const expectedSignature = signToken(token);
  
  // Use timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  const signature = signToken(token);
  const cookieValue = `${token}.${signature}`;
  
  response.cookies.set(CSRF_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate CSRF token from request
 * 
 * @param request - The incoming request
 * @returns true if valid, false otherwise
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return false;
  }
  
  // Get token and signature from cookie
  const cookieValue = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieValue) {
    return false;
  }
  
  const [cookieToken, signature] = cookieValue.split('.');
  if (!cookieToken || !signature) {
    return false;
  }
  
  // Verify cookie token matches header token
  if (cookieToken !== headerToken) {
    return false;
  }
  
  // Verify signature
  return verifyToken(cookieToken, signature);
}

/**
 * Middleware to protect routes from CSRF attacks
 * 
 * Usage:
 * ```typescript
 * export const POST = withCsrfProtection(async (request: NextRequest) => {
 *   // Your handler code
 * });
 * ```
 */
export function withCsrfProtection(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Only check CSRF for state-changing methods
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (!validateCsrfToken(request)) {
        return NextResponse.json(
          { error: 'Invalid or missing CSRF token' },
          { status: 403 }
        );
      }
    }
    
    return handler(request, ...args);
  };
}

/**
 * API route to get a new CSRF token
 * 
 * This should be called by the client before making state-changing requests.
 */
export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ token });
  setCsrfCookie(response, token);
  return response;
}