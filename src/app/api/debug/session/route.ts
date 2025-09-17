import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';

export async function GET(request: NextRequest) {
  console.log('Debug session endpoint called');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session retrieved:', session ? 'found' : 'not found');
    
    const response = {
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      user: session?.user ? {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role
      } : null,
      cookies: {
        all: request.headers.get('cookie') || 'No cookies found',
        sessionToken: request.cookies.get('next-auth.session-token')?.value || 'No session token',
        csrfToken: request.cookies.get('next-auth.csrf-token')?.value || 'No CSRF token'
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }
    };
    
    console.log('Sending debug response:', JSON.stringify(response, null, 2));
    return Response.json(response);
    
  } catch (error) {
    console.error('Debug session error:', error);
    return Response.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hasSession: false,
      cookies: {
        all: request.headers.get('cookie') || 'No cookies found'
      }
    }, { status: 500 });
  }
}