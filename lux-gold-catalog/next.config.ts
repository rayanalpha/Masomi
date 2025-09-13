import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable serverful features (API routes, NextAuth, Prisma)
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  // Allow dev network origin to access _next resources without warnings
  allowedDevOrigins: ["http://100.127.255.253:3000"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Allow production build to succeed even with ESLint issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
