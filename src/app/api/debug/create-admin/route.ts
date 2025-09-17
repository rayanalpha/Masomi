import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, force } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }
    
    console.log('Creating/updating admin user:', { email, passwordLength: password.length });
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser && !force) {
      return NextResponse.json({
        success: false,
        error: 'User already exists',
        details: 'Use force=true to update existing user',
        existingUser: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          createdAt: existingUser.createdAt
        }
      });
    }
    
    // Hash password
    console.log('Hashing password...');
    const passwordHash = await hash(password, 12);
    console.log('Password hashed successfully, length:', passwordHash.length);
    
    let user;
    if (existingUser) {
      // Update existing user
      console.log('Updating existing user...');
      user = await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          role: 'ADMIN',
          name: 'Administrator'
        }
      });
      console.log('User updated successfully');
    } else {
      // Create new user
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'ADMIN',
          name: 'Administrator'
        }
      });
      console.log('User created successfully');
    }
    
    // Test the password immediately
    const bcrypt = require('bcryptjs');
    const testResult = await bcrypt.compare(password, user.passwordHash);
    console.log('Password test result:', testResult);
    
    return NextResponse.json({
      success: true,
      action: existingUser ? 'updated' : 'created',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      passwordTest: {
        immediate: testResult,
        hashLength: user.passwordHash.length
      }
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}