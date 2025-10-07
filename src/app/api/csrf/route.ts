/**
 * CSRF Token API Endpoint
 * 
 * GET /api/csrf - Returns a new CSRF token and sets it as a cookie
 * 
 * Clients should call this endpoint before making state-changing requests
 * and include the returned token in the X-CSRF-Token header.
 */

import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ 
    token,
    usage: 'Include this token in X-CSRF-Token header for POST/PUT/PATCH/DELETE requests'
  });
  
  setCsrfCookie(response, token);
  
  return response;
}