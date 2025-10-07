import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { withDatabaseRetry } from "@/lib/db-serverless";
import crypto from "crypto";

// Extended user type for better TypeScript support
export interface ExtendedUser extends User {
  id: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
}

// Helper to hash sensitive data for logging (GDPR compliant)
function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 for better security)
    updateAge: 60 * 60, // 1 hour (reduced from 24 hours)
  },
  
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days (matches session)
  },
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        try {
          // Log with hashed email for privacy (GDPR compliant)
          if (process.env.NODE_ENV === 'development' && credentials?.email) {
            console.log('[Auth] Login attempt for user:', hashForLogging(credentials.email));
          }
          
          if (!credentials?.email || !credentials?.password) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Auth] Missing credentials');
            }
            return null;
          }
          
          const user = await withDatabaseRetry(async (prisma) => {
            return await prisma.user.findUnique({ 
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                passwordHash: true
              }
            });
          });
          
          if (!user) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Auth] User not found');
            }
            return null;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] User found, checking password');
          }
          
          const isValid = await compare(credentials.password, user.passwordHash);
          
          if (!isValid) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Auth] Invalid password');
            }
            return null;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authentication successful');
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role
          } as ExtendedUser;
          
        } catch (error) {
          console.error('[Auth] Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] JWT callback:', { hasToken: !!token, hasUser: !!user, trigger });
      }
      
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.uid = extendedUser.id;
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] JWT token updated with user data');
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Session callback:', { hasSession: !!session, hasToken: !!token });
      }
      
      if (session.user && token) {
        session.user.id = token.uid as string;
        session.user.role = token.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER';
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Session updated with token data');
        }
      }
      
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on auth errors
  },
  
  // Enhanced error handling
  logger: {
    error(code, metadata) {
      console.error('[NextAuth Error]', code, metadata);
    },
    warn(code) {
      console.warn('[NextAuth Warning]', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth Debug]', code, metadata);
      }
    },
  },
};

