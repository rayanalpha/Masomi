import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Debug login attempt:', { email, passwordLength: password?.length });
    
    // Check database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown DB error'
      });
    }
    
    // Find user
    let user = null;
    try {
      user = await prisma.user.findUnique({ 
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
    } catch (userError) {
      console.error('User lookup failed:', userError);
      return NextResponse.json({
        success: false,
        error: 'User lookup failed',
        details: userError instanceof Error ? userError.message : 'Unknown user lookup error'
      });
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: `No user found with email: ${email}`
      });
    }
    
    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        error: 'No password hash found',
        details: 'User exists but has no password hash'
      });
    }
    
    // Test password comparison
    let isValidPassword = false;
    try {
      isValidPassword = await compare(password, user.passwordHash);
      console.log('Password comparison result:', isValidPassword);
    } catch (compareError) {
      console.error('Password comparison failed:', compareError);
      return NextResponse.json({
        success: false,
        error: 'Password comparison failed',
        details: compareError instanceof Error ? compareError.message : 'Unknown compare error'
      });
    }
    
    return NextResponse.json({
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
    });
    
  } catch (error) {
    console.error('Debug login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug login failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}