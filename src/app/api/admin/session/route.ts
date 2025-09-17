import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return Response.json({
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: session.user.role,
        id: session.user.id
      } : null,
      cookies: request.headers.get('cookie') || 'No cookies',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session check error:', error);
    return Response.json({
      hasSession: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      cookies: request.headers.get('cookie') || 'No cookies',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}