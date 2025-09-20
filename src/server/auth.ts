import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { withDatabaseRetry } from "@/lib/db-serverless";

// Extended user type for better TypeScript support
export interface ExtendedUser extends User {
  id: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
          console.log('[Auth] Login attempt for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Missing credentials');
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
            console.log('[Auth] User not found:', credentials.email);
            return null;
          }
          
          console.log('[Auth] User found, checking password');
          const isValid = await compare(credentials.password, user.passwordHash);
          
          if (!isValid) {
            console.log('[Auth] Invalid password');
            return null;
          }
          
          console.log('[Auth] Authentication successful for:', user.email);
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
      console.log('[Auth] JWT callback:', { hasToken: !!token, hasUser: !!user, trigger });
      
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.uid = extendedUser.id;
        console.log('[Auth] JWT token updated with user data');
      }
      
      return token;
    },
    
    async session({ session, token }) {
      console.log('[Auth] Session callback:', { hasSession: !!session, hasToken: !!token });
      
      if (session.user && token) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = token.role as string;
        console.log('[Auth] Session updated with token data');
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

