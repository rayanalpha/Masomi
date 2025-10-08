/**
 * Client-side CSRF Token utilities
 */

interface CsrfResponse {
  token: string;
}

/**
 * Fetch a new CSRF token from the server
 * This will also set the CSRF cookie automatically
 */
export async function getCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'same-origin', // Include cookies in request
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data: CsrfResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Make a secure API request with CSRF protection
 * Automatically fetches and includes CSRF token
 */
export async function secureApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken();
  
  const headers = new Headers(options.headers);
  headers.set('x-csrf-token', token);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers,
  });
}

/**
 * Hook for React components to get CSRF token
 */
export function useCsrfToken() {
  let token: string | null = null;
  let isLoading = false;
  let error: Error | null = null;

  const fetchToken = async () => {
    if (token) return token;
    
    isLoading = true;
    error = null;
    
    try {
      token = await getCsrfToken();
      return token;
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      isLoading = false;
    }
  };

  return {
    token,
    isLoading,
    error,
    fetchToken,
  };
}