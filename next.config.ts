import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable serverful features (API routes, NextAuth, Prisma)
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Allow dev network origin to access _next resources without warnings
  allowedDevOrigins: ["http://100.127.255.253:3000"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // instrumentationHook is now enabled by default in Next.js 15.5+
  },
  serverExternalPackages: ['sharp', '@prisma/client'],
  // Temporarily disable ESLint for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for serverless deployment
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  // Note: API route body size limits are now configured per-route using export const config
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
