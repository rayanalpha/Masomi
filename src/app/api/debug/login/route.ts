import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { withDatabase, withRetry } from '@/lib/db-serverless';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Debug login attempt:', { email, passwordLength: password?.length });
    
    const result = await withRetry(async () => {
      return await withDatabase(async (prisma) => {
        // Find user
        const user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            createdAt: true
          }
        });
        
        console.log('User lookup result:', user ? 'Found user' : 'User not found');
        
        if (user) {
          console.log('User details:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasPasswordHash: !!user.passwordHash,
            passwordHashLength: user.passwordHash?.length,
            createdAt: user.createdAt
          });
        }
        
        if (!user) {
          return {
            success: false,
            error: 'User not found',
            details: `No user found with email: ${email}`
          };
        }
        
        if (!user.passwordHash) {
          return {
            success: false,
            error: 'No password hash found',
            details: 'User exists but has no password hash'
          };
        }
        
        // Test password comparison
        let isValidPassword = false;
        try {
          isValidPassword = await compare(password, user.passwordHash);
          console.log('Password comparison result:', isValidPassword);
        } catch (compareError) {
          console.error('Password comparison failed:', compareError);
          return {
            success: false,
            error: 'Password comparison failed',
            details: compareError instanceof Error ? compareError.message : 'Unknown compare error'
          };
        }
        
        return {
          success: isValidPassword,
          user: isValidPassword ? {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          } : null,
          debug: {
            userFound: true,
            hasPasswordHash: !!user.passwordHash,
            passwordLength: password?.length,
            hashLength: user.passwordHash?.length
          }
        };
      });
    }, 3, 150);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Debug login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug login failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
