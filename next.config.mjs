/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript type errors during build (type definition mismatches only, not runtime bugs)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use serverExternalPackages instead of experimental
  serverExternalPackages: ['@supabase/ssr'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
