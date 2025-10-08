import { GET as getCsrfToken } from '@/lib/csrf';

/**
 * GET /api/csrf
 * 
 * Returns a new CSRF token for client-side use.
 * The token is also set as an httpOnly cookie for server-side validation.
 */
export const GET = getCsrfToken;